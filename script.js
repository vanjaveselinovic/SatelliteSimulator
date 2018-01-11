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

	$('.menu-item').on('click', function() {
		$('.menu-item.active').removeClass('active');
		$(this).addClass('active');

		$('.section.page.active').removeClass('active');
		$($('.section.page')[$(this).data("menuItemNumber")-1]).addClass('active');
	})

	/* ---------- WEB WORLDWIND ---------- */

	var wwd = new WorldWind.WorldWindow('canvas');

	wwd.goToAnimator.animationFrequency = 0;
	wwd.goToAnimator.travelTime = 0;
	wwd.goTo(new WorldWind.Position(45.4215, -75.6972, 50000000));

	var earthLayer = new WorldWind.BMNGOneImageLayer();

    wwd.addLayer(earthLayer);
    //wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

    //wwd.addLayer(new WorldWind.CompassLayer());
    //wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    //wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

    /* orbits */

    var meshPositions = [];
	var row = [];
	var currLon = 0;
	var mesh = null;

	var red = new WorldWind.Color(1, 0, 0, 0.75);
	var blue = new WorldWind.Color(0, 0, 1, 0.75);

	var meshAttributes = [];

	meshAttributes[0] = new WorldWind.ShapeAttributes(null);
	meshAttributes[0].outlineColor = red;
	meshAttributes[0].interiorColor = new WorldWind.Color(0, 0, 0, 0);
	meshAttributes[0].applyLighting = false;

	meshAttributes[1] = new WorldWind.ShapeAttributes(meshAttributes[0]);
	meshAttributes[1].outlineColor = blue;

	var meshLayer = new WorldWind.RenderableLayer();

	/* satellites */

    var placemarks,
        placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
        highlightAttributes,
        placemarkLayer = new WorldWind.RenderableLayer("Placemarks"),
        testLayer = new WorldWind.RenderableLayer("Test"),
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
        size = 30;

    canvas.width = size;
    canvas.height = size;

    ctx2d.fillStyle = "rgb(0, 0, 0)";
	ctx2d.fillRect(0, size/3, size, size/3);

	ctx2d.fillStyle = "rgb(0, 0, 0)";
	ctx2d.fillRect(size/3, 0, size/3, size);

	ctx2d.fillStyle = "rgb(0, 128, 200)";
	ctx2d.fillRect(2, size/3+2, size-4, size/3-4);

	ctx2d.fillStyle = "rgb(200, 200, 200)";
	ctx2d.fillRect(size/3+2, 2, size/3-4, size-4);

	/*ctx2d.fillStyle = "rgb(0, 0, 0)";
	ctx2d.fillRect(2, 2, size - 4, size - 4);

	ctx2d.fillStyle = "rgb(128, 128, 128)";
	ctx2d.fillRect(4, 4, size - 8, size - 8);*/

	placemarkAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    placemarkAttributes.imageSource =
    		new WorldWind.ImageSource(canvas);

    highlightAttributes =
    		new WorldWind.PlacemarkAttributes(placemarkAttributes);
    highlightAttributes.imageScale = 1.2;

	var placemarks = [];
	var currPlacemark;

	var numRings = $('#input-nr').val();
	var numSatellitesPerRing = $('#input-nspr').val();

	var rings = [];
	var currRing;

	var r;

	/* adding */

	var globe = new WorldWind.Globe(new WorldWind.EarthElevationModel());

	function configure() {
		meshLayer.removeAllRenderables();
		placemarkLayer.removeAllRenderables();

		placemarks.length = 0;
		rings.length = 0;

		for (var i = 0; i < numRings; i++) {
			meshPositions[i] = [];
			row = [];
			currLon = MIN_LONGITUDE + i * MAX_LONGITUDE*2 / (numRings*2);
			for (var lat = -90; lat <= 90; lat += 10) {
				row = [];
				for (var lon = currLon; lon <= currLon + 180; lon += 180) {
					row.push(new WorldWind.Position(lat, lon, 1000000));
				}
				meshPositions[i].push(row);
			}

			rings.push(new WorldWind.GeographicMesh(meshPositions[i], meshAttributes[i % 2]));

			currRing = rings[rings.length - 1];

			meshLayer.addRenderable(currRing);

			for (var j = 0; j < numSatellitesPerRing; j++) {
				placemarks.push(new WorldWind.Placemark(
			    		new WorldWind.Position(
			    				MIN_LATITUDE + 2 * j * MAX_LATITUDE*2 / numSatellitesPerRing,
			    				MIN_LONGITUDE + i * MAX_LONGITUDE*2 / (numRings*2),
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

		/* xyz coordinates test placemarls */

		var testPosition1 = new WorldWind.Position(0, 0, 0);
		var testPosition2 = new WorldWind.Position(0, 0, 0);
		var testPosition3 = new WorldWind.Position(0, 0, 0);
		var testPosition4 = new WorldWind.Position(0, 0, 0);

		globe.computePositionFromPoint(0, 0, 0, testPosition1);
		globe.computePositionFromPoint(10000000, 0, 0, testPosition2);
		globe.computePositionFromPoint(0, 10000000, 0, testPosition3);
		globe.computePositionFromPoint(0, 0, 10000000, testPosition4);

		var testPlacemark1 = new WorldWind.Placemark(testPosition1, false, null);
		var testPlacemark2 = new WorldWind.Placemark(testPosition2, false, null);
		var testPlacemark3 = new WorldWind.Placemark(testPosition3, false, null);
		var testPlacemark4 = new WorldWind.Placemark(testPosition4, false, null);

		testPlacemark1.altitudeMode = WorldWind.ABSOLUTE;
		testPlacemark2.altitudeMode = WorldWind.ABSOLUTE;
		testPlacemark3.altitudeMode = WorldWind.ABSOLUTE;
		testPlacemark4.altitudeMode = WorldWind.ABSOLUTE;

		testPlacemark1.attributes = placemarkAttributes;
		testPlacemark2.attributes = placemarkAttributes;
		testPlacemark3.attributes = placemarkAttributes;
		testPlacemark4.attributes = placemarkAttributes;

		testLayer.addRenderable(testPlacemark1);
		testLayer.addRenderable(testPlacemark2);
		testLayer.addRenderable(testPlacemark3);
		testLayer.addRenderable(testPlacemark4);
	}

	configure();

	wwd.addLayer(meshLayer);
	wwd.addLayer(placemarkLayer);
	//wwd.addLayer(testLayer);

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

	var highlightController = new WorldWind.HighlightController(wwd);

	/* live update */

	var altitudeInput;

	$('#input-alt').on('input', function() {
		altitudeInput = $('#input-alt').val();

		if (!isNaN(altitudeInput) && altitudeInput > 0) {
			$('#input-alt').removeClass('invalid-input');

			for (var i = 0; i < placemarks.length; i++) {
				placemarks[i].position.altitude = altitudeInput;
			}

			wwd.redraw();
		} else {
			$('#input-alt').addClass('invalid-input');
		}
	});

	/* ---------- CHOREOGRAPHING ---------- */

	var numRingsInput;

	$('#input-nr').on('input', function() {
		numRingsInput = $('#input-nr').val();

		if (!isNaN(numRingsInput) && numRingsInput > 0) {
			$('#input-nr').removeClass('invalid-input');
			numRings = numRingsInput;
			configure();
		} else {
			$('#input-nr').addClass('invalid-input');
		}
	});

	var numSatellitesPerRingInput;

	$('#input-nspr').on('input', function() {
		numSatellitesPerRingInput = $('#input-nspr').val();

		if (!isNaN(numSatellitesPerRingInput) && numSatellitesPerRingInput > 0) {
			$('#input-nspr').removeClass('invalid-input');
			numSatellitesPerRing = numSatellitesPerRingInput;
			configure();
		} else {
			$('#input-nspr').addClass('invalid-input');
		}
	});

	var periodInput;

	$('#input-per').on('input', function() {
		periodInput = $('#input-per').val();

		if (!isNaN(periodInput) && periodInput > 0) {
			$('#input-per').removeClass('invalid-input');
			orbitalPeriod = periodInput * 60;
		} else {
			$('#input-per').addClass('invalid-input');
		}
	});

	var timeScaleInput;

	$('#input-ts').on('input', function() {
		timeScaleInput = $('#input-ts').val();

		if (!isNaN(timeScaleInput) && timeScaleInput > 0) {
			$('#input-ts').removeClass('invalid-input');
			timeScale = $('#input-ts').val();
		} else {
			$('#input-ts').addClass('invalid-input');
		}
	});

	var deltaTimeMillis = 0, prevTimeMillis = performance.now();
	var i = 0;
	var j = 0;
	var k = 0;

	var orbitalPeriod = $('#input-per').val() * 60; //seconds
	var timeScale = $('#input-ts').val();

	var rotationPeriod = 23*60*60 + 56*60 + 4; //earth's rotation in seconds

	var plusMinus = 1;

	var totalOffsetLon = 0;

	function doFrame(currTimeMillis) {
		deltaTimeMillis = currTimeMillis - prevTimeMillis;
		prevTimeMillis = currTimeMillis;

		totalOffsetLon += deltaTimeMillis/1000 * 360/rotationPeriod * timeScale;

		meshLayer.removeAllRenderables();

		for (i = 0; i < rings.length; i++) {
			for (j = 0; j < rings[i].positions.length; j++) {
				for (k = 0; k < rings[i].positions[j].length; k++) {
					rings[i].positions[j][k].longitude
							+= deltaTimeMillis/1000 * 360/rotationPeriod * timeScale;
				}
			}
			//meshLayer.addRenderable(new WorldWind.GeographicMesh(rings[i].positions, rings[i].attributes));
			meshLayer.addRenderable(rings[i]);
		}

		plusMinus = 1;

		for (i = 0; i < placemarks.length; i++) {
			//if (i % numSatellitesPerRing === 0)
			//	plusMinus = plusMinus*-1;

			placemarks[i].position.latitude
					+= (deltaTimeMillis/1000 * 360/orbitalPeriod * timeScale * plusMinus);

			placemarks[i].position.longitude
					+= (deltaTimeMillis/1000 * 360/rotationPeriod * timeScale);
		}

		wwd.redraw();

		window.requestAnimationFrame(doFrame);
	}

	window.requestAnimationFrame(doFrame);

	/* ---------- WEB SERVICE ---------- */

	function formatQuery(queryInJSON) {
		var s = '';
		for (var key in queryInJSON) {
			if (queryInJSON.hasOwnProperty(key)) {
				s+=key;
				s+='=';
				s+=queryInJSON[key];
				s+='&';
			}
		}
		s = s.slice(0, -1);
		return s;
	}

	$('#button-run').on('click', function() {
		if (!loading) {
			$('.loader').css('display','block');
			loading = true;

			$.getJSON('http://127.0.0.1:8080/simulator?'+formatQuery(
						{
							dataRate: 1000,
							packetSize: 2000
						}))
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
