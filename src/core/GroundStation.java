package core;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.time.AbsoluteDate;

public class GroundStation extends Station{
	private GeodeticPoint groundPoint;

	@Override
	public Vector3D getSpacePositionVector(AbsoluteDate date) {
		return Earth.toSpacePosition(groundPoint, date);
	}

	@Override
	public Vector3D getSpaceVelocityVector(AbsoluteDate date) {
		return Earth.toSpaceVelocity(groundPoint, date);
	}

	@Override
	public Vector3D getGroundPositionVector(AbsoluteDate date) {
		return Earth.toGroundPosition(groundPoint);
	}

	@Override
	public GeodeticPoint getGroundPoint(AbsoluteDate date) {
		return groundPoint;
	}

	@Override
	public boolean isGroundStation() {
		return true;
	}
	
	

	
}
