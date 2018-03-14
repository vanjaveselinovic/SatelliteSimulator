/**
 TODO LIST FOR IPHANDLER

 - Process time to live field
 - look at copy_options field in ip packets
 -
 */

package jns.element;

import jns.Simulator;
import jns.agent.Agent;
import jns.agent.CL_Agent;
import jns.command.Command;
import jns.command.ElementUpdateCommand;
import jns.util.IPAddr;
import jns.util.Preferences;
import jns.util.RoutingTable;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Vector;

public class IPHandler extends Element implements CL_Agent {
	public static int MAX_BUFFER_LENGTH = 128;
	private Vector<Interface> m_interfaces;

	private LinkedList<IPPacket> m_packets_send;//jns.util.Queue m_packets_send; // Packets waiting to be sent
	private LinkedList<IPPacket> m_packets_recv;//jns.util.Queue m_packets_recv; // Received packets to be processed

	private Vector m_fragments; // A vector of Fragment objects (See below)

	private RoutingTable m_route;

	private static int m_packetid = 1; // Unique packet id

	private Hashtable m_protocols; // Higher level protocols, stores instances
	// of 'HigherAgent'

	public IPHandler() {
		m_interfaces = new Vector();

		m_packets_send = new LinkedList<>();//new jns.util.Queue();
		m_packets_recv = new LinkedList<>();//new jns.util.Queue();

		m_route = new RoutingTable();

		//m_fragments = new Vector();

		m_protocols = new Hashtable();
	}

	public void attach(Interface iface) {

		// If the appropriate flag is set, make this iface the default route

		if (Preferences.first_iface_is_default_route && m_interfaces.isEmpty()) {
			m_route.addDefaultRoute(iface);
		}

		// Make this handler that interfaces handler

		iface.setIPHandler(this);

		// Add to interface list

		m_interfaces.addElement(iface);
	}

	public void attach(Agent higher_level, int unique_id) {

		// Create a new receive queue, etc. for this agent

		HigherAgent newagent = new HigherAgent(higher_level);
		m_protocols.put(new Integer(unique_id), newagent);

		// Reverse attach ourselves to this agent (allow it to make a reference)

		higher_level.attach(this);
	}

	public void attach(Agent lower_level) {
		Simulator.error(
				"You may not attach a lower level agent to an IP " + "handler (because there is no such thing!)");
	}

	public void dump() {
		System.out.println("IP Handler");

		Enumeration e = m_interfaces.elements();
		while (e.hasMoreElements())
			((Element) e.nextElement()).dump();
	}

	public IPAddr getAddress() {
		if (m_interfaces.size() > 0) {
			Interface iface = (Interface) m_interfaces.firstElement();
			return iface.getIPAddr();
		} else
			return null;
	}

