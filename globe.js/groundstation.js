var GroundStation = function(params) {
	if (params === undefined) params = {};

	var placemarkAttributes = params.placemarkAttributes;
	var highlightAttributes = params.highlightAttributes;
	var position = params.position;

	this.placemark = new WorldWind.Placemark(
			position,
			false,
			null);

	this.placemark.altitudeMode = WorldWind.ABSOLUTE;
	this.placemark.attributes = placemarkAttributes;
	this.placemark.highlightAttributes = highlightAttributes;
}