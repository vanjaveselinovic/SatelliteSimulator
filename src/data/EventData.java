package data;

import core.Satellite;

public class EventData {
	public double startSimulationTime;//time in s from simulation start
	public String startUtcTime;//utc timestamp
	public double endSimulationTime;//time in s from simulation start
	public String endUtcTime;//utc timestamp
	public PathData[] paths;
	public SatelliteData[] satelliteData;
}
