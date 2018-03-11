package core;

import java.io.IOException;

import jns.Simulator;
import jns.agent.RandomSink;
import jns.agent.RandomSource;
import jns.element.DuplexInterface;
import jns.element.IPHandler;
import jns.element.Interface;
import jns.element.Node;
import jns.trace.JavisTrace;
import jns.trace.Trace;
import jns.util.IPAddr;

public class NetTest {

	public static void main(String... args) throws IOException {

		// Get a simulator

		Trace trace = new JavisTrace("output.txt");

		Simulator sim = Simulator.getInstance();
		sim.setTrace(trace);

		// Set up three nodes

		Node src = new Node("Source node");
		Node router = new Node("Router");
		Node dest = new Node("Destination node");

		sim.attach(src);
		sim.attach(router);
		sim.attach(dest);

		Interface src_iface = new DuplexInterface(new IPAddr(192, 168, 1, 10));
		src.attach(src_iface);
		sim.attach(src_iface);

		Interface dest_iface = new DuplexInterface(new IPAddr(128, 116, 11, 20));
		dest.attach(dest_iface);
		sim.attach(dest_iface);

		// The router needs two duplex interfaces, for obvious reasons

		Interface route_iface192 = new DuplexInterface(new IPAddr(192, 168, 1, 1));
		Interface route_iface128 = new DuplexInterface(new IPAddr(128, 116, 11, 1));

		router.attach(route_iface192);
		router.attach(route_iface128);

		sim.attach(route_iface192);
		sim.attach(route_iface128);

		VariableDuplexLink link_src_router = new VariableDuplexLink(trace, 1000000, 0.001);
		VariableDuplexLink link_router_dest = new VariableDuplexLink(trace, 1000000, 0.001);

		src_iface.attach(link_src_router, true);
		route_iface192.attach(link_src_router, true);
		sim.attach(link_src_router);

		route_iface128.attach(link_router_dest, true);
		dest_iface.attach(link_router_dest, true);
		sim.attach(link_router_dest);

		src.addDefaultRoute(src_iface);
		dest.addDefaultRoute(dest_iface);

		router.addRoute(new IPAddr(192, 168, 1, 0), new IPAddr(255, 255, 255, 0), route_iface192);
		router.addRoute(new IPAddr(128, 116, 11, 0), new IPAddr(255, 255, 255, 0), route_iface128);

		IPHandler sourceIPHandler = new IPHandler();
		sourceIPHandler.attach(new RandomSource(new IPAddr(192, 168, 1, 10), new IPAddr(128, 116, 11, 20), 0, 5000), 0);

		IPHandler destIPHandler = new IPHandler();
		sourceIPHandler.attach(new RandomSink(new IPAddr(128, 116, 11, 20), 0, 5000), 1);

		src_iface.attach(sourceIPHandler, 2);
		dest_iface.attach(destIPHandler, 3);

		sim.dump();
		sim.run();
	}
}
