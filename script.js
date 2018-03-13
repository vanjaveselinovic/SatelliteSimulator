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

	var globe = new Globe({main: this});

	/* load library */

	var getCPresetHTML = function(presetKey, active) {
		var activeProp = active ? 'active' : '';
		return '<div class="section card preset '+activeProp+'" id="'+presetKey+'"><i class="fas fa-check icon"></i><span class="name">'+globe.constellations[presetKey].name+'</span></div>';
	};

	var constellations = Object.keys(globe.constellations);

	for (var i = 0; i < constellations.length; i++) {
		$('#c-presets').append(getCPresetHTML(constellations[i], i === 0 ? true : false));
	}

	var getGSPresetHTML = function(presetKey) {
		return '<div class="section card preset" id="'+presetKey+'"><i class="fas fa-plus-circle icon"></i><span class="name">'+globe.groundStationPresets[presetKey].name+'</span></div>';
	};

	var groundStationKeys = Object.keys(globe.groundStationPresets);

	for (var i = 0; i < groundStationKeys.length; i++) {
		$('#gs-presets').append(getGSPresetHTML(groundStationKeys[i]));
	}

	/* load configuration */

	var getElementHTML = function(element, i) {
		var singleChecked = element.type === TYPE_SINGLE ? 'checked' : '';
		var doubleChecked = element.type === TYPE_DOUBLE ? 'checked' : '';

		var radioSD = '<div class="input-radio"><input type="radio" id="type-single" name="type'+i+'" value="'+TYPE_SINGLE+'" '+singleChecked+'><label for="type-single"><div class="type-icon"></div>Single</label><input type="radio" id="type-double" name="type'+i+'" value="'+TYPE_DOUBLE+'" '+doubleChecked+'><label for="type-double"><div class="type-icon"></div>Double</label></div>';

		var radioColor = '<div class="input-radio-color irc-c">';

		var checkedTemp = '';
		var colorTemp = '';

		for (var c = 0; c < COLORS.length; c++) {

			colorTemp = 'rgb('
					+COLORS[c].r+', '
					+COLORS[c].g+', '
					+COLORS[c].b+')';

			checkedTemp = element.color === COLORS[c] ? 'checked="checked"' : '';

			radioColor += '<label style="background-color: '+colorTemp+'"><input type="radio" name="color'+i+'" value="color'+c+'" '+checkedTemp+'><i class="fas fa-check icon"></i></label>';
		}

		radioColor += '</div>'

		return '<div class="section card" data-i='+i+'><div class="input-with-labels"><div class="iwl-section label-before">Num. rings</div><div class="iwl-section input"><input type="text" id="" value="'+element.numRings+'" autocomplete="off" class="input-numeric input-nr"></div></div><div class="input-with-labels"><div class="iwl-section label-before">Num. sat per ring</div><div class="iwl-section input"><input type="text" id="" value="'+element.numSatellitesPerRing+'" autocomplete="off" class="input-numeric input-nspr"></div></div><div class="input-with-labels"><div class="iwl-section label-before">Inclination</div><div class="iwl-section input"><input type="text" id="" value="'+element.inclination+'" autocomplete="off" class="input-numeric input-inc"></div><div class="iwl-section label-after">deg</div></div><div class="input-with-labels"><div class="iwl-section label-before">Period</div><div class="iwl-section input"><input type="text" id="" value="'+element.orbitalPeriod+'" autocomplete="off" class="input-numeric input-per"></div><div class="iwl-section label-after">min</div></div>'+radioSD+radioColor+'<div class="close-button"><i class="fas fa-times"></i></div></div>';
	}

	var customPreset = {};

	var applyPreset = function(preset) {
		customPreset = preset;

		$('.constellation-info').text('Preset: '+preset.name);

		/*
		$('.constellation-info select').empty();

		var constellations = Object.keys(globe.constellations);

		for (var i = 0; i < constellations.length; i++) {
			$('.constellation-info select').append($('<option>', {
				value: constellations[i],
				text: globe.constellations[constellations[i]].name
			}));
		}
		*/

		globe.applyPreset(customPreset);

		$('#elements').empty();

		for (var i = 0; i < customPreset.elements.length; i++) {
			$('#elements').append(getElementHTML(customPreset.elements[i], i));
			$('#elements .card:last-child').css('border-bottom', '8px solid rgb('
					+customPreset.elements[i].color.r+', '
					+customPreset.elements[i].color.g+', '
					+customPreset.elements[i].color.b+')');
		}

		registerInputs();
	};

	applyPreset(JSON.parse(JSON.stringify(globe.constellations.iridium)));

	$('#c-presets .preset').on('click', function() {
		$('#c-presets .preset.active').removeClass('active');
		$(this).addClass('active');

		applyPreset(JSON.parse(JSON.stringify(globe.constellations[$(this).attr('id')])));
	});

	$('#add-constellation').on('click', function() {
		customPreset.name = 'Custom';
		$('#c-presets .preset.active').removeClass('active');

		customPreset.elements.push({
				numRings: 1,
				numSatellitesPerRing: 10,
				inclination: 90,
				color: COLORS[0],
				orbitalPeriod: 95,
				type: TYPE_SINGLE
			});

		applyPreset(customPreset);
	});

	/* ground stations */

	var getGSHTML = function(gs, i) {
		var radioColor = '<div class="input-radio-color irc-gs">';

		var checkedTemp = '';
		var colorTemp = '';

		for (var c = COLORS.length - 1; c >= 0; c--) {

			if (c === 0 || c === 2 || c === 3) {
				colorTemp = 'rgb('
						+COLORS[c].r+', '
						+COLORS[c].g+', '
						+COLORS[c].b+')';

				checkedTemp = gs.color === COLORS[c] ? 'checked="checked"' : '';

				radioColor += '<label style="background-color: '+colorTemp+'"><input type="radio" name="color-gs'+i+'" value="color'+c+'" '+checkedTemp+'><i class="fas fa-check icon icon-next-to-text"></i> <span>'+COLORS[c].trafficName+'</span></label>';
			}
		}

		radioColor += '</div>'

		return '<div class="section card" data-i='+i+'><div class="input-with-labels"><div class="iwl-section label-before">Name</div><div class="iwl-section input"><input type="text" id="" value="'+gs.name+'" autocomplete="off" class="input-name"></div></div><div class="input-with-labels"><div class="iwl-section label-before">Latitude</div><div class="iwl-section input"><input type="text" id="" value="'+gs.lat+'" autocomplete="off" class="input-numeric input-lat"></div><div class="iwl-section label-after">deg</div></div><div class="input-with-labels"><div class="iwl-section label-before">Longitude</div><div class="iwl-section input"><input type="text" id="" value="'+gs.lon+'" autocomplete="off" class="input-numeric input-lon"></div><div class="iwl-section label-after">deg</div></div>'+radioColor+'<div class="close-button"><i class="fas fa-times"></i></div></div>';
	};

	var groundStations = [];

	var applyGroundStations = function(groundStationsInput) {
		groundStations = groundStationsInput;

		globe.applyGroundStations(groundStations);

		$('#ground-stations').empty();

		for (var i = 0; i < groundStations.length; i++) {
			$('#ground-stations').append(getGSHTML(groundStations[i], i));
			$('#ground-stations .card:last-child').css('border-bottom', '8px solid rgb('
						+groundStations[i].color.r+', '
						+groundStations[i].color.g+', '
						+groundStations[i].color.b+')');
			}

		registerGSInputs();
	};

	var gsKeys = Object.keys(globe.groundStationPresets);

	for (var i = 0; i < gsKeys.length; i++) {
		groundStations.push(globe.groundStationPresets[gsKeys[i]]);
	}

	applyGroundStations(groundStations);

	$('#gs-presets .preset').on('click', function() {
		groundStations.push(globe.groundStationPresets[$(this).attr('id')]);
		applyGroundStations(groundStations);
	});

	$('#add-ground-station').on('click', function() {
		groundStations.push({
				name: 'Custom',
				lat: 0,
				lon: 0,
				traffic: TRAFFIC_MD,
				color: COLORS[2]
			});

		applyGroundStations(groundStations);
	});

	var handleClick = function(recognizer) {
		var x = recognizer.clientX;
		var y = recognizer.clientY;

		var pickList = globe.wwd.pick(globe.wwd.canvasCoordinates(x, y));

		if (pickList.objects.length === 1 && pickList.objects[0].isTerrain) {
			var position = pickList.objects[0].position;
			
			//tempGroundStations.push();

			//this.configureGroundStations(tempGroundStations);
			groundStations.push({
				name: 'Custom',
				lat: position.latitude,
				lon: position.longitude,
				traffic: TRAFFIC_MD,
				color: COLORS[2]
			});

			applyGroundStations(groundStations);
		}
	};

	var clickRecognizer = new WorldWind.ClickRecognizer(globe.wwd, handleClick);

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
				$(this).removeClass('invalid-input');
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
				$(this).removeClass('invalid-input');
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
				$(this).removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].inclination = inclinationInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-per').on('input', function() {
			periodInput = $(this).val();

			if (!isNaN(periodInput) && periodInput >= 90 && periodInput <= 100) {
				$(this).removeClass('invalid-input');
				customPreset.elements[$(this)[0].parentElement.parentElement.parentElement.dataset.i].orbitalPeriod = periodInput;
				customPreset.name = 'Custom';
				globe.applyPreset(customPreset);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-radio input').on('click', function() {
			customPreset.elements[$(this)[0].parentElement.parentElement.dataset.i].type = $(this).val();
			customPreset.name = 'Custom';
			$('#c-presets .preset.active').removeClass('active');
			globe.applyPreset(customPreset);
		});

		$('.irc-c input').on('click', function() {
			var i = $(this)[0].parentElement.parentElement.parentElement.dataset.i;
			var color = COLORS[parseInt($(this).val().replace('color', ''))];
			customPreset.elements[i].color = color;
			customPreset.name = 'Custom';

			$($('#elements .card')[i]).css('border-color', 'rgb('
					+color.r+', '
					+color.g+', '
					+color.b+')');

			globe.applyPreset(customPreset);
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

		$('#elements .close-button').on('click', function() {
			var element = $(this)[0].parentElement;

			customPreset.name = 'Custom';
			$('#c-presets .preset.active').removeClass('active');

			customPreset.elements.splice(element.dataset.i, 1);
			$(element).remove();

			applyPreset(customPreset);
		});
	}

	var nameInput;
	var latitudeInput;
	var longitudeInput;

	function registerGSInputs() {
		$('.input-name').on('input', function() {
			nameInput = $(this).val();

			if (nameInput !== '') {
				$(this).removeClass('invalid-input');
				groundStations[$(this)[0].parentElement.parentElement.parentElement.dataset.i].name = nameInput;
				globe.applyGroundStations(groundStations);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-lat').on('input', function() {
			latitudeInput = $(this).val();

			if (!isNaN(latitudeInput) && latitudeInput >= -90 && latitudeInput <= 90) {
				$(this).removeClass('invalid-input');
				groundStations[$(this)[0].parentElement.parentElement.parentElement.dataset.i].lat = latitudeInput;
				globe.applyGroundStations(groundStations);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.input-lon').on('input', function() {
			longitudeInput = $(this).val();

			if (!isNaN(longitudeInput) && longitudeInput >= -180 && longitudeInput <= 180) {
				$(this).removeClass('invalid-input');
				groundStations[$(this)[0].parentElement.parentElement.parentElement.dataset.i].lon = longitudeInput;
				globe.applyGroundStations(groundStations);
			} else {
				$(this).addClass('invalid-input');
			}
		});

		$('.irc-gs input').on('click', function() {
			var i = $(this)[0].parentElement.parentElement.parentElement.dataset.i;
			var color = COLORS[parseInt($(this).val().replace('color', ''))];
			groundStations[i].color = color;
			groundStations[i].traffic = color.traffic;

			$($('#ground-stations .card')[i]).css('border-color', 'rgb('
					+color.r+', '
					+color.g+', '
					+color.b+')');

			globe.applyGroundStations(groundStations);
		});

		$('#ground-stations .input-numeric').on('keydown', function(e) {
			if (!isNaN($(this).val())) {
				if (e.which === 38)
					$(this).val(parseInt($(this).val())+1);
				else if (e.which === 40)
					$(this).val(parseInt($(this).val())-1);
			}
			$(this).trigger('input');
		});

		$('#ground-stations .close-button').on('click', function() {
			var element = $(this)[0].parentElement;

			groundStations.splice(element.dataset.i, 1);
			$(element).remove();

			applyGroundStations(groundStations);
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