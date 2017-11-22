$(document).ready(function () {
	var loading = false;

	$(window).resize(function () {
		resizeCanvas();
	});

	var resizeCanvas = function () {
		$('#canvas').width($('#canvas-container').width());
		$('#canvas').height($('#canvas-container').height());
	};

	resizeCanvas();

	var wwd = new WorldWind.WorldWindow('canvas');

    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    //wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

    //wwd.addLayer(new WorldWind.CompassLayer());
    //wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    //wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

    var placemark,
        placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
        highlightAttributes,
        placemarkLayer = new WorldWind.RenderableLayer("Placemarks"),
        latitude = 45.4215,
        longitude = -75.6972,
        altitude = 1000000;

    placemarkAttributes.drawLeaderLine = true;
    placemarkAttributes.imageScale = 1;
    placemarkAttributes.imageOffset = new WorldWind.Offset(
        WorldWind.OFFSET_FRACTION, 0.5,
        WorldWind.OFFSET_FRACTION, 0.5);
    placemarkAttributes.imageColor = WorldWind.Color.WHITE;

    var canvas = document.createElement("canvas"),
        ctx2d = canvas.getContext("2d"),
        size = 20;

    canvas.width = size;
    canvas.height = size;

    ctx2d.fillStyle = "rgb(255, 255, 255)";
	ctx2d.fillRect(0, 0, size, size);

	ctx2d.fillStyle = "rgb(0, 0, 0)";
	ctx2d.fillRect(2, 2, size - 4, size - 4);

	ctx2d.fillStyle = "rgb(128, 128, 128)";
	ctx2d.fillRect(4, 4, size - 8, size - 8);

    placemark = new WorldWind.Placemark(
    		new WorldWind.Position(latitude, longitude, altitude),
    		false,
    		null);
    placemark.altitudeMode = WorldWind.ABSOLUTE;

    placemarkAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    placemarkAttributes.imageSource =
    		new WorldWind.ImageSource(canvas);
    placemark.attributes = placemarkAttributes;

 	highlightAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 1.2;
    placemark.highlightAttributes = highlightAttributes;

    placemarkLayer.addRenderable(placemark);
	wwd.addLayer(placemarkLayer);

	//var layerManger = new LayerManager(wwd);
	var highlightController = new WorldWind.HighlightController(wwd);

	$('#button-run').click(function() {
		if (!loading) {
			$('.loader').css('display','block');
			loading = true;

			$.getJSON('http://127.0.0.1:5000/python/simulator',
				{
					dataRate: $('#input-rate').val(),
					packetSize: $('#input-size').val()
				})
				.done(function(data, textStatus, jqXHR) {
					loading = false;
					console.log(data);
					$('.loader').css('display','none');
				})
				.fail(function() {
					loading = false;
					console.log('error');
					$('.loader').css('display','none');
				});
		}
	});
});
