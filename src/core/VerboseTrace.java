package core;

import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;
import java.util.StringJoiner;
import java.util.TreeSet;

import jns.trace.Event;
import jns.trace.Trace;
import jns.trace.Traceable;

public class VerboseTrace extends Trace {
	private SortedSet<Traceable> elements = new TreeSet<>();
	private List<Event> events = new ArrayList<>();
	
	@Override
	public void attach(Traceable t) {
		synchronized(elements){
			elements.add(t);
		}
	}
	
	@Override
	public void writePreamble() {
		System.out.println(this.dumpElementsJson());
	}

	@Override
	public void handleEvent(Event e) {
		synchronized(elements){
			events.add(e);
		}
	}

	@Override
	public void writePostamble() {
		
	}
	
	public String dumpElementsJson() {
		StringJoiner sj = new StringJoiner(",\n","[\n","\n]");

		synchronized(elements){
			for(Traceable t : elements) {
				sj.add(t.dumpJson());
			}
		}
		return sj.toString();
	}
}
