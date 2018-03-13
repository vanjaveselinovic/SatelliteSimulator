package jns.element;

import org.hipparchus.util.FastMath;

import jns.trace.Trace;

/**
 * All information is kept in the internal m_link1.
 */
public class DuplexLink extends Link {

	private SimplexLink m_link1, m_link2;

	public DuplexLink() {}
	
	public DuplexLink(int bandwidth, double delay) {
		m_link1=new SimplexLink(bandwidth, delay);
		m_link2=new SimplexLink(bandwidth, delay);
	}

	public DuplexLink(int bandwidth, double delay, double error) {
		m_link1=new SimplexLink(bandwidth, delay, error);
		m_link2=new SimplexLink(bandwidth, delay, error);
	}

	public void dump() {
		System.out.println("DuplexLink: ");
		getM_link1().dump();
		getM_link2().dump();
	}

	public void attach(Trace trace) {
		getM_link1().attach(trace);
		getM_link2().attach(trace);
	}

	public void update() {

	}

	public SimplexLink getSimplexLink1() {
		return getM_link1();
	}

	public SimplexLink getSimplexLink2() {
		return getM_link2();
	}

	/**
	 * Set the status of this link, either 'up' or 'down'. Use the integer constants
	 * provided in jns.util.Status.
	 * 
	 * @param status
	 *            the new status of the link
	 */
	public void setStatus(int status) {
		getM_link1().setStatus(status);
		getM_link2().setStatus(status);
	}

	/**
	 * Return the status of this link, either 'up' or 'down'. Returns one of the
	 * constans provided in jns.util.Status.
	 * 
	 * @return Status.UP or Status.DOWN.
	 */
	public int getStatus() {
		return getM_link1().getStatus();
	}

	public double getBandwidth() {
		return FastMath.min(getM_link1().getBandwidth(),getM_link2().getBandwidth());
	}

	public double getDelay() {
		return FastMath.max(getM_link1().getDelay(),getM_link2().getDelay());
	}
	
	public double getError() {
		return FastMath.max(getM_link1().getError(),getM_link2().getError());
	}

	public Interface getIncomingInterface() {
		return getM_link1().getIncomingInterface();
	}

	public Interface getOutgoingInterface() {
		return getM_link1().getOutgoingInterface();
	}

	protected SimplexLink getM_link1() {
		return m_link1;
	}

	protected SimplexLink getM_link2() {
		return m_link2;
	}
	
}
