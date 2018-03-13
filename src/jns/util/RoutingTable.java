package jns.util;

import jns.element.Interface;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;
import java.util.Vector;

/**
 * RoutingTable implements a generic IP routing table. There are routes to
 * networks associated with interfaces and a default route. Note: The current
 * implementation uses a vector for the routes. A tree structure would be
 * faster, but there are no efficiency concers. Feel free to change it.
 */
public class RoutingTable {

	private Route m_default; // Default route
	private Set<Route> m_routes; // List of 'Route' objects

	public RoutingTable() {
		m_default = null;
		m_routes = new HashSet<Route>();
	}

	public Interface getRoute(IPAddr dest) {

		// Search through routes
		for(Route curroute:m_routes) {
			if (curroute.match(dest)) {
				return curroute.getInterface();
			}
		}

		// No default route, give up
		return null;
	}

	/**
	 * Add a route to the routing table.
	 * 
	 * @param dest
	 *            the destination address (network or host)
	 * @param netmask
	 *            the netmask to use when comparing against targets
	 * @param iface
	 *            the interface to send packets to when sending to dest
	 */
	public void addRoute(IPAddr dest, IPAddr netmask, Interface iface) {
		Route route = new Route(dest, netmask, iface);
		// TODO: Check for duplicate routes and give a warning
		m_routes.remove(route);
		m_routes.add(route);
	}

	/**
	 * Set the default route to use when no other route can be matched. Note that
	 * repeated calls will override the previous default route.
	 * 
	 * @param iface
	 *            the interface to send packets to when they can't be routed
	 */
	public void addDefaultRoute(Interface iface) {
		Route route = new Route(new IPAddr(0, 0, 0, 0), new IPAddr(255, 255, 255, 255), iface);
		m_default = route;
	}

	/**
	 * Delete every route to the given destination.
	 */
	public void deleteRoute(IPAddr dest) {

	}

	public Enumeration enumerateEntries() {
		return Collections.enumeration(m_routes);
	}

	/**
	 * Delete the default route.
	 */
	public void deleteDefaultRoute() {
		m_default = null;
	}

	public void dump() {
		for (Route curroute : m_routes) {
			System.out.println(curroute.getDestination() + "      " + curroute.getNetmask());
		}
	}

	/**
	 * Returns all the interfaces in this routing table.
	 */
	public Vector getAllRoutes() {
		Vector interfaces = new Vector();
		for (Route curroute : m_routes) {
			interfaces.add(curroute.getInterface());
		}
		return interfaces;
	}

}
