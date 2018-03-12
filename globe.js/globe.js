const TYPE_SINGLE = 'single';
const TYPE_DOUBLE = 'double';

const COLORS = [
	{ //red 0
		r: 244,
		g: 66,
		b: 66
	},
	{ //orange 1
		r: 244,
		g: 110,
		b: 66
	},
	{ //yellow 2
		r: 252,
		g: 172,
		b: 42
	},
	{ //green 3
		r: 28,
		g: 204,
		b: 72
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

	var ringLayer = new WorldWind.RenderableLayer("Rings");

	/* presets */

	this.constellations = {
		iridium: {
			name: "Iridium-like",
			elements: [{
				numRings: 5,
				numSatellitesPerRing: 10,
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
					numRings: 10,
					numSatellitesPerRing: 10,
					inclination: 50,
					color: COLORS[0],
					orbitalPeriod: 95,
					type: TYPE_DOUBLE
				},
				{
					numRings: 3,
					numSatellitesPerRing: 10,
					inclination: 80,
					color: COLORS[5],
					orbitalPeriod: 95,
					type: TYPE_DOUBLE
				},
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
			new WorldWind.ImageSource(CanvasIcon.Circle({size: 10, r: 255, g: 0, b: 0}));

	highlightAttributes =
			new WorldWind.PlacemarkAttributes(placemarkAttributes);
	highlightAttributes.imageSource =
			new WorldWind.ImageSource(CanvasIcon.Satellite({size: 30, outline: true}));

	var rings = [];
	var tempPlacemarkAttributes;

	var ringAttributes = new WorldWind.ShapeAttributes(null);
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

			var doub = elements[i].type === TYPE_DOUBLE ? 2 : 1;

			for (var k = 0; k < doub; k++) {

				var inc = k === 1 ?
						360 - elements[i].inclination :
						elements[i].inclination;

				for (var j = 0; j < elements[i].numRings; j++) {
					rings.push(new Ring({
						inclination: inc,
						longitude: -180 + j*(180/elements[i].numRings),
						numSatellites: elements[i].numSatellitesPerRing,
						color: elements[i].color,
						ringAttributes: new WorldWind.ShapeAttributes(ringAttributes),
						placemarkAttributes: tempPlacemarkAttributes,
						highlightAttributes: highlightAttributes,
						orbitalPeriod: elements[i].orbitalPeriod
					}));
				}
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

	var handleClick = function(recognizer) {
		var x = recognizer.clientX;
		var y = recognizer.clientY;

		var pickList = this.wwd.pick(this.wwd.canvasCoordinates(x, y));

		if (pickList.objects.length === 1 && pickList.objects[0].isTerrain) {
			var position = pickList.objects[0].position;
			console.log(new WorldWind.Location(position.latitude, position.longitude));
		}
	}.bind(this);

	var clickRecognizer = new WorldWind.ClickRecognizer(this.wwd, handleClick);
}