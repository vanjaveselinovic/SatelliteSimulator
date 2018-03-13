package data;

public class OutputData {
	public String startTime;//utc start time string
	public double deltaT;
	public int numberOfStations;//stations are numbered in the range [1, max] inclusive. Stations are ground stations and/or satellites
	public GroundStationData[] groundStations;
	public RingData[] rings;
	public EventData[] events;//in order
}
