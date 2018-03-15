package core;

import org.apache.commons.math3.util.FastMath;
import org.orekit.time.AbsoluteDate;

public class RoutingUtil {
	public static final double BOLTZMANN_CONSTANT = 1.38064852e-23d;
	public static final double dB_BOLTZMANN_CONSTANT = 10.0d*FastMath.log10(BOLTZMANN_CONSTANT);
	public static final double MAX_ERROR_RATE = 1e-5;
	public static final double SATTELITE_ANTENNA_MAX_ANGLE = 90.0d *FastMath.PI/180.0d;
	public static final int MAX_SATTELITE_CONNECTIONS_PER_SATTELITE = 4;
	//in SI units
	public static double DISH_SIZE_GROUND = 1.8d;
	public static double DISH_SIZE_SAT = 0.6d;

	public static double FREQUENCY_FROM_GROUND = 2.75e10d;
	public static double FREQUENCY_FROM_SAT = 1.97e10d;

	public static double GROUND_ANTENNA_GAIN = 60.0d*(FREQUENCY_FROM_GROUND*1e-9d)*(FREQUENCY_FROM_GROUND*1e-9d)*DISH_SIZE_GROUND*DISH_SIZE_GROUND;
	public static double SAT_ANTENNA_GAIN = 60.0d*(FREQUENCY_FROM_SAT*1e-9d)*(FREQUENCY_FROM_SAT*1e-9d)*DISH_SIZE_SAT*DISH_SIZE_SAT;
	
	public static double RAIN_ATENUATION = 1e-4d;
	
	public static double POWER_TRANSMIT_FROM_GROUND = 5d;
	public static double POWER_TRANSMIT_FROM_SAT = 0.2d;
	
	public static double LINE_LOSS_FROM_GROUND = FastMath.pow(10d,1.16d/10d);
	public static double LINE_LOSS_FROM_SAT = FastMath.pow(10d,1.16d/10d);
	
	
	//Effective Isotropic Radiated Power
	public static double EIRP_FROM_GROUND = POWER_TRANSMIT_FROM_GROUND * GROUND_ANTENNA_GAIN / LINE_LOSS_FROM_GROUND;
	public static double EIRP_FROM_SAT = POWER_TRANSMIT_FROM_SAT * SAT_ANTENNA_GAIN / LINE_LOSS_FROM_GROUND;

	public static double GROUND_SYSTEM_NOISE_TEMPORATURE = 300d;/*300Kelvin*/
	public static double SAT_SYSTEM_NOISE_TEMPORATURE = 72d;/*72Kelvin*/
	
	/**
	 * @param frequency
	 * @param distance
	 * @return path loss in dB
	 */
	public static double path_loss(double frequency, double distance) {
		return (3e8d/(4.0d*Math.PI*distance*frequency))*(3.0e8d/(4.0d*Math.PI*distance*frequency));
	}
		
	public static double error(AbsoluteDate date, Station tx, Station rx) {
		if(Earth.distance(date, tx, rx)<1000000) {// && rx.isGroundStation()
			Earth.distance(date, tx, rx);
		}
		double stn = 10*FastMath.log10(signal_to_noise(date, tx, rx));
		if(stn <= 0) {
			return 1d;
		}
		double rootStn = FastMath.sqrt(stn);
		
		double erfc = org.hipparchus.special.Erf.erfc(rootStn);
		double halfErfc = erfc/2d;
		
		if(halfErfc<0) {return 0d;}
		if(halfErfc>1) {return 1d;}
		return halfErfc;
		
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
		
		double rain = 1d;
		if(tx.isGroundStation() || rx.isGroundStation()) {//or skims the atmo
			rain = RAIN_ATENUATION;
		}
		
		double gain;
		if(rx.isGroundStation()) {
			gain = GROUND_ANTENNA_GAIN;
		}else {
			gain = SAT_ANTENNA_GAIN;
		}
		
		double temporature;
		if(tx.isGroundStation()) {
			temporature = GROUND_SYSTEM_NOISE_TEMPORATURE;
		}else {
			temporature = SAT_SYSTEM_NOISE_TEMPORATURE;
		}
		
		
		double baud = bandwidth(date, tx, rx);
		
		return (eirp*pathLoss*rain*gain)/(baud*temporature*BOLTZMANN_CONSTANT);
	}
	
	public static double bandwidth(AbsoluteDate date, Station tx, Station rx) {
		double modulation = 4.d;
		double frequencyRange = 1e7d;
		return frequencyRange/modulation;
	}
	
	public static double delay(AbsoluteDate date, Station tx, Station rx) {
		
		return Earth.distance(date, tx, rx)/(3e8d);
	}
	
	public static double errorChance(double bitwiseErrorRate, int packetLenthInBytes) {
		/*
		 * p = odds that a specific bit has been fliped
		 * 
		 * k = 0, we accept only 0 flips
		 * 
		 * n = the length of the packet in bits
		 * 
		 * (n choose k) (p^k) ((1-p)^(n-k))
		 * 
		 * (n!/(k!(n-k)!)) (p^k) ((1-p)^(n-k))
		 * 
		 * (n!/(0!(n-0)!)) (p^0) ((1-p)^(n-0))
		 * 
		 * (n!/n!) (1) ((1-p)^(n))
		 * 
		 * (1) (1) (1-p)^(n)
		 * 
		 * (1-p)^(n)
		 * 
		 * the odds that a given bit survives the trip ^ #of bits
		 */
		return FastMath.pow((1-bitwiseErrorRate),(packetLenthInBytes<<3));
	}
	
	public static double errorChange(double bitwiseErrorRate) {
		return errorChance(bitwiseErrorRate, (int)AutoPacketSender.meanPacketSize());
	}
	
}
