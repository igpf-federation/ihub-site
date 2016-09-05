require(["locations/marker-icons"], function(markerIcons) {

	var mapWrapper = $(".iframe-wrapper");
	var el = mapWrapper[0];
	var map = new google.maps.Map(el, {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	var markers = new Array(3);
	var links = new Array(3);
	var bounds = new google.maps.LatLngBounds();

	for (var i = 1; i <= 3; i++) {
		var ii = i.toString();
		var lat = mapWrapper.data(ii+"-lat");
		var lng = mapWrapper.data(ii+"-lng");
		links[i] = mapWrapper.data(ii+"-link");
		var latLng = new google.maps.LatLng(lat, lng);

		markers[i] = new google.maps.Marker({
			position: latLng,
			map: map,
			icon: markerIcons.ihub
		});;

		google.maps.event.addListener(markers[i], 'click', function(num) {
			return function() {
				window.location.href = links[num];
			}
		}(i));

		bounds.extend(latLng);
	}

	map.fitBounds(bounds);
});