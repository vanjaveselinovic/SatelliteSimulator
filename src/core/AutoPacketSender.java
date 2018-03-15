package core;

import org.uncommons.maths.random.ContinuousUniformGenerator;
import org.uncommons.maths.random.ExponentialGenerator;
import org.uncommons.maths.random.MersenneTwisterRNG;

import data.PacketSenderData;
import jns.Simulator;
import jns.command.Command;
import jns.element.IPPacket;
import jns.util.Preferences;
import jns.util.Protocols;

public class AutoPacketSender{

	
	private static final int MAX_PACKET_SIZE = Preferences.default_iface_MTU-IPPacket.HEADER_SIZE;
	private static final int MIN_PACKET_SIZE = 0;

	private static final double MEAN_PACKET_SIZE = ((double)MAX_PACKET_SIZE + (double)MIN_PACKET_SIZE)/2d;
	
	private ExponentialGenerator InterArrivalTimeRng;
	private ContinuousUniformGenerator packetSizeRng;
	private GroundStation sender;
	private GroundStation dest;
	public final int id;
	private Simulator sim;
	private double rate;
	
	public GroundStation getSource() {
		return sender;
	}
	
	public GroundStation getDestination() {
		return dest;
	}
	
	
	public AutoPacketSender(GroundStation sender, GroundStation dest, double rate, int id) {
		this.id = id;
		this.rate = rate;
		InterArrivalTimeRng = new ExponentialGenerator(rate, new MersenneTwisterRNG());
		packetSizeRng = new ContinuousUniformGenerator(MIN_PACKET_SIZE, MAX_PACKET_SIZE, new MersenneTwisterRNG());
		
		this.sim = Simulator.getInstance();
		this.sender = sender;
		sender.add(this);
		
		this.dest = dest;
		
		this.createEvent(Double.MIN_NORMAL);
	}
	
	public static double meanPacketSize() {
		return MEAN_PACKET_SIZE;
	}
	
	public int nextPacketSize() {
		return Double.valueOf(packetSizeRng.nextValue()).intValue();
	}
	
	public void createEvent(double time) {
		sim.schedule(
				new Command("AutoPacketCreate", time+InterArrivalTimeRng.nextValue()) {
					public void execute() {
						Simulator.getInstance().getManager().createPacket(id);
						sender.send(new IPPacket(sender.ip, dest.ip, nextPacketSize(), id+":"+getTime()));
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
