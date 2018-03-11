
/*
  This file contains a primitive test of IP fragmentation. A packet is sent
  through a router to a link with a small MTU and consequently fragmented.
*/

import jns.Simulator;

import jns.trace.*;
import jns.element.*;
import jns.util.*;
import jns.command.*;

import java.io.IOException;

import core.VerboseTrace;




public class Test_Packet {

  public static void main(String args[]) {
	  IPAddr srcAdr = new IPAddr(192,168,1,10);
	  IPAddr desAdr = new IPAddr(128,116,11,20);
	  
  	
    // Get a simulator

    Simulator sim=Simulator.getInstance();
    Trace trace=new VerboseTrace();
    sim.setTrace(trace);

      
    // Set up three nodes

    Node src=new Node("Source node");
    Node router=new Node("Router");
    Node dest=new Node("Destination node");

    sim.attachWithTrace(src,trace);
    sim.attachWithTrace(router,trace);
    sim.attachWithTrace(dest,trace);

    // Give source and dest node a duplex network interface

    Interface src_iface=new DuplexInterface(srcAdr);
    src.attach(src_iface);
    src.addDefaultRoute(src_iface);

    Interface dest_iface=new DuplexInterface(desAdr);
    dest.attach(dest_iface);
    dest.addDefaultRoute(dest_iface);

    sim.attachWithTrace(src_iface,trace);
    sim.attachWithTrace(dest_iface,trace);

    // The router needs two duplex interfaces, for obvious reasons

    Interface route_iface192=new DuplexInterface(srcAdr);
    Interface route_iface128=new DuplexInterface(desAdr);
    router.attach(route_iface192);
    router.attach(route_iface128);
    router.addRoute(srcAdr,new IPAddr(255,255,255,0),
	            route_iface192);
    router.addRoute(desAdr,new IPAddr(255,255,255,0),
		    route_iface128);

    // Cunningly force the router to fragment the packet we're sending by
    // setting a small MTU.
    route_iface128.setMTU(600);

    sim.attachWithTrace(route_iface192,trace);
    sim.attachWithTrace(route_iface128,trace);
    

    // All we need now is two links

    Link link1=new DuplexLink(10000,0.01);
    Link link2=new DuplexLink(5000,0.03);

    route_iface192.attach(link1,true);
    route_iface128.attach(link2,true);

    src_iface.attach(link1,true);
    dest_iface.attach(link2,true);

    sim.attachWithTrace(link1,trace);
    sim.attachWithTrace(link2,trace);
      
    // Stop the simulator after 4 seconds

    sim.schedule(new PacketSender(src.getIPHandler(),1));
    sim.schedule(new StopCommand(10));

    //    sim.dump();
    
    // Create a trace object and start simulating
    try {
    	sim.setTrace(new JavisTrace("output.txt"));
    	trace.writePreamble();
      
    	sim.run();

    	trace.writePostamble();
    	
    }
    catch (IOException e) {
      System.out.println("An I/O exception occured during the simulation!");
      System.exit(1);
    }
    
  }  
}

