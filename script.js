$(document).ready(function () {
	var loading = false;

	$('#test-button').click(function() {
		if (!loading) {
			$('#test-loading').css('display','block');

			$.getJSON('http://127.0.0.1:5000/python/simulator',
				function(data, textStatus, jqXHR) {
					console.log(data);
					$('#test-loading').css('display','none');
				}
			);
		}
	});
});