package core;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.Random;
import java.util.Set;

import org.orekit.time.AbsoluteDate;
import org.uncommons.maths.random.MersenneTwisterRNG;

import jns.Simulator;
import jns.command.Command;
import jns.element.DuplexInterface;
import jns.element.DuplexLink;
import jns.element.IPPacket;
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
	

	private final LinkedList<IPPacket> toA = new LinkedList<>();
	private final LinkedList<IPPacket> toB = new LinkedList<>();
	
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
		
		//stationA.node.attach(a_interface);
		//stationB.node.attach(b_interface);

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
	
	public void sendTo(Station rx, IPPacket p) {
		LinkedList<IPPacket> q = null;
		if(this.stationA.equals(rx)) {
			q = toA;
		}else {
			q = toB;
		}
		
		q.add(p);
		
		if(q.size() == 1) {
			new PacketSendEvent(Simulator.getInstance().getTime()+this.getDelay(rx, p.length), this, q, rx);
		}
	}
	/*
	public void addRoute(Station tx, Station destination) {
		tx.node.addRoute(destination.ip, new IPAddr(255,255,255,0), (tx==stationA)?(b_interface):(a_interface));
	}
	*/
	@Override
	protected SimplexLink getM_link1() {
		return a_b;
	}

	@Override
	protected SimplexLink getM_link2() {
		return b_a;
	}

	public double getDelay(Station rx, int length) {
		return (rx == this.stationA)?(b_a.getDelay(length)):(a_b.getDelay(length));
	}

	public double getError(Station rx) {
		return (rx==this.stationA)?(this.b_a.getError()):(this.a_b.getError());
	}
}

class PacketSendEvent extends Command{
	private static final Random bitFlipRng = new MersenneTwisterRNG();
	private SmartDuplexLink link;
	private LinkedList<IPPacket> q;
	private Station rx;
	
	public PacketSendEvent(double time, SmartDuplexLink link, LinkedList<IPPacket> q, Station rx) {
		super("PacketSendEvent", time);
		this.link = link;
		this.q = q;
		this.rx = rx;
		Simulator.getInstance().schedule(this);
	}

	@Override
	public void execute() {
		IPPacket p = q.remove(0);
		
		if (RoutingUtil.errorChance(link.getError(rx), p.length) < bitFlipRng.nextDouble()) {
			p.crc_is_corrupt = true;
			Simulator.getInstance().getManager().damagedPacket(p, link);
		}else {
			rx.send(p);
		}
		if(!q.isEmpty()) {
			new PacketSendEvent(this.getTime()+link.getDelay(rx, p.length), this.link, this.q, this.rx);
		}
	}
}





