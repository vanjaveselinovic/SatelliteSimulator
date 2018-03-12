var map = {};
map['p' + (90 * 60)] = 240;
map['p' + (91 * 60)] = 249;
map['p' + (92 * 60)] = 257;
map['p' + (93 * 60)] = 263;
map['p' + (94 * 60)] = 270;
map['p' + (95 * 60)] = 278;
map['p' + (96 * 60)] = 287;
map['p' + (97 * 60)] = 296;
map['p' + (98 * 60)] = 304;
map['p' + (99 * 60)] = 315;
map['p' + (100 * 60)] = 326;

const EARTH_RADIUS = 6371000; //in meters
const SECONDS_PER_DAY = 86400;
const STANDARD_GRAVITATIONAL_PARAMETER = 3.986004418 * (Math.pow(10, 14));

var Ring = function(params) {
	if (params === undefined) params = {};

	var inclination = params.inclination;
	var longitude = params.longitude;
	var numSatellites = params.numSatellites;
	var color = params.color;
	var ringAttributes = params.ringAttributes;
	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;
	var orbitalPeriod = params.orbitalPeriod * 60;
	var type = params.type;

	var launchOffset = (map['p' + orbitalPeriod] * 60 / numSatellites) / SECONDS_PER_DAY;

	var pathPositions = [];

	ringAttributes.outlineColor = new WorldWind.Color(
			color.r/255,
			color.g/255,
			color.b/255,
			0.75
		);

	this.satellites = [];
	for (var i = 0; i < numSatellites; i++) {
		this.satellites.push(new Satellite({
			inclination: inclination,
			longitude: longitude,
			placemarkAttributes: placemarkAttributes,
			highlightAttributes: highlightAttributes,
			offset: i * launchOffset,
			revPerDay: SECONDS_PER_DAY / orbitalPeriod
		}));
		pathPositions.push(this.satellites[this.satellites.length - 1].placemark.position);
	}
	pathPositions.push(this.satellites[0].placemark.position);

	this.path = new WorldWind.Path(pathPositions, ringAttributes);

	var i = 0;

	this.update = function() {
		this.path.positions = [];
		for (i = 0; i < this.satellites.length; i++) {
			pathPositions[i] = this.satellites[i].placemark.position;
		}
		pathPositions[this.satellites.length] = this.satellites[0].placemark.position;
		this.path.positions = pathPositions;
	};
};