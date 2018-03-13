package data;

public class RingData {
	public int ringNumber;//rings are counted from 1, no 2 rings have the same number
	public int[] stationIds;//the ids of all the stations in this ring
	
	public double eccentricity;  				//{non-0, unit-less} shape of the ellipse, describing how much it is elongated compared to a circle (not marked in diagram).
	public double semimajorAxis;				//{in m from Earth's core}the mean radius. You can treat this like the radius.
	public double inclination;					//{in rad} vertical tilt of the ellipse with respect to the reference plane, measured at the ascending node (where the orbit passes upward through the reference plane, the green angle i in the diagram). Tilt angle is measured perpendicular to line of intersection between orbital plane and reference plane. Any three points on an ellipse will define the ellipse orbital plane. The plane and the ellipse are both two-dimensional objects defined in three-dimensional space.
	public double longitudeOfAscendingNode;	    //{in rad} horizontally orients the ascending node of the ellipse (where the orbit passes upward through the reference plane) with respect to the reference frame's vernal point
	public double argumentOfPeriapsis;			//{in rad} defines the orientation of the ellipse in the orbital plane, as an angle measured from the ascending node to the periapsis (the closest point the satellite object comes to the primary object around which it orbits)

}
