package core;

import jns.Simulator;
import jns.element.DuplexInterface;
import jns.element.Interface;
import jns.element.Node;
import jns.util.IPAddr;

public class NetTest {

	public static void main(String ...args) {
		
	    // Get a simulator

	    Simulator sim=Simulator.getInstance();

	      
	    // Set up three nodes

	    Node src=new Node("Source node");
	    Node router=new Node("Router");
	    Node dest=new Node("Destination node");

	    sim.attach(src);
	    sim.attach(router);
	    sim.attach(dest);


	    // Give source and dest node a duplex network interface

	    Interface src_iface=new DuplexInterface(new IPAddr(192,168,1,10));
	    src.attach(src_iface);

	    Interface dest_iface=new DuplexInterface(new IPAddr(128,116,11,20));
	    dest.attach(dest_iface);

	    sim.attach(src_iface);
	    sim.attach(dest_iface);


	    // The router needs two duplex interfaces, for obvious reasons

	    Interface route_iface192=new DuplexInterface(new IPAddr(192,168,1,1));
	    Interface route_iface128=new DuplexInterface(new IPAddr(128,116,11,1));
	    router.attach(route_iface192);
	    router.attach(route_iface128);

	    sim.attach(route_iface192);
	    sim.attach(route_iface128);
	    
	    sim.dump();
		
	}
}

