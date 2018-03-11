var Globe = function(params) {
	if (params === undefined) params = {};

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

	var ringLayer = new WorldWind.RenderableLayer("Rings");

	/* presets */

	this.constellations = {
		iridium: {
			name: "Iridium-like",
			elements: [{
				numRings: 5,
				numSatellitesPerRing: 10,
				inclination: 90,
				ringAttributes: ringAttributes[0],
				orbitalPeriod: 90*60
			}]
		},
		telesat: {
			name: "Telesat-like",
			elements: [
				{
					numRings: 10,
					numSatellitesPerRing: 10,
					inclination: 50,
					ringAttributes: ringAttributes[0],
					orbitalPeriod: 92*60
				},
				{
					numRings: 10,
					numSatellitesPerRing: 10,
					inclination: 310,
					ringAttributes: ringAttributes[0],
					orbitalPeriod: 92*60
				},
				{
					numRings: 3,
					numSatellitesPerRing: 10,
					inclination: 80,
					ringAttributes: ringAttributes[1],
					orbitalPeriod: 92*60
				},
				{
					numRings: 3,
					numSatellitesPerRing: 10,
					inclination: 280,
					ringAttributes: ringAttributes[1],
					orbitalPeriod: 92*60
				}
			]
		}
	};

	this.applyPreset = function(preset) {
		this.configure(preset.elements);
	};

	/* satellites */

	var placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
	    highlightAttributes,
	    satelliteLayer = new WorldWind.RenderableLayer("Satellites"),
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

	var rings = [];

	this.configure = function(elements) {
		ringLayer.removeAllRenderables();
		satelliteLayer.removeAllRenderables();

		rings = [];

		for (var i = 0; i < elements.length; i++) {
			for (var j = 0; j < elements[i].numRings; j++) {
				rings.push(new Ring({
					inclination: elements[i].inclination,
					longitude: -180 + j*(180/elements[i].numRings),
					numSatellites: elements[i].numSatellitesPerRing,
					ringAttributes: elements[i].ringAttributes,
					placemarkAttributes: placemarkAttributes,
					highlightAttributes: highlightAttributes,
					orbitalPeriod: elements[i].orbitalPeriod
				}));
			}
		}

		for (var i = 0; i < rings.length; i++) {
			ringLayer.addRenderable(rings[i].path);
			for (var j = 0; j < rings[i].satellites.length; j++) {
				satelliteLayer.addRenderable(rings[i].satellites[j].placemark);
			}
		}
	};

	this.wwd.addLayer(ringLayer);
	this.wwd.addLayer(satelliteLayer);

	var highlightController = new WorldWind.HighlightController(this.wwd);

	var date = new Date();

	var i, j;

	this.propagate = function(deltaTimeSeconds) {
		for (i = 0; i < rings.length; i++) {
			for (j = 0; j < rings[i].satellites.length; j++) {
				rings[i].satellites[j].update(deltaTimeSeconds);
			}
			//rings[i].update();
		}
	}
}