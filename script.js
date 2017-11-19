$(document).ready(function () {
	var loading = false;

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
