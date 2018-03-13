package core;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.hipparchus.util.FastMath;
import org.hipparchus.geometry.euclidean.threed.Line;
import org.orekit.bodies.CelestialBody;
import org.orekit.bodies.CelestialBodyFactory;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.frames.Frame;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScale;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;

public class Earth {
	public static final double atmosphereHeight = 12000d;//height of the atmosphere in m
	public static final CelestialBody body;
	public static final OneAxisEllipsoid shape;
	public static final OneAxisEllipsoid atmosphere;
	public static final Frame groundFrame;
	public static final Frame spaceFrame;
	public static final TimeScale utc;
	public static final double mu = 3.986004415e+14;// Earth's mu value
	//private static AbsoluteDate initialDate;
	
	static {
		System.setProperty("orekit.data.path", "orekit-data.zip");
		try {
			body = CelestialBodyFactory.getEarth();
			groundFrame = body.getBodyOrientedFrame();
			spaceFrame = body.getInertiallyOrientedFrame();
			shape = new OneAxisEllipsoid(Constants.WGS84_EARTH_EQUATORIAL_RADIUS, Constants.WGS84_EARTH_FLATTENING, groundFrame);
			atmosphere = new OneAxisEllipsoid(shape.getA()+atmosphereHeight, shape.getB()+atmosphereHeight, groundFrame);
			utc = TimeScalesFactory.getUTC();

		} catch (Throwable t) {
			throw new RuntimeException(t);
		}
	}
		
