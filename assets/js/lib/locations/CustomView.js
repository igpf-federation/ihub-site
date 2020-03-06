define(["locations/marker-icons"], function(markerIcons) {
	var View = storeLocator.View;
	var CustomView = function(map, data, opt_options) {
		View.call(this, map, data, opt_options, arguments);
	};
	CustomView.prototype = Object.create(View.prototype);
	CustomView.prototype.constructor = CustomView;

	CustomView.prototype.init_ = function() {
		if (this.settings_['geolocation']) {
			this.geolocate_();
		}
		this.markerCache_ = {};
		this.infoWindow_ = new google.maps.InfoWindow;
		this.infoWindow_.setOptions({
			disableAutoPan : true
		});

		var that = this;
		var map = this.getMap();

		this.set('updateOnPan', this.settings_['updateOnPan']);

		google.maps.event.addListener(this.infoWindow_, 'closeclick', function() {
			that.highlight(null);
		});

		google.maps.event.addListener(map, 'click', function() {
			that.highlight(null);
			that.infoWindow_.close();
		});
	};

	CustomView.prototype.highlight = function(store, opt_pan, panel) {
		var infoWindow = this.getInfoWindow(store);

		if (store) {
			var infoWindow = this.getInfoWindow(store);
			
			if (store.getMarker()) {
				infoWindow.open(this.getMap(), store.getMarker());
			} else {
				infoWindow.setPosition(store.getLocation());
				infoWindow.open(this.getMap());
			}

			if (opt_pan) {
				var offset = 50 + ((panel ? panel.getPanelSearchOH() : $(".panel-search").outerHeight()) / 2);
					this.getMap().panTo(store.getLocation());
					if(window.bp.xs) this.getMap().panBy(0, -offset);
			}

			if (this.getMap().getStreetView().getVisible()) {
				this.getMap().getStreetView().setPosition(store.getLocation());
			}
		} else {
			infoWindow.close();
		}

		this.set('selectedStore', store);
	};

	CustomView.prototype.addStoreToMap = function(store) {
		var marker = this.getMarker(store);
		store.setMarker(marker);
		var that = this;

		marker.clickListener_ = google.maps.event.addListener(marker, 'click',
				function() {
					that.highlight(store, true);
				});

		if (marker.getMap() != this.getMap()) {
			marker.setMap(this.getMap());
		}
	};

	CustomView.prototype.refreshView = function() {
		var that = this;

		var from = !!this.originPos_ ? new google.maps.LatLngBounds(this.originPos_, this.originPos_) : this.getMap().getBounds();

		this.data_.getStores(from,
			/** @type {storeLocator.FeatureSet} */ (this.get('featureFilter')),
			function(stores) {
				var oldStores = that.get('stores');
				if (oldStores) {
					for (var i = 0, ii = oldStores.length; i < ii; i++) {
						google.maps.event.removeListener(
								oldStores[i].getMarker().clickListener_);
					}
				}
				that.set('stores', stores);
			}
		);
	};

	CustomView.prototype.createMarker = function(store) {
		//console.log(store.getId(), store.getFeatures().getById("ihub"));
		var markerOptions = {
			position: store.getLocation()
		};
		if (store.getFeatures().getById("ihub")) markerOptions.icon = markerIcons.ihub;
		if (store.getFeatures().getById("gp")) markerOptions.icon = markerIcons.gp;
		var opt_icon = this.settings_['markerIcon'];
		if (opt_icon) {
			markerOptions.icon = opt_icon;
		}
		return new google.maps.Marker(markerOptions);
	};

	return CustomView;
});