$(document).ready(function () {
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
	});

	$('.input-numeric').on('keydown', function(e) {
		if (!isNaN($(this).val())) {
			if (e.which === 38)
				$(this).val(parseInt($(this).val())+1);
			else if (e.which === 40)
				$(this).val(parseInt($(this).val())-1);
		}
		$(this).trigger('input');
	});

	/* ---------- GLOBE ---------- */

	var numRings = $('#input-nr').val();
	var numSatellitesPerRing = $('#input-nspr').val();
	var altitude = $('#input-alt').val();
	var orbitalPeriod = $('#input-per').val() * 60; //seconds
	var timeScale = $('#input-ts').val();

	var rotationPeriod = 23*60*60 + 56*60 + 4; //earth's rotation in seconds

	var globe = new Globe({
		numRings: numRings,
		numSatellitesPerRing: numSatellitesPerRing,
		altitude: altitude,
		orbitalPeriod: orbitalPeriod
	});

	/* live update */

	var numRingsInput;

	$('#input-nr').on('input', function() {
		numRingsInput = $('#input-nr').val();

		if (!isNaN(numRingsInput) && numRingsInput > 0) {
			$('#input-nr').removeClass('invalid-input');
			globe.numRings = numRingsInput;
			globe.configure();
		} else {
			$('#input-nr').addClass('invalid-input');
		}
	});

	var numSatellitesPerRingInput;

	$('#input-nspr').on('input', function() {
		numSatellitesPerRingInput = $('#input-nspr').val();

		if (!isNaN(numSatellitesPerRingInput) && numSatellitesPerRingInput > 0) {
			$('#input-nspr').removeClass('invalid-input');
			globe.numSatellitesPerRing = numSatellitesPerRingInput;
			globe.configure();
		} else {
			$('#input-nspr').addClass('invalid-input');
		}
	});

	var altitudeInput;

	$('#input-alt').on('input', function() {
		altitudeInput = $('#input-alt').val();

		if (!isNaN(altitudeInput) && altitudeInput > 0) {
			$('#input-alt').removeClass('invalid-input');

			for (var i = 0; i < globe.placemarks.length; i++) {
				globe.placemarks[i].position.altitude = altitudeInput;
			}

			globe.wwd.redraw();
		} else {
			$('#input-alt').addClass('invalid-input');
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

		if (!isNaN(timeScaleInput) && timeScaleInput > 0 && timeScaleInput < 1000000) {
			$('#input-ts').removeClass('invalid-input');
			timeScale = $('#input-ts').val();
		} else {
			$('#input-ts').addClass('invalid-input');
		}
	});

	/* ---------- CHOREOGRAPHING ---------- */

	var deltaTimeMillis = 0, prevTimeMillis = performance.now();
	var i = 0;
	var j = 0;
	var k = 0;

	var plusMinus = 1;

	function doFrame(currTimeMillis) {
		deltaTimeMillis = currTimeMillis - prevTimeMillis;
		prevTimeMillis = currTimeMillis;

		/*
		globe.ringLayer.removeAllRenderables();

		for (i = 0; i < globe.rings.length; i++) {
			for (j = 0; j < globe.rings[i].positions.length; j++) {
				globe.rings[i].positions[j].longitude
						+= deltaTimeMillis/1000 * 360/rotationPeriod * timeScale;
			}
			//ringLayer.addRenderable(new WorldWind.Path(rings[i].positions, rings[i].attributes));
			globe.ringLayer.addRenderable(globe.rings[i]);
		}

		plusMinus = 1;

		for (i = 0; i < globe.placemarks.length; i++) {
			//if (i % numSatellitesPerRing === 0)
			//	plusMinus = plusMinus*-1;

			globe.placemarks[i].position.latitude
					+= (deltaTimeMillis/1000 * 360/orbitalPeriod * timeScale * plusMinus);

			globe.placemarks[i].position.longitude
					+= (deltaTimeMillis/1000 * 360/rotationPeriod * timeScale);
		}
		*/

		globe.propagate(deltaTimeMillis/1000 * timeScale);

		globe.wwd.redraw();

		window.requestAnimationFrame(doFrame);
	}

	window.requestAnimationFrame(doFrame);

	/* ---------- WEB SERVICE ---------- */

	var ws = new WebService();

	$('#button-run').on('click', function() {
		ws.request(
				'http://127.0.0.1:8080/simulator',
				{
					dataRate: 1000,
					packetSize: 2000
				}
		);
	});
});