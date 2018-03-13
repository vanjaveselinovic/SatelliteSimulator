package core;

import jns.trace.Event;
import jns.trace.Trace;
import jns.trace.Traceable;

public class QuietTrace extends Trace {
	
	@Override
	public void attach(Traceable t) {
	}
	
	@Override
	public void writePreamble() {
	}

	@Override
	public void handleEvent(Event e) {
	}

	@Override
	public void writePostamble() {
		
	}
}
