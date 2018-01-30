var Globe = function(params) {
	if (params === undefined) params = {};

	this.numRings = params.numRings;
	this.numSatellitesPerRing = params.numSatellitesPerRing;
	this.altitude = params.numSatellitesPerRing;
	this.orbitalPeriod = params.orbitalPeriod;

	const SECONDS_PER_DAY = (23 * 60 * 60) + (56 * 60) + 4.1;

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
		/*
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
		*/
	}

	//this.configure();

	//this.wwd.addLayer(this.ringLayer);
	//this.wwd.addLayer(placemarkLayer);

	for (var i = 0; i < this.numRings; i++) {
		this.rings.push(new Ring({
			inclination: 90,
			longitude: -180 + i*(180/this.numRings),
			numSatellites: this.numSatellitesPerRing,
			placemarkAttributes: placemarkAttributes,
			highlightAttributes: highlightAttributes,
			orbitalPeriod: this.orbitalPeriod
		}));
	}

	for (var i = 0; i < this.rings.length; i++) {
		for (var j = 0; j < this.rings[i].satellites.length; j++) {
			testLayer.addRenderable(this.rings[i].satellites[j].placemark);
		}
	}

	this.wwd.addLayer(testLayer);

	var highlightController = new WorldWind.HighlightController(this.wwd);

	var date = new Date(2018, 1, 1, 12, 0, 0);

	var i, j;

	this.propagate = function(deltaTimeSeconds) {
		for (i = 0; i < this.rings.length; i++) {
			for (j = 0; j < this.rings[i].satellites.length; j++) {
				this.rings[i].satellites[j].update(deltaTimeSeconds);
			}
		}
	}
}