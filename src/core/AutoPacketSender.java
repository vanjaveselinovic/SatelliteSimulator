package core;

import org.uncommons.maths.random.ContinuousUniformGenerator;
import org.uncommons.maths.random.ExponentialGenerator;
import org.uncommons.maths.random.MersenneTwisterRNG;

import data.PacketSenderData;
import jns.Simulator;
import jns.command.Command;
import jns.util.Protocols;

public class AutoPacketSender{

	public static final int MIN_PACKET_SIZE = 1;
	public static final int MAX_PACKET_SIZE = 500*1000;//derived from the UDP max size, and then multiplied by 1000
	
	private ExponentialGenerator InterArrivalTimeRng;
	private ContinuousUniformGenerator packetSizeRng;
	private GroundStation sender;
	private Station dest;
	public final int id;
	private Simulator sim;
	private double rate;
	
	public Station getSource() {
		return sender;
	}
	
	public Station getDestination() {
		return dest;
	}
	
	
	public AutoPacketSender(GroundStation sender, Station dest, double rate, int id) {
		this.id = id;
		this.rate = rate;
		InterArrivalTimeRng = new ExponentialGenerator(rate, new MersenneTwisterRNG());
		packetSizeRng = new ContinuousUniformGenerator(MIN_PACKET_SIZE, MAX_PACKET_SIZE+1, new MersenneTwisterRNG());
		
		this.sim = Simulator.getInstance();
		this.sender = sender;
		sender.add(this);
		
		this.dest = dest;
		
		this.createEvent(Double.MIN_NORMAL);
	}
	
	public void createEvent(double time) {
		sim.schedule(
				new Command("AutoPacketCreate", time+InterArrivalTimeRng.nextValue()) {
					public void execute() {
						sender.node.getIPHandler().send(sender.ip, dest.ip, Double.valueOf(packetSizeRng.nextValue()).intValue(), id+":"+getTime(), Protocols.UDP);
						createEvent(getTime());
					}
				}
		);
	}

	public PacketSenderData asData() {
		PacketSenderData data = new PacketSenderData();
		data.id = this.id;
		data.receverName = this.dest.name;
		data.rate = rate;
		return data;
	}

	
}
