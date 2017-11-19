$(document).ready(function () {
	var loading = false;

	$('#test-button').click(function() {
		if (!loading) {
			$('#test-loading').css('display','block');
			loading = true;

			$.getJSON('http://127.0.0.1:5000/python/simulator',
				{
					 packetSize: 1024
				})
				.done(function(data, textStatus, jqXHR) {
					loading = false;
					console.log(data);
					$('#test-loading').css('display','none');
				})
				.fail(function() {
					loading = false;
					console.log('error');
					$('#test-loading').css('display','none');
				});
		}
	});
});
