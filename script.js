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
    wwd.addLayer(new WorldWind.BingAerialWithLabelsLayer());

    wwd.addLayer(new WorldWind.CompassLayer());
    wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

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
