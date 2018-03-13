package data;

public class PathData {
	long packetSenderID;
	int[] stationIDs;//in order from source to destination, the ids of each point in the journey
	double[] delays;//all delays, used to find jitter and mean delay. Only counts successful and outOfOrder Packets 
	
	//simple counts of all packets that met their end
	//a packet that stopped flying in this period is recording in exactly one of these 4 counts
	int sucsessfulPackets;
	int outOfOrderPackets;
	int droppedPackets;
	int damagedPackets;
}
