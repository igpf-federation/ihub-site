require(["locations/GPDataFeed", "locations/CustomPanel", "locations/CustomView"], function(GPDataFeed, CustomPanel, CustomView) {
	var qs = function(name) {
		var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	}

	$('body').on('click', 'p.details-show span', function(event) {
		$(this).parent().toggleClass('show');
	});

	var init = function() {
		var address = qs('loc');
		var geo = !!qs('geo');
		var gp = qs('gp');
		var show_ihub = !!qs('ihub');
		initMap({
			defaultCenter: new google.maps.LatLng(51.549, -0.107),
			zoom: 13,
			address: address,
			geo: geo,
			gp: gp,
			show_ihub: show_ihub
		});
	}

	var initMap = function(opts) {
		var defaultCenter = opts.defaultCenter;
		var zoom = opts.zoom;
		var address = opts.address;
		var geo = opts.geo;
		var gp = opts.gp;
		var show_ihub = opts.show_ihub;

		var map = new google.maps.Map(document.getElementById('map-canvas'), {
			center: defaultCenter,
			zoom: zoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		});

		map.smoothZoom = function(max, cnt) {
			var cnt = (typeof cnt !== 'undefined') ?  cnt : this.getZoom();
			if (cnt >= max) {
		        return;
		    }
		    else {
		        z = google.maps.event.addListener(this, 'zoom_changed', function(event){
		            google.maps.event.removeListener(z);
		            smoothZoom(this, max, cnt + 1);
		        });
		        setTimeout(function(){this.setZoom(cnt)}, 500); // 80ms is what I found to work well on my system -- it might not work well on all systems
		    }
		}

		var panelDiv = document.getElementById('panel');
		var data = new GPDataFeed;
		var view = new CustomView(map, data, {
			geolocation: false,
			features: data.getFeatures()
		});

		var panel = new CustomPanel(panelDiv, {
			view: view,
			address: address,
			geo: geo,
			gp: gp,
			show_ihub: show_ihub
		});
		

		$("#show-panel-btn").click(function() {
			console.log($(event.target));
			$(event.target).closest(".container-map").hasClass("show-panel") ? panel.hidePanel() : panel.showPanel();
		});
	}

	init();
});
