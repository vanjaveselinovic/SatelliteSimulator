package data;

public class ConstellationData {

	//describe satellite [0][0];
	public double eccentricity;  				//{non-0, unit-less} shape of the ellipse, describing how much it is elongated compared to a circle (not marked in diagram).
	public double period;						//in seconds, the orbital period of this constelation
	public double inclination;					//{in rad} vertical tilt of the ellipse with respect to the reference plane, measured at the ascending node (where the orbit passes upward through the reference plane, the green angle i in the diagram). Tilt angle is measured perpendicular to line of intersection between orbital plane and reference plane. Any three points on an ellipse will define the ellipse orbital plane. The plane and the ellipse are both two-dimensional objects defined in three-dimensional space.
	public double longitudeOfAscendingNode;	    //{in rad} horizontally orients the ascending node of the ellipse (where the orbit passes upward through the reference plane) with respect to the reference frame's vernal point
	public double argumentOfPeriapsis;			//{in rad} defines the orientation of the ellipse in the orbital plane, as an angle measured from the ascending node to the periapsis (the closest point the satellite object comes to the primary object around which it orbits)
	public double trueAnomaly;					//{in rad} defines the position of the orbiting body along the ellipse at simulation time 0
    
    public boolean doubled;
    
    public int satellitesPerRing;
    public int numberOfRings;
    public double offsetBetweenRings;	//0 	satellites of absent rings are right beside one another, 
    							//0.5 	rings are offset by half a satellite gap
    							//-0.5  the same as 0.5, but in the other direction (only effects numbering)
    
    public ConstellationData(
	    		double periodInMinutes,
	    		double inclination,
	    		int satellitesPerRing,
	    		int numberOfRings,
	    		double offsetBetweenRings,
	    		boolean doubled
	    	) {
    	this.eccentricity = 0;
    	
    	this.period = periodInMinutes * 60;
    	this.inclination = inclination;
    	
    	this.longitudeOfAscendingNode = 0;
    	this.argumentOfPeriapsis = 0;
    	this.trueAnomaly = 0;
    	
    	this.doubled = doubled;    	
    	this.satellitesPerRing = satellitesPerRing;
    	this.numberOfRings = numberOfRings;
    	this.offsetBetweenRings = offsetBetweenRings;
    }
    

	/*
	 * give me sattelite[0][0]'s orbit
	 * 
	 * remember to give it a bit of eccentricity so that they don't collide
	 * also argument or pariapsis
	 * 
	 */
}
