var GroundStation = function(params) {
	if (params === undefined) params = {};

	var name = params.name;
	var uniqueName = params.uniqueName;
	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;
	var position = params.position;
	var traffic = params.traffic;

	this.placemark = new WorldWind.Placemark(
			position,
			false,
			null);

	this.placemark.altitudeMode = WorldWind.ABSOLUTE;
	this.placemark.attributes = placemarkAttributes;
	this.placemark.highlightAttributes = highlightAttributes;
}