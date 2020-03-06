$(function() {
	var input = $("input#input-gp-search")[0];
	var ac = new google.maps.places.Autocomplete(input);
	ac.setBounds({
		north: 51.7,
		south: 51.2,
		west: -0.5,
		east: 0.3
	});
	google.maps.event.addListener(ac, "place_changed", function() {
		//console.log(this.getPlace().formatted_address);
		window.location = "/map/?loc="+this.getPlace().formatted_address;
	});

	var $geoBtn = $("button.button-gp-search");
	$geoBtn.click(function() {
		//console.log("yas biatch");
		window.location = "/map/?geo=1"
	})

	//window.location = url;
});