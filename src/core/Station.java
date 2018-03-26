package core;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.time.AbsoluteDate;

import jns.Simulator;
import jns.element.IPPacket;
import jns.util.IPAddr;
import jns.util.RoutingTable;

public abstract class Station {
	public static int IPcounter = 0;
	public final IPAddr ip = new IPAddr(++IPcounter);
	
	private Map<Integer, SmartDuplexLink> routingTable = new HashMap<>();
	
	public final String name;

	private List<SmartDuplexLink> links = new ArrayList<>();
	private List<SmartDuplexLink> viableLinks = new ArrayList<>();
	
	public Double cSuccessChange = null;
	public List<SmartDuplexLink> path = null;
	
	
	public boolean updateLength(List<SmartDuplexLink> path) {
		double success = 1;
		for(SmartDuplexLink link:path) {
			success *= RoutingUtil.successChange(link.getError(link.otherStation(this)));
		}
		if(cSuccessChange == null || cSuccessChange < success) {
			cSuccessChange = success;
			this.path = path;
			
			return true;
		}
		return false;
	}
	
	
	
	public Station(String name) {
		this.name = name;
		//this.node = new Node(name);
	}

	
	public RoutingTable getRoutingTable() {
		//return node.getIPHandler().getRoutingTable();
		return null;
	}
	
	public void addLink(SmartDuplexLink link) {
		if(!links.contains(link)) {
			links.add(link);
		}
	}
	/*
	public void updateViableLinks() {
		viableLinks = new ArrayList<>();
		for(SmartDuplexLink link : links) {
			if(link.isViable()) {
				viableLinks.add(link);
			}
		}
	}*/
	
	public List<SmartDuplexLink> getLinks(){
		return links;
	}
	
	/*
	public List<SmartDuplexLink> getViableLinks(){
		return viableLinks;
	}*/
	
	public void send(IPPacket packet) {
		SmartDuplexLink link;
		if(this.ip.getIntegerAddress() == packet.destination.getIntegerAddress()) {
			Simulator.getInstance().getManager().gotPacket(packet, this);
		}else if((link = getRout(packet.destination)) == null) {
			Simulator.getInstance().getManager().dropPacket(packet, this);
		}else {
			link.sendTo(link.otherStation(this), packet);
		}
	}
	
	public void addRoute(IPAddr dest, SmartDuplexLink link) {
		routingTable.put(dest.getIntegerAddress(), link);
	}
	
	public SmartDuplexLink getRout(IPAddr dest) {
		return routingTable.get(dest.getIntegerAddress());
	}
	
	public abstract Vector3D getSpacePositionVector(AbsoluteDate date);
	public abstract Vector3D getSpaceVelocityVector(AbsoluteDate date);
	public abstract Vector3D getGroundPositionVector(AbsoluteDate date);
	public abstract GeodeticPoint getGroundPoint(AbsoluteDate date);
	public abstract boolean isGroundStation();




	

}
