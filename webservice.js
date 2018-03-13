var loading = false;

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

	this.postWithData = function(url, dataIn) {
		if (!loading) {
			$('.loader').css('display','block');
			loading = true;

			$.ajax({
				url: url,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(dataIn),
				dataType: 'json'
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
	}

	this.requestWithQuery = function(url, queryParams) {
		if (!loading) {
			$('.loader').css('display','block');
			loading = true;

			$.getJSON(url+'?'+formatQuery(queryParams))
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
	}
};