package core;

import org.orekit.time.AbsoluteDate;

import jns.element.SimplexLink;

public class SmartLink extends SimplexLink {
	private Station tx; 
	private Station rx;
	
	final private Object dateLock = new Object();//just some object 
	private AbsoluteDate date;
	
	public SmartLink(AbsoluteDate date, Station tx, Station rx) {
		super(0,0);
		this.date = date;
		this.tx = tx;
		this.rx = rx;
	}
	
	public AbsoluteDate getDate() {
		synchronized(dateLock){
			return date;
		}
	}

	
	synchronized public void setDate(AbsoluteDate newDate) {
		synchronized(dateLock){
			this.date = newDate;
		}
	}
	
	@Override
	public void dump() {
		System.out.println("SmartLink: "+tx+" to "+rx);
	}
	
	@Override
	public double getBandwidth() {
		synchronized(dateLock){
			return RoutingUtil.bandwidth(date, tx, rx);
		}
	}
	@Override
	public double getDelay() {
		synchronized(dateLock){
			return RoutingUtil.delay(date, tx, rx);
		}
	}
	@Override
	public double getError() {
		synchronized(dateLock){
			return RoutingUtil.error(date, tx, rx);
		}
	}

	public double getDelay(int length) {
		return this.getDelay()+(length<<3)/this.getBandwidth();
	}
}
