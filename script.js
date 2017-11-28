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

	/* ---------- WEB WORLDWIND ---------- */

	var wwd = new WorldWind.WorldWindow('canvas');

    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    //wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

    //wwd.addLayer(new WorldWind.CompassLayer());
    //wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    //wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

    /* orbits */

    var meshPositions = [];
	var row = [];
	var currLon = 0;
	var mesh = null;

	var meshAttributes = new WorldWind.ShapeAttributes(null);
	meshAttributes.outlineColor = new WorldWind.Color(1, 1, 1, 0.5);
	meshAttributes.interiorColor = new WorldWind.Color(0, 0, 0, 0);
	meshAttributes.applyLighting = false;

	var meshLayer = new WorldWind.RenderableLayer();

	/* satellites */

    var placemarks,
        placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
        highlightAttributes,
        placemarkLayer = new WorldWind.RenderableLayer("Placemarks"),
        latitude = 45.4215,
        longitude = -75.6972,
        altitude = 1000000;

    var MIN_LATITUDE = -90,
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

	placemarkAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    placemarkAttributes.imageSource =
    		new WorldWind.ImageSource(canvas);

    highlightAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 1.2;

	placemarks = [];
	var currPlacemark;

	var numRings = 10;
	var numSatellitesPerRing = 10;

	/* adding */

	for (var i = 0; i < numRings; i++) {
		meshPositions = [];
		row = [];
		currLon = MIN_LONGITUDE + i * MAX_LONGITUDE*2 / numSatellitesPerRing;
		for (var lat = -90; lat <= 90; lat += 10) {
			row = [];
			for (var lon = currLon; lon <= currLon + 180; lon += 180) {
				row.push(new WorldWind.Position(lat, lon, 1000000));
			}
			meshPositions.push(row);
		}

		mesh = new WorldWind.GeographicMesh(meshPositions, null);
		mesh.attributes = meshAttributes;

		meshLayer.addRenderable(mesh);

		for (var j = 0; j < numSatellitesPerRing; j++) {
			placemarks.push(new WorldWind.Placemark(
    		new WorldWind.Position(
    				MIN_LATITUDE + j * MAX_LATITUDE*2 / numRings,
    				MIN_LONGITUDE + i * MAX_LONGITUDE*2 / numSatellitesPerRing,
    				altitude),
    		false,
    		null));

    		currPlacemark = placemarks[placemarks.length - 1];
    		currPlacemark.altitudeMode = WorldWind.ABSOLUTE;
		    currPlacemark.attributes = placemarkAttributes;
		    currPlacemark.highlightAttributes = highlightAttributes;

		    placemarkLayer.addRenderable(currPlacemark);
		}
	}

	wwd.addLayer(meshLayer);
	wwd.addLayer(placemarkLayer);

	/*
	var shapesLayer = new WorldWind.RenderableLayer("Surface Shapes");
	wwd.addLayer(shapesLayer);

	var shapeAttributes = new WorldWind.ShapeAttributes(null);
	shapeAttributes.outlineWidth = 5;
	shapeAttributes.outlineColor = WorldWind.Color.WHITE;
	shapeAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);

	var shapeHighlightAttributes = new WorldWind.ShapeAttributes(shapeAttributes);
	shapeHighlightAttributes.outlineColor = new WorldWind.Color(0, 1, 1, 0.5);

	var bigPolylineBoundary = [];
	bigPolylineBoundary.push(new WorldWind.Location(-45, -135));
	bigPolylineBoundary.push(new WorldWind.Location(45, -32));

	var bigPolyline = new WorldWind.SurfacePolyline(bigPolylineBoundary, shapeAttributes);
	bigPolyline.highlightAttributes = highlightAttributes;

	shapesLayer.addRenderable(bigPolyline);
	*/

	//var layerManger = new LayerManager(wwd);
	var highlightController = new WorldWind.HighlightController(wwd);

	/* live update */

	var altitudeInput;

	$('#input-alt').on('input', function() {
		altitudeInput = $('#input-alt').val();

		for (var i = 0; i < placemarks.length; i++) {
			placemarks[i].position.altitude = altitudeInput;
		}

		wwd.redraw();
	});

	/* ---------- CHOREOGRAPHING ---------- */

	$('#input-vel').on('input', function() {
		orbitalVelocity_km_s = $('#input-vel').val();
		orbitalVelocity_d_s = orbitalVelocity_km_s / 111;
	});

	$('#input-ts').on('input', function() {
		timeScale = $('#input-ts').val();
	});

	var deltaTimeMillis = 0, prevTimeMillis = performance.now();
	var i = 0;

	var orbitalVelocity_km_s = $('#input-vel').val(); // km/s // default 7.8
	var orbitalVelocity_d_s = orbitalVelocity_km_s / 111; // degree/s
	var timeScale = $('#input-ts').val(); // default 1

	function doFrame(currTimeMillis) {
		deltaTimeMillis = currTimeMillis - prevTimeMillis;
		prevTimeMillis = currTimeMillis;

		for (i = 0; i < placemarks.length; i++) {
			placemarks[i].position.latitude
					= placemarks[i].position.latitude
							+ deltaTimeMillis/1000 * orbitalVelocity_d_s * timeScale;
		}

		wwd.redraw();

		window.requestAnimationFrame(doFrame);
	}

	window.requestAnimationFrame(doFrame);

	/* ---------- WEB SERVICE ---------- */

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
