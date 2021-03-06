package jns.trace;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Vector;

public abstract class Traceable {
	/**
	 * List of Trace objects that are listening to us.
	 */
	
	public Vector m_traces = new Vector();

	public void attach(Trace trace) {
		m_traces.addElement(trace);
		trace.attach(this);
	}

	public void detach(Trace trace) {
	};

	/**
	 * Used by subclasses to send events to a Trace object. This gets rid of lots of
	 * if/else code by making the decision if anyone is listening in here.
	 */
	public void sendEvent(Event event) {
		Enumeration e = m_traces.elements();
		while (e.hasMoreElements()) {
			Trace trace = (Trace) e.nextElement();
			trace.handleEvent(event);
		}

	}
	
	
	
}
