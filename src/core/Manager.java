package core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.Stack;

import org.orekit.time.AbsoluteDate;

import jns.Simulator;
import jns.command.Command;
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
	
	
	public Manager() {
		
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
		
		/*///uncomment this and satellite connection parameters is updated continuously
		for(SmartDuplexLink l : links) {
			l.setDate(time);
		}
		//*///this is not cheap
		
	}

	public void updateSattelitePositions() {
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
		
		Map<AutoPacketSender, List<SmartDuplexLink>> paths = new HashMap<>();
		
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
	
	public void recordCommand(Command current_command) {
		// TODO Auto-generated method stub
		//"AutoPacketCreate";
		
	}

	public void damagedPacket(IPPacket curpacket) {
		// TODO Auto-generated method stub
		
	}

	public void gotPacket(IPPacket curpacket) {
		// TODO Auto-generated method stub
		
	}

	public void dropPacket(IPPacket curpacket) {
		// TODO Auto-generated method stub
		
	}
	
	
	
}

class Tupple<L,R>{
	public L l;
	public R r;
	
	public Tupple(L l, R r) {
		this.l=l;
		this.r=r;
	}
}

