package data;

public class PacketSenderData {
	long id;//must be non-0, used to allow you to display results from one connection at a time
	String receverName;
	double meanInterArivalTime; //using exponential distribution
	//boolean tcp; might be able to add this later, default will be UDP
}
