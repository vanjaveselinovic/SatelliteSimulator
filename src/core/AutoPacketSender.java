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
	public static final int MAX_PACKET_SIZE = 500;//derived from the UDP max size
	
	private ExponentialGenerator InterArrivalTimeRng;
	private ContinuousUniformGenerator packetSizeRng;
	private Station sender;
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
	
	public AutoPacketSender(Simulator sim, GroundStation sender, GroundStation dest, double rate, int id) {
		this.id = id;
		this.rate = rate;
		InterArrivalTimeRng = new ExponentialGenerator(1.d/rate, new MersenneTwisterRNG());
		packetSizeRng = new ContinuousUniformGenerator(MIN_PACKET_SIZE, MAX_PACKET_SIZE+1, new MersenneTwisterRNG());
		
		this.sim = sim;
		this.sender = sender;
		sender.add(this);
		this.dest = dest;
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
		data.meanInterArivalTime = rate;
		return data;
	}

	
}
