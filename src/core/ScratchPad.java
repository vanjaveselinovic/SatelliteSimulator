package core;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.junit.jupiter.api.Test;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.errors.OrekitException;
import org.orekit.orbits.CartesianOrbit;
import org.orekit.orbits.KeplerianOrbit;
import org.orekit.orbits.Orbit;
import org.orekit.orbits.PositionAngle;
import org.orekit.propagation.SpacecraftState;
import org.orekit.propagation.analytical.KeplerianPropagator;
import org.orekit.time.AbsoluteDate;

class ScratchPad {

	@Test
	void test() throws Exception {
		List<Integer> ld = new ArrayList<>();
		ld.add(0);
		ld.add(1);
		ld.add(2);
		ld.add(3);
		ld.add(4);
		ld.add(5);
		
		System.out.println(ld.indexOf(5));
		/*
		Earth.setStartDate(2018, 1, 1, 1, 1);
		Earth.getInitialDate();
		GeodeticPoint gp = new GeodeticPoint(45.18,-75.7,114.0);//null island
		
		Orbit initialOrbit = new KeplerianOrbit(42164000, 0, 0, 0, 0, 0, PositionAngle.TRUE,	Earth.spaceFrame, Earth.getInitialDate(), Earth.mu);
		KeplerianPropagator kepler = new KeplerianPropagator(initialOrbit);
		kepler.setSlaveMode();
		
		
		for(double i = 0d; i<2*24*60; i+=1) {
			//every minute for 2 days
			AbsoluteDate ad = Earth.getInitialDate().shiftedBy(60d*i);

			Vector3D orbit = kepler.propagate(ad).getOrbit().getPVCoordinates().getPosition();
			System.out.println(i+": "+Earth.toGroundPosition(orbit, ad));
			//System.out.println(Earth.getPositionVector(gp)+"\t:\t"+Earth.getGeopoint(Earth.getPositionVector(gp),ad));
			
		}
	*/	
	}

}