	/**
	 * The update function will process the send queue and the receive queue of the
	 * IPHandler. Everything in the send queue will be given to an interface to
	 * send, if possible. Things in the receive queue will be forwarded to a higher
	 * level protocol or if this is a router, sent on to the next hop.
	 */
	public void update() {
		Simulator.verbose("Updating IP Handler");

		// Process packets waiting to be sent
		outerLoop:
		while(!m_packets_send.isEmpty()) {
			IPPacket curpacket = m_packets_send.remove(0);
			
			Interface target = m_route.getRoute(curpacket.destination);
			

			if(target == null) {
				Simulator.getInstance().getManager().dropPacket(curpacket);
			}else if (!target.canSend(curpacket.destination, curpacket.length)) {
				if(m_packets_send.size()<MAX_BUFFER_LENGTH) {
					m_packets_send.add(0, curpacket);
					break outerLoop;
				}else {
					Simulator.getInstance().getManager().dropPacket(curpacket);
				}
			}else{
				// Copy the packet, to use if we send more than one..
				IPPacket sendPacket = new IPPacket(curpacket);
				target.send(sendPacket);
			}
		}

		// Received packets waiting to be sent on or given to higher level
		// protocols
		
		while(!m_packets_recv.isEmpty()) {
			IPPacket curpacket = m_packets_recv.remove(0);
			// Check the packet's integrity

			if (curpacket.crc_is_corrupt) {
				Simulator.getInstance().getManager().damagedPacket(curpacket);
				continue;
			}

			// Check if the packet's destination IP address equals on of our
			// interfaces addresses..

			boolean is_final_dest = false;
			
			for(Interface curiface : m_interfaces) {
				//Interface curiface = (Interface) e.nextElement();

				if (curiface.getIPAddr().equals(curpacket.destination)) {
					Simulator.verbose("Packet at final dest");
					Simulator.getInstance().getManager().gotPacket(curpacket);
					is_final_dest = true;
					break;
				}
			}

			// If this is not a final destination, send it on
			// TODO: IMPORTANT: I'm pretty sure that the last conditional on this if
			// statement
			// breaks the standard, fixed line IP handling of multicast addresses, but it's
			// the desired behaviour for 802.11b in ad hoc mode!
			if (!is_final_dest) {
				Simulator.verbose("Sending on packet");

				m_packets_send.add(curpacket);

				Simulator.getInstance().schedule(new ElementUpdateCommand(this,
						Simulator.getInstance().getTime() + Preferences.delay_ip_to_ifacequeue));
			} else {
				// Not a fragment because we do not use fragments

				// Pass on to higher level protocol
				HigherAgent destagent = (HigherAgent) m_protocols.get(new Integer(curpacket.protocol));
				if (destagent != null) {
					destagent.queue.pushFront(curpacket);
					destagent.agent.indicate(Agent.PACKET_AVAILABLE, this);
				} else {
					// TODO: No destination protocol.. Generate a custom event ?
					throw new RuntimeException();
				}
			}

			
		}
	}

	/**
	 * Private function that processes a packet to be sent to a certain destination
	 */

	/**
	 * Send an IP packet. This queues the packet into the send queue and schedules a
	 * call to update().
	 */
	public void send(IPAddr source, IPAddr dest, int length, Object data, int unique_id) {
		IPPacket packet = new IPPacket();

		packet.source = new IPAddr(source);
		packet.destination = new IPAddr(dest);
		packet.length = IPPacket.HEADER_SIZE + length;
		packet.data = data;
		packet.id = m_packetid++;
		packet.protocol = unique_id;

		// Put packet in the send queue
		m_packets_send.add(packet);

		// Schedule a call to the update function
		Simulator.getInstance().schedule(
				new ElementUpdateCommand(this, Simulator.getInstance().getTime() + Preferences.delay_ip_to_ifacequeue));
	}

	public Object read(int unique_id) {

		HigherAgent destagent = (HigherAgent) m_protocols.get(new Integer(unique_id));
		if (destagent == null) {
			Simulator.warning("Higher level agent with unknown id called read()");
			return null;
		}

		IPPacket packet = (IPPacket) destagent.queue.peekBack();
		destagent.queue.popBack();

		return packet;
	}

	public boolean canSend(IPAddr destination, int length) {
		Interface target = m_route.getRoute(destination);
		return target.canSend(destination, length);
	}

