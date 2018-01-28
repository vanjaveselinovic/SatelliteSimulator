var Satellite = function(params) {
	if (params === undefined) params = {};

	var inclination = params.inclination;
	var ascendingNode = params.longitude;

	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;

	var periapsis = params.periapsis;
	var revPerDay = params.revPerDay;

	var date = new Date(2018, 1, 1, 12, 0, 0);

	function generateTLELine1() {
		return '1'+' '+ //line number
				'99999'+'U'+' '+ //satellite number and classification
				'18'+'001'+'A  '+' '+ //launch year, number, and piece
				'00'+'001.00000000'+' '+ //epoch year and day
				'−.00002182'+' '+ //first time derivate of mean motion / 2 (zero here)
				' 00000-0'+' '+ //second time derivative of mean motion / 6 (zero here)
				'-11606-4'+' '+ //drag term (zero here)
				'0'+' '+
				'001'+' '+ //element set number
				'0'; //should be checksum but we don't need to have one	
	};

	function generateTLELine2(inclination, rAscOfAscNode, eccentricity, argOfPer, meanAnom, meanMotion) {
		return '2'+' '+ //line number
				'99999'+' '+ //satellite number
				inclination+' '+ //inclination (degrees)
				rAscOfAscNode+' '+ //right ascension of the ascending node (degrees)
				eccentricity+' '+ //eccentricity (decimal point assumed)
				argOfPer+' '+ //argument of periapsis (degrees)
				meanAnom+' '+ //mean anomaly (degrees)
				meanMotion+' '+ //mean motion (revolutions per day)
				'00000'+' '+ //revolution number at epoch (revolutions)
				'0'; //should be checksum but we don't need to have one
	};

	function precise(number, precision) {
		return Number.parseFloat(number).toPrecision(precision);
	}

	var tleLine1 = generateTLELine1();
   	var tleLine2 = generateTLELine2(
			'00.0000',
			'000.0000',
			'0000000',
			precise(periapsis, 7)+'',//'130.5360',
			'000.0000',
			precise(revPerDay, 10)+''
	);

    var satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    var positionAndVelocity, positionEci, gmst, positionGd, lonRad, latRad, height;
    const EARTH_RADIUS = 6371000; //in meters

	function getPosition(date) {
	    positionAndVelocity = satellite.propagate(satrec, date);

	    positionEci = positionAndVelocity.position;

	    gmst = satellite.gstime(date);

	    positionGd = satellite.eciToGeodetic(positionEci, gmst);
	    
	    lonRad = positionGd.longitude;
	    latRad = positionGd.latitude;
	    height = positionGd.height;

	    if (lonRad < -1*Math.PI) lonRad += 2*Math.PI;

	    return {
	    	longitude: satellite.degreesLong(lonRad),
	    	latitude: satellite.degreesLat(latRad),
	    	altitude: height*1000 - EARTH_RADIUS
	    };
    };

	var position = getPosition(date);

	this.placemark = new WorldWind.Placemark(
			new WorldWind.Position(
					position.latitude,
					position.longitude,
					position.altitude),
			false,
			null);

	this.placemark.altitudeMode = WorldWind.ABSOLUTE;
	this.placemark.attributes = placemarkAttributes;
	this.placemark.highlightAttributes = highlightAttributes;

	this.update = function(newDate) {
		date = newDate;

		position = getPosition(date);
		this.placemark.position.latitude = position.latitude;
		this.placemark.position.longitude = position.longitude;
		this.placemark.position.altitude = position.altitude;
	};
};