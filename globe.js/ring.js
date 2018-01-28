var Ring = function(params) {
	if (params === undefined) params = {};

	var inclination = params.inclination;
	var ascendingNode = params.ascendingNode;
	var numSatellites = params.numSatellites;
	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;
	var revPerDay = params.revPerDay;

	this.satellites = [];
	for (var i = 0; i < numSatellites; i++) {
		this.satellites.push(new Satellite({
			inclination: inclination,
			ascendingNode: ascendingNode,
			relativeProcession: 0,
			placemarkAttributes: placemarkAttributes,
			highlightAttributes: highlightAttributes,
			offset: i * 16*60*60/numSatellites,
			revPerDay: revPerDay
		}));
	}
};