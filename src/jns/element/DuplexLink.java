package jns.element;

import jns.trace.Trace;

/**
 * All information is kept in the internal m_link1.
 */
public class DuplexLink extends Link {

	public SimplexLink m_link1, m_link2;

	public DuplexLink(int bandwidth, double delay) {
		m_link1 = new SimplexLink(bandwidth, delay);
		m_link2 = new SimplexLink(bandwidth, delay);
	}

	public DuplexLink(int bandwidth, double delay, double error) {
		m_link1 = new SimplexLink(bandwidth, delay, error);
		m_link2 = new SimplexLink(bandwidth, delay, error);
	}

	public void dump() {
		System.out.println("DuplexLink: ");
		m_link1.dump();
		m_link2.dump();
	}

	public void attach(Trace trace) {
		m_link1.attach(trace);
		m_link2.attach(trace);
	}

	public void update() {

	}

	public SimplexLink getSimplexLink1() {
		return m_link1;
	}

	public SimplexLink getSimplexLink2() {
		return m_link2;
	}

	/**
	 * Set the status of this link, either 'up' or 'down'. Use the integer constants
	 * provided in jns.util.Status.
	 * 
	 * @param status
	 *            the new status of the link
	 */
	public void setStatus(int status) {
		m_link1.setStatus(status);
		m_link2.setStatus(status);
	}

	/**
	 * Return the status of this link, either 'up' or 'down'. Returns one of the
	 * constans provided in jns.util.Status.
	 * 
	 * @return Status.UP or Status.DOWN.
	 */
	public int getStatus() {
		return m_link1.getStatus();
	}

	public int getBandwidth() {
		return m_link1.getBandwidth();
	}

	public double getDelay() {
		return m_link1.getDelay();
	}
	
	public double getError() {
		return m_link1.getError();
	}

	public Interface getIncomingInterface() {
		return m_link1.getIncomingInterface();
	}

	public Interface getOutgoingInterface() {
		return m_link1.getOutgoingInterface();
	}
	
	/*
	@Override
	public String dumpJson() {
		
		return 
				"{"
				+ "\"id\":"+this.id+","
				+ "\"type\":\""+this.getClass().getSimpleName()+"\","
				+ "\"bandwidth\":\""+this.getBandwidth()+"\","
				+ "\"delay\":\""+this.getDelay()+"\","
				+ "\"error\":\""+this.getError()+"\","
				+ "\"addresses\":\"["+this.getSimplexLink1().m_in.getIPAddr()+","+this.getSimplexLink1().m_out.getIPAddr()+"]\","
				+ "\"link_ids\":\"["+this.getSimplexLink1().id+","+this.getSimplexLink1().id+"]\","
				+ "}";
	}*/
}
