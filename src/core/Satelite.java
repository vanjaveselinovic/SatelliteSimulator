package core;

import org.orekit.propagation.Propagator;

import jns.element.Node;

public class Satelite {
	private Node n;
	private Propagator o;
	
	public Satelite(jns.element.Node node, org.orekit.propagation.Propagator orbit) {
		n = node;
		o = orbit;
	}
	
	
}
