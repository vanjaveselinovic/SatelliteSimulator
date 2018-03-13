package data;

public class OutputData {
	String startTime;//utc start time string
	double deltaT;
	int numberOfStations;//stations are numbered in the range [1, max] inclusive. Stations are ground stations and/or satellites
	GroundStationData[] groundStations;
	RingData[] rings;
	EventData[] events;//in order
}
