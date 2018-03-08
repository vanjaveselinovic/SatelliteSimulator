package data;

public class GroundStationData {
	
	String name;
	double latitude;
	double longitude;
	double altitude;//can be left off. don't go too high, some math starts to misbehave
	
	PacketSenderData[] senders;//things being sent from this node, can be empty or null
	
	//it is always running
	//it does not move
	//This might change later, but null will always mean always on and no moving
}
