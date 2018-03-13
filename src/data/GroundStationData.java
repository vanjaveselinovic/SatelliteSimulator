package data;

public class GroundStationData {
	public int id;//only used on output, in the same counting as the satellites
	public String name;
	public double latitude;
	public double longitude;
	public double altitude;//can be left off. don't go too high, some math starts to misbehave
	
	public int rate; // in Mb/s
	
	public PacketSenderData[] senders;//things being sent from this node, can be empty or null
	
	//it is always running
	//it does not move
	//This might change later, but null will always mean always on and no moving
	
	public GroundStationData(
				String name,
				double lat,
				double lon,
				String traffic
			) {
		this.name = name;
		this.latitude = lat;
		this.longitude = lon;
		if (traffic.equals('l')) this.rate = 1;
		else if (traffic.equals('m')) this.rate = 10;
		else this.rate = 100;
	}
}
