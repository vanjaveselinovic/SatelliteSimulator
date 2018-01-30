var Ring = function(params) {
	if (params === undefined) params = {};

	var inclination = params.inclination;
	var longitude = params.longitude;
	var numSatellites = params.numSatellites;
	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;
	var orbitalPeriod = params.orbitalPeriod;

	const SECONDS_PER_DAY = 86400;
	var launchOffset = 278*60 / numSatellites / SECONDS_PER_DAY;

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
	}
};

/*
90 240
91 249
92 257
93 263
94 270
95 278
96 287
97 296
98 204
99 315
100 326
*/