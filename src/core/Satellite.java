package core;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.errors.OrekitException;
import org.orekit.orbits.CartesianOrbit;
import org.orekit.orbits.Orbit;
import org.orekit.propagation.Propagator;
import org.orekit.time.AbsoluteDate;

import data.SatelliteData;
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

public class Satellite extends Station{
	Orbit lastOrbit;
	private Propagator orbitPropagator;
	
	public Satellite(String name, Propagator orbitPropagator, Orbit orbit) {
		super(name);
		this.orbitPropagator = orbitPropagator;
		this.lastOrbit = orbit;
	}

	public void updatePosition(AbsoluteDate newTime) {
		try {
			lastOrbit = orbitPropagator.propagate(newTime).getOrbit();
		} catch (OrekitException e) {
			throw new RuntimeException(e);
		}
	}
	
	@Override
	public Vector3D getSpacePositionVector(AbsoluteDate date) {
		return lastOrbit.getPVCoordinates().getPosition();
	}

	@Override
	public Vector3D getSpaceVelocityVector(AbsoluteDate date) {
		return lastOrbit.getPVCoordinates().getVelocity();
	}

	@Override
	public Vector3D getGroundPositionVector(AbsoluteDate date) {
		return Earth.fromSpacePositionToGroundPosition(this.getSpacePositionVector(date), date);
	}

	@Override
	public GeodeticPoint getGroundPoint(AbsoluteDate date) {
		return Earth.fromGroundPositionToGeo(this.getGroundPositionVector(date));
	}

	@Override
	public boolean isGroundStation() {
		return false;
	}
	
	public SatelliteData getData(AbsoluteDate date) {
		SatelliteData data = new SatelliteData();
		data.id = this.ip.getIntegerAddress();
		GeodeticPoint groundPos = this.getGroundPoint(date);
		data.x = groundPos.getLatitude()/(Math.PI/180d);
		data.y = groundPos.getLongitude()/(Math.PI/180d);
		data.z = groundPos.getAltitude();
		return data;
	}

}
