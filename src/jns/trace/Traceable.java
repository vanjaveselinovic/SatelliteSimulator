package jns.trace;

import java.io.IOException;
import java.util.Enumeration;
import java.util.Vector;

public abstract class Traceable implements Comparable<Traceable> {
	private static long traceableIdCounter = 1L;
	public final long id = traceableIdCounter++;
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
	
	public abstract String dumpJson();
	
	@Override
	public final boolean equals(Object o) {
		if(o == null) {
			return false;
		}else if(!(o instanceof Traceable)) {
			return false;
		}else {
			Traceable t = (Traceable)o;
			return this.id==t.id;
		}
	}
	
	@Override
	public final int hashCode() {
		return Long.valueOf(id).intValue();
	}
	
	@Override
	public int compareTo(Traceable t) {
		return Long.compare(this.id, t.id);
	}
}
