package data;

public class SimulationConfigurationData {
	public ConstellationData[] constellations;
	public GroundStationData[] groundStations;
	//long[] PacketSenderIDsOfInterest;//leave null or empty to record everything, otherwise just record the connections created by these senders
	
	//use one option
	public String startTime;//utc dateTime string, see org.orekit.time.DateTimeComponents.parseDateTime(String)
	
	public double deltaT;//how far apart are the satellite movement time steps?
	public double endTimeInMinutes;
	
	public SimulationConfigurationData(
			ConstellationData[] constellations,
			GroundStationData[] groundStations,
			String startTime,
			int duration,
			double interval) {
		this.constellations = constellations;
		this.groundStations = groundStations;
		this.startTime = startTime;
		this.endTimeInMinutes = duration;
		this.deltaT = interval;
	}
	
}
