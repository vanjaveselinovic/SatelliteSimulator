package core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.orekit.time.AbsoluteDate;

import data.EventData;
import data.GroundStationData;
import data.OutputData;
import data.PacketSenderData;
import data.PathData;
import data.RingData;
import data.SatelliteData;
import data.SimulationConfigurationData;
import jns.Simulator;
import jns.element.IPPacket;

public class Manager implements Runnable{

	List<Station> stations = new ArrayList<>();
	List<GroundStation> groundStations = new ArrayList<>();
	List<Satellite> satellites = new ArrayList<>();
	List<SmartDuplexLink> links = new ArrayList<>();
	List<AutoPacketSender> senders = new ArrayList<>();
	Simulator sim;
	
	AbsoluteDate initialTime;
	AbsoluteDate lastSatUpdateTime;
	AbsoluteDate time;
	
	double simTime;
	double lastSatUpdateSimTime;
	double simTimeSinceLastSatUpdate;
	private double deltaT;
	
	private OutputData output = new OutputData();
	
	
	List<EventData> events = new ArrayList<>();
	
	//used to record event data
	Map<AutoPacketSender, List<SmartDuplexLink>> paths = new HashMap<>();
	Map<Integer, Double> lastGoodPackets = new HashMap<>();//id to start time, also, do not clear
	Map<Integer, Integer> latePackets = new HashMap<>();
	Map<Integer, List<Double>> packetDelays = new HashMap<>();
	Map<Integer, Integer> damagedPackets = new HashMap<>();
	Map<Integer, Integer> droppedPackets = new HashMap<>();
	Map<Integer, Integer> goodPackets = new HashMap<>();
	
	public Manager(SimulationConfigurationData inputData) {
		this.initialTime = new AbsoluteDate(inputData.startTime, Earth.utc);
		this.deltaT = inputData.deltaT;
		Map<String, GroundStation> groundStationMap = new HashMap<>();
		for(GroundStationData data : inputData.groundStations) {
			groundStationMap.put(data.name, new GroundStation(data));
		}
		
		for(GroundStationData data : inputData.groundStations) {
			for(PacketSenderData senderData:data.senders) {
				senders.add(new AutoPacketSender(
						groundStationMap.get(data.name), 
						groundStationMap.get(senderData.receverName),
						senderData.rate,
						senderData.id));
			}
		}
		
		groundStations.addAll(groundStationMap.values());
		
		List<RingData> rings = new ArrayList<>();
		
		
		
		//output
	}
	
	@Override
	public void run() {
		// TODO Auto-generated method stub
		sim = Simulator.getInstance();
		sim.setManager(this);
	}


	public void setTime(double m_time) {
		simTime = m_time;
		simTimeSinceLastSatUpdate = simTime-lastSatUpdateSimTime;
		time = initialTime.shiftedBy(simTime);
		
		/*///uncomment this and satellite connection parameters are updated continuously
		for(SmartDuplexLink l : links) {
			l.setDate(time);
		}
		//*///this is not cheap
		
	}

