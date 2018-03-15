const TYPE_SINGLE = 'single';
const TYPE_DOUBLE = 'double';

const COLORS = [
	{ //red 0
		r: 244,
		g: 66,
		b: 66,
		traffic: TRAFFIC_HI,
		trafficName: '100 Mb/s'
	},
	{ //orange 1
		r: 244,
		g: 110,
		b: 66
	},
	{ //yellow 2
		r: 252,
		g: 172,
		b: 42,
		traffic: TRAFFIC_MD,
		trafficName: '10 Mb/s'
	},
	{ //green 3
		r: 28,
		g: 204,
		b: 72,
		traffic: TRAFFIC_LO,
		trafficName: '1 Mb/s'
	},
	{ //cyan 4
		r: 30,
		g: 209,
		b: 219
	},
	{ //blue 5
		r: 49,
		g: 62,
		b: 244
	},
	{ //purple 6
		r: 152,
		g: 60,
		b: 234
	},
	{ //magenta 7
		r: 216,
		g: 32,
		b: 121
	}
];

var Globe = function(params) {
	if (params === undefined) params = {};

	var main = params.main;

	const SECONDS_PER_DAY = (23 * 60 * 60) + (56 * 60) + 4.1;

	this.wwd = new WorldWind.WorldWindow('canvas');

	this.wwd.goToAnimator.animationFrequency = 0;
	this.wwd.goToAnimator.travelTime = 0;
	this.wwd.goTo(new WorldWind.Position(45.4215, -75.6972, 35000000));

	var earthLayer = new WorldWind.BMNGOneImageLayer();

	this.wwd.addLayer(earthLayer);
	//this.wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

	//wwd.addLayer(new WorldWind.CompassLayer());
	//wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
	//wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

	/* presets */

	this.constellations = {
		iridium: {
			name: "Iridium-like",
			elements: [{
				numRings: 10,
				numSatellitesPerRing: 20,
				inclination: 90,
				color: COLORS[0],
				orbitalPeriod: 95,
				type: TYPE_SINGLE
			}]
		},
		telesat: {
			name: "Telesat-like",
			elements: [
				{
					numRings: 20,
					numSatellitesPerRing: 20,
					inclination: 50,
					color: COLORS[0],
					orbitalPeriod: 95,
					type: TYPE_DOUBLE
				},
				{
					numRings: 5,
					numSatellitesPerRing: 10,
					inclination: 80,
					color: COLORS[5],
					orbitalPeriod: 95,
					type: TYPE_DOUBLE
				},
			]
		}
	};

	this.groundStationPresets = {
		ottawa: {
			name: 'Ottawa',
			uniqueName: 'Ottawa',
			lat: 45.4215,
			lon: -75.6972,
			traffic: TRAFFIC_LO,
			color: COLORS[3]
		},
		toronto: {
			name: 'Toronto',
			uniqueName: 'Toronto',
			lat: 43.6532,
			lon: -79.3832,
			traffic: TRAFFIC_MD,
			color: COLORS[2]
		},
		london: {
			name: 'London',
			uniqueName: 'London',
			lat: 51.5074,
			lon: 0.1278,
			traffic: TRAFFIC_HI,
			color: COLORS[0]
		}
	};

	this.applyPreset = function(preset) {
		this.configure(preset.elements);
	};

	/* ground stations */

	var groundStationAttributes = new WorldWind.PlacemarkAttributes(null),
		groundStationHighlightAttributes,
		groundStationLayer = new WorldWind.RenderableLayer("Ground Stations");

	var groundStations = [];

	/* orbits */

	var ringPositions = [];
	var row = [];
	var currLon = 0;
	var mesh = null;

	var ringLayer = new WorldWind.RenderableLayer("Rings");

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
			new WorldWind.ImageSource(CanvasIcon.Circle({size: 5, r: 255, g: 0, b: 0}));

	highlightAttributes =
			new WorldWind.PlacemarkAttributes(placemarkAttributes);
	highlightAttributes.imageSource =
			new WorldWind.ImageSource(CanvasIcon.Satellite({size: 30, outline: true}));

	var rings = [];
	var tempPlacemarkAttributes;

	var ringAttributes = new WorldWind.ShapeAttributes(null);
	ringAttributes.outlineColor = new WorldWind.Color(1,0,0,0.75);
	ringAttributes.interiorColor = new WorldWind.Color(0, 0, 0, 0);
	ringAttributes.applyLighting = false;

	this.configure = function(elements) {
		ringLayer.removeAllRenderables();
		satelliteLayer.removeAllRenderables();

		rings = [];

		for (var i = 0; i < elements.length; i++) {
			tempPlacemarkAttributes =
					new WorldWind.PlacemarkAttributes(placemarkAttributes);

			tempPlacemarkAttributes.imageSource =
					new WorldWind.ImageSource(CanvasIcon.Circle({
							size: 5,
							r: elements[i].color.r,
							g: elements[i].color.g,
							b: elements[i].color.b
						}));

			//var doub = elements[i].type === TYPE_DOUBLE ? 2 : 1;

			//for (var k = 0; k < doub; k++) {

				/*var inc = k === 1 ?
						360 - elements[i].inclination :
						elements[i].inclination;*/

			var totalDeg = elements[i].type === TYPE_DOUBLE ? 360 : 180;

			for (var j = 0; j < elements[i].numRings; j++) {
				rings.push(new Ring({
					inclination: elements[i].inclination,
					longitude: (-1*totalDeg) + j*(totalDeg/elements[i].numRings),
					numSatellites: elements[i].numSatellitesPerRing,
					color: elements[i].color,
					ringAttributes: new WorldWind.ShapeAttributes(ringAttributes),
					placemarkAttributes: tempPlacemarkAttributes,
					highlightAttributes: highlightAttributes,
					orbitalPeriod: elements[i].orbitalPeriod
				}));
			}
			//}
		}

		for (var i = 0; i < rings.length; i++) {
			ringLayer.addRenderable(rings[i].path);
			for (var j = 0; j < rings[i].satellites.length; j++) {
				satelliteLayer.addRenderable(rings[i].satellites[j].placemark);
			}
		}
	};

	this.applyGroundStations = function(groundStationsInput) {
		groundStations.length = 0;
		groundStationLayer.removeAllRenderables();
		groundStationNames = {};

		for (var i = 0; i < groundStationsInput.length; i++) {
			groundStationAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
			groundStationAttributes.imageSource =
				new WorldWind.ImageSource(CanvasIcon.GroundStation({
						traffic: groundStationsInput[i].traffic,
						color: groundStationsInput[i].color
					}));

			groundStationHighlightAttributes = new WorldWind.PlacemarkAttributes(groundStationAttributes);
			groundStationHighlightAttributes.imageScale = 1.2;

			groundStations.push(new GroundStation({
					name: groundStationsInput[i].name,
					uniqueName: groundStationsInput[i].uniqueName,
					placemarkAttributes: groundStationAttributes,
					highlightAttributes: groundStationHighlightAttributes,
					position: new WorldWind.Position(
						groundStationsInput[i].lat,
						groundStationsInput[i].lon,
						0
					),
					traffic: groundStationsInput[i].traffic
				}));

			groundStationLayer.addRenderable(groundStations[groundStations.length - 1].placemark);
		}
	};

	this.wwd.addLayer(groundStationLayer);
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

	/* output */

	//var outputSatellites = {};

	this.applyOutput = function(satellites, rings, startTime) {
		ringLayer.removeAllRenderables();
		satelliteLayer.removeAllRenderables();

		var satelliteIds = {};

		for (var i = 0; i < satellites.length; i++) {
			/*var positionXYZ = {
				x: satellites[i].x,
				y: satellites[i].y,
				z: satellites[i].z
			}

			var gmst = satellite.gstime(Date.parse(startTime));
			var positionLLH = satellite.eciToGeodetic(positionXYZ, gmst);

			var lonRad = positionLLH.longitude;
		    var latRad = positionLLH.latitude;
		    var height = positionLLH.height;

	    	if (lonRad < -1*Math.PI) lonRad += 2*Math.PI;

	    	var newPlacemark = new WorldWind.Placemark(
					new WorldWind.Position(
							satellite.degreesLat(latRad),
							satellite.degreesLong(lonRad),
		    				height - EARTH_RADIUS,
							false,
							null));
			*/

			var position = new WorldWind.Position(
							satellites[i].x,
							satellites[i].y,
		    				satellites[i].z,
							false,
							null)

			satelliteIds['s'+satellites[i].id] = {
				position: position
			};

			var newPlacemark = new WorldWind.Placemark(position);

			newPlacemark.altitudeMode = WorldWind.ABSOLUTE;
			newPlacemark.attributes = placemarkAttributes;
			newPlacemark.highlightAttributes = highlightAttributes;

			//outputSatellites['s'+satellites[i].id] = newPlacemark;

			satelliteLayer.addRenderable(newPlacemark);
		}

		for (var i = 0; i < rings.length; i++) {
			var pathPositions = [];

			for (var j = 0; j < rings[i].stationIds.length; j++) {
				pathPositions.push(satelliteIds['s'+rings[i].stationIds[j]].position);
			}
			pathPositions.push(satelliteIds['s'+rings[i].stationIds[0]].position);

			ringLayer.addRenderable(new WorldWind.Path(pathPositions, ringAttributes));
		}

		this.wwd.redraw();
	};
}