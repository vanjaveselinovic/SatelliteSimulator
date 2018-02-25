package core;

import org.orekit.propagation.Propagator;

import jns.element.IPHandler;
import jns.element.Node;
import jns.trace.Trace;
import jns.util.RoutingTable;

/*
 * 
 * on simulation start, connect every node to every other node,
 * Model in our own code what edges work and what edges don't
 * Every time we need to, 'manually' reach into every node's routing table and setting it up.
 * 
 * 
 * to decide when to recalculate, look at 'public class JavisTrace extends Trace'
 * We extend Trace, and make something that reacts only to "MoveSatellites" events, recalculates them, and adds a new event after a time step.
 * 
 */

public class Satellite {
	private Node node;
	private RoutingTable table;
	private Propagator orbit;
	
	public Satellite(Node node, Propagator orbit) {
		this.node = node;
		table = node.getIPHandler().getRoutingTable();
		this.orbit = orbit;
	}
	
}