	/*
	 * write an event
	 * update times
	 * clear out old log data
	 * routing
	 * update routing tables
	 */
	public void updateSattelitePositions() {
		//time to write the EventData for the lest deltaT
		EventData event = new EventData();
		event.startSimulationTime = this.lastSatUpdateSimTime;
		event.startUtcTime = this.lastSatUpdateTime.toString();
		event.endSimulationTime = this.simTime;
		event.endUtcTime = this.time.toString();
		
		List<PathData> pathDatas = new ArrayList<>();
		
		for(AutoPacketSender aps: paths.keySet()) {
			PathData pathData = new PathData();
			pathData.packetSenderID = aps.id;////////////////////////////////////////////
			
			List<Integer> ids = new ArrayList<>();
			Station tx = aps.getSource();
			ids.add(tx.ip.getIntegerAddress()); 
			for(SmartDuplexLink link : paths.get(aps)) {
				tx = link.otherStation(tx);
				ids.add(tx.ip.getIntegerAddress());
			}
			pathData.stationIDs = new int[ids.size()];
			for(int i = 0; i<pathData.stationIDs.length; i++) {
				pathData.stationIDs[i] = ids.get(i);////////////////////////////////////////////
			}
			
			
			List<Double> delays = packetDelays.get(aps.id);
			if(delays == null) {
				delays = new ArrayList<>();
			}
			pathData.delays = new double[delays.size()];
			for(int i = 0; i<pathData.delays.length; i++) {
				pathData.delays[i] = delays.get(i);//////////////////////////////////////////
			}
			
			
			Integer temp = goodPackets.get(aps.id);
			if(temp == null) {
				temp = 0;
			}
			pathData.sucsessfulPackets = temp;/////////////////////////////////////////
			
			temp = latePackets.get(aps.id);
			if(temp == null) {
				temp = 0;
			}
			pathData.outOfOrderPackets = temp;////////////////////////////////////////
			
			temp = droppedPackets.get(aps.id);
			if(temp == null) {
				temp = 0;
			}
			pathData.droppedPackets = temp;///////////////////////////////////////////
			
			temp = damagedPackets.get(aps.id);
			if(temp == null) {
				temp = 0;
			}
			pathData.damagedPackets = temp;///////////////////////////////////////////
			
			
			pathDatas.add(pathData);
		}
		
		event.paths = pathDatas.toArray(new PathData[0]);
		
		List<SatelliteData> sateliteData = new ArrayList<>();
		for(Satellite sat : this.satellites) {
			sateliteData.add(sat.getData(lastSatUpdateTime));
		}
		
		event.satelliteData = sateliteData.toArray(new Satellite[0]);
		
		events.add(event);
		
		goodPackets = new HashMap<>();
		latePackets = new HashMap<>();
		packetDelays = new HashMap<>();
		damagedPackets = new HashMap<>();
		droppedPackets = new HashMap<>();
		
		
		//update the times
		lastSatUpdateTime = time;
		lastSatUpdateSimTime = simTime;
		simTimeSinceLastSatUpdate = 0d;
		

		for(Satellite sat : satellites) {
			sat.updatePosition(time);
		}
		for(SmartDuplexLink l : links) {
			l.usedBy = new HashSet<>();
			l.setDate(time);
			l.testViable();
		}
		for(Station s : stations) {
			s.updateViableLinks();
		}
		
		paths = new HashMap<>();
		
		//re-routing starts here
		for(AutoPacketSender sender:senders) {
			List<SmartDuplexLink> path = route(sender, sender.getSource(), sender.getDestination());
			if(path == null) {
				throw new RuntimeException(sender.getSource()+" cannot reach "+sender.getDestination());
			}
			paths.put(sender, path);
		}
		
		//first pass done
		
		Satellite badSat;
		while((badSat = getBadSatellites()) != null) {
			List<SmartDuplexLink> badSatLinks = new ArrayList<>(badSat.getLinks());
			Collections.sort(badSatLinks, new Comparator<SmartDuplexLink>() {

				@Override
				public int compare(SmartDuplexLink arg0, SmartDuplexLink arg1) {
					return Integer.compare(arg0.usedBy.size(), arg1.usedBy.size());
				}
			});
			
			while(badSatLinks.get(0).usedBy.isEmpty()) {
				//it might be a bad idea to run this
				//badSatLinks.get(0).isNotViable();
				badSatLinks.remove(0);
			}
			boolean stillBad = true;
			SmartDuplexLink badLink = badSatLinks.get(0);
			while(stillBad && !badSatLinks.isEmpty()) {
				badLink = badSatLinks.remove(0);
				badLink.isNotViable();
				Station s1 = badLink.otherStation(null);
				Station s2 = badLink.otherStation(s1);
				if(route(null, s1, s2) == null) {
					//if cutting this link stops us from being able to get from one end to the other, we turn it back in
					badLink.testViable();
				}else {
					stillBad = false;
				}
			}
			if(stillBad) {
				throw new RuntimeException("failed to route paths without using too many antenas");
			}else {
				Set<AutoPacketSender> badSenders = new HashSet<>(badLink.usedBy); 
				for(AutoPacketSender aps: badSenders) {
					for(SmartDuplexLink affectedLink : paths.remove(aps)) {
						affectedLink.usedBy.remove(aps);
					}
				}
				for(AutoPacketSender aps: badSenders) {
					List<SmartDuplexLink> path = route(aps, aps.getSource(), aps.getDestination());
					if(path == null) {
						throw new RuntimeException(aps.getSource()+" cannot reach "+aps.getDestination());
					}
					paths.put(aps, path);
				}
			}
		}
		//routing done!
		//populate routing tables
		
		for(AutoPacketSender aps:paths.keySet()) {
			List<SmartDuplexLink> links = paths.get(aps);
			Station tx = aps.getSource();
			for(int i = 0; i<links.size()-1; i++) {
				links.get(i).addRoute(tx, aps.getDestination());
				tx = links.get(i).otherStation(tx);
			}
		}
	}
	
