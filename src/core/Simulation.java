package core;
/*
import org.orekit.errors.OrekitException;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.orbits.CircularOrbit;
import org.orekit.orbits.KeplerianOrbit;
import org.orekit.orbits.Orbit;
import org.orekit.orbits.PositionAngle;
import org.orekit.propagation.SpacecraftState;
import org.orekit.propagation.analytical.KeplerianPropagator;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScale;
import org.orekit.time.TimeScalesFactory;

public class Simulation {
	static{
		System.setProperty("orekit.data.path", "orekit-data.zip"); 
	}
	
	
	public static void main(String ...args) throws OrekitException {
		Frame inertialFrame = FramesFactory.getGCRF();

		TimeScale utc = TimeScalesFactory.getTAI();
		AbsoluteDate initialDate = new AbsoluteDate(2004, 01, 01, 23, 30, 00.000, utc);

		double mu =  3.986004415e+14;

		double a = 8000000.;                 // semi major axis in meters
		double e = 0.;               // eccentricity
		double i = Math.toRadians(-20);        // inclination
		double omega = Math.toRadians(0);  // perigee argument
		double raan = Math.toRadians(0);   // right ascension of ascending node
		double lM = 0;                       // mean anomaly
		
		Orbit initialOrbit = new KeplerianOrbit(a, e, i, omega, raan, lM, PositionAngle.MEAN,
                inertialFrame, initialDate, mu);
		KeplerianPropagator kepler = new KeplerianPropagator(initialOrbit);
		
		kepler.setSlaveMode();
		double duration = 86400.;
		AbsoluteDate finalDate = initialDate.shiftedBy(duration);
		double stepT = 60.;
		int cpt = 1;
		for (AbsoluteDate extrapDate = initialDate;
		     extrapDate.compareTo(finalDate) <= 0;
		     extrapDate = extrapDate.shiftedBy(stepT))  {
		    SpacecraftState currentState = kepler.propagate(extrapDate);
		    //System.out.println("step " + cpt++);
		    //System.out.println(" time : " + currentState.getDate());
		    //System.out.println(" " + currentState.getOrbit());
		    CircularOrbit orbit = new CircularOrbit(currentState.getOrbit());
		    System.out.println("Lat: "+orbit.getAlphaV()+" Long: "+orbit.getLv());
		}
	}
}

/**///

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.BodyShape;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.errors.OrekitException;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.orbits.CartesianOrbit;
import org.orekit.orbits.CircularOrbit;
import org.orekit.orbits.KeplerianOrbit;
import org.orekit.orbits.Orbit;
import org.orekit.orbits.PositionAngle;
import org.orekit.propagation.SpacecraftState;
import org.orekit.propagation.analytical.KeplerianPropagator;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScale;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;
import org.orekit.utils.TimeStampedPVCoordinates;

public class Simulation {
	
	static{
		System.setProperty("orekit.data.path", "orekit-data.zip"); 
	}
	
	private static final double EARTH_MU =  3.986004415e+14;//Earth's mu value
	static private Frame earthFrame = FramesFactory.getGCRF();
	AbsoluteDate initialDate;
	static private BodyShape earth = new OneAxisEllipsoid(Constants.WGS84_EARTH_EQUATORIAL_RADIUS, Constants.WGS84_EARTH_FLATTENING, earthFrame);
	
	//private int rings;
	//private int satsPerRing;

	//private double radius;
	//private double inclination;
	
	private Map<KeplerianPropagator, Orbit> orbits = new HashMap<>();
	
	public Simulation(int rings, int satsPerRing, int radius, double inclination) throws OrekitException {
		
		
		
		

		TimeScale utc = TimeScalesFactory.getUTC();
		initialDate = new AbsoluteDate(2004, 01, 01, 23, 30, 00.000, utc);
		
		for(int ring=0; ring<rings; ring++) {
			for(int sat=0; sat<satsPerRing; sat++) {
				double raan = Math.PI*((double)ring)/((double)rings);
				double a = Math.PI*2.0*((double)sat)/((double)satsPerRing);
						
				Orbit initialOrbit = new KeplerianOrbit(
						radius, 
						0, 
						inclination, 
						0, 
						raan, 
						a, 
						PositionAngle.TRUE,
						earthFrame, 
						initialDate, 
						EARTH_MU);
				KeplerianPropagator kepler = new KeplerianPropagator(initialOrbit);
				kepler.setSlaveMode();
				orbits.put(kepler,initialOrbit);
			}
		}	
	}
	
	/*
	*
	*  ECEF - Earth Centered Earth Fixed
	*   
	*  LLA - Lat Lon Alt
	*
	*  ported from matlab code at
	*  https://gist.github.com/1536054
	*     and
	*  https://gist.github.com/1536056
	*/
	
public static double[] orbitToLLA(Orbit o) {
	Vector3D cords = new CartesianOrbit(o).getPVCoordinates().getPosition();

	// WGS84 ellipsoid constants
	double a = 6378137; // radius
	double e = 8.1819190842622e-2;  // eccentricity

	double asq = Math.pow(a,2);
	double esq = Math.pow(e,2);

	double x = cords.getX();
	double y = cords.getY();
	double z = cords.getZ();
	
	double b = Math.sqrt( asq * (1-esq) );
	double bsq = Math.pow(b,2);
	double ep = Math.sqrt( (asq - bsq)/bsq);
	double p = Math.sqrt( Math.pow(x,2) + Math.pow(y,2) );
	double th = Math.atan2(a*z, b*p);
	
	double lon = Math.atan2(y,x);
	double lat = Math.atan2( (z + Math.pow(ep,2)*b*Math.pow(Math.sin(th),3) ), (p - esq*a*Math.pow(Math.cos(th),3)) );
	double N = a/( Math.sqrt(1-esq*Math.pow(Math.sin(lat),2)) );
	double alt = p / Math.cos(lat) - N;
	// mod lat to 0-2pi
	lon = lon % (2*Math.PI);
	
	// correction for altitude near poles left out.
	double[] ret = {lat, lon, alt};
	
	return ret;
}
	
	public static void main(String args[]) throws OrekitException {
		Simulation sim = new Simulation(1, 1, 8000000, Math.toRadians(88));
		
		double duration = 86400.;
		AbsoluteDate finalDate = sim.initialDate.shiftedBy(duration);
		double stepT = 60.;
		int cpt = 0;
		System.out.println("[");
		for (AbsoluteDate extrapDate = sim.initialDate;
		    extrapDate.compareTo(finalDate) <= 0;
		    extrapDate = extrapDate.shiftedBy(stepT))  {
		  
			
			//System.out.println("\t{\"minute\":"+ cpt++ +", \"points\":[");
			
			for(KeplerianPropagator kepler : sim.orbits.keySet()) {
			    SpacecraftState currentState = kepler.propagate(extrapDate);
			    
			    System.out.println(Arrays.toString(orbitToLLA(currentState.getOrbit())));
			    
			  //System.out.println("{\"lat\":"+Math.toDegrees(orbit.getAlphaV()%(Math.PI*2.))+", \"long\":"+Math.toDegrees(orbit.getLv()%(Math.PI*2.))+"},");
			  //System.out.println("\t\t{\"lat\":"+Math.toDegrees(orbit.getAlphaV()%(Math.PI*2.))+", \"long\":"+Math.toDegrees(orbit.getLv()%(Math.PI*2.))+"},");
			}
			//System.out.println("\t]},");
		}
		//System.out.println("]");
		
		//TopocentricFrame sta1Frame = new TopocentricFrame(earth, station1, "station1");
	}
}
/**/