var Globe = function(params) {
	if (params === undefined) params = {};

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
				argOfPer+' '+ //argument of perigree (degrees)
				meanAnom+' '+ //mean anomaly (degrees)
				meanMotion+' '+ //mean motion (revolutions per day)
				'56353'+' '+ //revolution number at epoch (revolutions)
				'0'; //should be checksum but we don't need to have one
	};

	var date = new Date(2018, 1, 1, 12, 0, 0);

	var tleLine1 = generateTLELine1();//'1 99999U 18067A   08264.51782528 -.00002182  00000-0 -11606-4 0  2927',
    	tleLine2 = generateTLELine2(
    			'51.6416',
    			'247.4627',
    			'0006703',
    			'130.5360',
    			'325.0288',
    			'15.72125391'
    	);
    			//'2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391563537';

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

	    try {
		    return {
		    	longitude: satellite.degreesLong(lonRad),
		    	latitude: satellite.degreesLat(latRad),
		    	altitude: height*1000 - EARTH_RADIUS
		    };
		} catch(e) {
			console.log(e);
			console.log(positionAndVelocity);
		}
    };

	this.numRings = params.numRings;
	this.numSatellitesPerRing = params.numSatellitesPerRing;
	this.altitude = params.numSatellitesPerRing;
	this.orbitalPeriod = params.orbitalPeriod;

	this.wwd = new WorldWind.WorldWindow('canvas');

	this.wwd.goToAnimator.animationFrequency = 0;
	this.wwd.goToAnimator.travelTime = 0;
	this.wwd.goTo(new WorldWind.Position(45.4215, -75.6972, 35000000));

	var earthLayer = new WorldWind.BMNGOneImageLayer();

	this.wwd.addLayer(earthLayer);
	//wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

	//wwd.addLayer(new WorldWind.CompassLayer());
	//wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
	//wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

	/* orbits */

	var ringPositions = [];
	var row = [];
	var currLon = 0;
	var mesh = null;

	var red = new WorldWind.Color(1, 0, 0, 0.75);
	var blue = new WorldWind.Color(0, 0, 1, 0.75);

	var ringAttributes = [];

	ringAttributes[0] = new WorldWind.ShapeAttributes(null);
	ringAttributes[0].outlineColor = red;
	ringAttributes[0].interiorColor = new WorldWind.Color(0, 0, 0, 0);
	ringAttributes[0].applyLighting = false;

	ringAttributes[1] = new WorldWind.ShapeAttributes(ringAttributes[0]);
	ringAttributes[1].outlineColor = blue;

	this.ringLayer = new WorldWind.RenderableLayer();

	/* satellites */

	var placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
	    highlightAttributes,
	    placemarkLayer = new WorldWind.RenderableLayer("Placemarks"),
	    testLayer = new WorldWind.RenderableLayer("Test"),
	    altitude = 1000000;

	const MIN_LATITUDE = -90,
	    MAX_LATITUDE = 90,
	    MIN_LONGITUDE = -180,
	    MAX_LONGITUDE = 180;

	placemarkAttributes.drawLeaderLine = true;
	placemarkAttributes.leaderLineAttributes
			= new WorldWind.ShapeAttributes();
	placemarkAttributes.leaderLineAttributes.outlineColor
			= new WorldWind.Color(1, 1, 1, 0.25);
	placemarkAttributes.imageScale = 1;
	placemarkAttributes.imageOffset = new WorldWind.Offset(
	    WorldWind.OFFSET_FRACTION, 0.5,
	    WorldWind.OFFSET_FRACTION, 0.5);
	placemarkAttributes.imageColor = WorldWind.Color.WHITE;

	placemarkAttributes =
			new WorldWind.PlacemarkAttributes(placemarkAttributes);
	placemarkAttributes.imageSource =
			new WorldWind.ImageSource(CanvasIcon.Satellite({size: 30, outline: true}));

	highlightAttributes =
			new WorldWind.PlacemarkAttributes(placemarkAttributes);
	highlightAttributes.imageScale = 1.2;

	this.placemarks = [];
	var currPlacemark;

	this.rings = [];
	var currRing;

	/* adding */

	this.configure = function() {
		this.ringLayer.removeAllRenderables();
		placemarkLayer.removeAllRenderables();

		this.placemarks.length = 0;
		this.rings.length = 0;

		for (var i = 0; i < this.numRings*2; i++) {
			ringPositions[i] = [];
			lon = MIN_LONGITUDE + i * MAX_LONGITUDE*2 / (this.numRings*2);
			for (var lat = -90; lat <= 90; lat += 90) {
				ringPositions[i].push(new WorldWind.Position(lat, lon, 1000000));
			}

			this.rings.push(new WorldWind.Path(ringPositions[i], ringAttributes[i % 2]));

			currRing = this.rings[this.rings.length - 1];

			this.ringLayer.addRenderable(currRing);
		}

		for (var i = 0; i < this.numRings; i++) {
			for (var j = 0; j < this.numSatellitesPerRing; j++) {
				this.placemarks.push(new WorldWind.Placemark(
			    		new WorldWind.Position(
			    				MIN_LATITUDE + 2 * j * MAX_LATITUDE*2 / this.numSatellitesPerRing,
			    				MIN_LONGITUDE + i * MAX_LONGITUDE*2 / (this.numRings*2),
			    				altitude),
			    		false,
			    		null));

	    		currPlacemark = this.placemarks[this.placemarks.length - 1];
	    		currPlacemark.altitudeMode = WorldWind.ABSOLUTE;
			    currPlacemark.attributes = placemarkAttributes;
			    currPlacemark.highlightAttributes = highlightAttributes;

			    placemarkLayer.addRenderable(currPlacemark);
			}
		}
	}

	this.configure();

	this.wwd.addLayer(this.ringLayer);
	this.wwd.addLayer(placemarkLayer);

	this.iss = new WorldWind.Placemark(
			new WorldWind.Position(
					getPosition().latitude,
					getPosition().longitude,
					getPosition().altitude),
			false,
			null);

	this.iss.altitudeMode = WorldWind.ABSOLUTE;
	this.iss.attributes = placemarkAttributes;
	this.iss.highlightAttributes = highlightAttributes;

	testLayer.addRenderable(this.iss);

	this.wwd.addLayer(testLayer);

	var highlightController = new WorldWind.HighlightController(this.wwd);

	var positionUpdate;

	this.propagate = function(deltaTimeSeconds) {
		date.setSeconds(date.getSeconds() + deltaTimeSeconds);

		positionUpdate = getPosition(date);

		this.iss.position.latitude = positionUpdate.latitude;
		this.iss.position.longitude = positionUpdate.longitude;
		this.iss.position.altitude = positionUpdate.altitude;
	}
}