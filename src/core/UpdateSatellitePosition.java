package core;

import jns.Simulator;
import jns.command.Command;

public class UpdateSatellitePosition extends Command{
	Manager man;
	public UpdateSatellitePosition(Manager man, double time) {
		super("UpdateSatellitePositionEvent", time);
		this.man = man;
	}

	@Override
	public void execute() {
		man.updateSattelitePositions();
		Simulator.getInstance().schedule(new UpdateSatellitePosition(man, this.man.simTime+this.man.deltaT));
	}
	
}
