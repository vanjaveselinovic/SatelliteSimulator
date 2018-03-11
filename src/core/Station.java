package core;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.BodyShape;
import org.orekit.bodies.CelestialBody;
import org.orekit.bodies.CelestialBodyFactory;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.bodies.OneAxisEllipsoid;
import org.orekit.frames.Frame;
import org.orekit.frames.FramesFactory;
import org.orekit.time.AbsoluteDate;
import org.orekit.time.TimeScale;
import org.orekit.time.TimeScalesFactory;
import org.orekit.utils.Constants;

import jns.element.Node;
import jns.util.RoutingTable;

public abstract class Station {
	

	public Node node;
	public RoutingTable table;

	public abstract Vector3D getSpacePositionVector(AbsoluteDate date);
	public abstract Vector3D getSpaceVelocityVector(AbsoluteDate date);
	public abstract Vector3D getGroundPositionVector(AbsoluteDate date);
	public abstract GeodeticPoint getGroundPoint(AbsoluteDate date);
	public abstract boolean isGroundStation();

}
