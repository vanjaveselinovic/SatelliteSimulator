package core;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.apache.commons.math3.util.FastMath;
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
		AbsoluteDate now = new AbsoluteDate();

		
		//GeodeticPoint gp = new GeodeticPoint(Math.PI, Math.PI/2, 10);
		//Vector3D spacePoint = Earth.toSpacePosition(gp, now);
		//Vector3D groundPoint = Earth.toGroundPosition(gp);
		//GeodeticPoint gpFromSpace = Earth.toGroundPoint(groundPosition, date)
		
		
		/*
		System.out.println(Earth.shape.getA());
		Orbit initialOrbita = new KeplerianOrbit(20000000, 0.01, 0, 0, 0, 0, PositionAngle.TRUE,	Earth.spaceFrame, now, Earth.mu);
		System.out.println(initialOrbita.getKeplerianPeriod());
		KeplerianPropagator keplera = new KeplerianPropagator(initialOrbita);
		keplera.setSlaveMode();
		Satellite sata = new Satellite("[a]", keplera, initialOrbita);
		

		Orbit initialOrbitb = new KeplerianOrbit(10000000, 0.02, 0, 0, 0, 0, PositionAngle.TRUE,	Earth.spaceFrame, now, Earth.mu);
		KeplerianPropagator keplerb = new KeplerianPropagator(initialOrbitb);
		keplerb.setSlaveMode();
		Satellite satb = new Satellite("[b]", keplerb, initialOrbitb);
		
		for(int i = 0; i<1000; i++) {
			now = now.shiftedBy(60d);//advance 1 minute
			sata.updatePosition(now);
			satb.updatePosition(now);
			
			Vector3D a = sata.getSpacePositionVector(now);
			Vector3D b = satb.getSpacePositionVector(now);

			R3 ra = new R3(a.getX(), a.getY(), a.getZ());
			R3 rb = new R3(b.getX(), b.getY(), b.getZ());
			R3 rp = new R3(0,0,0);
			R3.distanceToSegment(rp, ra, rb);
			
			System.out.println(Earth.distance(now, sata, satb)+","+R3.distanceToSegment(rp, ra, rb));
		}*/
		
	}

}
