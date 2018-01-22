package core;

import org.orekit.propagation.Propagator;

import jns.element.Node;
import jns.trace.Trace;

/*
 * 
 * on simulation start, connect every node to every other node,
 * Model in our own code what edges work and what edges don't
 * Every time we need to, 'manually' reach into every node's routing table and setting it up propperly.
 * 
 * 
 * to decide when to recalculate, look at 'public class JavisTrace extends Trace'
 * We extend Trace, and make something that reacts only to "MoveSatellites" events, recalculates them, and adds a new event after a time step.
 * 
 */

public class Satellite {
	private Node n;
	private Propagator o;
	
	public Satellite(jns.element.Node node, org.orekit.propagation.Propagator orbit) {
		n = node;
		o = orbit;
	}
	
	
}
