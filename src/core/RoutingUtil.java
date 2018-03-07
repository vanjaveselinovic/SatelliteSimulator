package core;

import org.apache.commons.math3.util.FastMath;
import org.orekit.time.AbsoluteDate;

public class RoutingUtil {
	public static final double BOLTZMANN_CONSTANT = 1.38064852e-23d;
	public static final double dB_BOLTZMANN_CONSTANT = 10.0d*FastMath.log10(BOLTZMANN_CONSTANT);
	//in SI units
	public static double DISH_SIZE_GROUND = 1.0d;
	public static double DISH_SIZE_SAT = 0.6d;

	public static double FREQUENCY_FROM_GROUND = 2.75e10d;
	public static double FREQUENCY_FROM_SAT = 1.97e10d;

	public static double GROUND_ANTENNA_GAIN = 10.0d*FastMath.log10(60.0d*FREQUENCY_FROM_GROUND*FREQUENCY_FROM_GROUND*DISH_SIZE_GROUND*DISH_SIZE_GROUND);
	public static double SAT_ANTENNA_GAIN = 10.0d*FastMath.log10(60.0d*FREQUENCY_FROM_SAT*FREQUENCY_FROM_SAT*DISH_SIZE_SAT*DISH_SIZE_SAT);
	
	public static double RAIN_ATENUATION = -40.0d;
	
	public static double POWER_TRANSMIT_FROM_GROUND = 10*FastMath.log10(0.225d);
	public static double POWER_TRANSMIT_FROM_SAT = 10*FastMath.log10(0.2d);
	
	public static double LINE_LOSS_FROM_GROUND = 1.16d;
	public static double LINE_LOSS_FROM_SAT = 1.16d;
	
	
	//Effective Isotropic Radiated Power
	public static double EIRP_FROM_GROUND = POWER_TRANSMIT_FROM_GROUND + LINE_LOSS_FROM_GROUND + GROUND_ANTENNA_GAIN;
	public static double EIRP_FROM_SAT = POWER_TRANSMIT_FROM_SAT + LINE_LOSS_FROM_GROUND + SAT_ANTENNA_GAIN;
	
	public static double SYSTEM_NOISE_TEMPORATURE = 10.0d*FastMath.log10(300.d);/*300K*/
	
	/**
	 * @param frequency
	 * @param distance
	 * @return path loss in dB
	 */
	public static double path_loss(double frequency, double distance) {
		return 10.0d*Math.log10((3e8d/(4.0d*Math.PI*distance*frequency))*(3.0e8d/(4.0d*Math.PI*distance*frequency)));
	}
		
	public static double error(AbsoluteDate date, Station tx, Station rx) {
		return org.apache.commons.math3.special.Erf.erfc(FastMath.sqrt(signal_to_noise(date, tx, rx)));
	}
	
	private static double signal_to_noise(AbsoluteDate date, Station tx, Station rx) {
		
		double eirp;
		if(tx.isGroundStation()) {
			eirp = EIRP_FROM_GROUND;
		}else {
			eirp = EIRP_FROM_SAT;
		}
		
		double frequency;
		if(tx.isGroundStation()) {
			frequency = FREQUENCY_FROM_GROUND;
		}else {
			frequency = FREQUENCY_FROM_SAT;
		}
				
		double pathLoss = path_loss(frequency, Earth.distance(date, tx, rx));
		
		double rain = 0d;
		if(tx.isGroundStation() || rx.isGroundStation()) {
			rain = RAIN_ATENUATION;
		}
		
		double gain;
		if(rx.isGroundStation()) {
			gain = GROUND_ANTENNA_GAIN;
		}else {
			gain = SAT_ANTENNA_GAIN;
		}
		
		double baud = bandwidth(date, tx, rx);
		
		return (eirp+pathLoss+rain+gain)-(baud+SYSTEM_NOISE_TEMPORATURE+dB_BOLTZMANN_CONSTANT);
	}

	
	public static double bandwidth(AbsoluteDate date, Station tx, Station rx) {
		double modulation = 4.d;
		double frequencyRange = 1e7d;
		return frequencyRange/modulation;
	}
	
	public static double delay(AbsoluteDate date, Station tx, Station rx) {
		
		return Earth.distance(date, tx, rx)/(3e8d);
	}
}
