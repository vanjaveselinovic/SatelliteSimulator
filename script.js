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

	/* ---------- GLOBE ---------- */

	var timeScale = $('#input-ts').val();

	var rotationPeriod = 23*60*60 + 56*60 + 4; //earth's rotation in seconds

	var globe = new Globe();

	$('.preset .name')[0].innerHTML = globe.constellations.iridium.name;
	$('.preset .name')[1].innerHTML = globe.constellations.telesat.name;

	var getElementHTML = function(element, i) {
		return '<div class="section card" data-i='+i+'><div class="input-with-labels"><div class="iwl-section label-before">Num. rings</div><div class="iwl-section input"><input type="text" id="" value="'+element.numRings+'" autocomplete="off" class="input-numeric input-nr"></div></div><div class="input-with-labels"><div class="iwl-section label-before">Num. sat per ring</div><div class="iwl-section input"><input type="text" id="" value="'+element.numSatellitesPerRing+'" autocomplete="off" class="input-numeric input-nspr"></div></div><div class="input-with-labels"><div class="iwl-section label-before">Inclination</div><div class="iwl-section input"><input type="text" id="" value="'+element.inclination+'" autocomplete="off" class="input-numeric input-inc"></div><div class="iwl-section label-after">deg</div></div><div class="input-with-labels"><div class="iwl-section label-before">Period</div><div class="iwl-section input"><input type="text" id="" value="'+element.orbitalPeriod+'" autocomplete="off" class="input-numeric input-per"></div><div class="iwl-section label-after">min</div></div></div>';
	}

	var customPreset = {};

	var applyPreset = function(preset) {
		customPreset = preset;

		$('.constellation-info').text('Preset: '+preset.name);

		globe.applyPreset(preset);

		$('#elements').empty();

		for (var i = 0; i < preset.elements.length; i++) {
			$('#elements').append(getElementHTML(preset.elements[i], i));
		}

		registerInputs();
	};

	applyPreset(globe.constellations.iridium);

	$('.preset').on('click', function() {
		$('.preset.active').removeClass('active');
		$(this).addClass('active');
	});

	$('#iridium').on('click', function() {
		applyPreset(globe.constellations.iridium);
	});

	$('#telesat').on('click', function() {
		applyPreset(globe.constellations.telesat);
	});

	/* live update */

	$('#input-ts.input-numeric').on('keydown', function(e) {
		if (!isNaN($(this).val())) {
			if (e.which === 38)
				$(this).val(parseInt($(this).val())+1);
			else if (e.which === 40)
				$(this).val(parseInt($(this).val())-1);
		}
		$(this).trigger('input');
	});

	var numRingsInput;
	var numSatellitesPerRingInput;
	var inclinationInput;
	var periodInput;

	function registerInputs() {
		$('.input-nr').on('input', function() {
			numRingsInput = $(this).val();

			if (!isNaN(numRingsInput) && numRingsInput > 0) {
				$('.input-nr').removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].numRings = numRingsInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-nspr').on('input', function() {
			numSatellitesPerRingInput = $(this).val();

			if (!isNaN(numSatellitesPerRingInput) && numSatellitesPerRingInput > 0) {
				$('.input-nspr').removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].numSatellitesPerRing = numSatellitesPerRingInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-inc').on('input', function() {
			inclinationInput = $(this).val();

			if (!isNaN(inclinationInput) && inclinationInput > 0 && inclinationInput < 360) {
				$('.input-inc').removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].inclination = inclinationInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-per').on('input', function() {
			periodInput = $('.input-per').val();

			if (!isNaN(periodInput) && periodInput >= 90 && periodInput <= 100) {
				$('.input-per').removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].orbitalPeriod = periodInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$('.input-per').addClass('invalid-input');
			}
		});

		$('#elements .input-numeric').on('keydown', function(e) {
			if (!isNaN($(this).val())) {
				if (e.which === 38)
					$(this).val(parseInt($(this).val())+1);
				else if (e.which === 40)
					$(this).val(parseInt($(this).val())-1);
			}
			$(this).trigger('input');
		});
	}

	var altitudeInput;

	$('.input-alt').on('input', function() {
		altitudeInput = $('.input-alt').val();

		if (!isNaN(altitudeInput) && altitudeInput > 0) {
			$('.input-alt').removeClass('invalid-input');

			for (var i = 0; i < globe.placemarks.length; i++) {
				globe.placemarks[i].position.altitude = altitudeInput;
			}

			globe.wwd.redraw();
		} else {
			$('.input-alt').addClass('invalid-input');
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

		globe.propagate(deltaTimeMillis/1000 * timeScale);

		globe.wwd.redraw();

		window.requestAnimationFrame(doFrame);
	}

	window.requestAnimationFrame(doFrame);

	/* ---------- WEB SERVICE ---------- */

	var ws = new WebService();

	$('#button-run').on('click', function() {
		ws.postWithData(
				'http://127.0.0.1:4321/simulator',
				customPreset
		);
	});
});