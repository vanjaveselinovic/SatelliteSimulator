package data;

public class SimulationConfigurationData {
	public SimulationConfigurationData(ConstellationData[] constellations, GroundStationData[] groundStations) {
		// TODO Auto-generated constructor stub
	}

	ConstellationData[] constellations;
	GroundStationData[] groundStations;
	//long[] PacketSenderIDsOfInterest;//leave null or empty to record everything, otherwise just record the connections created by these senders
	
	//use one option
	String startTime;//utc dateTime string, see org.orekit.time.DateTimeComponents.parseDateTime(String)

	double deltaT;//how far apart are the satellite movement time steps?
	
}