	private Satellite getBadSatellites(){
		for(Satellite sat : satellites) {
			int count = 0;
			for(SmartDuplexLink link:sat.getViableLinks()) {
				if(!link.otherStation(sat).isGroundStation() && !link.usedBy.isEmpty()) {
					count++;
				}
			}
			if(count > RoutingUtil.MAX_SATTELITE_CONNECTIONS_PER_SATTELITE) {
				return sat;
			}
		}
		return null;	
	}
	
	private List<SmartDuplexLink> route(AutoPacketSender sender, Station source, Station dest){
		for(Station s : stations) {
			s.distance = null;
			s.path = null;
		}
		List<Station> queue = new ArrayList<>();
		source.updateLength(new ArrayList<>());
		queue.add(source);
		
		//Collections.sort(queue, comparator);
		
		while(!queue.isEmpty() && !(dest==queue.get(0))) {
			Station point = queue.remove(0);
			if(!point.isGroundStation()) {
				for(SmartDuplexLink link: point.getViableLinks()) {
					List<SmartDuplexLink> l = new ArrayList<>(point.path);
					l.add(link);
					Station s = link.otherStation(point);
					if(s.distance == null) {
						queue.add(s);
					}
					s.updateLength(l);
				}
				Collections.sort(queue, new Comparator<Station>() {
					@Override
					public int compare(Station s1, Station s2) {
						return Double.valueOf(s1.distance).compareTo(s2.distance);
					}
				});
			}
		}
		
		if(queue.isEmpty()) {
			return null;//throw new RuntimeException(source.name +" cannot reach "+ dest.name);
		}else {
			if(sender != null) {
				for(SmartDuplexLink link:queue.get(0).path) {
					link.usedBy.add(sender);
				}
			}
			return queue.get(0).path;
		}
	}
	
	
	
	public void damagedPacket(IPPacket packet) {
		String[] data = ((String)packet.data).split(":");
		int id = Integer.valueOf(data[0]);
		
		if(damagedPackets.get(id) == null) {
			damagedPackets.put(id, 0);
		}
		damagedPackets.put(id, damagedPackets.get(id)+1);
	}

	public void dropPacket(IPPacket packet) {
		String[] data = ((String)packet.data).split(":");
		int id = Integer.valueOf(data[0]);
		
		if(droppedPackets.get(id) == null) {
			droppedPackets.put(id, 0);
		}
		droppedPackets.put(id, droppedPackets.get(id)+1);
	}


	public void gotPacket(IPPacket packet) {
		String[] data = ((String)packet.data).split(":");
		int id = Integer.valueOf(data[0]);
		double startTime = Double.valueOf(data[1]);
		
		if(lastGoodPackets.get(id) == null) {
			lastGoodPackets.put(id, -1d);
		}
		
		if(lastGoodPackets.get(id) < startTime) {
			//the packet is on time
			lastGoodPackets.put(id, startTime);
			
			if(goodPackets.get(id) == null) {
				goodPackets.put(id, 0);
			}
			goodPackets.put(id, goodPackets.get(id)+1);
		}else {
			//the packet is late
			if(latePackets.get(id) == null) {
				latePackets.put(id, 0);
			}
			latePackets.put(id, latePackets.get(id)+1);
		}
		
		if(packetDelays.get(id) == null) {
			packetDelays.put(id, new ArrayList<>());
		}
		packetDelays.get(id).add(simTime-startTime);
	}
	
	public OutputData getOutputData() {
		
			//String startTime;//utc start time string
			//double deltaT;
			//int numberOfStations;//stations are numbered in the range [1, max] inclusive. Stations are ground stations and/or satellites
			//GroundStationData[] groundStations;
			//RingData[] rings;
			//EventData[] events;//in order
		return output;
	}
	
}


