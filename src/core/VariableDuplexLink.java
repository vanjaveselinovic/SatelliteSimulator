package core;

import java.io.IOException;

import jns.element.DuplexLink;
import jns.trace.Event;
import jns.trace.EventParameter;
import jns.trace.Trace;
import jns.trace.Traceable;

public class VariableDuplexLink extends DuplexLink implements Traceable {

	private Trace trace;

	public VariableDuplexLink(Trace trace, int bandwidth, double delay) {
		this(trace, bandwidth, delay, 0.0d);

	}

	public VariableDuplexLink(Trace trace, int bandwidth, double delay, double error) {
		super(bandwidth, delay, error);
		this.trace = trace;
	}

	public void setProperties(int bandwidth, double delay, double error) {
		setBandwidth(bandwidth);
		setDelay(delay);
		setError(error);
		Event e = new Event("Link Update Event");
		e.addParameter(new EventParameter("source", this));

		e.addParameter("bandwidth", bandwidth);
		e.addParameter("delay", delay);
		e.addParameter("error", error);

		trace.handleEvent(e);
	}

	private void setBandwidth(int bandwidth) {
		m_link1.m_bandwidth = bandwidth;
		m_link2.m_bandwidth = bandwidth;
	}

	private void setDelay(double delay) {
		m_link1.m_delay = delay;
		m_link2.m_delay = delay;
	}

	private void setError(double error) {
		m_link1.m_error = error;
		m_link2.m_error = error;
	}

}
