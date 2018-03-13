package core;

import java.util.ArrayList;
import java.util.List;

import org.hipparchus.geometry.euclidean.threed.Vector3D;
import org.orekit.bodies.GeodeticPoint;
import org.orekit.time.AbsoluteDate;

import data.GroundStationData;
import data.PacketSenderData;

public class GroundStation extends Station{
	private GeodeticPoint groundPoint;
	private List<AutoPacketSender> senders = new ArrayList<>();
	String name;

	public GroundStation(GroundStationData data) {
		super(data.name);
		this.groundPoint = new GeodeticPoint(data.latitude, data.longitude, data.altitude);
	}

	@Override
	public Vector3D getSpacePositionVector(AbsoluteDate date) {
		return Earth.toSpacePosition(groundPoint, date);
	}

	@Override
	public Vector3D getSpaceVelocityVector(AbsoluteDate date) {
		return Earth.toSpaceVelocity(groundPoint, date);
	}

	@Override
	public Vector3D getGroundPositionVector(AbsoluteDate date) {
		return Earth.toGroundPosition(groundPoint);
	}

	@Override
	public GeodeticPoint getGroundPoint(AbsoluteDate date) {
		return groundPoint;
	}

	@Override
	public boolean isGroundStation() {
		return true;
	}
	
	
	public GroundStationData asData() {
		GroundStationData data = new GroundStationData();
		
		data.id = this.ip.getIntegerAddress();
		data.name = this.name;
		data.latitude = this.groundPoint.getLatitude();
		data.longitude = this.groundPoint.getLongitude();
		data.altitude = this.groundPoint.getAltitude();
		
		List<PacketSenderData> senderData = new ArrayList<>();
		for(AutoPacketSender s : senders) {
			senderData.add(s.asData());
		}
		
		data.senders = senderData.toArray(new PacketSenderData[0]);
		return data;
	}

	public void add(AutoPacketSender autoPacketSender) {
		senders.add(autoPacketSender);
	}
	
}
