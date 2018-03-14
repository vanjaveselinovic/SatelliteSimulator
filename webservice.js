var loading = false;

var load = function(params) {
	if (params === undefined) params = {};

	$('.loader').css('display','block');
	loading = true;
};

var endLoad = function() {
	loading = false;
	$('.loader').css('display','none');
}

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

var WebService = function(params) {
	if (params === undefined) params = {};

	this.postWithData = function(url, dataIn, success) {
		if (!loading) {
			load();

			$.ajax({
				url: url,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(dataIn),
				dataType: 'json'
			})
				.done(function(data, textStatus, jqXHR) {
					endLoad();
					console.log(data);
					success();
				})
				.fail(function() {
					endLoad();
					console.log('error');
					$('#sim-menu .subtitle').append('<span style="color: red"> failed</span>');
				});
		}
	}

	this.request = function(url, successByDone, failByDone) {
		if (!loading) {
			load();

			$.getJSON(url)
				.done(function(data, textStatus, jqXHR) {
					endLoad();
					console.log(data);
					if (data.done === true) successByDone();
					else failByDone();
					$('.loader').css('display','none');
				})
				.fail(function() {
					endLoad();
					console.log('error');
					$('.loader').css('display','none');
				});
		}
	}

	this.requestWithQuery = function(url, queryParams, success, fail) {
		if (!loading) {
			load();

			$.getJSON(url+'?'+formatQuery(queryParams))
				.done(function(data, textStatus, jqXHR) {
					endLoad();
					console.log(data);
					$('.loader').css('display','none');
				})
				.fail(function() {
					endLoad();
					console.log('error');
					$('.loader').css('display','none');
				});
		}
	}
};