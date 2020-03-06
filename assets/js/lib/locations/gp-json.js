require(["locations/GPDataFeed"], function(GPDataFeed) {
	console.log(1);
	var data = new GPDataFeed;	
	setTimeout(function() {
		console.log(data);
		var json = data.JSON;
		console.log(json);
		console.log(data.getJSON());
		$("body").text(json);
	}, 500);
});