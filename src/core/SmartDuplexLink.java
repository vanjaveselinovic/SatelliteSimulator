package core;

import java.util.HashSet;
import java.util.Set;

import org.orekit.time.AbsoluteDate;

import jns.Simulator;
import jns.element.DuplexInterface;
import jns.element.DuplexLink;
import jns.element.SimplexLink;
import jns.util.IPAddr;

public class SmartDuplexLink extends DuplexLink {

	private final Object dateLock = new Object();//just some object 
	private AbsoluteDate date;

	private final Station stationA;
	private final Station stationB;
	
	private final SmartLink a_b;
	private final SmartLink b_a;

	private final DuplexInterface a_interface;
	private final DuplexInterface b_interface;
	
	private boolean viable = true;
	
	public Set<AutoPacketSender> usedBy = new HashSet<>();
	
	public SmartDuplexLink(AbsoluteDate date, Station a, Station b) {
		this.date = date;
		
		if(b.isGroundStation()) {
			stationA=b;
			stationB=a;
		}else {
			stationA=a;
			stationB=b;
		}
		a_b = new SmartLink(date, stationA, stationB);
		b_a = new SmartLink(date, stationB, stationA);

		a_interface = new DuplexInterface(stationA.ip);
		b_interface = new DuplexInterface(stationB.ip);
		
		stationA.node.attach(a_interface);
		stationB.node.attach(b_interface);

		this.a_interface.attach(this, true);
		this.b_interface.attach(this, true);
		
		this.setDate(date);
		
		a.addLink(this);
		b.addLink(this);
	}
	
	public boolean isViable() {
		return viable;
	}
	
	public void isNotViable() {
		viable = false;
	}
	
	public Station otherStation(Station sta) {
		if(stationA == sta) {
			return stationB;
		}else {
			return stationA;
		}
	}
	
	public boolean testViable() {
		if(stationA.isGroundStation() && stationB.isGroundStation()) {
			viable =  false;
		}else if(stationA.isGroundStation()) {
			//check for ground to sat
			viable = /*(getError() <= RoutingUtil.MAX_ERROR_RATE) && */(Earth.groundStationAngle(stationA, stationB, date) <= RoutingUtil.SATTELITE_ANTENNA_MAX_ANGLE);
		}else {
			viable = /*(getError() <= RoutingUtil.MAX_ERROR_RATE) && */(Earth.lineOfSightConsideringAtmosphere(stationA, stationB, date));
		}
		return viable;
	}
	
	public void attachToSim(Simulator sim) {
		sim.attach(a_interface);
		sim.attach(b_interface);
		sim.attach(this);
	}
	
	public boolean touches(Station s) {
		return stationA == s || stationB == s;
	}
	
	public AbsoluteDate getDate() {
		synchronized(dateLock){
			return date;
		}
	}

	synchronized public void setDate(AbsoluteDate newDate) {
		synchronized(dateLock){
			this.date = newDate;
			this.a_b.setDate(date);
			this.a_b.setDate(date);
		}
	}
	
	public void addRoute(Station tx, Station destination) {
		tx.node.addRoute(destination.ip, new IPAddr(255,255,255,0), (tx==stationA)?(b_interface):(a_interface));
	}
	
	@Override
	protected SimplexLink getM_link1() {
		return a_b;
	}

	@Override
	protected SimplexLink getM_link2() {
		return b_a;
	}
}
