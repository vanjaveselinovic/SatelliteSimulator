package jns;

import jns.command.Command;
import jns.element.Element;
import jns.trace.Trace;
import jns.util.Preferences;
import jns.util.PriorityQueue;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.Vector;

import core.Manager;

/**
 * Simulator is the main class in JNS. It contains the main loop that will
 * update the elements of the network. Objects can request to have their own
 * commands scheduled here to have them executed at a specific time.
 */
public class Simulator implements Runnable {

	private Set<Element> m_elements;

	private double m_time; // Time in seconds

	private static Simulator m_instance = null;

	private boolean m_finished; // Flag to finish the run() loop

	private PriorityQueue m_commands; // Queue of Command objects

	private Trace m_trace; // the trace object
	
	private Manager man;

	/**
	 * Default Constructor. Initialises the internal structure and resets the time
	 * to zero. You cannot call this from outside, this is a singleton class. Use
	 * the getInstance function.
	 * 
	 * @see getInstance
	 */
	private Simulator() {
		m_elements = new HashSet<>();
		m_commands = new PriorityQueue();
		m_time = 0;
		m_finished = false;

	}

	public void setTrace(Trace trace) {
		m_trace = trace;
	}

	/**
	 * Return the singleton instance of the simulator. There can only ever be one
	 * simulator active at a time.
	 * 
	 * @return the one and only simulator object
	 */
	public static Simulator getInstance() {
		if (m_instance == null)
			m_instance = new Simulator();
		return m_instance;
	}
	
	public static void clearInstance() {
		m_instance = null;
	}
	
	/**
	 * Attach a new element to the simulator to be updated regularly during the
	 * simulation.
	 * 
	 * @param element
	 *            the element to add
	 */
	public void attach(Element element) {
		m_elements.add(element);
	}

	/**
	 * A very useful helper function if elements have to be attach to the simulator
	 * and traced afterwards. Saves you the time of calling element.attach(trace)
	 * separately.
	 */
	public void attachWithTrace(Element element) {
		attach(element);
		element.attach(m_trace);
	}

	/**
	 * Add a command the simulator should execute at a specific time
	 * 
	 * @param command
	 *            the command object that should be executed
	 * 
	 *            --Changed to synchronize on the command queue, and notifying
	 *            sleeping threads.
	 */
	public void schedule(Command command) {
		synchronized (m_commands) {
			m_commands.push(command, command.getTime());
			m_commands.notifyAll();
		}
	}

	/**
	 * Dump the contents of the simulator, for debugging purposes. This function
	 * calls the dump function of all elements in the simulator.
	 */
	public void dump() {

		System.out.println("----------[STATIC ELEMENTS]----------");

		for (Element curelement : m_elements) {
			curelement.dump();
			System.out.println("---------------");
		}

		System.out.println("------------[COMMANDS]---------------");
		Enumeration e = m_commands.elements();
		while (e.hasMoreElements()) {
			Command curcommand = (Command) e.nextElement();
			System.out.println(curcommand.getName() + ": " + curcommand.getTime());
		}
	}

	/**
	 * Enumerate the elements stored in the simulator. This can be used by other
	 * objects to, say, print them out.
	 * 
	 * @return an Enumeration of the elements in the simulator
	 */
	public Enumeration enumerateElements() {
		return java.util.Collections.enumeration(m_elements);
	}

	/**
	 * Run the actual simulation. This takes over control from the calling program
	 * for a long period of time, don't expect to do anything in the meantime. After
	 * the execution of run(), the contents of the simulator and all its elements
	 * are invalid.
	 * 
	 * --Changed, now runs as a separated thread. Will now return immediately. This
	 * function now allows for scheduling of events to take place after the
	 * simulation has started. NOTE: The events still need to be in the right
	 * temporal order though!
	 */
	public void run() {

		m_trace.writePreamble();

		while (m_commands.size() > 0 || !m_finished) {

			// Needs to do a busy wait until there is a command...
			Command current_command = null;
			synchronized (m_commands) {
				
				while (m_commands.size() <= 0) {
					try {
						m_commands.wait();
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}

				current_command = (Command) m_commands.peek();
				m_commands.pop();
			}

			m_time = current_command.getTime();
			man.setTime(m_time);
			current_command.execute();

		}
		m_trace.writePostamble();
		Simulator.verbose("The simulator has stopped, and has successfully written a JVS file");
		// System.exit(0); //I want to be able to run more than one of these
	}

	/**
	 * error can be used by elements to display an error message and exit
	 * immediately, if the error cannot be recovered.
	 * 
	 * @param message
	 *            the error message to display. It is prepended with the string
	 *            "*JNS ERROR*".
	 */
	public static void error(String message) {
		System.err.println("*JNS ERROR* " + message);
		System.exit(1);
	}

	/**
	 * warning can be used by elements to display information about non-fatal
	 * errors.
	 * 
	 * @param message
	 *            the warning message to display. It is prepended with the string
	 *            "*JNS WARNING*".
	 */
	public static void warning(String message) {
		System.err.println("*JNS WARNING* " + message);
	}

	/**
	 * verbose is used to print out messages if the simulator is in verbose mode.
	 * Elements use this for debugging output. Nothing will be displayed if the
	 * Preferences.verbose variable is set to false.
	 * 
	 * @param message
	 *            the string to display
	 */
	public static void verbose(String message) {
		if (Preferences.verbose)
			System.out.println(message);
	}

	/**
	 * This function is just an aid that allows printing of integers. It will
	 * convert the integer to a string and forward the call to the verbose(String)
	 * function.
	 * 
	 * @param i
	 *            the integer to print out
	 */
	public static void verbose(int i) {
		Simulator.verbose(String.valueOf(i));
	}

	/**
	 * Return the current time in the simulation, in seconds.
	 * 
	 * @return the current time in seconds
	 */
	public double getTime() {
		return m_time;
	}

	/**
	 * Set a flag that will quit the simulator immediately.
	 */
	public void setFinished() {
		m_finished = true;
	}

	public void setManager(Manager manager) {
		this.man = manager;
	}

	public Manager getManager() {
		// TODO Auto-generated method stub
		return man;
	}

}
