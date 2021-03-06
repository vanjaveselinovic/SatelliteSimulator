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
		var colorTest = 'rgb('
					+element.color.r+', '
					+element.color.g+', '
					+element.color.b+')';

		for (var c = 0; c < COLORS.length; c++) {

			colorTemp = 'rgb('
					+COLORS[c].r+', '
					+COLORS[c].g+', '
					+COLORS[c].b+')';

			checkedTemp = colorTest === colorTemp ? 'checked="checked"' : '';

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

	var groundStationNames = {};

	var addGroundStation = function(gs) {
		gs.uniqueName = gs.name;

		if (!groundStationNames.hasOwnProperty(gs.name)) groundStationNames[gs.name] = 1;
		else {
			groundStationNames[gs.name]++;
			gs.uniqueName += groundStationNames[gs.name];
		}

		groundStations.push(gs);
		applyGroundStations(groundStations);
	};

	var changeGroundStationName = function(i, name) {
		groundStations[i].name = name;
		groundStations[i].uniqueName = name;

		if (!groundStationNames.hasOwnProperty(name)) groundStationNames[name] = 1;
		else {
			groundStationNames[name]++;
			groundStations[i].uniqueName += groundStationNames[name];
		}
	};

	var gsKeys = Object.keys(globe.groundStationPresets);

	for (var i = 0; i < gsKeys.length; i++) {
		addGroundStation(globe.groundStationPresets[gsKeys[i]]);
	}

	$('#gs-presets .preset').on('click', function() {
		addGroundStation(globe.groundStationPresets[$(this).attr('id')]);
	});

	$('#add-ground-station').on('click', function() {		
		addGroundStation({
				name: 'Custom',
				lat: 0,
				lon: 0,
				traffic: TRAFFIC_MD,
				color: COLORS[2]
			});
	});

	var disabled = false;

	var handleClick = function(recognizer) {
		if (!disabled) {
			var x = recognizer.clientX;
			var y = recognizer.clientY;

			var pickList = globe.wwd.pick(globe.wwd.canvasCoordinates(x, y));

			if (pickList.objects.length === 1 && pickList.objects[0].isTerrain) {
				var position = pickList.objects[0].position;
				
				addGroundStation({
					name: 'Custom',
					lat: position.latitude,
					lon: position.longitude,
					traffic: TRAFFIC_MD,
					color: COLORS[2]
				});
			}
		}
	};

	var clickRecognizer = new WorldWind.ClickRecognizer(globe.wwd, handleClick);

	/* live update */

	$('.input-numeric.in-static').on('keydown', function(e) {
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
				var i = $(this)[0].parentElement.parentElement.parentElement.dataset.i;
				changeGroundStationName(i, nameInput);
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

	/* simulation config */

	var startTime = new Date();

	var simulationConfig = {
		startTime: startTime.toISOString(),
		duration: parseInt($('.input-dur').val()), //minutes
		interval: parseInt($('.input-int').val()) //seconds
	};

	$('.input-dur').on('input', function() {
		var durationInput = $('.input-dur').val();

		if (!isNaN(durationInput) && durationInput > 0) {
			$('.input-dur').removeClass('invalid-input');
			simulationConfig.duration = parseInt(durationInput);
		} else {
			$('.input-dur').addClass('invalid-input');
		}
	});

	$('.input-int').on('input', function() {
		var intervalInput = $('.input-int').val();

		if (!isNaN(intervalInput) && intervalInput > 0) {
			$('.input-int').removeClass('invalid-input');
			simulationConfig.interval = parseInt(intervalInput);
		} else {
			$('.input-int').addClass('invalid-input');
		}
	});

	/* ---------- CHOREOGRAPHING ---------- */

	var deltaTimeMillis = 0, prevTimeMillis = performance.now();
	var i = 0;
	var j = 0;
	var k = 0;

	var plusMinus = 1;

	var go = true;

	function doFrame(currTimeMillis) {
		deltaTimeMillis = currTimeMillis - prevTimeMillis;
		prevTimeMillis = currTimeMillis;

		globe.propagate(deltaTimeMillis/1000 * timeScale);

		globe.wwd.redraw();

		if (go) window.requestAnimationFrame(doFrame);
	}

	window.requestAnimationFrame(doFrame);

	/* ---------- WEB SERVICE ---------- */

	var ws = new WebService();

	$('#button-run').on('click', function() {
		disableInputs();
		ws.postWithData(
				'http://localhost:1234/simulator',
				{
					constellations: customPreset,
					groundStations: groundStations,
					simulation: simulationConfig
				},
				waitForSimulationToFinish,
				function() {
					$('#button-run').remove();
					$('.result-button').show();
					outputResults(testOutput);
				}
		);
	});

	/* waiting */

	var timeBetweenChecksInSeconds = 10;
	var totalTimeWaitingInSeconds = -1 * timeBetweenChecksInSeconds;

	var output;

	var waitForSimulationToFinish = function() {
		console.log('waiting...');

		totalTimeWaitingInSeconds += timeBetweenChecksInSeconds;
		if (totalTimeWaitingInSeconds > 300) timeBetweenChecksInSeconds = 60;

		ws.request(
				'http://localhost:1234/check',
				function(outputIn){
					console.log('done!');

					endLoad();

					$('#button-run').remove();
					$('.result-button').show();

					outputResults(outputIn);
				},
				function(){
					console.log('back to waiting...');

					load();
					
					setTimeout(waitForSimulationToFinish, timeBetweenChecksInSeconds * 1000);
				}
			);
	};

	/* disable inputs */

	var disableInputs = function() {
		$('input[type="text"]').prop('disabled', true);
		$('input[type="radio"]').prop('disabled', true);
		$('#add-constellation').addClass('disabled');
		$('#add-ground-station').addClass('disabled');
		$('.close-button').addClass('disabled');
		$('.preset').addClass('disabled');
		disabled = true;
	};

	/* expand simulation menu */

	var expandSimulationMenu = function() {
		$('#sim-menu').addClass('expanded');
	};

	/* output */

	var testOutput = JSON.parse('{"startTime":"2018-03-15T00:01:01.681Z","deltaT":10,"numberOfStations":203,"groundStations":[{"id":1,"name":"Ottawa","nonUniqueName":"Ottawa","latitude":45.4215,"longitude":-75.6972,"altitude":0,"rate":1,"senders":[]},{"id":2,"name":"Toronto","nonUniqueName":"Toronto","latitude":43.6532,"longitude":-79.3832,"altitude":0,"rate":1,"senders":[]},{"id":3,"name":"London","nonUniqueName":"London","latitude":51.5074,"longitude":0.1278,"altitude":0,"rate":1,"senders":[]}],"rings":[{"ringNumber":1,"stationIds":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":0,"argumentOfPeriapsis":45},{"ringNumber":2,"stationIds":[24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":18,"argumentOfPeriapsis":45},{"ringNumber":3,"stationIds":[44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":36,"argumentOfPeriapsis":45},{"ringNumber":4,"stationIds":[64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":54,"argumentOfPeriapsis":45},{"ringNumber":5,"stationIds":[84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":72,"argumentOfPeriapsis":45},{"ringNumber":6,"stationIds":[104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":90,"argumentOfPeriapsis":45},{"ringNumber":7,"stationIds":[124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":108,"argumentOfPeriapsis":45},{"ringNumber":8,"stationIds":[144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":126,"argumentOfPeriapsis":45},{"ringNumber":9,"stationIds":[164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":144,"argumentOfPeriapsis":45},{"ringNumber":10,"stationIds":[184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203],"eccentricity":0.005,"semimajorAxis":6896719.789103912,"inclination":90,"longitudeOfAscendingNode":162,"argumentOfPeriapsis":45}],"events":[{"startSimulationTime":0,"startUtcTime":"2018-03-15T00:01:01.681","endSimulationTime":0,"endUtcTime":"2018-03-15T00:01:01.681","paths":[],"satelliteData":[{"id":4,"x":45.178548433445734,"y":-82.62598677176658,"z":494815.8758832716},{"id":5,"x":63.14402863689465,"y":-82.62598677176656,"z":502763.5802469675},{"id":6,"x":81.05488514150284,"y":-82.62598677176656,"z":511489.3193409972},{"id":7,"x":81.0548250307098,"y":97.3740132282334,"z":519064.99313895096},{"id":8,"x":63.14357014776106,"y":97.37401322823341,"z":524764.0179173786},{"id":9,"x":45.17766015492553,"y":97.37401322823344,"z":529126.8910639888},{"id":10,"x":27.143890109280868,"y":97.37401322823344,"z":533505.9863538411},{"id":11,"x":9.054974579857587,"y":97.37401322823344,"z":539264.1881495158},{"id":12,"x":-9.054913230343681,"y":97.37401322823342,"z":546946.4220682223},{"id":13,"x":-27.143425803509746,"y":97.37401322823342,"z":555785.401459319},{"id":14,"x":-45.17677187602807,"y":97.37401322823342,"z":563782.7422341157},{"id":15,"x":-63.142670280821605,"y":97.37401322823345,"z":568354.9213382266},{"id":16,"x":-81.0544454880544,"y":97.37401322823345,"z":567284.4471640416},{"id":17,"x":-81.05450560378203,"y":-82.62598677176659,"z":559602.2131853735},{"id":18,"x":-63.14312879111844,"y":-82.62598677176659,"z":546075.5054952728},{"id":19,"x":-45.177660154925526,"y":-82.62598677176658,"z":529126.8910639896},{"id":20,"x":-27.14433706510712,"y":-82.62598677176658,"z":512194.49948893144},{"id":21,"x":-9.055300589407327,"y":-82.62598677176658,"z":498726.9684232612},{"id":22,"x":9.055361943993928,"y":-82.62598677176658,"z":491151.29468584293},{"id":23,"x":27.144801392098017,"y":-82.62598677176658,"z":490194.06256239454},{"id":24,"x":54.169560833364365,"y":-64.62598677176658,"z":498537.9859325796},{"id":25,"x":72.10450713964065,"y":-64.62598677176658,"z":507173.3016507119},{"id":26,"x":90,"y":-45.75608912592255,"z":515497.98292829003},{"id":27,"x":72.1042809369627,"y":115.37401322823341,"z":522141.9697657595},{"id":28,"x":54.16886091493454,"y":115.37401322823344,"z":527038.6183746886},{"id":29,"x":36.16906884342926,"y":115.37401322823344,"z":531218.9848524369},{"id":30,"x":18.104570962316814,"y":115.37401322823341,"z":536151.235893193},{"id":31,"x":-9.597113255917817e-16,"y":115.37401322823344,"z":542879.8608843721},{"id":32,"x":-18.10434080043441,"y":115.37401322823344,"z":551322.5931509967},{"id":33,"x":-36.16836427054255,"y":115.37401322823344,"z":560047.5751126325},{"id":34,"x":-54.16789754128888,"y":115.37401322823344,"z":566655.746134536},{"id":35,"x":-72.10358472560577,"y":115.37401322823344,"z":568623.1069685126},{"id":36,"x":-89.99999999999997,"y":120.16947505021896,"z":564264.5466391919},{"id":37,"x":-72.10381094353711,"y":-64.62598677176659,"z":553451.7493461025},{"id":38,"x":-54.168597475350026,"y":-64.62598677176658,"z":537827.1551803611},{"id":39,"x":-36.16933403477839,"y":-64.62598677176656,"z":520430.4483089916},{"id":40,"x":-18.10504918201734,"y":-64.62598677176658,"z":504841.45707390475},{"id":41,"x":-1.5575677735847336e-14,"y":-64.62598677176658,"z":494113.2971734712},{"id":42,"x":18.105279359442793,"y":-64.62598677176656,"z":489872.78932684526},{"id":43,"x":36.17003862282411,"y":-64.62598677176658,"z":491929.8165663255},{"id":44,"x":63.14402863689465,"y":-46.62598677176657,"z":502763.58024696633},{"id":45,"x":81.05488514150284,"y":-46.62598677176655,"z":511489.3193409954},{"id":46,"x":81.0548250307098,"y":133.37401322823342,"z":519064.9931389514},{"id":47,"x":63.14357014776106,"y":133.37401322823342,"z":524764.0179173786},{"id":48,"x":45.17766015492553,"y":133.37401322823342,"z":529126.8910639888},{"id":49,"x":27.143890109280864,"y":133.37401322823342,"z":533505.986353842},{"id":50,"x":9.054974579857587,"y":133.37401322823342,"z":539264.1881495158},{"id":51,"x":-9.05491323034368,"y":133.37401322823342,"z":546946.4220682225},{"id":52,"x":-27.143425803509746,"y":133.37401322823342,"z":555785.401459319},{"id":53,"x":-45.17677187602806,"y":133.37401322823342,"z":563782.7422341169},{"id":54,"x":-63.14267028082163,"y":133.37401322823342,"z":568354.9213382271},{"id":55,"x":-81.05444548805437,"y":133.37401322823345,"z":567284.4471640439},{"id":56,"x":-81.05450560378202,"y":-46.62598677176659,"z":559602.2131853724},{"id":57,"x":-63.14312879111844,"y":-46.62598677176658,"z":546075.5054952728},{"id":58,"x":-45.177660154925526,"y":-46.62598677176657,"z":529126.8910639896},{"id":59,"x":-27.14433706510712,"y":-46.62598677176657,"z":512194.49948893144},{"id":60,"x":-9.055300589407333,"y":-46.62598677176657,"z":498726.96842325677},{"id":61,"x":9.055361943993926,"y":-46.62598677176657,"z":491151.2946858437},{"id":62,"x":27.144801392098017,"y":-46.62598677176657,"z":490194.062562396},{"id":63,"x":45.17854843344571,"y":-46.62598677176658,"z":494815.8758832716},{"id":64,"x":72.10450713964065,"y":-28.625986771766556,"z":507173.30165071134},{"id":65,"x":90,"y":33.93906440531143,"z":515497.98292829003},{"id":66,"x":72.1042809369627,"y":151.37401322823342,"z":522141.96976575983},{"id":67,"x":54.16886091493454,"y":151.37401322823342,"z":527038.6183746879},{"id":68,"x":36.16906884342925,"y":151.37401322823342,"z":531218.9848524384},{"id":69,"x":18.104570962316814,"y":151.37401322823342,"z":536151.2358931918},{"id":70,"x":-9.597113255917817e-16,"y":151.37401322823342,"z":542879.8608843731},{"id":71,"x":-18.104340800434404,"y":151.37401322823342,"z":551322.593151},{"id":72,"x":-36.16836427054255,"y":151.37401322823342,"z":560047.5751126328},{"id":73,"x":-54.16789754128889,"y":151.37401322823342,"z":566655.7461345352},{"id":74,"x":-72.10358472560578,"y":151.37401322823342,"z":568623.1069685146},{"id":75,"x":-89.99999999999994,"y":156.92424862599935,"z":564264.5466391919},{"id":76,"x":-72.1038109435371,"y":-28.62598677176659,"z":553451.7493461005},{"id":77,"x":-54.16859747535002,"y":-28.625986771766577,"z":537827.155180363},{"id":78,"x":-36.16933403477839,"y":-28.625986771766577,"z":520430.4483089908},{"id":79,"x":-18.105049182017343,"y":-28.625986771766573,"z":504841.4570739044},{"id":80,"x":-1.5575677735847336e-14,"y":-28.625986771766577,"z":494113.29717347026},{"id":81,"x":18.105279359442793,"y":-28.625986771766566,"z":489872.78932684526},{"id":82,"x":36.1700386228241,"y":-28.62598677176656,"z":491929.8165663282},{"id":83,"x":54.169560833364336,"y":-28.625986771766566,"z":498537.98593257857},{"id":84,"x":81.05488514150284,"y":-10.625986771766561,"z":511489.3193409966},{"id":85,"x":81.0548250307098,"y":169.37401322823342,"z":519064.9931389521},{"id":86,"x":63.14357014776106,"y":169.37401322823342,"z":524764.017917379},{"id":87,"x":45.17766015492552,"y":169.37401322823342,"z":529126.8910639908},{"id":88,"x":27.143890109280864,"y":169.37401322823342,"z":533505.986353842},{"id":89,"x":9.054974579857584,"y":169.37401322823342,"z":539264.1881495193},{"id":90,"x":-9.054913230343685,"y":169.37401322823342,"z":546946.4220682201},{"id":91,"x":-27.143425803509754,"y":169.37401322823342,"z":555785.4014593179},{"id":92,"x":-45.17677187602806,"y":169.37401322823342,"z":563782.7422341169},{"id":93,"x":-63.14267028082164,"y":169.37401322823342,"z":568354.9213382266},{"id":94,"x":-81.0544454880544,"y":169.37401322823345,"z":567284.4471640427},{"id":95,"x":-81.05450560378202,"y":-10.625986771766591,"z":559602.213185374},{"id":96,"x":-63.14312879111844,"y":-10.625986771766577,"z":546075.5054952728},{"id":97,"x":-45.17766015492555,"y":-10.625986771766577,"z":529126.8910639887},{"id":98,"x":-27.14433706510713,"y":-10.62598677176657,"z":512194.49948893074},{"id":99,"x":-9.055300589407333,"y":-10.625986771766579,"z":498726.9684232564},{"id":100,"x":9.055361943993928,"y":-10.625986771766575,"z":491151.29468584293},{"id":101,"x":27.144801392098017,"y":-10.625986771766568,"z":490194.062562396},{"id":102,"x":45.17854843344571,"y":-10.625986771766566,"z":494815.8758832716},{"id":103,"x":63.14402863689461,"y":-10.625986771766563,"z":502763.580246968},{"id":104,"x":90,"y":45.3276696604607,"z":515497.98292829003},{"id":105,"x":72.1042809369627,"y":-172.62598677176658,"z":522141.96976575983},{"id":106,"x":54.16886091493454,"y":-172.62598677176658,"z":527038.618374687},{"id":107,"x":36.16906884342926,"y":-172.62598677176658,"z":531218.9848524369},{"id":108,"x":18.104570962316814,"y":-172.62598677176658,"z":536151.2358931918},{"id":109,"x":-9.597113255917817e-16,"y":-172.62598677176658,"z":542879.8608843721},{"id":110,"x":-18.104340800434414,"y":-172.62598677176658,"z":551322.5931509954},{"id":111,"x":-36.16836427054254,"y":-172.62598677176655,"z":560047.5751126322},{"id":112,"x":-54.16789754128889,"y":-172.62598677176658,"z":566655.7461345366},{"id":113,"x":-72.10358472560578,"y":-172.62598677176655,"z":568623.1069685146},{"id":114,"x":-89.99999999999997,"y":-163.07599287027924,"z":564264.5466391919},{"id":115,"x":-72.10381094353716,"y":7.374013228233413,"z":553451.7493460998},{"id":116,"x":-54.168597475350026,"y":7.374013228233424,"z":537827.1551803611},{"id":117,"x":-36.16933403477839,"y":7.374013228233422,"z":520430.4483089916},{"id":118,"x":-18.105049182017343,"y":7.374013228233432,"z":504841.4570739044},{"id":119,"x":-1.5575677735847336e-14,"y":7.374013228233426,"z":494113.2971734712},{"id":120,"x":18.105279359442793,"y":7.374013228233429,"z":489872.78932684526},{"id":121,"x":36.17003862282411,"y":7.374013228233426,"z":491929.8165663255},{"id":122,"x":54.169560833364336,"y":7.374013228233435,"z":498537.9859325779},{"id":123,"x":72.10450713964065,"y":7.374013228233437,"z":507173.30165071116},{"id":124,"x":81.0548250307098,"y":-154.62598677176658,"z":519064.99313895096},{"id":125,"x":63.14357014776106,"y":-154.62598677176658,"z":524764.0179173786},{"id":126,"x":45.17766015492552,"y":-154.62598677176658,"z":529126.8910639908},{"id":127,"x":27.143890109280864,"y":-154.62598677176658,"z":533505.986353842},{"id":128,"x":9.054974579857587,"y":-154.62598677176658,"z":539264.1881495158},{"id":129,"x":-9.054913230343685,"y":-154.62598677176658,"z":546946.4220682201},{"id":130,"x":-27.143425803509746,"y":-154.62598677176658,"z":555785.401459319},{"id":131,"x":-45.176771876028056,"y":-154.62598677176658,"z":563782.7422341191},{"id":132,"x":-63.14267028082164,"y":-154.62598677176655,"z":568354.9213382266},{"id":133,"x":-81.0544454880544,"y":-154.62598677176655,"z":567284.4471640416},{"id":134,"x":-81.05450560378203,"y":25.374013228233405,"z":559602.2131853735},{"id":135,"x":-63.14312879111844,"y":25.37401322823342,"z":546075.5054952728},{"id":136,"x":-45.17766015492555,"y":25.37401322823343,"z":529126.8910639887},{"id":137,"x":-27.14433706510713,"y":25.37401322823342,"z":512194.49948893074},{"id":138,"x":-9.055300589407333,"y":25.37401322823342,"z":498726.96842325677},{"id":139,"x":9.055361943993928,"y":25.37401322823342,"z":491151.29468584293},{"id":140,"x":27.144801392098017,"y":25.37401322823343,"z":490194.06256239454},{"id":141,"x":45.17854843344571,"y":25.37401322823343,"z":494815.87588327256},{"id":142,"x":63.14402863689461,"y":25.374013228233427,"z":502763.58024696773},{"id":143,"x":81.05488514150282,"y":25.37401322823343,"z":511489.31934099726},{"id":144,"x":72.10428093696271,"y":-136.62598677176658,"z":522141.969765759},{"id":145,"x":54.16886091493455,"y":-136.62598677176658,"z":527038.6183746881},{"id":146,"x":36.16906884342926,"y":-136.62598677176658,"z":531218.9848524369},{"id":147,"x":18.104570962316814,"y":-136.62598677176658,"z":536151.2358931918},{"id":148,"x":-9.597113255917817e-16,"y":-136.62598677176658,"z":542879.8608843721},{"id":149,"x":-18.104340800434404,"y":-136.62598677176655,"z":551322.593151},{"id":150,"x":-36.16836427054255,"y":-136.62598677176658,"z":560047.5751126328},{"id":151,"x":-54.16789754128889,"y":-136.62598677176658,"z":566655.7461345352},{"id":152,"x":-72.10358472560578,"y":-136.62598677176655,"z":568623.1069685156},{"id":153,"x":-89.99999999999997,"y":-126.2392885074569,"z":564264.5466391919},{"id":154,"x":-72.10381094353711,"y":43.37401322823341,"z":553451.7493461025},{"id":155,"x":-54.16859747535007,"y":43.37401322823341,"z":537827.1551803604},{"id":156,"x":-36.16933403477839,"y":43.37401322823342,"z":520430.4483089908},{"id":157,"x":-18.10504918201734,"y":43.37401322823341,"z":504841.45707390475},{"id":158,"x":-1.557567773584734e-14,"y":43.374013228233416,"z":494113.2971734693},{"id":159,"x":18.10527935944279,"y":43.37401322823343,"z":489872.7893268471},{"id":160,"x":36.17003862282411,"y":43.37401322823342,"z":491929.8165663255},{"id":161,"x":54.169560833364336,"y":43.37401322823342,"z":498537.98593257857},{"id":162,"x":72.10450713964065,"y":43.37401322823343,"z":507173.30165071116},{"id":163,"x":89.99999999999997,"y":56.477853865853994,"z":515497.98292829003},{"id":164,"x":63.14357014776106,"y":-118.62598677176659,"z":524764.017917379},{"id":165,"x":45.17766015492552,"y":-118.62598677176659,"z":529126.8910639908},{"id":166,"x":27.143890109280868,"y":-118.62598677176659,"z":533505.9863538418},{"id":167,"x":9.054974579857586,"y":-118.62598677176659,"z":539264.1881495158},{"id":168,"x":-9.054913230343681,"y":-118.62598677176659,"z":546946.4220682223},{"id":169,"x":-27.143425803509754,"y":-118.62598677176659,"z":555785.4014593156},{"id":170,"x":-45.17677187602807,"y":-118.62598677176659,"z":563782.7422341157},{"id":171,"x":-63.142670280821655,"y":-118.62598677176659,"z":568354.9213382251},{"id":172,"x":-81.05444548805441,"y":-118.62598677176656,"z":567284.4471640419},{"id":173,"x":-81.05450560378202,"y":61.37401322823339,"z":559602.213185374},{"id":174,"x":-63.14312879111844,"y":61.37401322823341,"z":546075.5054952728},{"id":175,"x":-45.17766015492555,"y":61.37401322823341,"z":529126.8910639891},{"id":176,"x":-27.14433706510712,"y":61.37401322823342,"z":512194.49948893144},{"id":177,"x":-9.055300589407333,"y":61.37401322823342,"z":498726.96842325915},{"id":178,"x":9.055361943993928,"y":61.37401322823341,"z":491151.294685842},{"id":179,"x":27.144801392098017,"y":61.37401322823342,"z":490194.06256239454},{"id":180,"x":45.17854843344571,"y":61.37401322823344,"z":494815.87588327256},{"id":181,"x":63.14402863689461,"y":61.37401322823341,"z":502763.58024696645},{"id":182,"x":81.05488514150282,"y":61.37401322823345,"z":511489.3193409974},{"id":183,"x":81.0548250307098,"y":-118.6259867717666,"z":519064.99313895236},{"id":184,"x":54.168860914934534,"y":-100.62598677176658,"z":527038.6183746889},{"id":185,"x":36.16906884342926,"y":-100.62598677176658,"z":531218.9848524369},{"id":186,"x":18.104570962316807,"y":-100.62598677176658,"z":536151.2358931936},{"id":187,"x":-9.597113255917819e-16,"y":-100.62598677176659,"z":542879.8608843712},{"id":188,"x":-18.10434080043441,"y":-100.62598677176659,"z":551322.5931509967},{"id":189,"x":-36.16836427054255,"y":-100.62598677176658,"z":560047.5751126325},{"id":190,"x":-54.16789754128888,"y":-100.62598677176658,"z":566655.7461345361},{"id":191,"x":-72.10358472560578,"y":-100.62598677176658,"z":568623.1069685146},{"id":192,"x":-89.99999999999997,"y":-93.71324728014795,"z":564264.5466391919},{"id":193,"x":-72.1038109435371,"y":79.37401322823341,"z":553451.7493461005},{"id":194,"x":-54.168597475350026,"y":79.37401322823342,"z":537827.1551803611},{"id":195,"x":-36.169334034778444,"y":79.37401322823342,"z":520430.4483089921},{"id":196,"x":-18.105049182017343,"y":79.37401322823342,"z":504841.4570739044},{"id":197,"x":-1.5575677735847332e-14,"y":79.37401322823342,"z":494113.29717347305},{"id":198,"x":18.105279359442793,"y":79.37401322823342,"z":489872.78932684456},{"id":199,"x":36.17003862282411,"y":79.37401322823342,"z":491929.8165663255},{"id":200,"x":54.169560833364336,"y":79.37401322823342,"z":498537.98593257903},{"id":201,"x":72.10450713964065,"y":79.37401322823344,"z":507173.30165071186},{"id":202,"x":89.99999999999999,"y":88.73985585963032,"z":515497.98292829003},{"id":203,"x":72.10428093696271,"y":-100.62598677176659,"z":522141.9697657578}]},{"startSimulationTime":0,"startUtcTime":"2018-03-15T00:01:01.681","endSimulationTime":10,"endUtcTime":"2018-03-15T00:01:11.681","paths":[{"packetSenderID":3,"stationIDs":[1,84,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39309,"damagedPackets":0,"createdPackets":40448},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39623,"damagedPackets":0,"createdPackets":40353},{"packetSenderID":4,"stationIDs":[1,7,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39383,"damagedPackets":0,"createdPackets":40495},{"packetSenderID":1,"stationIDs":[3,84,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39423,"damagedPackets":0,"createdPackets":40562},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39623,"damagedPackets":0,"createdPackets":40353},{"packetSenderID":4,"stationIDs":[1,7,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39383,"damagedPackets":0,"createdPackets":40495},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39048,"damagedPackets":0,"createdPackets":40248},{"packetSenderID":1,"stationIDs":[3,84,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39423,"damagedPackets":0,"createdPackets":40562},{"packetSenderID":6,"stationIDs":[2,51,50,7,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39765,"damagedPackets":0,"createdPackets":40506},{"packetSenderID":6,"stationIDs":[2,51,50,7,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39765,"damagedPackets":0,"createdPackets":40506},{"packetSenderID":1,"stationIDs":[3,84,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39423,"damagedPackets":0,"createdPackets":40562},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39048,"damagedPackets":0,"createdPackets":40248},{"packetSenderID":3,"stationIDs":[1,84,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39309,"damagedPackets":0,"createdPackets":40448},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39048,"damagedPackets":0,"createdPackets":40248},{"packetSenderID":6,"stationIDs":[2,51,50,7,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39765,"damagedPackets":0,"createdPackets":40506},{"packetSenderID":4,"stationIDs":[1,7,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39383,"damagedPackets":0,"createdPackets":40495},{"packetSenderID":3,"stationIDs":[1,84,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39309,"damagedPackets":0,"createdPackets":40448},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":39623,"damagedPackets":0,"createdPackets":40353}],"satelliteData":[{"id":4,"x":45.178548433445734,"y":-82.62598677176658,"z":494815.8758832716},{"id":5,"x":63.14402863689465,"y":-82.62598677176656,"z":502763.5802469675},{"id":6,"x":81.05488514150284,"y":-82.62598677176656,"z":511489.3193409972},{"id":7,"x":81.0548250307098,"y":97.3740132282334,"z":519064.99313895096},{"id":8,"x":63.14357014776106,"y":97.37401322823341,"z":524764.0179173786},{"id":9,"x":45.17766015492553,"y":97.37401322823344,"z":529126.8910639888},{"id":10,"x":27.143890109280868,"y":97.37401322823344,"z":533505.9863538411},{"id":11,"x":9.054974579857587,"y":97.37401322823344,"z":539264.1881495158},{"id":12,"x":-9.054913230343681,"y":97.37401322823342,"z":546946.4220682223},{"id":13,"x":-27.143425803509746,"y":97.37401322823342,"z":555785.401459319},{"id":14,"x":-45.17677187602807,"y":97.37401322823342,"z":563782.7422341157},{"id":15,"x":-63.142670280821605,"y":97.37401322823345,"z":568354.9213382266},{"id":16,"x":-81.0544454880544,"y":97.37401322823345,"z":567284.4471640416},{"id":17,"x":-81.05450560378198,"y":-82.62598677176659,"z":559602.2131853749},{"id":18,"x":-63.14312879111844,"y":-82.62598677176659,"z":546075.5054952728},{"id":19,"x":-45.177660154925526,"y":-82.62598677176658,"z":529126.8910639896},{"id":20,"x":-27.14433706510712,"y":-82.62598677176658,"z":512194.49948893144},{"id":21,"x":-9.055300589407327,"y":-82.62598677176658,"z":498726.9684232612},{"id":22,"x":9.055361943993928,"y":-82.62598677176658,"z":491151.29468584293},{"id":23,"x":27.144801392098017,"y":-82.62598677176658,"z":490194.06256239454},{"id":24,"x":54.169560833364365,"y":-64.62598677176658,"z":498537.9859325796},{"id":25,"x":72.10450713964065,"y":-64.62598677176658,"z":507173.3016507119},{"id":26,"x":90,"y":-45.75608912592255,"z":515497.98292829003},{"id":27,"x":72.1042809369627,"y":115.37401322823341,"z":522141.9697657595},{"id":28,"x":54.16886091493454,"y":115.37401322823344,"z":527038.6183746886},{"id":29,"x":36.16906884342926,"y":115.37401322823344,"z":531218.9848524369},{"id":30,"x":18.104570962316814,"y":115.37401322823341,"z":536151.235893193},{"id":31,"x":-9.597113255917817e-16,"y":115.37401322823344,"z":542879.8608843721},{"id":32,"x":-18.10434080043441,"y":115.37401322823344,"z":551322.5931509967},{"id":33,"x":-36.16836427054255,"y":115.37401322823344,"z":560047.5751126325},{"id":34,"x":-54.16789754128888,"y":115.37401322823344,"z":566655.746134536},{"id":35,"x":-72.10358472560577,"y":115.37401322823344,"z":568623.1069685126},{"id":36,"x":-89.99999999999997,"y":120.16947505021896,"z":564264.5466391919},{"id":37,"x":-72.10381094353716,"y":-64.62598677176658,"z":553451.7493461004},{"id":38,"x":-54.168597475350026,"y":-64.62598677176658,"z":537827.1551803611},{"id":39,"x":-36.16933403477839,"y":-64.62598677176656,"z":520430.4483089916},{"id":40,"x":-18.105049182017282,"y":-64.62598677176659,"z":504841.457073904},{"id":41,"x":-1.5575677735847336e-14,"y":-64.62598677176658,"z":494113.2971734712},{"id":42,"x":18.105279359442793,"y":-64.62598677176656,"z":489872.78932684526},{"id":43,"x":36.17003862282411,"y":-64.62598677176658,"z":491929.8165663255},{"id":44,"x":63.14402863689465,"y":-46.62598677176657,"z":502763.58024696633},{"id":45,"x":81.05488514150284,"y":-46.62598677176655,"z":511489.3193409954},{"id":46,"x":81.0548250307098,"y":133.37401322823342,"z":519064.9931389514},{"id":47,"x":63.14357014776106,"y":133.37401322823342,"z":524764.0179173786},{"id":48,"x":45.17766015492553,"y":133.37401322823342,"z":529126.8910639888},{"id":49,"x":27.143890109280864,"y":133.37401322823342,"z":533505.986353842},{"id":50,"x":9.054974579857587,"y":133.37401322823342,"z":539264.1881495158},{"id":51,"x":-9.05491323034368,"y":133.37401322823342,"z":546946.4220682225},{"id":52,"x":-27.143425803509746,"y":133.37401322823342,"z":555785.401459319},{"id":53,"x":-45.17677187602806,"y":133.37401322823342,"z":563782.7422341169},{"id":54,"x":-63.14267028082163,"y":133.37401322823342,"z":568354.9213382271},{"id":55,"x":-81.05444548805437,"y":133.37401322823345,"z":567284.4471640439},{"id":56,"x":-81.05450560378198,"y":-46.62598677176658,"z":559602.2131853745},{"id":57,"x":-63.14312879111844,"y":-46.62598677176658,"z":546075.5054952728},{"id":58,"x":-45.177660154925526,"y":-46.62598677176657,"z":529126.8910639896},{"id":59,"x":-27.14433706510712,"y":-46.62598677176657,"z":512194.49948893144},{"id":60,"x":-9.055300589407333,"y":-46.62598677176657,"z":498726.96842325677},{"id":61,"x":9.055361943993926,"y":-46.62598677176657,"z":491151.2946858437},{"id":62,"x":27.144801392098017,"y":-46.62598677176657,"z":490194.062562396},{"id":63,"x":45.17854843344571,"y":-46.62598677176658,"z":494815.8758832716},{"id":64,"x":72.10450713964065,"y":-28.625986771766556,"z":507173.30165071134},{"id":65,"x":90,"y":33.93906440531143,"z":515497.98292829003},{"id":66,"x":72.1042809369627,"y":151.37401322823342,"z":522141.96976575983},{"id":67,"x":54.16886091493454,"y":151.37401322823342,"z":527038.6183746879},{"id":68,"x":36.16906884342925,"y":151.37401322823342,"z":531218.9848524384},{"id":69,"x":18.104570962316814,"y":151.37401322823342,"z":536151.2358931918},{"id":70,"x":-9.597113255917817e-16,"y":151.37401322823342,"z":542879.8608843731},{"id":71,"x":-18.104340800434404,"y":151.37401322823342,"z":551322.593151},{"id":72,"x":-36.16836427054255,"y":151.37401322823342,"z":560047.5751126328},{"id":73,"x":-54.16789754128889,"y":151.37401322823342,"z":566655.7461345352},{"id":74,"x":-72.10358472560578,"y":151.37401322823342,"z":568623.1069685146},{"id":75,"x":-89.99999999999994,"y":156.92424862599935,"z":564264.5466391919},{"id":76,"x":-72.10381094353716,"y":-28.62598677176659,"z":553451.7493460998},{"id":77,"x":-54.16859747535002,"y":-28.625986771766577,"z":537827.155180363},{"id":78,"x":-36.16933403477839,"y":-28.625986771766577,"z":520430.4483089908},{"id":79,"x":-18.105049182017282,"y":-28.625986771766573,"z":504841.457073904},{"id":80,"x":-1.5575677735847336e-14,"y":-28.625986771766577,"z":494113.29717347026},{"id":81,"x":18.105279359442793,"y":-28.625986771766566,"z":489872.78932684526},{"id":82,"x":36.1700386228241,"y":-28.62598677176656,"z":491929.8165663282},{"id":83,"x":54.169560833364336,"y":-28.625986771766566,"z":498537.98593257857},{"id":84,"x":81.05488514150284,"y":-10.625986771766561,"z":511489.3193409966},{"id":85,"x":81.0548250307098,"y":169.37401322823342,"z":519064.9931389521},{"id":86,"x":63.14357014776106,"y":169.37401322823342,"z":524764.017917379},{"id":87,"x":45.17766015492552,"y":169.37401322823342,"z":529126.8910639908},{"id":88,"x":27.143890109280864,"y":169.37401322823342,"z":533505.986353842},{"id":89,"x":9.054974579857584,"y":169.37401322823342,"z":539264.1881495193},{"id":90,"x":-9.054913230343685,"y":169.37401322823342,"z":546946.4220682201},{"id":91,"x":-27.143425803509754,"y":169.37401322823342,"z":555785.4014593179},{"id":92,"x":-45.17677187602806,"y":169.37401322823342,"z":563782.7422341169},{"id":93,"x":-63.14267028082164,"y":169.37401322823342,"z":568354.9213382266},{"id":94,"x":-81.0544454880544,"y":169.37401322823345,"z":567284.4471640427},{"id":95,"x":-81.05450560378198,"y":-10.625986771766591,"z":559602.2131853752},{"id":96,"x":-63.14312879111844,"y":-10.625986771766577,"z":546075.5054952728},{"id":97,"x":-45.17766015492555,"y":-10.625986771766577,"z":529126.8910639887},{"id":98,"x":-27.14433706510713,"y":-10.62598677176657,"z":512194.49948893074},{"id":99,"x":-9.055300589407333,"y":-10.625986771766579,"z":498726.9684232564},{"id":100,"x":9.055361943993928,"y":-10.625986771766575,"z":491151.29468584293},{"id":101,"x":27.144801392098017,"y":-10.625986771766568,"z":490194.062562396},{"id":102,"x":45.17854843344571,"y":-10.625986771766566,"z":494815.8758832716},{"id":103,"x":63.14402863689461,"y":-10.625986771766563,"z":502763.580246968},{"id":104,"x":90,"y":45.3276696604607,"z":515497.98292829003},{"id":105,"x":72.1042809369627,"y":-172.62598677176658,"z":522141.96976575983},{"id":106,"x":54.16886091493454,"y":-172.62598677176658,"z":527038.618374687},{"id":107,"x":36.16906884342926,"y":-172.62598677176658,"z":531218.9848524369},{"id":108,"x":18.104570962316814,"y":-172.62598677176658,"z":536151.2358931918},{"id":109,"x":-9.597113255917817e-16,"y":-172.62598677176658,"z":542879.8608843721},{"id":110,"x":-18.104340800434414,"y":-172.62598677176658,"z":551322.5931509954},{"id":111,"x":-36.16836427054254,"y":-172.62598677176655,"z":560047.5751126322},{"id":112,"x":-54.16789754128889,"y":-172.62598677176658,"z":566655.7461345366},{"id":113,"x":-72.10358472560578,"y":-172.62598677176655,"z":568623.1069685146},{"id":114,"x":-89.99999999999997,"y":-163.07599287027924,"z":564264.5466391919},{"id":115,"x":-72.10381094353716,"y":7.374013228233413,"z":553451.7493460998},{"id":116,"x":-54.168597475350026,"y":7.374013228233424,"z":537827.1551803611},{"id":117,"x":-36.16933403477839,"y":7.374013228233422,"z":520430.4483089916},{"id":118,"x":-18.105049182017282,"y":7.374013228233429,"z":504841.457073904},{"id":119,"x":-1.5575677735847336e-14,"y":7.374013228233426,"z":494113.2971734712},{"id":120,"x":18.105279359442793,"y":7.374013228233429,"z":489872.78932684526},{"id":121,"x":36.17003862282411,"y":7.374013228233426,"z":491929.8165663255},{"id":122,"x":54.169560833364336,"y":7.374013228233435,"z":498537.9859325779},{"id":123,"x":72.10450713964065,"y":7.374013228233437,"z":507173.30165071116},{"id":124,"x":81.0548250307098,"y":-154.62598677176658,"z":519064.99313895096},{"id":125,"x":63.14357014776106,"y":-154.62598677176658,"z":524764.0179173786},{"id":126,"x":45.17766015492552,"y":-154.62598677176658,"z":529126.8910639908},{"id":127,"x":27.143890109280864,"y":-154.62598677176658,"z":533505.986353842},{"id":128,"x":9.054974579857587,"y":-154.62598677176658,"z":539264.1881495158},{"id":129,"x":-9.054913230343685,"y":-154.62598677176658,"z":546946.4220682201},{"id":130,"x":-27.143425803509746,"y":-154.62598677176658,"z":555785.401459319},{"id":131,"x":-45.176771876028056,"y":-154.62598677176658,"z":563782.7422341191},{"id":132,"x":-63.14267028082164,"y":-154.62598677176655,"z":568354.9213382266},{"id":133,"x":-81.0544454880544,"y":-154.62598677176655,"z":567284.4471640416},{"id":134,"x":-81.05450560378198,"y":25.37401322823341,"z":559602.2131853745},{"id":135,"x":-63.14312879111844,"y":25.37401322823342,"z":546075.5054952728},{"id":136,"x":-45.17766015492555,"y":25.37401322823343,"z":529126.8910639887},{"id":137,"x":-27.14433706510713,"y":25.37401322823342,"z":512194.49948893074},{"id":138,"x":-9.055300589407333,"y":25.37401322823342,"z":498726.96842325677},{"id":139,"x":9.055361943993928,"y":25.37401322823342,"z":491151.29468584293},{"id":140,"x":27.144801392098017,"y":25.37401322823343,"z":490194.06256239454},{"id":141,"x":45.17854843344571,"y":25.37401322823343,"z":494815.87588327256},{"id":142,"x":63.14402863689461,"y":25.374013228233427,"z":502763.58024696773},{"id":143,"x":81.05488514150282,"y":25.37401322823343,"z":511489.31934099726},{"id":144,"x":72.10428093696271,"y":-136.62598677176658,"z":522141.969765759},{"id":145,"x":54.16886091493455,"y":-136.62598677176658,"z":527038.6183746881},{"id":146,"x":36.16906884342926,"y":-136.62598677176658,"z":531218.9848524369},{"id":147,"x":18.104570962316814,"y":-136.62598677176658,"z":536151.2358931918},{"id":148,"x":-9.597113255917817e-16,"y":-136.62598677176658,"z":542879.8608843721},{"id":149,"x":-18.104340800434404,"y":-136.62598677176655,"z":551322.593151},{"id":150,"x":-36.16836427054255,"y":-136.62598677176658,"z":560047.5751126328},{"id":151,"x":-54.16789754128889,"y":-136.62598677176658,"z":566655.7461345352},{"id":152,"x":-72.10358472560578,"y":-136.62598677176655,"z":568623.1069685156},{"id":153,"x":-89.99999999999997,"y":-126.2392885074569,"z":564264.5466391919},{"id":154,"x":-72.10381094353716,"y":43.37401322823341,"z":553451.7493461004},{"id":155,"x":-54.16859747535007,"y":43.37401322823341,"z":537827.1551803604},{"id":156,"x":-36.16933403477839,"y":43.37401322823342,"z":520430.4483089908},{"id":157,"x":-18.105049182017286,"y":43.374013228233416,"z":504841.4570739011},{"id":158,"x":-1.557567773584734e-14,"y":43.374013228233416,"z":494113.2971734693},{"id":159,"x":18.10527935944279,"y":43.37401322823343,"z":489872.7893268471},{"id":160,"x":36.17003862282411,"y":43.37401322823342,"z":491929.8165663255},{"id":161,"x":54.169560833364336,"y":43.37401322823342,"z":498537.98593257857},{"id":162,"x":72.10450713964065,"y":43.37401322823343,"z":507173.30165071116},{"id":163,"x":89.99999999999997,"y":56.477853865853994,"z":515497.98292829003},{"id":164,"x":63.14357014776106,"y":-118.62598677176659,"z":524764.017917379},{"id":165,"x":45.17766015492552,"y":-118.62598677176659,"z":529126.8910639908},{"id":166,"x":27.143890109280868,"y":-118.62598677176659,"z":533505.9863538418},{"id":167,"x":9.054974579857586,"y":-118.62598677176659,"z":539264.1881495158},{"id":168,"x":-9.054913230343681,"y":-118.62598677176659,"z":546946.4220682223},{"id":169,"x":-27.143425803509754,"y":-118.62598677176659,"z":555785.4014593156},{"id":170,"x":-45.17677187602807,"y":-118.62598677176659,"z":563782.7422341157},{"id":171,"x":-63.142670280821655,"y":-118.62598677176659,"z":568354.9213382251},{"id":172,"x":-81.05444548805441,"y":-118.62598677176656,"z":567284.4471640419},{"id":173,"x":-81.05450560378198,"y":61.37401322823339,"z":559602.2131853749},{"id":174,"x":-63.14312879111844,"y":61.37401322823341,"z":546075.5054952728},{"id":175,"x":-45.17766015492555,"y":61.37401322823341,"z":529126.8910639891},{"id":176,"x":-27.14433706510712,"y":61.37401322823342,"z":512194.49948893144},{"id":177,"x":-9.055300589407333,"y":61.37401322823342,"z":498726.96842325915},{"id":178,"x":9.055361943993928,"y":61.37401322823341,"z":491151.294685842},{"id":179,"x":27.144801392098017,"y":61.37401322823342,"z":490194.06256239454},{"id":180,"x":45.17854843344571,"y":61.37401322823344,"z":494815.87588327256},{"id":181,"x":63.14402863689461,"y":61.37401322823341,"z":502763.58024696645},{"id":182,"x":81.05488514150282,"y":61.37401322823345,"z":511489.3193409974},{"id":183,"x":81.0548250307098,"y":-118.6259867717666,"z":519064.99313895236},{"id":184,"x":54.168860914934534,"y":-100.62598677176658,"z":527038.6183746889},{"id":185,"x":36.16906884342926,"y":-100.62598677176658,"z":531218.9848524369},{"id":186,"x":18.104570962316807,"y":-100.62598677176658,"z":536151.2358931936},{"id":187,"x":-9.597113255917819e-16,"y":-100.62598677176659,"z":542879.8608843712},{"id":188,"x":-18.10434080043441,"y":-100.62598677176659,"z":551322.5931509967},{"id":189,"x":-36.16836427054255,"y":-100.62598677176658,"z":560047.5751126325},{"id":190,"x":-54.16789754128888,"y":-100.62598677176658,"z":566655.7461345361},{"id":191,"x":-72.10358472560578,"y":-100.62598677176658,"z":568623.1069685146},{"id":192,"x":-89.99999999999997,"y":-93.71324728014795,"z":564264.5466391919},{"id":193,"x":-72.10381094353716,"y":79.37401322823342,"z":553451.7493461004},{"id":194,"x":-54.168597475350026,"y":79.37401322823342,"z":537827.1551803611},{"id":195,"x":-36.169334034778444,"y":79.37401322823342,"z":520430.4483089921},{"id":196,"x":-18.10504918201728,"y":79.37401322823342,"z":504841.45707390463},{"id":197,"x":-1.5575677735847332e-14,"y":79.37401322823342,"z":494113.29717347305},{"id":198,"x":18.105279359442793,"y":79.37401322823342,"z":489872.78932684456},{"id":199,"x":36.17003862282411,"y":79.37401322823342,"z":491929.8165663255},{"id":200,"x":54.169560833364336,"y":79.37401322823342,"z":498537.98593257903},{"id":201,"x":72.10450713964065,"y":79.37401322823344,"z":507173.30165071186},{"id":202,"x":89.99999999999999,"y":88.73985585963032,"z":515497.98292829003},{"id":203,"x":72.10428093696275,"y":-100.62598677176659,"z":522141.9697657578}]},{"startSimulationTime":10,"startUtcTime":"2018-03-15T00:01:11.681","endSimulationTime":20,"endUtcTime":"2018-03-15T00:01:21.681","paths":[{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40186,"damagedPackets":0,"createdPackets":40243},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40844,"damagedPackets":0,"createdPackets":40882},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40518,"damagedPackets":0,"createdPackets":40657},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40502,"damagedPackets":0,"createdPackets":40538},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40844,"damagedPackets":0,"createdPackets":40882},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40518,"damagedPackets":0,"createdPackets":40657},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40390,"damagedPackets":0,"createdPackets":40469},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40502,"damagedPackets":0,"createdPackets":40538},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40367,"damagedPackets":0,"createdPackets":40457},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40367,"damagedPackets":0,"createdPackets":40457},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40502,"damagedPackets":0,"createdPackets":40538},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40390,"damagedPackets":0,"createdPackets":40469},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40186,"damagedPackets":0,"createdPackets":40243},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40390,"damagedPackets":0,"createdPackets":40469},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40367,"damagedPackets":0,"createdPackets":40457},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40518,"damagedPackets":0,"createdPackets":40657},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40186,"damagedPackets":0,"createdPackets":40243},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40844,"damagedPackets":0,"createdPackets":40882}],"satelliteData":[{"id":4,"x":45.81642033947562,"y":-82.6677675149984,"z":495056.056041769},{"id":5,"x":63.77926299830483,"y":-82.66776751499837,"z":503073.4906188554},{"id":6,"x":81.68781638697641,"y":-82.66776751499837,"z":511785.0637646521},{"id":7,"x":80.42326025388137,"y":97.33223248500158,"z":519298.3092323224},{"id":8,"x":62.51232318862457,"y":97.3322324850016,"z":524933.867541705},{"id":9,"x":44.546057074332815,"y":97.3322324850016,"z":529271.2912495129},{"id":10,"x":26.511942356505816,"y":97.33223248500161,"z":533677.7605056221},{"id":11,"x":8.423384943516934,"y":97.33223248500161,"z":539500.213473817},{"id":12,"x":-9.685075028293637,"y":97.33223248500161,"z":547243.1672461963},{"id":13,"x":-27.771252396632534,"y":97.33223248500161,"z":556091.7689127809},{"id":14,"x":-45.80201502555194,"y":97.3322324850016,"z":564014.0193434928},{"id":15,"x":-63.76598492899781,"y":97.33223248500163,"z":568422.3778719878},{"id":16,"x":-81.67729180395207,"y":97.33223248500163,"z":567128.8646071563},{"id":17,"x":-80.43024988039805,"y":-82.66776751499842,"z":559218.9295778263},{"id":18,"x":-62.51571365013837,"y":-82.66776751499842,"z":545522.2139588533},{"id":19,"x":-44.54600702590109,"y":-82.66776751499839,"z":528511.0402751893},{"id":20,"x":-26.508412489425147,"y":-82.6677675149984,"z":511643.3657551183},{"id":21,"x":-8.416167649970562,"y":-82.6677675149984,"z":498349.60903990286},{"id":22,"x":9.695878406267296,"y":-82.6677675149984,"z":491005.85135218047},{"id":23,"x":27.784731809504713,"y":-82.6677675149984,"z":490273.1998640234},{"id":24,"x":54.80612525992797,"y":-64.66776751499839,"z":498824.78614190675},{"id":25,"x":72.73850022978974,"y":-64.6677675149984,"z":507484.88773958525},{"id":26,"x":89.36788841179226,"y":115.33223248500146,"z":515765.6328510794},{"id":27,"x":71.47299285906459,"y":115.33223248500158,"z":522340.8275548894},{"id":28,"x":53.53748146386283,"y":115.33223248500161,"z":527189.3624347639},{"id":29,"x":35.537244832286,"y":115.33223248500161,"z":531370.7541395971},{"id":30,"x":17.47268049011014,"y":115.33223248500161,"z":536352.639863687},{"id":31,"x":-0.631012589296542,"y":115.33223248500161,"z":543149.7447533545},{"id":32,"x":-18.733416732463493,"y":115.33223248500161,"z":551633.1954852833},{"id":33,"x":-36.794875476837525,"y":115.33223248500161,"z":560328.0422487534},{"id":34,"x":-54.792038026957194,"y":115.33223248500161,"z":566815.1011276533},{"id":35,"x":-72.72644491099723,"y":115.33223248500161,"z":568583.4514711485},{"id":36,"x":-89.37668928494958,"y":-64.66776751499856,"z":563991.7433898938},{"id":37,"x":-71.47816388008714,"y":-64.66776751499842,"z":552972.6114711306},{"id":38,"x":-53.53913845431614,"y":-64.66776751499839,"z":537227.0582284516},{"id":39,"x":-35.53547747304271,"y":-64.6677675149984,"z":519831.285130615},{"id":40,"x":-17.46732779852156,"y":-64.66776751499839,"z":504366.15522233746},{"id":41,"x":0.6400780902342684,"y":-64.6677675149984,"z":493848.65555560135},{"id":42,"x":18.745731189816706,"y":-64.66776751499839,"z":489844.55537404853},{"id":43,"x":36.809073052974384,"y":-64.6677675149984,"z":492099.9700491766},{"id":44,"x":63.77926299830483,"y":-46.66776751499838,"z":503073.49061885354},{"id":45,"x":81.68781638697641,"y":-46.66776751499839,"z":511785.0637646514},{"id":46,"x":80.42326025388138,"y":133.33223248500158,"z":519298.30923232285},{"id":47,"x":62.51232318862457,"y":133.3322324850016,"z":524933.8675417051},{"id":48,"x":44.54605707433283,"y":133.3322324850016,"z":529271.2912495122},{"id":49,"x":26.511942356505816,"y":133.3322324850016,"z":533677.7605056221},{"id":50,"x":8.423384943516934,"y":133.3322324850016,"z":539500.213473817},{"id":51,"x":-9.685075028293634,"y":133.3322324850016,"z":547243.1672461983},{"id":52,"x":-27.771252396632516,"y":133.3322324850016,"z":556091.7689127845},{"id":53,"x":-45.80201502555194,"y":133.3322324850016,"z":564014.0193434928},{"id":54,"x":-63.76598492899784,"y":133.3322324850016,"z":568422.3778719875},{"id":55,"x":-81.67729180395204,"y":133.33223248500164,"z":567128.8646071543},{"id":56,"x":-80.43024988039805,"y":-46.66776751499841,"z":559218.9295778256},{"id":57,"x":-62.51571365013839,"y":-46.667767514998395,"z":545522.2139588525},{"id":58,"x":-44.5460070259011,"y":-46.6677675149984,"z":528511.0402751886},{"id":59,"x":-26.508412489425158,"y":-46.66776751499839,"z":511643.3657551176},{"id":60,"x":-8.416167649970562,"y":-46.667767514998395,"z":498349.60903990397},{"id":61,"x":9.695878406267296,"y":-46.66776751499839,"z":491005.85135218257},{"id":62,"x":27.784731809504706,"y":-46.667767514998395,"z":490273.1998640227},{"id":63,"x":45.8164203394756,"y":-46.667767514998395,"z":495056.056041769},{"id":64,"x":72.73850022978974,"y":-28.66776751499838,"z":507484.8877395868},{"id":65,"x":89.36788841179225,"y":151.3322324850012,"z":515765.6328510794},{"id":66,"x":71.47299285906458,"y":151.3322324850016,"z":522340.8275548905},{"id":67,"x":53.53748146386283,"y":151.3322324850016,"z":527189.3624347644},{"id":68,"x":35.537244832286,"y":151.3322324850016,"z":531370.7541395971},{"id":69,"x":17.47268049011014,"y":151.3322324850016,"z":536352.6398636857},{"id":70,"x":-0.6310125892965419,"y":151.3322324850016,"z":543149.7447533568},{"id":71,"x":-18.733416732463493,"y":151.3322324850016,"z":551633.1954852826},{"id":72,"x":-36.794875476837525,"y":151.3322324850016,"z":560328.0422487521},{"id":73,"x":-54.79203802695718,"y":151.3322324850016,"z":566815.1011276537},{"id":74,"x":-72.72644491099726,"y":151.33223248500164,"z":568583.451471151},{"id":75,"x":-89.3766892849496,"y":-28.6677675149988,"z":563991.7433898966},{"id":76,"x":-71.47816388008714,"y":-28.667767514998406,"z":552972.6114711304},{"id":77,"x":-53.539138454316124,"y":-28.667767514998403,"z":537227.0582284534},{"id":78,"x":-35.53547747304271,"y":-28.667767514998403,"z":519831.285130615},{"id":79,"x":-17.467327798521563,"y":-28.667767514998395,"z":504366.15522233583},{"id":80,"x":0.6400780902342682,"y":-28.66776751499839,"z":493848.6555556028},{"id":81,"x":18.74573118981671,"y":-28.667767514998395,"z":489844.5553740472},{"id":82,"x":36.809073052974384,"y":-28.667767514998403,"z":492099.9700491766},{"id":83,"x":54.80612525992794,"y":-28.66776751499838,"z":498824.786141907},{"id":84,"x":81.68781638697641,"y":-10.667767514998387,"z":511785.0637646521},{"id":85,"x":80.42326025388137,"y":169.3322324850016,"z":519298.3092323224},{"id":86,"x":62.51232318862457,"y":169.33223248500158,"z":524933.867541705},{"id":87,"x":44.54605707433283,"y":169.3322324850016,"z":529271.2912495122},{"id":88,"x":26.511942356505816,"y":169.3322324850016,"z":533677.7605056221},{"id":89,"x":8.423384943516934,"y":169.33223248500158,"z":539500.2134738194},{"id":90,"x":-9.685075028293637,"y":169.3322324850016,"z":547243.1672461963},{"id":91,"x":-27.771252396632534,"y":169.3322324850016,"z":556091.7689127799},{"id":92,"x":-45.80201502555194,"y":169.3322324850016,"z":564014.0193434928},{"id":93,"x":-63.76598492899784,"y":169.3322324850016,"z":568422.3778719875},{"id":94,"x":-81.67729180395207,"y":169.3322324850016,"z":567128.8646071559},{"id":95,"x":-80.43024988039805,"y":-10.667767514998406,"z":559218.9295778263},{"id":96,"x":-62.51571365013837,"y":-10.667767514998399,"z":545522.2139588533},{"id":97,"x":-44.5460070259011,"y":-10.667767514998394,"z":528511.0402751886},{"id":98,"x":-26.508412489425158,"y":-10.667767514998406,"z":511643.3657551176},{"id":99,"x":-8.416167649970562,"y":-10.667767514998392,"z":498349.6090399027},{"id":100,"x":9.695878406267296,"y":-10.6677675149984,"z":491005.85135218047},{"id":101,"x":27.78473180950472,"y":-10.66776751499839,"z":490273.19986402127},{"id":102,"x":45.8164203394756,"y":-10.667767514998394,"z":495056.05604176916},{"id":103,"x":63.779262998304766,"y":-10.667767514998383,"z":503073.4906188516},{"id":104,"x":89.36788841179225,"y":-172.66776751499873,"z":515765.6328510794},{"id":105,"x":71.47299285906458,"y":-172.66776751499842,"z":522340.8275548905},{"id":106,"x":53.53748146386283,"y":-172.66776751499842,"z":527189.3624347649},{"id":107,"x":35.537244832286,"y":-172.66776751499842,"z":531370.7541395971},{"id":108,"x":17.47268049011014,"y":-172.6677675149984,"z":536352.6398636857},{"id":109,"x":-0.631012589296542,"y":-172.66776751499842,"z":543149.7447533545},{"id":110,"x":-18.733416732463493,"y":-172.66776751499842,"z":551633.1954852826},{"id":111,"x":-36.794875476837525,"y":-172.6677675149984,"z":560328.0422487534},{"id":112,"x":-54.792038026957194,"y":-172.6677675149984,"z":566815.1011276537},{"id":113,"x":-72.72644491099726,"y":-172.6677675149984,"z":568583.451471151},{"id":114,"x":-89.37668928494958,"y":7.332232485001277,"z":563991.7433898938},{"id":115,"x":-71.47816388008714,"y":7.332232485001587,"z":552972.6114711312},{"id":116,"x":-53.53913845431614,"y":7.33223248500159,"z":537227.0582284516},{"id":117,"x":-35.535477473042725,"y":7.332232485001614,"z":519831.28513061337},{"id":118,"x":-17.467327798521563,"y":7.332232485001606,"z":504366.15522233583},{"id":119,"x":0.6400780902342684,"y":7.332232485001598,"z":493848.65555560135},{"id":120,"x":18.74573118981671,"y":7.3322324850016045,"z":489844.5553740472},{"id":121,"x":36.80907305297438,"y":7.332232485001603,"z":492099.970049176},{"id":122,"x":54.80612525992793,"y":7.332232485001602,"z":498824.7861419069},{"id":123,"x":72.73850022978971,"y":7.3322324850016205,"z":507484.88773958286},{"id":124,"x":80.42326025388137,"y":-154.66776751499842,"z":519298.3092323224},{"id":125,"x":62.51232318862457,"y":-154.66776751499842,"z":524933.8675417047},{"id":126,"x":44.54605707433282,"y":-154.66776751499842,"z":529271.2912495112},{"id":127,"x":26.511942356505816,"y":-154.66776751499842,"z":533677.7605056221},{"id":128,"x":8.423384943516934,"y":-154.66776751499842,"z":539500.2134738194},{"id":129,"x":-9.685075028293637,"y":-154.66776751499842,"z":547243.1672461963},{"id":130,"x":-27.771252396632534,"y":-154.66776751499842,"z":556091.7689127809},{"id":131,"x":-45.80201502555194,"y":-154.66776751499842,"z":564014.0193434928},{"id":132,"x":-63.76598492899784,"y":-154.66776751499842,"z":568422.3778719875},{"id":133,"x":-81.67729180395207,"y":-154.6677675149984,"z":567128.8646071559},{"id":134,"x":-80.43024988039805,"y":25.332232485001587,"z":559218.9295778263},{"id":135,"x":-62.51571365013839,"y":25.332232485001608,"z":545522.213958853},{"id":136,"x":-44.5460070259011,"y":25.332232485001608,"z":528511.0402751886},{"id":137,"x":-26.508412489425158,"y":25.33223248500159,"z":511643.3657551176},{"id":138,"x":-8.416167649970564,"y":25.332232485001605,"z":498349.60903990024},{"id":139,"x":9.695878406267296,"y":25.33223248500159,"z":491005.85135218047},{"id":140,"x":27.784731809504713,"y":25.332232485001608,"z":490273.1998640234},{"id":141,"x":45.8164203394756,"y":25.332232485001615,"z":495056.05604176916},{"id":142,"x":63.779262998304766,"y":25.332232485001615,"z":503073.4906188516},{"id":143,"x":81.68781638697635,"y":25.33223248500162,"z":511785.06376465183},{"id":144,"x":71.47299285906459,"y":-136.66776751499842,"z":522340.8275548894},{"id":145,"x":53.53748146386284,"y":-136.66776751499842,"z":527189.362434764},{"id":146,"x":35.537244832286,"y":-136.66776751499842,"z":531370.7541395957},{"id":147,"x":17.47268049011014,"y":-136.66776751499842,"z":536352.639863687},{"id":148,"x":-0.631012589296542,"y":-136.6677675149984,"z":543149.7447533545},{"id":149,"x":-18.733416732463493,"y":-136.66776751499842,"z":551633.1954852833},{"id":150,"x":-36.794875476837525,"y":-136.6677675149984,"z":560328.0422487534},{"id":151,"x":-54.79203802695718,"y":-136.6677675149984,"z":566815.1011276537},{"id":152,"x":-72.72644491099726,"y":-136.6677675149984,"z":568583.4514711507},{"id":153,"x":-89.37668928494958,"y":43.33223248500118,"z":563991.7433898938},{"id":154,"x":-71.47816388008714,"y":43.33223248500158,"z":552972.6114711306},{"id":155,"x":-53.53913845431614,"y":43.3322324850016,"z":537227.0582284516},{"id":156,"x":-35.53547747304271,"y":43.3322324850016,"z":519831.285130615},{"id":157,"x":-17.467327798521563,"y":43.3322324850016,"z":504366.15522233583},{"id":158,"x":0.6400780902342684,"y":43.3322324850016,"z":493848.65555560135},{"id":159,"x":18.745731189816706,"y":43.33223248500161,"z":489844.55537404853},{"id":160,"x":36.809073052974384,"y":43.332232485001605,"z":492099.9700491766},{"id":161,"x":54.80612525992793,"y":43.33223248500161,"z":498824.7861419069},{"id":162,"x":72.73850022978971,"y":43.33223248500161,"z":507484.88773958414},{"id":163,"x":89.36788841179226,"y":-136.66776751499881,"z":515765.6328510794},{"id":164,"x":62.51232318862457,"y":-118.66776751499842,"z":524933.867541705},{"id":165,"x":44.546057074332815,"y":-118.66776751499842,"z":529271.2912495129},{"id":166,"x":26.511942356505816,"y":-118.66776751499842,"z":533677.7605056221},{"id":167,"x":8.423384943516934,"y":-118.66776751499842,"z":539500.213473817},{"id":168,"x":-9.685075028293639,"y":-118.66776751499842,"z":547243.1672461956},{"id":169,"x":-27.771252396632534,"y":-118.66776751499842,"z":556091.7689127809},{"id":170,"x":-45.80201502555194,"y":-118.66776751499842,"z":564014.0193434928},{"id":171,"x":-63.76598492899784,"y":-118.66776751499839,"z":568422.3778719875},{"id":172,"x":-81.67729180395207,"y":-118.66776751499839,"z":567128.8646071564},{"id":173,"x":-80.43024988039805,"y":61.33223248500157,"z":559218.9295778259},{"id":174,"x":-62.51571365013839,"y":61.33223248500158,"z":545522.213958853},{"id":175,"x":-44.546007025901105,"y":61.3322324850016,"z":528511.0402751886},{"id":176,"x":-26.508412489425158,"y":61.3322324850016,"z":511643.3657551176},{"id":177,"x":-8.416167649970562,"y":61.3322324850016,"z":498349.6090399027},{"id":178,"x":9.695878406267296,"y":61.3322324850016,"z":491005.85135218047},{"id":179,"x":27.784731809504713,"y":61.3322324850016,"z":490273.1998640212},{"id":180,"x":45.8164203394756,"y":61.3322324850016,"z":495056.0560417682},{"id":181,"x":63.77926299830479,"y":61.33223248500161,"z":503073.4906188511},{"id":182,"x":81.68781638697637,"y":61.332232485001626,"z":511785.06376465317},{"id":183,"x":80.4232602538814,"y":-118.66776751499843,"z":519298.30923232244},{"id":184,"x":53.53748146386283,"y":-100.6677675149984,"z":527189.3624347644},{"id":185,"x":35.53724483228599,"y":-100.6677675149984,"z":531370.7541395976},{"id":186,"x":17.472680490110132,"y":-100.6677675149984,"z":536352.6398636877},{"id":187,"x":-0.6310125892965419,"y":-100.6677675149984,"z":543149.7447533539},{"id":188,"x":-18.733416732463493,"y":-100.6677675149984,"z":551633.1954852826},{"id":189,"x":-36.794875476837525,"y":-100.66776751499839,"z":560328.0422487534},{"id":190,"x":-54.792038026957194,"y":-100.6677675149984,"z":566815.1011276533},{"id":191,"x":-72.72644491099726,"y":-100.6677675149984,"z":568583.451471151},{"id":192,"x":-89.37668928494958,"y":79.33223248500137,"z":563991.743389894},{"id":193,"x":-71.47816388008714,"y":79.3322324850016,"z":552972.6114711312},{"id":194,"x":-53.53913845431614,"y":79.3322324850016,"z":537227.0582284516},{"id":195,"x":-35.53547747304277,"y":79.3322324850016,"z":519831.2851306155},{"id":196,"x":-17.46732779852156,"y":79.3322324850016,"z":504366.15522233746},{"id":197,"x":0.6400780902342686,"y":79.33223248500161,"z":493848.6555555996},{"id":198,"x":18.745731189816706,"y":79.3322324850016,"z":489844.55537404853},{"id":199,"x":36.80907305297438,"y":79.3322324850016,"z":492099.970049176},{"id":200,"x":54.80612525992793,"y":79.3322324850016,"z":498824.786141906},{"id":201,"x":72.73850022978971,"y":79.33223248500161,"z":507484.88773958286},{"id":202,"x":89.36788841179225,"y":-100.66776751499862,"z":515765.63285108015},{"id":203,"x":71.47299285906462,"y":-100.6677675149984,"z":522340.8275548918}]},{"startSimulationTime":20,"startUtcTime":"2018-03-15T00:01:21.681","endSimulationTime":30,"endUtcTime":"2018-03-15T00:01:31.681","paths":[{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40260,"damagedPackets":0,"createdPackets":40317},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40475,"damagedPackets":0,"createdPackets":40493},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41085,"damagedPackets":0,"createdPackets":41065},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40869,"damagedPackets":0,"createdPackets":40972},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40475,"damagedPackets":0,"createdPackets":40493},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41085,"damagedPackets":0,"createdPackets":41065},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40285,"damagedPackets":0,"createdPackets":40327},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40869,"damagedPackets":0,"createdPackets":40972},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40691,"damagedPackets":0,"createdPackets":40621},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40691,"damagedPackets":0,"createdPackets":40621},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40869,"damagedPackets":0,"createdPackets":40972},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40285,"damagedPackets":0,"createdPackets":40327},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40260,"damagedPackets":0,"createdPackets":40317},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40285,"damagedPackets":0,"createdPackets":40327},{"packetSenderID":6,"stationIDs":[2,51,50,26,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40691,"damagedPackets":0,"createdPackets":40621},{"packetSenderID":4,"stationIDs":[1,26,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41085,"damagedPackets":0,"createdPackets":41065},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40260,"damagedPackets":0,"createdPackets":40317},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40475,"damagedPackets":0,"createdPackets":40493}],"satelliteData":[{"id":4,"x":46.45420287916494,"y":-82.70954825823023,"z":495300.3257220676},{"id":5,"x":64.41440529599282,"y":-82.70954825823021,"z":503384.1885987981},{"id":6,"x":82.32068113769488,"y":-82.70954825823021,"z":512079.1556017124},{"id":7,"x":79.79172363729371,"y":97.29045174176976,"z":519529.1273034344},{"id":8,"x":61.88107171708033,"y":97.29045174176976,"z":525102.0050207383},{"id":9,"x":43.91443727986488,"y":97.29045174176977,"z":529415.7622881951},{"id":10,"x":25.879991854265377,"y":97.29045174176977,"z":533851.3400166061},{"id":11,"x":7.79182642620316,"y":97.29045174176977,"z":539738.6966818706},{"id":12,"x":-10.315168196444027,"y":97.29045174176979,"z":547541.3634895262},{"id":13,"x":-28.39898844831753,"y":97.29045174176979,"z":556397.0670088186},{"id":14,"x":-46.427174871470925,"y":97.29045174176977,"z":564241.0145205926},{"id":15,"x":-64.38925501945053,"y":97.29045174176977,"z":568482.8149860428},{"id":16,"x":-82.30015473050437,"y":97.2904517417698,"z":566965.0723788615},{"id":17,"x":-79.80591095377643,"y":-82.70954825823024,"z":558828.3957631472},{"id":18,"x":-61.8881631442996,"y":-82.70954825823024,"z":544964.7029989554},{"id":19,"x":-43.91419786796638,"y":-82.70954825823023,"z":527895.3008152214},{"id":20,"x":-25.872351063748503,"y":-82.70954825823024,"z":511096.7160395467},{"id":21,"x":-7.776951971202961,"y":-82.70954825823024,"z":497979.8156340523},{"id":22,"x":10.336406518397595,"y":-82.70954825823024,"z":490868.8632835639},{"id":23,"x":28.4246099264513,"y":-82.70954825823023,"z":490359.3899914811},{"id":24,"x":55.44259476841274,"y":-64.70954825823024,"z":499113.98565507086},{"id":25,"x":73.37241132793389,"y":-64.70954825823023,"z":507795.87293106766},{"id":26,"x":88.73582458426814,"y":115.2904517417697,"z":516030.9885833862},{"id":27,"x":70.8417148147573,"y":115.29045174176976,"z":522537.4022662231},{"id":28,"x":52.90608821943197,"y":115.29045174176976,"z":527339.2213372365},{"id":29,"x":34.90540792500195,"y":115.29045174176976,"z":531523.5380414816},{"id":30,"x":16.840802558698112,"y":115.29045174176976,"z":536556.3619518632},{"id":31,"x":-1.2619745204043802,"y":115.29045174176979,"z":543421.7994625191},{"id":32,"x":-19.36241005907742,"y":115.29045174176979,"z":551944.1395491887},{"id":33,"x":-37.421295679490896,"y":115.29045174176979,"z":560605.8502852042},{"id":34,"x":-55.41611097244434,"y":115.29045174176976,"z":566968.6717748556},{"id":35,"x":-73.34928925276357,"y":115.29045174176979,"z":568535.9359668511},{"id":36,"x":-88.75332810340112,"y":-64.70954825823031,"z":563710.9292620901},{"id":37,"x":-70.85240452688844,"y":-64.70954825823023,"z":552487.5131497494},{"id":38,"x":-52.90952900595467,"y":-64.70954825823024,"z":536624.8159077008},{"id":39,"x":-34.90146945833841,"y":-64.70954825823023,"z":519234.5018563374},{"id":40,"x":-16.8294931195893,"y":-64.70954825823024,"z":503897.1118304375},{"id":41,"x":1.2802040141793631,"y":-64.70954825823024,"z":493592.3259764399},{"id":42,"x":19.38616034546325,"y":-64.70954825823024,"z":489824.333222371},{"id":43,"x":37.448032484347095,"y":-64.70954825823024,"z":492275.81913315965},{"id":44,"x":64.41440529599281,"y":-46.70954825823022,"z":503384.18859879853},{"id":45,"x":82.32068113769488,"y":-46.70954825823021,"z":512079.1556017117},{"id":46,"x":79.79172363729371,"y":133.29045174176974,"z":519529.1273034344},{"id":47,"x":61.88107171708033,"y":133.29045174176974,"z":525102.0050207389},{"id":48,"x":43.91443727986489,"y":133.29045174176977,"z":529415.7622881962},{"id":49,"x":25.879991854265377,"y":133.29045174176977,"z":533851.3400166061},{"id":50,"x":7.79182642620316,"y":133.29045174176977,"z":539738.6966818697},{"id":51,"x":-10.315168196444025,"y":133.29045174176977,"z":547541.3634895281},{"id":52,"x":-28.398988448317528,"y":133.29045174176977,"z":556397.0670088206},{"id":53,"x":-46.42717487147092,"y":133.29045174176977,"z":564241.014520591},{"id":54,"x":-64.38925501945056,"y":133.29045174176977,"z":568482.8149860423},{"id":55,"x":-82.30015473050435,"y":133.29045174176977,"z":566965.0723788592},{"id":56,"x":-79.80591095377643,"y":-46.70954825823026,"z":558828.3957631487},{"id":57,"x":-61.8881631442996,"y":-46.70954825823024,"z":544964.7029989565},{"id":58,"x":-43.91419786796638,"y":-46.70954825823024,"z":527895.3008152214},{"id":59,"x":-25.872351063748507,"y":-46.70954825823025,"z":511096.7160395449},{"id":60,"x":-7.776951971202961,"y":-46.709548258230235,"z":497979.8156340526},{"id":61,"x":10.336406518397597,"y":-46.70954825823024,"z":490868.8632835613},{"id":62,"x":28.424609926451296,"y":-46.709548258230235,"z":490359.38999147975},{"id":63,"x":46.454202879164924,"y":-46.70954825823022,"z":495300.3257220677},{"id":64,"x":73.37241132793389,"y":-28.709548258230214,"z":507795.8729310661},{"id":65,"x":88.73582458426814,"y":151.29045174176957,"z":516030.98858338804},{"id":66,"x":70.8417148147573,"y":151.29045174176974,"z":522537.4022662236},{"id":67,"x":52.906088219431965,"y":151.29045174176974,"z":527339.2213372391},{"id":68,"x":34.90540792500195,"y":151.29045174176977,"z":531523.5380414816},{"id":69,"x":16.84080255869811,"y":151.29045174176977,"z":536556.3619518626},{"id":70,"x":-1.26197452040438,"y":151.29045174176977,"z":543421.7994625219},{"id":71,"x":-19.362410059077416,"y":151.29045174176977,"z":551944.1395491888},{"id":72,"x":-37.42129567949089,"y":151.29045174176977,"z":560605.8502852028},{"id":73,"x":-55.41611097244436,"y":151.29045174176977,"z":566968.671774853},{"id":74,"x":-73.3492892527636,"y":151.29045174176977,"z":568535.9359668493},{"id":75,"x":-88.75332810340115,"y":-28.709548258230427,"z":563710.9292620909},{"id":76,"x":-70.85240452688844,"y":-28.709548258230242,"z":552487.5131497497},{"id":77,"x":-52.90952900595465,"y":-28.709548258230235,"z":536624.8159077027},{"id":78,"x":-34.90146945833841,"y":-28.709548258230228,"z":519234.50185633753},{"id":79,"x":-16.829493119589294,"y":-28.70954825823022,"z":503897.1118304409},{"id":80,"x":1.2802040141793631,"y":-28.709548258230235,"z":493592.3259764399},{"id":81,"x":19.38616034546325,"y":-28.709548258230228,"z":489824.333222371},{"id":82,"x":37.448032484347095,"y":-28.709548258230228,"z":492275.81913315965},{"id":83,"x":55.442594768412725,"y":-28.70954825823022,"z":499113.985655069},{"id":84,"x":82.32068113769488,"y":-10.709548258230217,"z":512079.15560171136},{"id":85,"x":79.79172363729371,"y":169.29045174176974,"z":519529.1273034344},{"id":86,"x":61.88107171708033,"y":169.29045174176977,"z":525102.0050207383},{"id":87,"x":43.91443727986489,"y":169.29045174176977,"z":529415.7622881962},{"id":88,"x":25.879991854265377,"y":169.29045174176977,"z":533851.340016605},{"id":89,"x":7.79182642620316,"y":169.29045174176977,"z":539738.6966818697},{"id":90,"x":-10.315168196444027,"y":169.29045174176974,"z":547541.3634895255},{"id":91,"x":-28.398988448317528,"y":169.29045174176977,"z":556397.0670088206},{"id":92,"x":-46.427174871470925,"y":169.29045174176977,"z":564241.0145205926},{"id":93,"x":-64.38925501945056,"y":169.29045174176974,"z":568482.8149860423},{"id":94,"x":-82.30015473050437,"y":169.2904517417698,"z":566965.0723788615},{"id":95,"x":-79.80591095377643,"y":-10.709548258230244,"z":558828.3957631476},{"id":96,"x":-61.88816314429958,"y":-10.709548258230233,"z":544964.7029989553},{"id":97,"x":-43.91419786796638,"y":-10.709548258230237,"z":527895.3008152214},{"id":98,"x":-25.872351063748507,"y":-10.709548258230235,"z":511096.7160395449},{"id":99,"x":-7.776951971202961,"y":-10.709548258230237,"z":497979.8156340526},{"id":100,"x":10.336406518397597,"y":-10.709548258230232,"z":490868.86328356364},{"id":101,"x":28.424609926451296,"y":-10.709548258230226,"z":490359.38999147975},{"id":102,"x":46.454202879164924,"y":-10.709548258230233,"z":495300.3257220677},{"id":103,"x":64.41440529599272,"y":-10.709548258230237,"z":503384.1885987957},{"id":104,"x":88.73582458426814,"y":-172.7095482582304,"z":516030.9885833862},{"id":105,"x":70.8417148147573,"y":-172.70954825823023,"z":522537.4022662223},{"id":106,"x":52.906088219431965,"y":-172.70954825823023,"z":527339.2213372391},{"id":107,"x":34.90540792500196,"y":-172.70954825823023,"z":531523.5380414792},{"id":108,"x":16.840802558698112,"y":-172.70954825823023,"z":536556.3619518632},{"id":109,"x":-1.2619745204043802,"y":-172.70954825823023,"z":543421.799462521},{"id":110,"x":-19.36241005907742,"y":-172.70954825823023,"z":551944.1395491887},{"id":111,"x":-37.421295679490896,"y":-172.70954825823023,"z":560605.8502852042},{"id":112,"x":-55.41611097244435,"y":-172.70954825823023,"z":566968.6717748544},{"id":113,"x":-73.3492892527636,"y":-172.70954825823023,"z":568535.9359668493},{"id":114,"x":-88.75332810340112,"y":7.290451741769607,"z":563710.9292620887},{"id":115,"x":-70.85240452688855,"y":7.290451741769757,"z":552487.5131497505},{"id":116,"x":-52.90952900595466,"y":7.290451741769759,"z":536624.8159077015},{"id":117,"x":-34.90146945833841,"y":7.290451741769775,"z":519234.5018563374},{"id":118,"x":-16.8294931195893,"y":7.290451741769769,"z":503897.1118304375},{"id":119,"x":1.2802040141793631,"y":7.290451741769775,"z":493592.3259764396},{"id":120,"x":19.386160345463246,"y":7.290451741769765,"z":489824.3332223722},{"id":121,"x":37.448032484347095,"y":7.290451741769771,"z":492275.81913315965},{"id":122,"x":55.442594768412725,"y":7.290451741769775,"z":499113.985655069},{"id":123,"x":73.37241132793389,"y":7.29045174176979,"z":507795.8729310669},{"id":124,"x":79.79172363729371,"y":-154.70954825823023,"z":519529.1273034347},{"id":125,"x":61.88107171708033,"y":-154.70954825823023,"z":525102.0050207383},{"id":126,"x":43.91443727986489,"y":-154.70954825823023,"z":529415.7622881962},{"id":127,"x":25.879991854265377,"y":-154.70954825823023,"z":533851.3400166061},{"id":128,"x":7.79182642620316,"y":-154.70954825823023,"z":539738.6966818706},{"id":129,"x":-10.315168196444027,"y":-154.70954825823026,"z":547541.3634895255},{"id":130,"x":-28.39898844831753,"y":-154.70954825823023,"z":556397.0670088186},{"id":131,"x":-46.42717487147092,"y":-154.70954825823023,"z":564241.014520591},{"id":132,"x":-64.38925501945056,"y":-154.70954825823023,"z":568482.8149860444},{"id":133,"x":-82.30015473050437,"y":-154.70954825823023,"z":566965.072378862},{"id":134,"x":-79.80591095377643,"y":25.290451741769747,"z":558828.3957631493},{"id":135,"x":-61.88816314429958,"y":25.290451741769772,"z":544964.7029989553},{"id":136,"x":-43.91419786796638,"y":25.290451741769775,"z":527895.3008152214},{"id":137,"x":-25.872351063748503,"y":25.29045174176977,"z":511096.7160395467},{"id":138,"x":-7.776951971202962,"y":25.29045174176976,"z":497979.81563405076},{"id":139,"x":10.336406518397597,"y":25.29045174176977,"z":490868.86328356364},{"id":140,"x":28.424609926451296,"y":25.29045174176977,"z":490359.38999147975},{"id":141,"x":46.454202879164924,"y":25.29045174176977,"z":495300.3257220677},{"id":142,"x":64.41440529599272,"y":25.290451741769765,"z":503384.1885987957},{"id":143,"x":82.32068113769483,"y":25.290451741769775,"z":512079.1556017138},{"id":144,"x":70.8417148147573,"y":-136.70954825823023,"z":522537.40226622234},{"id":145,"x":52.90608821943197,"y":-136.70954825823023,"z":527339.2213372372},{"id":146,"x":34.90540792500196,"y":-136.70954825823023,"z":531523.5380414808},{"id":147,"x":16.840802558698115,"y":-136.70954825823026,"z":536556.3619518619},{"id":148,"x":-1.2619745204043804,"y":-136.70954825823023,"z":543421.7994625204},{"id":149,"x":-19.36241005907742,"y":-136.70954825823023,"z":551944.1395491887},{"id":150,"x":-37.421295679490896,"y":-136.70954825823023,"z":560605.8502852042},{"id":151,"x":-55.41611097244434,"y":-136.7095482582302,"z":566968.6717748556},{"id":152,"x":-73.3492892527636,"y":-136.7095482582302,"z":568535.93596685},{"id":153,"x":-88.75332810340112,"y":43.290451741769544,"z":563710.9292620904},{"id":154,"x":-70.85240452688844,"y":43.29045174176975,"z":552487.513149749},{"id":155,"x":-52.90952900595472,"y":43.29045174176977,"z":536624.8159077014},{"id":156,"x":-34.90146945833841,"y":43.29045174176976,"z":519234.5018563374},{"id":157,"x":-16.8294931195893,"y":43.29045174176975,"z":503897.1118304368},{"id":158,"x":1.2802040141793631,"y":43.29045174176977,"z":493592.3259764399},{"id":159,"x":19.38616034546325,"y":43.29045174176977,"z":489824.333222371},{"id":160,"x":37.448032484347095,"y":43.290451741769765,"z":492275.81913315965},{"id":161,"x":55.442594768412725,"y":43.290451741769765,"z":499113.98565507017},{"id":162,"x":73.37241132793389,"y":43.290451741769786,"z":507795.8729310661},{"id":163,"x":88.73582458426816,"y":-136.70954825823046,"z":516030.9885833865},{"id":164,"x":61.88107171708033,"y":-118.70954825823024,"z":525102.0050207389},{"id":165,"x":43.91443727986489,"y":-118.70954825823027,"z":529415.7622881962},{"id":166,"x":25.879991854265366,"y":-118.70954825823024,"z":533851.3400166089},{"id":167,"x":7.79182642620316,"y":-118.70954825823024,"z":539738.6966818697},{"id":168,"x":-10.315168196444027,"y":-118.70954825823024,"z":547541.3634895262},{"id":169,"x":-28.398988448317546,"y":-118.70954825823024,"z":556397.0670088183},{"id":170,"x":-46.427174871470925,"y":-118.70954825823024,"z":564241.0145205926},{"id":171,"x":-64.38925501945056,"y":-118.70954825823024,"z":568482.8149860433},{"id":172,"x":-82.30015473050437,"y":-118.70954825823021,"z":566965.0723788611},{"id":173,"x":-79.80591095377643,"y":61.29045174176973,"z":558828.3957631493},{"id":174,"x":-61.8881631442996,"y":61.29045174176974,"z":544964.7029989554},{"id":175,"x":-43.91419786796638,"y":61.29045174176974,"z":527895.3008152214},{"id":176,"x":-25.872351063748507,"y":61.29045174176976,"z":511096.7160395449},{"id":177,"x":-7.776951971202961,"y":61.29045174176977,"z":497979.8156340523},{"id":178,"x":10.336406518397595,"y":61.29045174176976,"z":490868.8632835639},{"id":179,"x":28.424609926451296,"y":61.29045174176976,"z":490359.38999147975},{"id":180,"x":46.45420287916494,"y":61.29045174176976,"z":495300.3257220646},{"id":181,"x":64.41440529599272,"y":61.29045174176977,"z":503384.1885987973},{"id":182,"x":82.32068113769483,"y":61.29045174176979,"z":512079.1556017129},{"id":183,"x":79.79172363729373,"y":-118.70954825823027,"z":519529.1273034345},{"id":184,"x":52.906088219431965,"y":-100.70954825823024,"z":527339.2213372391},{"id":185,"x":34.90540792500195,"y":-100.70954825823024,"z":531523.5380414816},{"id":186,"x":16.8408025586981,"y":-100.70954825823024,"z":536556.3619518655},{"id":187,"x":-1.2619745204043804,"y":-100.70954825823024,"z":543421.7994625204},{"id":188,"x":-19.36241005907742,"y":-100.70954825823024,"z":551944.1395491887},{"id":189,"x":-37.42129567949089,"y":-100.70954825823023,"z":560605.8502852028},{"id":190,"x":-55.41611097244436,"y":-100.70954825823024,"z":566968.671774853},{"id":191,"x":-73.3492892527636,"y":-100.70954825823023,"z":568535.9359668484},{"id":192,"x":-88.75332810340112,"y":79.29045174176966,"z":563710.9292620907},{"id":193,"x":-70.85240452688844,"y":79.29045174176977,"z":552487.5131497494},{"id":194,"x":-52.90952900595465,"y":79.29045174176977,"z":536624.8159077023},{"id":195,"x":-34.90146945833846,"y":79.29045174176977,"z":519234.50185633806},{"id":196,"x":-16.8294931195893,"y":79.29045174176977,"z":503897.1118304368},{"id":197,"x":1.2802040141793631,"y":79.29045174176976,"z":493592.3259764399},{"id":198,"x":19.386160345463246,"y":79.29045174176977,"z":489824.3332223722},{"id":199,"x":37.448032484347095,"y":79.29045174176977,"z":492275.81913315965},{"id":200,"x":55.442594768412725,"y":79.29045174176977,"z":499113.98565507017},{"id":201,"x":73.37241132793389,"y":79.29045174176977,"z":507795.8729310666},{"id":202,"x":88.73582458426814,"y":-100.70954825823034,"z":516030.98858338606},{"id":203,"x":70.84171481475735,"y":-100.70954825823026,"z":522537.40226622275}]},{"startSimulationTime":30,"startUtcTime":"2018-03-15T00:01:31.681","endSimulationTime":40,"endUtcTime":"2018-03-15T00:01:41.681","paths":[{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40695,"damagedPackets":0,"createdPackets":40754},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40473,"damagedPackets":0,"createdPackets":40455},{"packetSenderID":4,"stationIDs":[1,182,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40602},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40112,"damagedPackets":0,"createdPackets":40097},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40473,"damagedPackets":0,"createdPackets":40455},{"packetSenderID":4,"stationIDs":[1,182,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40602},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40665,"damagedPackets":0,"createdPackets":40583},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40112,"damagedPackets":0,"createdPackets":40097},{"packetSenderID":6,"stationIDs":[2,51,50,182,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40372,"damagedPackets":0,"createdPackets":40390},{"packetSenderID":6,"stationIDs":[2,51,50,182,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40372,"damagedPackets":0,"createdPackets":40390},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40112,"damagedPackets":0,"createdPackets":40097},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40665,"damagedPackets":0,"createdPackets":40583},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40695,"damagedPackets":0,"createdPackets":40754},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40665,"damagedPackets":0,"createdPackets":40583},{"packetSenderID":6,"stationIDs":[2,51,50,182,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40372,"damagedPackets":0,"createdPackets":40390},{"packetSenderID":4,"stationIDs":[1,182,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40602},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40695,"damagedPackets":0,"createdPackets":40754},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40473,"damagedPackets":0,"createdPackets":40455}],"satelliteData":[{"id":4,"x":47.09189536862929,"y":-82.75132900187893,"z":495548.56592585746},{"id":5,"x":65.04945602404678,"y":-82.75132900187893,"z":503695.5669337634},{"id":6,"x":82.95348063988527,"y":-82.75132900187891,"z":512371.53539267473},{"id":7,"x":79.16021382663692,"y":97.24867099812106,"z":519757.44928693946},{"id":8,"x":61.24981489110947,"y":97.24867099812106,"z":525268.4815471189},{"id":9,"x":43.28280081986184,"y":97.24867099812107,"z":529560.3724841874},{"id":10,"x":25.248039523039914,"y":97.24867099812107,"z":534026.7711018872},{"id":11,"x":7.160300388663832,"y":97.24867099812106,"z":539979.6319430085},{"id":12,"x":-10.945191606222659,"y":97.24867099812107,"z":547840.9454112275},{"id":13,"x":-29.026633672448693,"y":97.24867099812106,"z":556701.1894347639},{"id":14,"x":-47.05225225410867,"y":97.24867099812107,"z":564463.6177258892},{"id":15,"x":-65.01248238333405,"y":97.24867099812109,"z":568536.1601854915},{"id":16,"x":-82.92303660763177,"y":97.2486709981211,"z":566793.0661475477},{"id":17,"x":-79.18148664741834,"y":-82.75132900187893,"z":558430.685213476},{"id":18,"x":-61.26047593872138,"y":-82.75132900187893,"z":544403.1084801828},{"id":19,"x":-43.28223266683753,"y":-82.75132900187893,"z":527279.8335681476},{"id":20,"x":-25.23615417148448,"y":-82.75132900187893,"z":510554.687845931},{"id":21,"x":-7.137655908915721,"y":-82.75132900187893,"z":497617.66009459173},{"id":22,"x":10.976943755005344,"y":-82.75132900187893,"z":490740.31785309874},{"id":23,"x":29.064433885264503,"y":-82.75132900187893,"z":490452.54828538356},{"id":24,"x":56.07896929426134,"y":-64.75132900187894,"z":499405.4658254376},{"id":25,"x":74.00624137680512,"y":-64.75132900187893,"z":508106.17057706794},{"id":26,"x":88.10380713258253,"y":115.24867099812103,"z":516294.02130501554},{"id":27,"x":70.21044563883741,"y":115.24867099812107,"z":522731.7234625079},{"id":28,"x":52.27468075988794,"y":115.24867099812107,"z":527488.2596583414},{"id":29,"x":34.273558635873975,"y":115.24867099812107,"z":531677.3985219654},{"id":30,"x":16.208938383954703,"y":115.24867099812104,"z":536762.4249142436},{"id":31,"x":-1.8928844609296203,"y":115.24867099812107,"z":543695.9886545881},{"id":32,"x":-19.99132001252058,"y":115.24867099812107,"z":552255.3357120012},{"id":33,"x":-38.047625146444176,"y":115.24867099812107,"z":560880.8857682821},{"id":34,"x":-56.040117755207106,"y":115.24867099812107,"z":567116.3620078898},{"id":35,"x":-73.97211991268418,"y":115.24867099812107,"z":568480.5193528627},{"id":36,"x":-88.12991410820426,"y":-64.751329001879,"z":563422.1391705457},{"id":37,"x":-70.22653105087109,"y":-64.75132900187894,"z":551996.5625124555},{"id":38,"x":-52.27976841669496,"y":-64.75132900187893,"z":536020.5823006738},{"id":39,"x":-34.267310696813446,"y":-64.75132900187894,"z":518640.2537903997},{"id":40,"x":-16.19154709763069,"y":-64.75132900187894,"z":503434.43575419247},{"id":41,"x":1.920375219141871,"y":-64.75132900187894,"z":493344.3384948798},{"id":42,"x":20.02656454384983,"y":-64.75132900187894,"z":489812.07078475965},{"id":43,"x":38.08691561339476,"y":-64.75132900187893,"z":492457.25629306375},{"id":44,"x":65.04945602404678,"y":-46.751329001878936,"z":503695.56693376164},{"id":45,"x":82.95348063988527,"y":-46.751329001878915,"z":512371.5353926766},{"id":46,"x":79.16021382663692,"y":133.24867099812107,"z":519757.4492869399},{"id":47,"x":61.24981489110947,"y":133.24867099812107,"z":525268.4815471189},{"id":48,"x":43.28280081986184,"y":133.24867099812107,"z":529560.3724841874},{"id":49,"x":25.248039523039914,"y":133.24867099812107,"z":534026.7711018872},{"id":50,"x":7.160300388663829,"y":133.24867099812107,"z":539979.6319430113},{"id":51,"x":-10.945191606222659,"y":133.24867099812107,"z":547840.9454112275},{"id":52,"x":-29.026633672448693,"y":133.24867099812107,"z":556701.189434763},{"id":53,"x":-47.05225225410867,"y":133.24867099812107,"z":564463.6177258895},{"id":54,"x":-65.01248238333407,"y":133.24867099812107,"z":568536.1601854917},{"id":55,"x":-82.92303660763174,"y":133.2486709981211,"z":566793.0661475472},{"id":56,"x":-79.18148664741834,"y":-46.75132900187894,"z":558430.6852134756},{"id":57,"x":-61.26047593872138,"y":-46.751329001878936,"z":544403.108480182},{"id":58,"x":-43.28223266683754,"y":-46.75132900187894,"z":527279.8335681477},{"id":59,"x":-25.23615417148448,"y":-46.751329001878936,"z":510554.687845931},{"id":60,"x":-7.137655908915721,"y":-46.751329001878936,"z":497617.66009459173},{"id":61,"x":10.97694375500534,"y":-46.751329001878936,"z":490740.31785310176},{"id":62,"x":29.064433885264503,"y":-46.75132900187894,"z":490452.5482853822},{"id":63,"x":47.09189536862925,"y":-46.75132900187893,"z":495548.56592585787},{"id":64,"x":74.00624137680512,"y":-28.75132900187892,"z":508106.1705770698},{"id":65,"x":88.10380713258253,"y":151.24867099812096,"z":516294.0213050148},{"id":66,"x":70.2104456388374,"y":151.24867099812107,"z":522731.7234625078},{"id":67,"x":52.27468075988794,"y":151.24867099812107,"z":527488.2596583429},{"id":68,"x":34.27355863587397,"y":151.24867099812107,"z":531677.3985219663},{"id":69,"x":16.208938383954692,"y":151.24867099812107,"z":536762.4249142448},{"id":70,"x":-1.8928844609296203,"y":151.24867099812107,"z":543695.9886545881},{"id":71,"x":-19.99132001252058,"y":151.24867099812107,"z":552255.3357120012},{"id":72,"x":-38.04762514644417,"y":151.24867099812107,"z":560880.885768282},{"id":73,"x":-56.040117755207106,"y":151.24867099812107,"z":567116.36200789},{"id":74,"x":-73.9721199126842,"y":151.24867099812107,"z":568480.51935286},{"id":75,"x":-88.12991410820429,"y":-28.751329001879064,"z":563422.1391705454},{"id":76,"x":-70.22653105087109,"y":-28.75132900187895,"z":551996.562512456},{"id":77,"x":-52.279768416694935,"y":-28.751329001878933,"z":536020.5823006764},{"id":78,"x":-34.26731069681346,"y":-28.751329001878936,"z":518640.253790398},{"id":79,"x":-16.191547097630682,"y":-28.751329001878926,"z":503434.43575419317},{"id":80,"x":1.920375219141871,"y":-28.751329001878936,"z":493344.3384948798},{"id":81,"x":20.026564543849837,"y":-28.751329001878933,"z":489812.0707847578},{"id":82,"x":38.08691561339475,"y":-28.751329001878926,"z":492457.25629306445},{"id":83,"x":56.07896929426127,"y":-28.751329001878933,"z":499405.465825437},{"id":84,"x":82.95348063988527,"y":-10.751329001878922,"z":512371.5353926763},{"id":85,"x":79.16021382663692,"y":169.24867099812104,"z":519757.44928693946},{"id":86,"x":61.24981489110947,"y":169.24867099812107,"z":525268.4815471189},{"id":87,"x":43.28280081986184,"y":169.24867099812107,"z":529560.3724841874},{"id":88,"x":25.248039523039914,"y":169.24867099812107,"z":534026.7711018872},{"id":89,"x":7.160300388663827,"y":169.24867099812107,"z":539979.6319430113},{"id":90,"x":-10.945191606222664,"y":169.24867099812107,"z":547840.9454112268},{"id":91,"x":-29.0266336724487,"y":169.24867099812107,"z":556701.1894347626},{"id":92,"x":-47.05225225410867,"y":169.24867099812107,"z":564463.6177258892},{"id":93,"x":-65.01248238333407,"y":169.24867099812107,"z":568536.1601854909},{"id":94,"x":-82.92303660763177,"y":169.2486709981211,"z":566793.0661475459},{"id":95,"x":-79.18148664741834,"y":-10.751329001878943,"z":558430.685213476},{"id":96,"x":-61.26047593872138,"y":-10.751329001878954,"z":544403.1084801822},{"id":97,"x":-43.28223266683753,"y":-10.751329001878942,"z":527279.8335681476},{"id":98,"x":-25.23615417148448,"y":-10.751329001878938,"z":510554.68784593215},{"id":99,"x":-7.137655908915721,"y":-10.751329001878936,"z":497617.66009459173},{"id":100,"x":10.976943755005344,"y":-10.751329001878934,"z":490740.31785309874},{"id":101,"x":29.064433885264503,"y":-10.751329001878927,"z":490452.54828538356},{"id":102,"x":47.09189536862925,"y":-10.751329001878943,"z":495548.5659258572},{"id":103,"x":65.0494560240467,"y":-10.751329001878938,"z":503695.56693376263},{"id":104,"x":88.10380713258253,"y":-172.75132900187904,"z":516294.0213050144},{"id":105,"x":70.21044563883741,"y":-172.75132900187896,"z":522731.7234625079},{"id":106,"x":52.27468075988794,"y":-172.75132900187896,"z":527488.2596583414},{"id":107,"x":34.273558635873975,"y":-172.75132900187893,"z":531677.3985219654},{"id":108,"x":16.208938383954695,"y":-172.75132900187896,"z":536762.4249142426},{"id":109,"x":-1.8928844609296203,"y":-172.75132900187893,"z":543695.9886545881},{"id":110,"x":-19.99132001252058,"y":-172.75132900187896,"z":552255.3357120012},{"id":111,"x":-38.047625146444176,"y":-172.75132900187896,"z":560880.8857682821},{"id":112,"x":-56.040117755207106,"y":-172.75132900187896,"z":567116.36200789},{"id":113,"x":-73.9721199126842,"y":-172.75132900187893,"z":568480.5193528599},{"id":114,"x":-88.12991410820426,"y":7.248670998120957,"z":563422.1391705455},{"id":115,"x":-70.22653105087119,"y":7.2486709981210495,"z":551996.5625124575},{"id":116,"x":-52.279768416694935,"y":7.248670998121062,"z":536020.5823006749},{"id":117,"x":-34.267310696813446,"y":7.248670998121064,"z":518640.25379039743},{"id":118,"x":-16.191547097630686,"y":7.248670998121073,"z":503434.4357541906},{"id":119,"x":1.920375219141872,"y":7.248670998121074,"z":493344.3384948782},{"id":120,"x":20.02656454384983,"y":7.24867099812107,"z":489812.07078475965},{"id":121,"x":38.08691561339475,"y":7.248670998121065,"z":492457.25629306445},{"id":122,"x":56.07896929426128,"y":7.248670998121064,"z":499405.4658254363},{"id":123,"x":74.00624137680514,"y":7.248670998121081,"z":508106.17057706934},{"id":124,"x":79.16021382663692,"y":-154.75132900187896,"z":519757.4492869399},{"id":125,"x":61.24981489110947,"y":-154.75132900187896,"z":525268.4815471193},{"id":126,"x":43.28280081986184,"y":-154.75132900187893,"z":529560.3724841874},{"id":127,"x":25.248039523039914,"y":-154.75132900187896,"z":534026.7711018872},{"id":128,"x":7.16030038866383,"y":-154.75132900187896,"z":539979.6319430115},{"id":129,"x":-10.945191606222659,"y":-154.75132900187896,"z":547840.9454112275},{"id":130,"x":-29.0266336724487,"y":-154.75132900187896,"z":556701.1894347626},{"id":131,"x":-47.05225225410867,"y":-154.75132900187896,"z":564463.6177258895},{"id":132,"x":-65.01248238333406,"y":-154.75132900187893,"z":568536.1601854891},{"id":133,"x":-82.92303660763177,"y":-154.75132900187893,"z":566793.0661475465},{"id":134,"x":-79.18148664741834,"y":25.248670998121053,"z":558430.685213476},{"id":135,"x":-61.26047593872138,"y":25.248670998121057,"z":544403.1084801822},{"id":136,"x":-43.28223266683753,"y":25.248670998121067,"z":527279.8335681476},{"id":137,"x":-25.23615417148448,"y":25.248670998121067,"z":510554.687845931},{"id":138,"x":-7.137655908915721,"y":25.24867099812106,"z":497617.66009459173},{"id":139,"x":10.97694375500534,"y":25.248670998121053,"z":490740.31785310176},{"id":140,"x":29.064433885264503,"y":25.248670998121067,"z":490452.5482853822},{"id":141,"x":47.09189536862925,"y":25.24867099812107,"z":495548.5659258572},{"id":142,"x":65.04945602404669,"y":25.248670998121067,"z":503695.5669337634},{"id":143,"x":82.95348063988524,"y":25.248670998121085,"z":512371.53539267485},{"id":144,"x":70.21044563883741,"y":-136.75132900187896,"z":522731.72346250684},{"id":145,"x":52.27468075988794,"y":-136.75132900187896,"z":527488.2596583414},{"id":146,"x":34.273558635873975,"y":-136.75132900187896,"z":531677.3985219654},{"id":147,"x":16.208938383954695,"y":-136.75132900187896,"z":536762.4249142448},{"id":148,"x":-1.8928844609296205,"y":-136.75132900187896,"z":543695.9886545872},{"id":149,"x":-19.99132001252058,"y":-136.75132900187893,"z":552255.3357120005},{"id":150,"x":-38.047625146444176,"y":-136.75132900187896,"z":560880.8857682821},{"id":151,"x":-56.040117755207106,"y":-136.75132900187893,"z":567116.3620078918},{"id":152,"x":-73.9721199126842,"y":-136.75132900187893,"z":568480.5193528611},{"id":153,"x":-88.12991410820426,"y":43.24867099812092,"z":563422.1391705448},{"id":154,"x":-70.22653105087109,"y":43.24867099812106,"z":551996.562512455},{"id":155,"x":-52.27976841669501,"y":43.248670998121064,"z":536020.5823006765},{"id":156,"x":-34.267310696813446,"y":43.24867099812107,"z":518640.2537903997},{"id":157,"x":-16.191547097630686,"y":43.248670998121064,"z":503434.4357541906},{"id":158,"x":1.920375219141872,"y":43.248670998121064,"z":493344.3384948782},{"id":159,"x":20.02656454384983,"y":43.24867099812107,"z":489812.07078475965},{"id":160,"x":38.08691561339475,"y":43.248670998121064,"z":492457.25629306445},{"id":161,"x":56.07896929426127,"y":43.24867099812107,"z":499405.465825437},{"id":162,"x":74.00624137680514,"y":43.24867099812108,"z":508106.1705770693},{"id":163,"x":88.10380713258253,"y":-136.75132900187907,"z":516294.02130501554},{"id":164,"x":61.24981489110947,"y":-118.75132900187894,"z":525268.4815471193},{"id":165,"x":43.282800819861855,"y":-118.75132900187894,"z":529560.3724841865},{"id":166,"x":25.24803952303992,"y":-118.75132900187894,"z":534026.7711018877},{"id":167,"x":7.160300388663829,"y":-118.75132900187894,"z":539979.6319430113},{"id":168,"x":-10.945191606222659,"y":-118.75132900187894,"z":547840.9454112275},{"id":169,"x":-29.0266336724487,"y":-118.75132900187894,"z":556701.1894347626},{"id":170,"x":-47.05225225410867,"y":-118.75132900187894,"z":564463.6177258895},{"id":171,"x":-65.01248238333407,"y":-118.75132900187893,"z":568536.1601854909},{"id":172,"x":-82.92303660763177,"y":-118.75132900187893,"z":566793.0661475463},{"id":173,"x":-79.18148664741834,"y":61.248670998121035,"z":558430.685213476},{"id":174,"x":-61.26047593872138,"y":61.24867099812105,"z":544403.108480182},{"id":175,"x":-43.28223266683754,"y":61.24867099812105,"z":527279.8335681477},{"id":176,"x":-25.23615417148448,"y":61.248670998121064,"z":510554.687845931},{"id":177,"x":-7.137655908915721,"y":61.248670998121064,"z":497617.66009459173},{"id":178,"x":10.976943755005342,"y":61.248670998121064,"z":490740.3178530994},{"id":179,"x":29.064433885264503,"y":61.248670998121064,"z":490452.5482853822},{"id":180,"x":47.09189536862925,"y":61.248670998121064,"z":495548.5659258556},{"id":181,"x":65.0494560240467,"y":61.248670998121064,"z":503695.56693376263},{"id":182,"x":82.95348063988526,"y":61.248670998121085,"z":512371.53539267444},{"id":183,"x":79.16021382663692,"y":-118.75132900187897,"z":519757.4492869423},{"id":184,"x":52.27468075988794,"y":-100.75132900187893,"z":527488.2596583429},{"id":185,"x":34.273558635873975,"y":-100.75132900187893,"z":531677.3985219654},{"id":186,"x":16.208938383954695,"y":-100.75132900187894,"z":536762.4249142426},{"id":187,"x":-1.8928844609296203,"y":-100.75132900187893,"z":543695.9886545881},{"id":188,"x":-19.99132001252058,"y":-100.75132900187894,"z":552255.3357120012},{"id":189,"x":-38.04762514644418,"y":-100.75132900187893,"z":560880.8857682813},{"id":190,"x":-56.040117755207106,"y":-100.75132900187893,"z":567116.3620078898},{"id":191,"x":-73.9721199126842,"y":-100.75132900187893,"z":568480.5193528606},{"id":192,"x":-88.12991410820426,"y":79.24867099812099,"z":563422.1391705448},{"id":193,"x":-70.22653105087109,"y":79.24867099812106,"z":551996.5625124563},{"id":194,"x":-52.27976841669496,"y":79.24867099812106,"z":536020.5823006738},{"id":195,"x":-34.26731069681356,"y":79.24867099812106,"z":518640.25379039795},{"id":196,"x":-16.191547097630682,"y":79.24867099812106,"z":503434.43575419317},{"id":197,"x":1.920375219141871,"y":79.24867099812107,"z":493344.3384948798},{"id":198,"x":20.026564543849837,"y":79.24867099812106,"z":489812.0707847578},{"id":199,"x":38.08691561339475,"y":79.24867099812107,"z":492457.25629306445},{"id":200,"x":56.07896929426128,"y":79.24867099812107,"z":499405.4658254363},{"id":201,"x":74.00624137680514,"y":79.24867099812107,"z":508106.17057706916},{"id":202,"x":88.10380713258252,"y":-100.75132900187901,"z":516294.02130501455},{"id":203,"x":70.21044563883744,"y":-100.75132900187894,"z":522731.7234625074}]},{"startSimulationTime":40,"startUtcTime":"2018-03-15T00:01:41.681","endSimulationTime":50,"endUtcTime":"2018-03-15T00:01:51.681","paths":[{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40597},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40526,"damagedPackets":0,"createdPackets":40537},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40667,"damagedPackets":0,"createdPackets":40683},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40707,"damagedPackets":0,"createdPackets":40677},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40526,"damagedPackets":0,"createdPackets":40537},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40667,"damagedPackets":0,"createdPackets":40683},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40214,"damagedPackets":0,"createdPackets":40244},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40707,"damagedPackets":0,"createdPackets":40677},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40351,"damagedPackets":0,"createdPackets":40342},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40351,"damagedPackets":0,"createdPackets":40342},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40707,"damagedPackets":0,"createdPackets":40677},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40214,"damagedPackets":0,"createdPackets":40244},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40597},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40214,"damagedPackets":0,"createdPackets":40244},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40351,"damagedPackets":0,"createdPackets":40342},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40667,"damagedPackets":0,"createdPackets":40683},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40584,"damagedPackets":0,"createdPackets":40597},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40526,"damagedPackets":0,"createdPackets":40537}],"satelliteData":[{"id":4,"x":47.729497168650454,"y":-82.79310974511077,"z":495800.6572929426},{"id":5,"x":65.68441571245798,"y":-82.79310974511075,"z":504007.5195543111},{"id":6,"x":83.58621615513728,"y":-82.79310974511074,"z":512662.14577083976},{"id":7,"x":78.528729475959,"y":97.20689025488923,"z":519983.27920659434},{"id":8,"x":60.618551895600184,"y":97.20689025488923,"z":525433.3495469951},{"id":9,"x":42.65114777614856,"y":97.20689025488925,"z":529705.1900235774},{"id":10,"x":24.616086308118284,"y":97.20689025488925,"z":534204.0985607349},{"id":11,"x":6.528808195434086,"y":97.20689025488925,"z":540223.011320586},{"id":12,"x":-11.57514414941896,"y":97.20689025488925,"z":548141.8457460608},{"id":13,"x":-29.65418781968839,"y":97.20689025488923,"z":557004.0290557041},{"id":14,"x":-47.67724805284167,"y":97.20689025488925,"z":564681.7195551998},{"id":15,"x":-65.63566887916403,"y":97.20689025488926,"z":568582.3429296268},{"id":16,"x":-83.54593978143814,"y":97.20689025488927,"z":566612.8442690996},{"id":17,"x":-78.55697480331345,"y":-82.79310974511078,"z":558025.8739821422},{"id":18,"x":-60.63265073843748,"y":-82.79310974511077,"z":543837.5678778798},{"id":19,"x":-42.65011145882145,"y":-82.79310974511077,"z":526664.7994351736},{"id":20,"x":-24.599823240373727,"y":-82.79310974511077,"z":510017.4169928042},{"id":21,"x":-6.498281839943999,"y":-82.79310974511077,"z":497263.211472123},{"id":22,"x":11.617487601068857,"y":-82.79310974511075,"z":490620.1994896343},{"id":23,"x":29.704201863982785,"y":-82.79310974511075,"z":490552.58812013996},{"id":24,"x":56.71524881515883,"y":-64.79310974511077,"z":499699.1084663904},{"id":25,"x":74.63999134571853,"y":-64.79310974511075,"z":508415.6957725928},{"id":26,"x":87.47183466853534,"y":115.20689025488919,"z":516554.70440467296},{"id":27,"x":69.57918418485735,"y":115.20689025488922,"z":522923.8224581284},{"id":28,"x":51.64325869549017,"y":115.20689025488925,"z":527636.5425624851},{"id":29,"x":33.64169751023948,"y":115.20689025488925,"z":531832.3967338618},{"id":30,"x":15.57708919713393,"y":115.20689025488925,"z":536970.849642666},{"id":31,"x":-2.52374108709466,"y":115.20689025488922,"z":543972.2738612237},{"id":32,"x":-20.620145855131806,"y":115.20689025488925,"z":552566.6929102616},{"id":33,"x":-38.67386418545234,"y":115.20689025488925,"z":561153.0351346416},{"id":34,"x":-56.66405978743532,"y":115.20689025488925,"z":567258.0771024304},{"id":35,"x":-74.59493907013828,"y":115.20689025488925,"z":568417.1629413835},{"id":36,"x":-87.50644495832454,"y":-64.7931097451108,"z":563125.4107765895},{"id":37,"x":-69.6005416490312,"y":-64.79310974511077,"z":551499.8698853623},{"id":38,"x":-51.649856020027855,"y":-64.79310974511077,"z":535414.5123554586},{"id":39,"x":-33.633001944404974,"y":-64.79310974511077,"z":518048.695375969},{"id":40,"x":-15.553491719512026,"y":-64.79310974511077,"z":502978.23348005564},{"id":41,"x":2.560589146946834,"y":-64.79310974511075,"z":493104.7201323723},{"id":42,"x":20.666941527067078,"y":-64.79310974511077,"z":489807.71340249025},{"id":43,"x":38.725721179111524,"y":-64.79310974511078,"z":492644.17280314513},{"id":44,"x":65.68441571245798,"y":-46.793109745110755,"z":504007.5195543111},{"id":45,"x":83.58621615513727,"y":-46.79310974511073,"z":512662.14577083976},{"id":46,"x":78.52872947595901,"y":133.20689025488923,"z":519983.2792065948},{"id":47,"x":60.618551895600184,"y":133.20689025488923,"z":525433.3495469943},{"id":48,"x":42.651147776148576,"y":133.20689025488923,"z":529705.1900235789},{"id":49,"x":24.616086308118284,"y":133.20689025488923,"z":534204.0985607363},{"id":50,"x":6.5288081954340855,"y":133.20689025488923,"z":540223.0113205839},{"id":51,"x":-11.575144149418959,"y":133.20689025488923,"z":548141.8457460643},{"id":52,"x":-29.654187819688385,"y":133.20689025488923,"z":557004.0290557034},{"id":53,"x":-47.67724805284167,"y":133.20689025488923,"z":564681.7195551998},{"id":54,"x":-65.63566887916407,"y":133.20689025488923,"z":568582.3429296263},{"id":55,"x":-83.54593978143812,"y":133.20689025488926,"z":566612.8442691012},{"id":56,"x":-78.55697480331345,"y":-46.793109745110776,"z":558025.8739821428},{"id":57,"x":-60.6326507384375,"y":-46.79310974511076,"z":543837.5678778784},{"id":58,"x":-42.65011145882145,"y":-46.79310974511076,"z":526664.7994351736},{"id":59,"x":-24.599823240373727,"y":-46.79310974511076,"z":510017.4169928042},{"id":60,"x":-6.498281839944,"y":-46.793109745110755,"z":497263.21147212316},{"id":61,"x":11.61748760106886,"y":-46.793109745110755,"z":490620.1994896363},{"id":62,"x":29.704201863982775,"y":-46.793109745110755,"z":490552.5881201415},{"id":63,"x":47.729497168650425,"y":-46.793109745110755,"z":495800.65729294356},{"id":64,"x":74.63999134571853,"y":-28.793109745110744,"z":508415.6957725928},{"id":65,"x":87.47183466853534,"y":151.20689025488915,"z":516554.70440467395},{"id":66,"x":69.57918418485735,"y":151.20689025488923,"z":522923.82245812763},{"id":67,"x":51.64325869549017,"y":151.20689025488923,"z":527636.5425624851},{"id":68,"x":33.64169751023948,"y":151.20689025488923,"z":531832.3967338618},{"id":69,"x":15.57708919713393,"y":151.20689025488923,"z":536970.849642666},{"id":70,"x":-2.52374108709466,"y":151.20689025488923,"z":543972.2738612237},{"id":71,"x":-20.620145855131806,"y":151.20689025488923,"z":552566.6929102616},{"id":72,"x":-38.67386418545233,"y":151.20689025488923,"z":561153.0351346442},{"id":73,"x":-56.66405978743531,"y":151.20689025488923,"z":567258.0771024291},{"id":74,"x":-74.59493907013832,"y":151.20689025488926,"z":568417.1629413858},{"id":75,"x":-87.50644495832456,"y":-28.79310974511086,"z":563125.4107765899},{"id":76,"x":-69.6005416490312,"y":-28.793109745110765,"z":551499.8698853622},{"id":77,"x":-51.64985602002785,"y":-28.793109745110765,"z":535414.5123554594},{"id":78,"x":-33.633001944404974,"y":-28.79310974511075,"z":518048.6953759694},{"id":79,"x":-15.553491719512028,"y":-28.79310974511076,"z":502978.233480056},{"id":80,"x":2.560589146946834,"y":-28.79310974511076,"z":493104.7201323712},{"id":81,"x":20.666941527067078,"y":-28.793109745110765,"z":489807.71340249025},{"id":82,"x":38.72572117911153,"y":-28.79310974511075,"z":492644.1728031464},{"id":83,"x":56.71524881515875,"y":-28.793109745110744,"z":499699.108466388},{"id":84,"x":83.58621615513728,"y":-10.793109745110742,"z":512662.14577084157},{"id":85,"x":78.528729475959,"y":169.20689025488923,"z":519983.27920659457},{"id":86,"x":60.618551895600184,"y":169.20689025488923,"z":525433.3495469945},{"id":87,"x":42.65114777614856,"y":169.20689025488923,"z":529705.1900235774},{"id":88,"x":24.616086308118284,"y":169.20689025488923,"z":534204.0985607349},{"id":89,"x":6.528808195434083,"y":169.20689025488923,"z":540223.0113205878},{"id":90,"x":-11.575144149418959,"y":169.20689025488923,"z":548141.8457460643},{"id":91,"x":-29.654187819688385,"y":169.20689025488923,"z":557004.0290557034},{"id":92,"x":-47.677248052841676,"y":169.20689025488923,"z":564681.7195551997},{"id":93,"x":-65.63566887916407,"y":169.20689025488923,"z":568582.3429296263},{"id":94,"x":-83.54593978143814,"y":169.20689025488926,"z":566612.8442690996},{"id":95,"x":-78.55697480331345,"y":-10.793109745110772,"z":558025.8739821422},{"id":96,"x":-60.63265073843748,"y":-10.793109745110767,"z":543837.5678778798},{"id":97,"x":-42.650111458821435,"y":-10.793109745110765,"z":526664.7994351748},{"id":98,"x":-24.599823240373727,"y":-10.79310974511077,"z":510017.4169928042},{"id":99,"x":-6.498281839944,"y":-10.793109745110756,"z":497263.21147212316},{"id":100,"x":11.617487601068857,"y":-10.793109745110764,"z":490620.1994896343},{"id":101,"x":29.704201863982775,"y":-10.793109745110756,"z":490552.5881201408},{"id":102,"x":47.729497168650425,"y":-10.793109745110764,"z":495800.65729294356},{"id":103,"x":65.68441571245793,"y":-10.79310974511075,"z":504007.51955431345},{"id":104,"x":87.47183466853534,"y":-172.79310974511083,"z":516554.7044046746},{"id":105,"x":69.57918418485735,"y":-172.79310974511077,"z":522923.8224581289},{"id":106,"x":51.64325869549018,"y":-172.79310974511077,"z":527636.5425624842},{"id":107,"x":33.64169751023949,"y":-172.79310974511074,"z":531832.3967338614},{"id":108,"x":15.57708919713393,"y":-172.79310974511077,"z":536970.849642666},{"id":109,"x":-2.52374108709466,"y":-172.79310974511074,"z":543972.2738612231},{"id":110,"x":-20.620145855131806,"y":-172.79310974511074,"z":552566.6929102616},{"id":111,"x":-38.67386418545234,"y":-172.79310974511074,"z":561153.0351346423},{"id":112,"x":-56.66405978743532,"y":-172.79310974511074,"z":567258.0771024304},{"id":113,"x":-74.59493907013831,"y":-172.79310974511074,"z":568417.1629413852},{"id":114,"x":-87.50644495832454,"y":7.206890254889158,"z":563125.4107765895},{"id":115,"x":-69.60054164903126,"y":7.206890254889227,"z":551499.8698853608},{"id":116,"x":-51.649856020027855,"y":7.206890254889231,"z":535414.5123554586},{"id":117,"x":-33.633001944404974,"y":7.206890254889249,"z":518048.6953759666},{"id":118,"x":-15.553491719512031,"y":7.206890254889249,"z":502978.23348005593},{"id":119,"x":2.560589146946834,"y":7.206890254889244,"z":493104.7201323723},{"id":120,"x":20.666941527067067,"y":7.206890254889239,"z":489807.713402491},{"id":121,"x":38.725721179111524,"y":7.206890254889244,"z":492644.17280314513},{"id":122,"x":56.71524881515875,"y":7.206890254889239,"z":499699.108466388},{"id":123,"x":74.6399913457185,"y":7.206890254889249,"z":508415.6957725912},{"id":124,"x":78.528729475959,"y":-154.79310974511077,"z":519983.27920659434},{"id":125,"x":60.618551895600184,"y":-154.79310974511077,"z":525433.3495469945},{"id":126,"x":42.65114777614856,"y":-154.79310974511074,"z":529705.190023579},{"id":127,"x":24.616086308118284,"y":-154.79310974511077,"z":534204.0985607349},{"id":128,"x":6.528808195434083,"y":-154.79310974511077,"z":540223.0113205865},{"id":129,"x":-11.575144149418959,"y":-154.79310974511074,"z":548141.8457460643},{"id":130,"x":-29.654187819688385,"y":-154.79310974511077,"z":557004.0290557034},{"id":131,"x":-47.677248052841676,"y":-154.79310974511077,"z":564681.7195551997},{"id":132,"x":-65.63566887916406,"y":-154.79310974511074,"z":568582.3429296258},{"id":133,"x":-83.54593978143814,"y":-154.79310974511074,"z":566612.8442690988},{"id":134,"x":-78.55697480331345,"y":25.20689025488922,"z":558025.8739821418},{"id":135,"x":-60.6326507384375,"y":25.206890254889224,"z":543837.5678778784},{"id":136,"x":-42.65011145882145,"y":25.206890254889235,"z":526664.7994351736},{"id":137,"x":-24.59982324037373,"y":25.206890254889228,"z":510017.41699280444},{"id":138,"x":-6.498281839944,"y":25.206890254889235,"z":497263.21147212316},{"id":139,"x":11.617487601068857,"y":25.206890254889245,"z":490620.1994896343},{"id":140,"x":29.704201863982775,"y":25.206890254889245,"z":490552.5881201408},{"id":141,"x":47.729497168650425,"y":25.206890254889245,"z":495800.65729294356},{"id":142,"x":65.68441571245793,"y":25.20689025488925,"z":504007.5195543125},{"id":143,"x":83.58621615513724,"y":25.206890254889252,"z":512662.1457708414},{"id":144,"x":69.57918418485735,"y":-136.79310974511077,"z":522923.8224581284},{"id":145,"x":51.64325869549018,"y":-136.79310974511077,"z":527636.5425624842},{"id":146,"x":33.64169751023949,"y":-136.79310974511077,"z":531832.3967338614},{"id":147,"x":15.57708919713393,"y":-136.79310974511077,"z":536970.849642666},{"id":148,"x":-2.5237410870946593,"y":-136.79310974511077,"z":543972.2738612238},{"id":149,"x":-20.620145855131817,"y":-136.79310974511077,"z":552566.6929102594},{"id":150,"x":-38.67386418545234,"y":-136.79310974511077,"z":561153.0351346416},{"id":151,"x":-56.66405978743532,"y":-136.79310974511074,"z":567258.0771024304},{"id":152,"x":-74.59493907013832,"y":-136.79310974511074,"z":568417.1629413841},{"id":153,"x":-87.50644495832454,"y":43.206890254889124,"z":563125.4107765903},{"id":154,"x":-69.60054164903121,"y":43.20689025488922,"z":551499.8698853615},{"id":155,"x":-51.6498560200279,"y":43.20689025488923,"z":535414.5123554599},{"id":156,"x":-33.633001944404974,"y":43.206890254889224,"z":518048.6953759666},{"id":157,"x":-15.553491719512031,"y":43.20689025488923,"z":502978.23348005593},{"id":158,"x":2.560589146946834,"y":43.20689025488924,"z":493104.7201323723},{"id":159,"x":20.666941527067067,"y":43.206890254889245,"z":489807.713402491},{"id":160,"x":38.725721179111524,"y":43.20689025488924,"z":492644.17280314513},{"id":161,"x":56.71524881515875,"y":43.20689025488924,"z":499699.1084663889},{"id":162,"x":74.63999134571849,"y":43.20689025488926,"z":508415.6957725918},{"id":163,"x":87.47183466853534,"y":-136.79310974511088,"z":516554.70440467354},{"id":164,"x":60.618551895600184,"y":-118.79310974511077,"z":525433.3495469943},{"id":165,"x":42.65114777614856,"y":-118.79310974511077,"z":529705.190023579},{"id":166,"x":24.616086308118298,"y":-118.79310974511077,"z":534204.0985607321},{"id":167,"x":6.528808195434086,"y":-118.79310974511077,"z":540223.011320586},{"id":168,"x":-11.575144149418959,"y":-118.79310974511075,"z":548141.8457460643},{"id":169,"x":-29.654187819688378,"y":-118.79310974511075,"z":557004.0290557052},{"id":170,"x":-47.677248052841676,"y":-118.79310974511075,"z":564681.7195551997},{"id":171,"x":-65.63566887916406,"y":-118.79310974511075,"z":568582.3429296258},{"id":172,"x":-83.54593978143814,"y":-118.79310974511073,"z":566612.8442690991},{"id":173,"x":-78.55697480331345,"y":61.20689025488921,"z":558025.8739821424},{"id":174,"x":-60.63265073843748,"y":61.20689025488923,"z":543837.5678778798},{"id":175,"x":-42.65011145882144,"y":61.20689025488923,"z":526664.799435175},{"id":176,"x":-24.59982324037372,"y":61.20689025488923,"z":510017.4169928055},{"id":177,"x":-6.498281839944,"y":61.20689025488923,"z":497263.21147212316},{"id":178,"x":11.617487601068857,"y":61.20689025488923,"z":490620.1994896343},{"id":179,"x":29.704201863982775,"y":61.20689025488923,"z":490552.5881201408},{"id":180,"x":47.729497168650425,"y":61.206890254889245,"z":495800.65729294356},{"id":181,"x":65.68441571245793,"y":61.206890254889245,"z":504007.5195543125},{"id":182,"x":83.58621615513724,"y":61.20689025488928,"z":512662.1457708408},{"id":183,"x":78.52872947595898,"y":-118.79310974511077,"z":519983.2792065926},{"id":184,"x":51.64325869549017,"y":-100.79310974511077,"z":527636.5425624851},{"id":185,"x":33.64169751023948,"y":-100.79310974511077,"z":531832.3967338618},{"id":186,"x":15.577089197133926,"y":-100.79310974511077,"z":536970.8496426662},{"id":187,"x":-2.52374108709466,"y":-100.79310974511077,"z":543972.2738612237},{"id":188,"x":-20.62014585513181,"y":-100.79310974511077,"z":552566.6929102591},{"id":189,"x":-38.673864185452345,"y":-100.79310974511077,"z":561153.0351346408},{"id":190,"x":-56.66405978743531,"y":-100.79310974511077,"z":567258.0771024291},{"id":191,"x":-74.59493907013832,"y":-100.79310974511075,"z":568417.1629413858},{"id":192,"x":-87.50644495832454,"y":79.20689025488919,"z":563125.4107765895},{"id":193,"x":-69.6005416490312,"y":79.20689025488923,"z":551499.8698853623},{"id":194,"x":-51.64985602002785,"y":79.20689025488923,"z":535414.5123554594},{"id":195,"x":-33.63300194440502,"y":79.20689025488923,"z":518048.6953759683},{"id":196,"x":-15.553491719512026,"y":79.20689025488923,"z":502978.2334800589},{"id":197,"x":2.560589146946834,"y":79.20689025488923,"z":493104.7201323723},{"id":198,"x":20.666941527067067,"y":79.20689025488923,"z":489807.713402491},{"id":199,"x":38.72572117911154,"y":79.20689025488925,"z":492644.17280314246},{"id":200,"x":56.715248815158766,"y":79.20689025488923,"z":499699.10846638685},{"id":201,"x":74.63999134571851,"y":79.20689025488925,"z":508415.6957725902},{"id":202,"x":87.47183466853534,"y":-100.79310974511081,"z":516554.7044046745},{"id":203,"x":69.57918418485743,"y":-100.79310974511077,"z":522923.8224581277}]},{"startSimulationTime":50,"startUtcTime":"2018-03-15T00:01:51.681","endSimulationTime":60,"endUtcTime":"2018-03-15T00:02:01.681","paths":[{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41123,"damagedPackets":0,"createdPackets":41092},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40586,"damagedPackets":0,"createdPackets":40577},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40553,"damagedPackets":0,"createdPackets":40543},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40191,"damagedPackets":0,"createdPackets":40257},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40586,"damagedPackets":0,"createdPackets":40577},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40553,"damagedPackets":0,"createdPackets":40543},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40647,"damagedPackets":0,"createdPackets":40707},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40191,"damagedPackets":0,"createdPackets":40257},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40524,"damagedPackets":0,"createdPackets":40560},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40524,"damagedPackets":0,"createdPackets":40560},{"packetSenderID":1,"stationIDs":[3,123,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40191,"damagedPackets":0,"createdPackets":40257},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40647,"damagedPackets":0,"createdPackets":40707},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41123,"damagedPackets":0,"createdPackets":41092},{"packetSenderID":2,"stationIDs":[3,162,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40647,"damagedPackets":0,"createdPackets":40707},{"packetSenderID":6,"stationIDs":[2,51,50,143,1],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40524,"damagedPackets":0,"createdPackets":40560},{"packetSenderID":4,"stationIDs":[1,143,50,51,2],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40553,"damagedPackets":0,"createdPackets":40543},{"packetSenderID":3,"stationIDs":[1,123,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":41123,"damagedPackets":0,"createdPackets":41092},{"packetSenderID":5,"stationIDs":[2,51,50,162,3],"delays":[],"sucsessfulPackets":0,"outOfOrderPackets":0,"droppedPackets":40586,"damagedPackets":0,"createdPackets":40577}],"satelliteData":[{"id":4,"x":48.36700768464943,"y":-82.83489048917636,"z":496056.48016111355},{"id":5,"x":66.31928492654644,"y":-82.83489048917636,"z":504319.94162031997},{"id":6,"x":84.21888895956666,"y":-82.83489048917632,"z":512950.9314784019},{"id":7,"x":77.89726924845448,"y":97.16510951082365,"z":520206.6231582528},{"id":8,"x":59.98728194281523,"y":97.16510951082364,"z":525596.6626380596},{"id":9,"x":42.01947826399188,"y":97.16510951082365,"z":529850.2829244765},{"id":10,"x":23.984133179032533,"y":97.16510951082364,"z":534383.3657394296},{"id":11,"x":5.897351213980607,"y":97.16510951082365,"z":540468.8247637739},{"id":12,"x":-12.20502473894106,"y":97.16510951082365,"z":548443.99537513},{"id":13,"x":-30.281650677810617,"y":97.16510951082365,"z":557305.4779615215},{"id":14,"x":-48.30216318590958,"y":97.16510951082365,"z":564895.2112908621},{"id":15,"x":-66.25881639220847,"y":97.16510951082367,"z":568621.2946693589},{"id":16,"x":-84.16886660337431,"y":97.16510951082368,"z":566424.4077981348},{"id":17,"x":-77.9323732827836,"y":-82.83489048917637,"z":557614.040683806},{"id":18,"x":-60.00468628899498,"y":-82.83489048917637,"z":543268.2202306554},{"id":19,"x":-42.01783433090739,"y":-82.83489048917635,"z":526050.3592731053},{"id":20,"x":-23.963359741933424,"y":-82.83489048917636,"z":509485.03755981097},{"id":21,"x":-5.858832161099312,"y":-82.83489048917636,"z":496916.5359556289},{"id":22,"x":12.258035553006549,"y":-82.83489048917636,"z":490508.4896953011},{"id":23,"x":30.34391207698931,"y":-82.83489048917636,"z":490659.4209539189},{"id":24,"x":57.35143335070279,"y":-64.83489048917635,"z":499994.795906746},{"id":25,"x":75.27366222982721,"y":-64.83489048917635,"z":508724.3653878143},{"id":26,"x":86.83990580142134,"y":115.16510951082363,"z":516813.01347919647},{"id":27,"x":68.94792932578382,"y":115.16510951082365,"z":523113.73228796053},{"id":28,"x":51.01182166873888,"y":115.16510951082365,"z":527784.1357537862},{"id":29,"x":33.009825124159136,"y":115.16510951082365,"z":531988.5929728335},{"id":30,"x":14.945256244115853,"y":115.16510951082365,"z":537181.655140203},{"id":31,"x":-3.1545430845950304,"y":115.16510951082365,"z":544250.6145117074},{"id":32,"x":-21.248886879917677,"y":115.16510951082365,"z":552878.1186855497},{"id":33,"x":-39.30001314415299,"y":115.16510951082365,"z":561422.1847628573},{"id":34,"x":-57.28793851563171,"y":115.16510951082365,"z":567393.7237243186},{"id":35,"x":-75.21774892135575,"y":115.16510951082365,"z":568345.8304850177},{"id":36,"x":-86.88291831971273,"y":-64.83489048917639,"z":562820.7844839338},{"id":37,"x":-68.9744345491864,"y":-64.83489048917636,"z":550997.5477554711},{"id":38,"x":-51.019791196880995,"y":-64.83489048917636,"z":534806.7618288348},{"id":39,"x":-32.99854400660852,"y":-64.83489048917636,"z":517459.9801344613},{"id":40,"x":-14.915329005711234,"y":-64.83489048917636,"z":502528.6090840882},{"id":41,"x":3.20084323506982,"y":-64.83489048917635,"z":492873.4948698661},{"id":42,"x":21.307289062734164,"y":-64.83489048917636,"z":489811.20388115087},{"id":43,"x":39.36444796334064,"y":-64.83489048917636,"z":492836.4587952638},{"id":44,"x":66.31928492654643,"y":-46.834890489176345,"z":504319.9416203205},{"id":45,"x":84.21888895956666,"y":-46.83489048917632,"z":512950.9314784011},{"id":46,"x":77.89726924845448,"y":133.16510951082364,"z":520206.6231582514},{"id":47,"x":59.98728194281523,"y":133.16510951082364,"z":525596.6626380596},{"id":48,"x":42.01947826399188,"y":133.16510951082364,"z":529850.2829244765},{"id":49,"x":23.984133179032533,"y":133.16510951082364,"z":534383.3657394296},{"id":50,"x":5.897351213980607,"y":133.16510951082364,"z":540468.8247637739},{"id":51,"x":-12.205024738941056,"y":133.16510951082364,"z":548443.995375131},{"id":52,"x":-30.281650677810617,"y":133.16510951082364,"z":557305.4779615215},{"id":53,"x":-48.30216318590958,"y":133.16510951082364,"z":564895.2112908624},{"id":54,"x":-66.25881639220849,"y":133.16510951082364,"z":568621.2946693562},{"id":55,"x":-84.16886660337428,"y":133.16510951082367,"z":566424.4077981361},{"id":56,"x":-77.9323732827836,"y":-46.83489048917636,"z":557614.0406838058},{"id":57,"x":-60.00468628899498,"y":-46.83489048917635,"z":543268.2202306536},{"id":58,"x":-42.017834330907384,"y":-46.83489048917635,"z":526050.3592731059},{"id":59,"x":-23.963359741933424,"y":-46.834890489176345,"z":509485.03755981097},{"id":60,"x":-5.85883216109931,"y":-46.83489048917634,"z":496916.53595563007},{"id":61,"x":12.258035553006545,"y":-46.834890489176345,"z":490508.4896953021},{"id":62,"x":30.34391207698931,"y":-46.834890489176345,"z":490659.4209539189},{"id":63,"x":48.367007684649366,"y":-46.83489048917635,"z":496056.4801611137},{"id":64,"x":75.27366222982721,"y":-28.834890489176324,"z":508724.36538781354},{"id":65,"x":86.83990580142134,"y":151.16510951082358,"z":516813.01347919693},{"id":66,"x":68.9479293257838,"y":151.16510951082364,"z":523113.73228796036},{"id":67,"x":51.01182166873888,"y":151.16510951082364,"z":527784.1357537872},{"id":68,"x":33.009825124159136,"y":151.16510951082364,"z":531988.5929728335},{"id":69,"x":14.94525624411585,"y":151.16510951082364,"z":537181.6551402031},{"id":70,"x":-3.1545430845950295,"y":151.16510951082364,"z":544250.6145117085},{"id":71,"x":-21.248886879917677,"y":151.16510951082364,"z":552878.1186855497},{"id":72,"x":-39.30001314415299,"y":151.16510951082364,"z":561422.1847628573},{"id":73,"x":-57.28793851563172,"y":151.16510951082364,"z":567393.7237243186},{"id":74,"x":-75.21774892135578,"y":151.16510951082367,"z":568345.8304850188},{"id":75,"x":-86.88291831971276,"y":-28.83489048917643,"z":562820.7844839331},{"id":76,"x":-68.9744345491864,"y":-28.834890489176356,"z":550997.547755472},{"id":77,"x":-51.01979119688099,"y":-28.83489048917635,"z":534806.7618288352},{"id":78,"x":-32.99854400660852,"y":-28.83489048917635,"z":517459.9801344613},{"id":79,"x":-14.91532900571123,"y":-28.83489048917635,"z":502528.60908408964},{"id":80,"x":3.20084323506982,"y":-28.834890489176356,"z":492873.4948698661},{"id":81,"x":21.307289062734164,"y":-28.834890489176356,"z":489811.20388115087},{"id":82,"x":39.36444796334064,"y":-28.834890489176335,"z":492836.45879526343},{"id":83,"x":57.35143335070276,"y":-28.83489048917635,"z":499994.79590674647},{"id":84,"x":84.21888895956666,"y":-10.834890489176326,"z":512950.9314784019},{"id":85,"x":77.89726924845446,"y":169.16510951082364,"z":520206.62315825216},{"id":86,"x":59.98728194281523,"y":169.16510951082364,"z":525596.6626380589},{"id":87,"x":42.019478263991886,"y":169.16510951082364,"z":529850.2829244769},{"id":88,"x":23.984133179032533,"y":169.16510951082364,"z":534383.3657394323},{"id":89,"x":5.897351213980608,"y":169.16510951082364,"z":540468.8247637762},{"id":90,"x":-12.20502473894106,"y":169.16510951082364,"z":548443.99537513},{"id":91,"x":-30.281650677810617,"y":169.16510951082364,"z":557305.4779615215},{"id":92,"x":-48.30216318590958,"y":169.16510951082364,"z":564895.2112908624},{"id":93,"x":-66.25881639220849,"y":169.16510951082364,"z":568621.2946693568},{"id":94,"x":-84.16886660337431,"y":169.16510951082367,"z":566424.4077981348},{"id":95,"x":-77.9323732827836,"y":-10.834890489176356,"z":557614.0406838063},{"id":96,"x":-60.00468628899497,"y":-10.834890489176354,"z":543268.2202306542},{"id":97,"x":-42.01783433090739,"y":-10.834890489176361,"z":526050.3592731053},{"id":98,"x":-23.96335974193342,"y":-10.834890489176349,"z":509485.03755981225},{"id":99,"x":-5.858832161099312,"y":-10.834890489176345,"z":496916.5359556289},{"id":100,"x":12.258035553006545,"y":-10.834890489176345,"z":490508.4896953021},{"id":101,"x":30.34391207698931,"y":-10.834890489176347,"z":490659.4209539189},{"id":102,"x":48.36700768464938,"y":-10.834890489176345,"z":496056.48016111343},{"id":103,"x":66.31928492654636,"y":-10.834890489176345,"z":504319.9416203195},{"id":104,"x":86.83990580142134,"y":-172.83489048917642,"z":516813.01347919734},{"id":105,"x":68.9479293257838,"y":-172.83489048917636,"z":523113.73228796036},{"id":106,"x":51.01182166873889,"y":-172.83489048917636,"z":527784.1357537864},{"id":107,"x":33.009825124159136,"y":-172.83489048917633,"z":531988.5929728328},{"id":108,"x":14.94525624411585,"y":-172.83489048917633,"z":537181.6551402024},{"id":109,"x":-3.1545430845950295,"y":-172.83489048917633,"z":544250.6145117085},{"id":110,"x":-21.248886879917677,"y":-172.83489048917633,"z":552878.1186855497},{"id":111,"x":-39.30001314415299,"y":-172.83489048917633,"z":561422.1847628553},{"id":112,"x":-57.287938515631716,"y":-172.83489048917636,"z":567393.7237243202},{"id":113,"x":-75.21774892135578,"y":-172.83489048917633,"z":568345.8304850186},{"id":114,"x":-86.88291831971273,"y":7.16510951082359,"z":562820.7844839338},{"id":115,"x":-68.97443454918644,"y":7.165109510823634,"z":550997.547755469},{"id":116,"x":-51.019791196880995,"y":7.165109510823638,"z":534806.7618288356},{"id":117,"x":-32.99854400660852,"y":7.165109510823655,"z":517459.9801344613},{"id":118,"x":-14.91532900571123,"y":7.165109510823652,"z":502528.60908408964},{"id":119,"x":3.20084323506982,"y":7.165109510823656,"z":492873.4948698661},{"id":120,"x":21.307289062734167,"y":7.16510951082366,"z":489811.2038811485},{"id":121,"x":39.36444796334064,"y":7.165109510823647,"z":492836.4587952638},{"id":122,"x":57.35143335070276,"y":7.165109510823653,"z":499994.7959067475},{"id":123,"x":75.27366222982722,"y":7.16510951082366,"z":508724.36538781464},{"id":124,"x":77.89726924845448,"y":-154.83489048917636,"z":520206.6231582517},{"id":125,"x":59.987281942815244,"y":-154.83489048917636,"z":525596.6626380592},{"id":126,"x":42.01947826399188,"y":-154.83489048917636,"z":529850.2829244765},{"id":127,"x":23.984133179032533,"y":-154.83489048917633,"z":534383.3657394296},{"id":128,"x":5.897351213980608,"y":-154.83489048917636,"z":540468.8247637762},{"id":129,"x":-12.205024738941056,"y":-154.83489048917636,"z":548443.995375131},{"id":130,"x":-30.281650677810617,"y":-154.83489048917636,"z":557305.4779615215},{"id":131,"x":-48.30216318590958,"y":-154.83489048917636,"z":564895.2112908624},{"id":132,"x":-66.25881639220849,"y":-154.83489048917633,"z":568621.2946693564},{"id":133,"x":-84.16886660337431,"y":-154.83489048917633,"z":566424.4077981354},{"id":134,"x":-77.9323732827836,"y":25.165109510823644,"z":557614.0406838063},{"id":135,"x":-60.00468628899497,"y":25.165109510823655,"z":543268.2202306542},{"id":136,"x":-42.01783433090739,"y":25.16510951082364,"z":526050.3592731053},{"id":137,"x":-23.96335974193342,"y":25.16510951082365,"z":509485.03755981225},{"id":138,"x":-5.858832161099312,"y":25.165109510823658,"z":496916.5359556289},{"id":139,"x":12.258035553006549,"y":25.16510951082365,"z":490508.4896953012},{"id":140,"x":30.34391207698931,"y":25.165109510823648,"z":490659.4209539189},{"id":141,"x":48.367007684649366,"y":25.16510951082365,"z":496056.4801611137},{"id":142,"x":66.31928492654636,"y":25.165109510823655,"z":504319.9416203195},{"id":143,"x":84.21888895956666,"y":25.165109510823676,"z":512950.9314784045},{"id":144,"x":68.94792932578382,"y":-136.83489048917636,"z":523113.73228796053},{"id":145,"x":51.01182166873888,"y":-136.83489048917636,"z":527784.1357537862},{"id":146,"x":33.009825124159136,"y":-136.83489048917636,"z":531988.5929728335},{"id":147,"x":14.94525624411585,"y":-136.83489048917636,"z":537181.6551402031},{"id":148,"x":-3.1545430845950295,"y":-136.83489048917636,"z":544250.6145117085},{"id":149,"x":-21.248886879917677,"y":-136.83489048917636,"z":552878.1186855474},{"id":150,"x":-39.300013144153,"y":-136.83489048917633,"z":561422.1847628554},{"id":151,"x":-57.287938515631716,"y":-136.83489048917633,"z":567393.7237243202},{"id":152,"x":-75.21774892135578,"y":-136.83489048917633,"z":568345.8304850169},{"id":153,"x":-86.88291831971273,"y":43.16510951082356,"z":562820.7844839337},{"id":154,"x":-68.9744345491864,"y":43.16510951082363,"z":550997.5477554702},{"id":155,"x":-51.019791196881044,"y":43.16510951082364,"z":534806.7618288338},{"id":156,"x":-32.998544006608526,"y":43.16510951082363,"z":517459.9801344609},{"id":157,"x":-14.915329005711234,"y":43.16510951082364,"z":502528.6090840882},{"id":158,"x":3.200843235069819,"y":43.16510951082366,"z":492873.49486986664},{"id":159,"x":21.307289062734167,"y":43.16510951082365,"z":489811.2038811485},{"id":160,"x":39.36444796334064,"y":43.16510951082365,"z":492836.4587952638},{"id":161,"x":57.35143335070276,"y":43.16510951082365,"z":499994.7959067465},{"id":162,"x":75.27366222982722,"y":43.16510951082367,"z":508724.3653878128},{"id":163,"x":86.83990580142135,"y":-136.83489048917644,"z":516813.01347919734},{"id":164,"x":59.987281942815244,"y":-118.83489048917636,"z":525596.6626380592},{"id":165,"x":42.01947826399188,"y":-118.83489048917636,"z":529850.2829244765},{"id":166,"x":23.984133179032533,"y":-118.83489048917636,"z":534383.3657394296},{"id":167,"x":5.897351213980611,"y":-118.83489048917636,"z":540468.8247637727},{"id":168,"x":-12.205024738941061,"y":-118.83489048917636,"z":548443.9953751283},{"id":169,"x":-30.281650677810617,"y":-118.83489048917635,"z":557305.4779615215},{"id":170,"x":-48.30216318590958,"y":-118.83489048917635,"z":564895.2112908624},{"id":171,"x":-66.2588163922085,"y":-118.83489048917635,"z":568621.2946693561},{"id":172,"x":-84.16886660337431,"y":-118.83489048917632,"z":566424.4077981353},{"id":173,"x":-77.9323732827836,"y":61.16510951082363,"z":557614.0406838064},{"id":174,"x":-60.00468628899498,"y":61.16510951082364,"z":543268.2202306536},{"id":175,"x":-42.01783433090739,"y":61.16510951082364,"z":526050.3592731053},{"id":176,"x":-23.963359741933424,"y":61.16510951082364,"z":509485.03755981097},{"id":177,"x":-5.858832161099312,"y":61.16510951082364,"z":496916.5359556282},{"id":178,"x":12.258035553006552,"y":61.16510951082364,"z":490508.48969530064},{"id":179,"x":30.34391207698931,"y":61.16510951082364,"z":490659.4209539171},{"id":180,"x":48.367007684649366,"y":61.165109510823655,"z":496056.4801611137},{"id":181,"x":66.31928492654636,"y":61.165109510823655,"z":504319.9416203195},{"id":182,"x":84.21888895956666,"y":61.16510951082369,"z":512950.93147840234},{"id":183,"x":77.89726924845446,"y":-118.83489048917639,"z":520206.6231582523},{"id":184,"x":51.01182166873889,"y":-100.83489048917636,"z":527784.1357537864},{"id":185,"x":33.009825124159136,"y":-100.83489048917635,"z":531988.5929728335},{"id":186,"x":14.945256244115853,"y":-100.83489048917636,"z":537181.655140201},{"id":187,"x":-3.154543084595031,"y":-100.83489048917636,"z":544250.6145117079},{"id":188,"x":-21.248886879917677,"y":-100.83489048917635,"z":552878.1186855497},{"id":189,"x":-39.30001314415299,"y":-100.83489048917636,"z":561422.1847628573},{"id":190,"x":-57.287938515631716,"y":-100.83489048917636,"z":567393.7237243202},{"id":191,"x":-75.21774892135578,"y":-100.83489048917635,"z":568345.8304850186},{"id":192,"x":-86.88291831971273,"y":79.16510951082361,"z":562820.7844839336},{"id":193,"x":-68.9744345491864,"y":79.16510951082365,"z":550997.547755472},{"id":194,"x":-51.019791196880995,"y":79.16510951082365,"z":534806.7618288356},{"id":195,"x":-32.998544006608576,"y":79.16510951082365,"z":517459.98013446183},{"id":196,"x":-14.915329005711227,"y":79.16510951082364,"z":502528.60908408853},{"id":197,"x":3.200843235069819,"y":79.16510951082365,"z":492873.4948698662},{"id":198,"x":21.307289062734164,"y":79.16510951082365,"z":489811.20388115075},{"id":199,"x":39.364447963340645,"y":79.16510951082365,"z":492836.45879526413},{"id":200,"x":57.35143335070276,"y":79.16510951082365,"z":499994.79590674647},{"id":201,"x":75.27366222982722,"y":79.16510951082365,"z":508724.3653878128},{"id":202,"x":86.83990580142134,"y":-100.83489048917639,"z":516813.0134791977},{"id":203,"x":68.9479293257839,"y":-100.83489048917636,"z":523113.7322879591}]}]}');
	console.log(testOutput);

	var output;

	var outputResults = function(outputIn) {
		go = false;
		output = outputIn;

		$('#step-total').text(output.events.length - 1);
		outputStep(1);

		getData();

		expandSimulationMenu();
	};

	var stepNumber = 0;

	var outputStep = function(increment) {
		stepNumber += increment;
		if (stepNumber >= output.events.length) stepNumber = 1;
		if (stepNumber < 1) stepNumber = output.events.length - 1;

		console.log('output step '+stepNumber);

		$('#step-num').text(stepNumber);
		$('#step-time').text(output.events[stepNumber].startSimulationTime);

		globe.applyOutput(
				output.events[stepNumber].satelliteData,
				output.rings,
				output.events[stepNumber].paths,
				output.groundStations,
				output.startTime
			);
	};

	var playing = false;

	var loopSteps = function() {
		outputStep(1);
		setTimeout(loopSteps, 1000);
	}

	var stopPlaying = function() {
		closeStats();
		$('.play-button-play-icon').show();
		$('.play-button-pause-icon').hide();
		$('#button-play .button-label').text('Play');
		playing = false;
		if (intervalID !== null)
			clearInterval(intervalID);
		intervalID = null;
	};

	$('#button-prev').on('click', function() {
		stopPlaying();
		outputStep(-1);
	});

	var intervalID = null;

	$('#button-play').on('click', function() {
		closeStats();
		if (!playing) {
			playing = true;
			$('.play-button-play-icon').hide();
			$('.play-button-pause-icon').show();
			$('#button-play .button-label').text('Pause');
			if (intervalID === null)
				intervalID = setInterval(function() {
					outputStep(1);
				}, 1000);
		}
		else {
			stopPlaying();
		}
	});

	$('#button-next').on('click', function() {
		stopPlaying();
		outputStep(1);
	});

	/* data */

	var stats = {};

	var getData = function() {
		var allPathDataKeys = Object.keys(output.events[1].paths[0]);
		var pathDataKeys = [];

		for (var i = 0; i < allPathDataKeys.length; i++) {
			if (output.events[1].paths[0][allPathDataKeys[i]].constructor !== Array) {
				stats[allPathDataKeys[i]] = {x: [], y: []};
				pathDataKeys.push(allPathDataKeys[i]);
			}
		}

		for (var k = 0; k < pathDataKeys.length; k++) {
			var key = pathDataKeys[k];

			for (var e = 1; e < output.events.length; e++) {
				stats[key].x.push(output.events[e].startSimulationTime);
				stats[key].y.push(0);

				for (var p = 0; p < output.events[e].paths.length; p++) {
					stats[key].y[stats[key].y.length-1] += output.events[e].paths[p][key];
				}
			}
		}

		console.log(stats);

		makeCharts();
	};

	var makeCharts = function() {
		var statKeys = Object.keys(stats);
		var charts = [];

		for (var i = 0; i < statKeys.length; i++ ){
			var min = Math.min.apply(this, stats[statKeys[i]].y);
			var max = Math.max.apply(this, stats[statKeys[i]].y);

			var adjustment = Math.round((max - min) / 10);

			min -= adjustment;
			max += adjustment;

			$('#stats .stats-inner').append('<div class="chart-container section"><canvas id="chart'+i+'" width="500px" height="300px"></canvas></div>');

			var ctx = "chart"+i;
			charts.push(new Chart(ctx, {
			    type: 'bar',
			    data: {
			        labels: stats[statKeys[i]].x,
			        xAxisID: 'Time (s)',
			        datasets: [{
			            label: statKeys[i],
			            data: stats[statKeys[i]].y,
			            backgroundColor: 'rgba(244, 66, 66, 1)'
			        }]
			    },
			    options: {
			        scales: {
			            yAxes: [{
			                ticks: {
			                    suggestedMin: min,
			                    suggestedMax: max
			                }
			            }]
			        }
			    }
			}));
		}
	};

	$('#view-stats').on('click', function() {
		$('body').addClass('stats-open');
	});

	var closeStats = function() {
		$('body').removeClass('stats-open');
	};

	$('#close-stats').on('click', function() {
		closeStats();
	});
});