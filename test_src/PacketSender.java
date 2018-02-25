import jns.command.Command;
import jns.element.IPHandler;
import jns.util.IPAddr;
import jns.util.Protocols;

public class PacketSender extends Command {

	PacketSenderData data = new PacketSenderData();

	public PacketSender(IPHandler handler,double time) {
      super("PacketSender",time);
      data.m_ip=handler;
    }

    public void execute() {
      data.m_ip.send(data.m_ip.getAddress(),new IPAddr(128,116,11,20),1000,null,
		Protocols.TCP);
    }
}