	/**
	 * Indicate to this IP handler that a packet is waiting for collection
	 * 
	 * @param status
	 *            the status that is indicated, as defined in Agent
	 * @param indicator
	 *            the object that is giving is the packet, must be an Interface
	 *            object.
	 * @see Agent
	 */
	public void indicate(int status, Object indicator) {
		if (!(indicator instanceof Interface))
			Simulator.error("IPHandler received an indication from a non-Interface");

		if ((status & Agent.READY_TO_SEND) != 0) {
			Simulator.verbose("IPHandler got READY_TO_SEND");

			// Schedule a call to the update function
			Simulator.getInstance().schedule(new ElementUpdateCommand(this,
					Simulator.getInstance().getTime() + Preferences.delay_ifacequeue_to_ip));

			// Notify all agents above us that we're ready to send.
			for (Enumeration e = m_protocols.elements(); e.hasMoreElements();) {
				HigherAgent curagent = (HigherAgent) e.nextElement();

				curagent.agent.indicate(Agent.READY_TO_SEND, this);
			}
		} else if ((status & Agent.PACKET_AVAILABLE) != 0) {
			IPPacket packet = (IPPacket) ((Interface) indicator).read(0);

			// Stick the packet in the receive queue
			m_packets_recv.add(packet);

			// Schedule a call to the update function
			Simulator.getInstance().schedule(new ElementUpdateCommand(this,
					Simulator.getInstance().getTime() + Preferences.delay_ifacequeue_to_ip));
		} else
			Simulator.warning("IPHandler received an unhandled indication: " + status);
	}

	public void addRoute(IPAddr dest, IPAddr netmask, Interface iface) {
		m_route.addRoute(dest, netmask, iface);
	}

	public void addDefaultRoute(Interface iface) {
		m_route.addDefaultRoute(iface);
	}

	public RoutingTable getRoutingTable() {
		return m_route;
	}

	public Enumeration enumerateInterfaces() {
		return m_interfaces.elements();
	}
	/*
	@Override
	public String dumpJson() {
		
		return 
				"{"
				+ "\"id\":"+this.id+","
				+ "\"type\":\""+this.getClass().getSimpleName()+"\","
				+ "\"ip\":\""+this.getAddress()+"\","
				+ "}";
	}*/

}

class HigherAgent {
	public jns.util.Queue queue;
	public Agent agent;

	public HigherAgent(Agent agent) {
		this.agent = agent;
		queue = new jns.util.Queue();
	}
}

/**
 * Auxiliary class to represent the fragments of one IP packet. Contains the ID
 * of the packet and a number of fragment packets.
 */
class Fragment {

	private int m_id;
	private Vector m_packets;

	public Fragment(int id) {
		m_id = id;
		m_packets = new Vector();
	}

	public int getId() {
		return m_id;
	}

	public boolean complete() {

		int offset = 0;

		for (int i = 0; i < m_packets.size(); i++) {
			IPPacket curpacket = (IPPacket) m_packets.elementAt(i);

			// Offsets don't match, there a packet missing, fail
			if (curpacket.fragment_offset != offset)
				return false;

			// Last packet, but 'more fragments' set, so fail
			if (i == m_packets.size() - 1)
				if ((curpacket.flags & IPPacket.FLAG_MORE_FRAGMENTS) != 0)
					return false;

			offset = offset + (curpacket.length >> 3);
		}

		return true;
	}

	public void addFragment(IPPacket packet) {
		int i = 0;

		Simulator.verbose(m_packets.size());
		Simulator.verbose(packet.fragment_offset);

		if (m_packets.size() == 0) {
			m_packets.addElement(packet);
			return;
		}

		while (i < m_packets.size() && (((IPPacket) m_packets.elementAt(i)).fragment_offset < packet.fragment_offset))
			i++;

		// Ignore duplicates
		if (i < m_packets.size() && ((IPPacket) m_packets.elementAt(i)).fragment_offset == packet.fragment_offset)
			return;

		m_packets.insertElementAt(packet, i);
	}

	/**
	 * Reassemble a broken up IP packet. This is easy because the data does not
	 * actually ever get split up.. :)
	 */
	public IPPacket reassemble() {
		int length = 0;

		// Simply copy the first IP packet because it contains almost all of the
		// original packt
		IPPacket packet = new IPPacket((IPPacket) m_packets.elementAt(0));

		// Reset the flags and length
		packet.length = 0;
		packet.flags = 0;

		// Rebuild the original length field
		Enumeration e = m_packets.elements();
		while (e.hasMoreElements()) {
			IPPacket curpacket = (IPPacket) e.nextElement();

			packet.length += curpacket.length;
		}

		return packet;
	}
	
	
}