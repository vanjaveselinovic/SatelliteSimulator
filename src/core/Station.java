package core;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.BodyShape;
import org.orekit.bodies.CelestialBody;
import org.orekit.bodies.CelestialBodyFactory;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScale;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;

import jns.element.Node;
import jns.util.IPAddr;
import jns.util.RoutingTable;

public abstract class Station {
	public static int IPcounter = 0;
	public final IPAddr ip = new IPAddr(++IPcounter);
	
	public final Node node;
	public final String name;

	private List<SmartDuplexLink> links = new ArrayList<>();
	private List<SmartDuplexLink> viableLinks = new ArrayList<>();
	
	public Double distance = null;
	public List<SmartDuplexLink> path = null;
	
	
	public boolean updateLength(List<SmartDuplexLink> path) {
		double delay = 0;
		for(SmartDuplexLink link:path) {
			delay += link.getDelay() + ((double)AutoPacketSender.MAX_PACKET_SIZE/2.d)/link.getBandwidth();
		}
		if(distance == null || distance > delay) {
			distance = delay;
			this.path = path;
			return true;
		}
		return false;
	}
	
	
	
	public Station(String name) {
		this.name = name;
		this.node = new Node(name);
	}

	public RoutingTable getRoutingTable() {
		return node.getIPHandler().getRoutingTable();
	}
	
	public void addLink(SmartDuplexLink link) {
		if(!links.contains(link)) {
			links.add(link);
		}
	}
	
	public void updateViableLinks() {
		viableLinks = new ArrayList<>();
		for(SmartDuplexLink link : links) {
			if(link.isViable()) {
				viableLinks.add(link);
			}
		}
	}
	
	public List<SmartDuplexLink> getLinks(){
		return links;
	}
	
	public List<SmartDuplexLink> getViableLinks(){
		return viableLinks;
	}
	
	public abstract Vector3D getSpacePositionVector(AbsoluteDate date);
	public abstract Vector3D getSpaceVelocityVector(AbsoluteDate date);
	public abstract Vector3D getGroundPositionVector(AbsoluteDate date);
	public abstract GeodeticPoint getGroundPoint(AbsoluteDate date);
	public abstract boolean isGroundStation();

	

}
