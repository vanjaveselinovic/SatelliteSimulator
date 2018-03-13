package core;

import jns.trace.Event;
import jns.trace.Trace;
import jns.trace.Traceable;

public class QuietTrace extends Trace {
	
	@Override
	public void attach(Traceable t) {
		//t.attach(this);
	}
	
	@Override
	public void writePreamble() {
	}

	@Override
	public void handleEvent(Event e) {
		//System.out.println(e.getName());
	}

	@Override
	public void writePostamble() {
		
	}
}
