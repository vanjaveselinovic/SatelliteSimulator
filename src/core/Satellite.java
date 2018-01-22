package core;

import org.orekit.propagation.Propagator;

import jns.element.Node;

public class Satellite {
	private Node n;
	private Propagator o;
	
	public Satellite(jns.element.Node node, org.orekit.propagation.Propagator orbit) {
		n = node;
		o = orbit;
	}
	
	
}