	public static Vector3D toGroundVelocity(Vector3D spaceVelocity, AbsoluteDate date) {
		try {
			return spaceFrame.getTransformTo(groundFrame, date).transformVector(spaceVelocity);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static Vector3D toSpaceVelocity(Vector3D groundVelocity, AbsoluteDate date) {
		try {
			return groundFrame.getTransformTo(spaceFrame, date).transformPosition(groundVelocity);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static Vector3D toSpacePosition(Vector3D groundPosition, AbsoluteDate date) {
		try {
			return groundFrame.getTransformTo(spaceFrame, date).transformPosition(groundPosition);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static Vector3D toGroundPosition(Vector3D spacePosition, AbsoluteDate date) {
		try {
			return spaceFrame.getTransformTo(groundFrame, date).transformPosition(spacePosition);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static Vector3D toGroundPosition(GeodeticPoint groundPoint) {
		return shape.transform(groundPoint);
	}
	
	public static GeodeticPoint toGroundPoint(Vector3D groundPosition) {
		try {
			return shape.transform(groundPosition, groundFrame, null);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static Vector3D toSpacePosition(GeodeticPoint groundPoint, AbsoluteDate date) {
		return toSpacePosition(shape.transform(groundPoint), date);
	}
	
	public static GeodeticPoint toGroundPoint(Vector3D groundPosition, AbsoluteDate date) {
		try {
			return shape.transform(groundPosition, spaceFrame, date);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	//Assumes that the planet's motion is the largest contributer to movement
	public static Vector3D toGroundVelocity(GeodeticPoint groundPoint) {
		final double cosLat = FastMath.cos(groundPoint.getLatitude()); 
		final double a = shape.getA();
		final double b = shape.getB();
		final double a2 = a*a;
		return groundPoint.getEast().scalarMultiply((a*b*cosLat)/FastMath.sqrt((b*b - a2)*cosLat*cosLat + a2));
	}
	
	public static Vector3D toSpaceVelocity(GeodeticPoint groundPoint, AbsoluteDate date) {
		return toSpaceVelocity(toGroundVelocity(groundPoint), date);
	}
	
	public static double distance(AbsoluteDate date, Station s1, Station s2) {
		return s1.getSpacePositionVector(date).distance(s2.getSpacePositionVector(date));
	}
	
	
	public static boolean lineOfSight(Station s1, Station s2, AbsoluteDate date) {
		try {
			Vector3D pa = s1.getSpacePositionVector(date);
			Vector3D pb = s2.getSpacePositionVector(date);
			GeodeticPoint gp = shape.getIntersectionPoint(new Line(pa, pb, 1d), midpoint(pa, pb), spaceFrame, date);
			
			//if there is no intersection point, return true
			if(gp == null) {
				return true;
			}
			Vector3D pi = toSpacePosition(gp, date);

			//if there is an intersection point, return true iff it is not between the two stations
			return !((FastMath.min(pa.getX(), pb.getX()) < pi.getX()) && (pi.getX() < FastMath.max(pa.getX(), pb.getX())) &&
			         (FastMath.min(pa.getY(), pb.getY()) < pi.getY()) && (pi.getY() < FastMath.max(pa.getY(), pb.getY())) &&
			         (FastMath.min(pa.getZ(), pb.getZ()) < pi.getZ()) && (pi.getZ() < FastMath.max(pa.getZ(), pb.getZ())));
		} catch (Throwable t) {
			return false;
		}
	}
	
	public static boolean lineOfSightConsideringAtmosphere(Station s1, Station s2, AbsoluteDate date) {
		try {
			Vector3D pa = s1.getSpacePositionVector(date);
			Vector3D pb = s2.getSpacePositionVector(date);
			GeodeticPoint gp = atmosphere.getIntersectionPoint(new Line(pa, pb, 1d), midpoint(pa, pb), spaceFrame, date);
			
			//if there is no intersection point, return true
			if(gp == null) {
				return true;
			}
			Vector3D pi = toSpacePosition(gp, date);

			//if there is an intersection point, return true iff it is not between the two stations
			return !((FastMath.min(pa.getX(), pb.getX()) < pi.getX()) && (pi.getX() < FastMath.max(pa.getX(), pb.getX())) &&
			         (FastMath.min(pa.getY(), pb.getY()) < pi.getY()) && (pi.getY() < FastMath.max(pa.getY(), pb.getY())) &&
			         (FastMath.min(pa.getZ(), pb.getZ()) < pi.getZ()) && (pi.getZ() < FastMath.max(pa.getZ(), pb.getZ())));
		} catch (Throwable t) {
			return false;
		}
	}
	
	public static double groundStationAngle(Station groundStation, Station sattelite, AbsoluteDate date) {
		Vector3D gSpace = groundStation.getSpacePositionVector(date);
		Vector3D sSpace = sattelite.getSpacePositionVector(date);
		
		Vector3D gToSspace = new Vector3D(sSpace.getX()-gSpace.getX(), sSpace.getY()-gSpace.getY(), sSpace.getZ()-gSpace.getZ());
		return Vector3D.angle(Earth.toSpaceVelocity(groundStation.getGroundPoint(date).getZenith(), date), gToSspace);
	}
	
	public static Vector3D relativeVelocity(Station observer, Station subject, AbsoluteDate date) {
		Vector3D aV = observer.getSpaceVelocityVector(date);
		Vector3D bV = subject.getSpaceVelocityVector(date);
		return new Vector3D(bV.getX()-aV.getX(), bV.getY()-aV.getY(), bV.getZ()-aV.getZ());
	}
	
	public static double dopplerVelocity(Station observer, Station subject, AbsoluteDate date) {
		Vector3D aP = observer.getSpacePositionVector(date);
		Vector3D bP = subject.getSpacePositionVector(date);
		Vector3D relativePosition = new Vector3D(bP.getX()-aP.getX(), bP.getY()-aP.getY(), bP.getZ()-aP.getZ());
		Vector3D relativeVelocity = relativeVelocity(observer, subject, date);
		
		return Vector3D.dotProduct(relativeVelocity, relativePosition);		
	}
	public static double apparentAngularVelocity(Station observer, Station subject, AbsoluteDate date) {
		Vector3D aP = observer.getSpacePositionVector(date);
		Vector3D bP = subject.getSpacePositionVector(date);
		Vector3D relativePosition = new Vector3D(bP.getX()-aP.getX(), bP.getY()-aP.getY(), bP.getZ()-aP.getZ());
		Vector3D relativeVelocity = relativeVelocity(observer, subject, date);
		double relativeVelocityLength = vectorLength(relativeVelocity);
		double dopplerVelocity = Vector3D.dotProduct(relativeVelocity, relativePosition);
		/*
		 * a^2+b^2=c^2
		 * a^2+d^2=r^2
		 * a^2=r^2-d^2
		 * a = sqrt(r^2-d^2)
		 * correct for length with /relativePosition.length
		*/
		return FastMath.sqrt(FastMath.max(relativeVelocityLength*relativeVelocityLength-dopplerVelocity*dopplerVelocity, 0.d))/vectorLength(relativePosition);		
		
	}
	private static Vector3D midpoint(Vector3D a, Vector3D b) {
		return new Vector3D(a.getX()+b.getX()/2d,
				            a.getY()+b.getY()/2d,
				            a.getZ()+b.getZ()/2d);
	}
	private static double vectorLength(Vector3D v) {
		return FastMath.sqrt(v.getX()*v.getX()+v.getY()*v.getY()+v.getZ()*v.getZ());
	}
		
}








