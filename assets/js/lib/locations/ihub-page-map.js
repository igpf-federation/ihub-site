require(["locations/marker-icons"], function(markerIcons) {

	var mapWrapper = $(".iframe-wrapper");
	var el = mapWrapper[0];
	var lat = mapWrapper.data("lat");
	var lng = mapWrapper.data("lng");
	var latLng = new google.maps.LatLng(lat, lng);

	// console.log(el);
	// console.log(lat);
	// console.log(lng);
	// console.log(latLng);

	var map = new google.maps.Map(el, {
		center: latLng,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var marker = new google.maps.Marker({
		position: latLng,
		map: map,
		icon: markerIcons.ihub
	});
});