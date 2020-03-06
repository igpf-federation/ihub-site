define(["locations/marker-icons"], function(markerIcons) {
	var Panel = storeLocator.Panel;
	var CustomPanel = function(el, opt_options) {
		Panel.call(this, el, opt_options, arguments);
	};
	CustomPanel.prototype = Object.create(Panel.prototype);
	CustomPanel.prototype.constructor = CustomPanel;	

	//CustomPanel.prototype.init_ = function() {
	var newInit = function() {
		var that = this;
		this.itemCache_ = {};
		this.storesFound = false;

		if (this.settings_['view']) this.set('view', this.settings_['view']);
		if (this.settings_['address']) this.address_ = this.settings_['address'];
		if (this.settings_['geo']) this.geo_ = this.settings_['geo'];
		if (this.settings_['gp']) this.gp_ = this.settings_['gp'];
		if (this.settings_['show_ihub']) this.show_ihub_ = this.settings_['show_ihub'];
		
		this.container_ = $(".container-map");
		this.panelSearch_ = $('<div class="panel-search"/>');
		this.panelContent_ = $('<div class="panel-content"/>');
		this.panelContent_.append($('<div class="call-reminder tile"></div>'));

		////////////////////////////////////////
		//// ---- DELETE THIS FOR PROD ---- ////
		//// ---- \/ \/ \/ \/ \/ \/ \/ ---- ////
		////////////////////////////////////////

		this.panelContent_.find(".call-reminder").click(function() {
			$(this).toggleClass("not-blue");
		})

		////////////////////////////////////////
		//// ---- /\ /\ /\ /\ /\ /\ /\ ---- ////
		//// ---- DELETE THIS FOR PROD ---- ////
		////////////////////////////////////////


		this.el_.append(this.panelSearch_);
		this.el_.append(this.panelContent_);

		this.filter_ = $('<form class="storelocator-filter"/>');
		this.panelSearch_.append(this.filter_);

		if (this.settings_['locationSearch']) {
			this.locationSearch_ = $('<div class="location-search"><input></div>');
			if (this.address_) this.locationSearch_.find("input").val(this.address_);
			this.searchBtn_ = $('<button class="search-button"><i class="fa fa-search"></i></button>');
			this.geoBtn_ = $('<button type="button" class="geo-btn"><div class="gps-icon"><i class="fa fa-compass"></i></div><span>Find my current location</span></button>');
			var view = this.get('view');

			var geoClickHandler = function() {
				//console.log('function: geoClickHandler');
				//view.geolocate_();

				if (window.navigator && navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(pos) {
						var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
						that.locationSearch_.find("input").val("My location ("+pos.coords.latitude.toFixed(2)+", "+pos.coords.longitude.toFixed(2)+")");
						google.maps.event.trigger(that, 'geocode', loc);
					}, undefined, /** @type GeolocationPositionOptions */({
						maximumAge: 60 * 1000,
						timeout: 10 * 1000
					}));
				}
			};

			this.geoBtn_[0].clickHandler_ = google.maps.event.addDomListener(
				this.geoBtn_[0], 'click', geoClickHandler);

			this.locationSearch_.append(this.searchBtn_);
			this.searchBtn_.click(function() {
				var search = $(that.locationSearch_).find('input').val();
				that.searchPosition(/** @type {string} */(search));
			})

			this.filter_.append(this.locationSearch_);
			this.filter_.append(this.geoBtn_);

			if (typeof google.maps.places != 'undefined') {
				this.initAutocomplete_();
			} else {
				this.filter_.submit(function() {
					var search = $(that.locationSearch_).filter('input').val();
					that.searchPosition(/** @type {string} */(search));
				});
			}
			this.filter_.submit(function() {
				return false;
			})

			google.maps.event.addListener(this, 'geocode', function(place) {
				//console.log("function: geocode listener");
				if (typeof place.lat === 'function') {
					var location = place;
					place = {
						geometry: {
							location: location
						}
					}
				}

				if (!place.geometry) {
					that.searchPosition(place.name);
					return;
				}

				that.directionsFrom_ = place.geometry.location;
				that.getStoreDistances(place.geometry.location);
				that.placeOriginMarker(place.geometry.location);
				that.get('view').originPos_ = place.geometry.location;

				if (that.directionsVisible_) {
					//console.log("renderDirections in geocode listener");
					that.renderDirections_();
				}
				var sl = that.get('view');
				sl.highlight(null);
				var map = sl.getMap();
				if (false && place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
					map.setZoom(14);
				}
				sl.refreshView();
				that.listenForStoresUpdate_();
			});
		}

		if (this.settings_['featureFilter']) {
			// TODO(cbro): update this on view_changed
			this.featureFilter_ = $('<div class="feature-filter"/>');
			var allFeatures = this.get('view').getFeatures().asList();
			for (var i = 0, ii = allFeatures.length; i < ii; i++) {
				var feature = allFeatures[i];
				var checkbox = $('<input type="radio" name="feature-radio" id="radio-'+feature.getId()+'"'+(false ? 'checked="checked"' : '')+'/>');
				checkbox.data('feature', feature);
				$('<div/>').append(checkbox).append('<label for="radio-'+feature.getId()+'"><span>'+feature.getDisplayName()+'</span></label>')
					.appendTo(this.featureFilter_);
			}
			this.filter_.append(this.featureFilter_);
			this.featureFilter_.find('input').change(function() {
				var feature = $(this).data('feature');
				//that.toggleFeatureFilter_(/** @type {storeLocator.Feature} */(feature));

				var featureFilter = that.get('featureFilter');
				featureFilter.remove(allFeatures[0]);
				featureFilter.remove(allFeatures[1]);
				//$(this).prop('checked') ? featureFilter.add(feature) : featureFilter.remove(feature);
				that.container_.removeClass("show-ihub show-gp");
				if ($(this).prop('checked')) {
					featureFilter.add(feature);
					that.container_.addClass("show-"+feature.getId());
				} else {
					featureFilter.remove(feature);
					that.container_.removeClass("show-"+feature.getId());
				}
				that.set('featureFilter', featureFilter);
				that.get('view').refreshView();
			});
			// this.featureFilter_.find('input').first().prop('checked', true).trigger('change');
		};


		$(window).resize(function() {
			that.panelSearchOH_ = that.panelSearch_.outerHeight();
		});

		this.panelContent_.css("top", this.getPanelSearchOH());

		this.storeList_ = $('<ul class="store-list"/>');
		this.panelContent_.append(this.storeList_);

		if (this.settings_['directions']) {
			this.directionsRenderer_.setOptions( { suppressMarkers: true } );
			this.directionsPanel_ = $('<div class="directions-panel"><form>' +
					'<input class="directions-to"/>' +
					'<input type="submit" value="Find directions"/>' +
					'<button type="button" class="close-directions">Close</button>' +
					'</form><div class="rendered-directions tile"></div></div>');
			this.directionsPanel_.find('.directions-to').attr('readonly', 'readonly');
			this.directionsPanel_.hide();
			this.directionsVisible_ = false;
			this.directionsPanel_.find('form').submit(function() {
				//console.log("renderDirections in form submit");
				//if (!this.directionsFrom_) alert("Please enter a start point to get directions");
				that.renderDirections_();
				return false;
			});
			this.directionsPanel_.find('.close-directions').click(function() {
				that.hideDirections();
			});
			this.panelSearch_.append(this.directionsPanel_);
		}

		this.panelContent_.scroll(function() {
			if ($(this).scrollTop() > 0) {
				that.panelSearch_.addClass('shadow');
			} else {
				that.panelSearch_.removeClass('shadow');
			}
		});

		this.originMarker = new google.maps.Marker({
			position: new google.maps.LatLng(51.5074, -0.1278),
			map: null,
			icon: markerIcons.me,
			zIndex: 100,
			optimized: false,
		});

		if (this.address_) {
			this.searchPosition(this.address_);
		} else if (this.geo_) {
			geoClickHandler();
		}
	};

	CustomPanel.prototype.init_ = newInit;

	CustomPanel.prototype.getPanelSearchOH = function() {
		if (!this.panelSearchOH_) this.panelSearchOH_ = this.panelSearch_.outerHeight();
		return this.panelSearchOH_;
	}

	CustomPanel.prototype.hideDirections = function() {
		//console.log('function: hideDirections');
		this.directionsVisible_ = false;
		this.directionsPanel_.hide();
		this.featureFilter_.show();
		this.storeList_.show();
		this.container_.removeClass('show-directions');
		this.locationSearch_.find("input").attr("placeholder", "Enter a location");
		this.directionsRenderer_.setMap(null);
	};

	/**
	 * Shows directions to the selected store.
	 */
	CustomPanel.prototype.showDirections = function() {
		//console.log('function: showDirections');
		var store = this.get('selectedStore');
		this.featureFilter_.hide();
		this.storeList_.hide();
		this.directionsPanel_.find('.directions-to').val(store.getId());
		this.directionsPanel_.show();
		this.container_.addClass('show-directions');
		this.showPanel();
		//console.log("renderDirections in showDirections");
		this.renderDirections_();
		this.locationSearch_.find("input").attr("placeholder", "Enter starting point");
		this.directionsVisible_ = true;
	};

	CustomPanel.prototype.renderDirections_ = function() {
		//console.log('function: renderDirections');
		var that = this;
		if (!this.directionsFrom_) {
			console.log("WARNING: !directionsFrom_");
			return;
		}
		if (!this.directionsTo_) {
			console.log("WARNING: !directionsTo_");
			return;
		}
		var rendered = this.directionsPanel_.find('.rendered-directions');
		//rendered.empty();


		this.directionsService_.route({
			origin: this.directionsFrom_,
			destination: this.directionsTo_.getLocation(),
			travelMode: google.maps['DirectionsTravelMode'].DRIVING
			//TODO(cbro): region biasing, waypoints, travelmode
		}, function(result, status) {
			//console.log("directions result, status: "+status)
			if (status != google.maps.DirectionsStatus.OK) {
				// TODO(cbro): better error handling
				return;
			}

			var renderer = that.directionsRenderer_;
			renderer.setPanel(rendered[0]);
			renderer.setMap(that.get('view').getMap());
			renderer.setDirections(result);
		});
	};

	CustomPanel.NO_STORES_HTML_= '<li class="no-stores">An unexpected error occurred. Please wait for stores to load.</li>';
	CustomPanel.NO_STORES_IN_VIEW_HTML_= '<li class="no-stores">There\'s nothing in this area. Please zoom out.</li>';

	CustomPanel.prototype.showPanel = function() {
		if (window.bp.xs) {
			this.container_.addClass("show-panel");
			this.container_.find(".panel-content").fadeIn(200);
			this.container_.filter(".show-directions").find(".panel-search").fadeIn(200);
		}			
	};

	CustomPanel.prototype.hidePanel = function() {
		if (window.bp.xs) {
			this.container_.removeClass("show-panel");
			this.container_.find(".panel-content").fadeOut(200);
			this.container_.filter(".show-directions").find(".panel-search").fadeOut(200);
		}
	};

	CustomPanel.prototype.getStoreDistances = function(loc) {
		//console.log('function: getStoreDistances');
		// console.log('getStoreDistances.loc: '+loc.lat()+', '+loc.lng());
		if (!this.get('stores') || !loc) {
			return;
		}
		var stores = this.get('stores');
		for (var i = 0; i < stores.length; i++) {
			var store = stores[i];
			var dist = store.distanceTo(loc).toFixed(1);
			var slug = store.getDetails().slug;
			$("ul.store-list").find("."+slug).find(".distance-wrapper").show().find(".distance").text(dist+" km");
			$(".gm-style-iw").find("."+slug).find(".distance-wrapper").show().find(".distance").text(dist+" km");
		}
	};

	CustomPanel.prototype.placeOriginMarker = function(pos) {
		this.originMarker.setMap(null);
		this.originMarker = new google.maps.Marker({
			position: pos,
			map: this.get('view').getMap(),
			icon: markerIcons.me,
			zIndex: 100,
			optimized: false,
		});
	}

	CustomPanel.prototype.stores_changed = function() {
		// console.log('function: stores_changed');
		if (!this.get('stores')) {
			return;
		}

		var view = this.get('view');
		var bounds = view && view.getMap().getBounds();

		var that = this;
		var stores = this.get('stores');
		var selectedStore = this.get('selectedStore');
		this.storeList_.empty();

		if (!stores.length) {
			this.storeList_.append(this.NO_STORES_HTML_);
		} else if (bounds && !bounds.contains(stores[0].getLocation())) {
			this.storeList_.append(this.NO_STORES_IN_VIEW_HTML_);
		}

		var showOnMapHandler = function() {
			//console.log(this);
			view.highlight(this['store'], true, that);
			that.hidePanel();
		};

		var showDirectionsHandler = function() {
			//console.log(this);
			var store = this['store'];
			// view.highlight(store, true, that);
			view.set('selectedStore', store)
			that.directionsTo_ = store;
			that.directionsPanel_.find('.directions-to').val(store.getId());
			that.showDirections();
		};

		// TODO(cbro): change 10 to a setting/option
		for (var i = 0, ii = Math.min(100, stores.length); i < ii; i++) {
			var storeLi = stores[i].getInfoPanelItem();
			storeLi['store'] = stores[i];
			if (selectedStore && stores[i].getId() == selectedStore.getId()) {
				$(storeLi).addClass('highlighted');
			};

			var showMapBtns = [
				storeLi.querySelectorAll('p.map-show span')[0],
				storeLi.querySelectorAll('p.distance-wrapper > span')[0],
				storeLi.querySelectorAll('h2')[0]
			];

			for (var j = 0; j < 3; j++) {
				var storeLiBtn = showMapBtns[j];
				storeLiBtn['store'] = stores[i];
				if (!storeLiBtn.clickHandler_) {
					storeLiBtn.clickHandler_ = google.maps.event.addDomListener(
						storeLiBtn, 'click', showOnMapHandler);
				};
			};

			var showDirBtn = storeLi.querySelectorAll('p.directions-show span, .btn.phone.directions-show')[0];
			if (showDirBtn) {
				showDirBtn['store'] = stores[i];
				if (!showDirBtn.clickHandler_) {
					showDirBtn.clickHandler_ = google.maps.event.addDomListener(
						showDirBtn, 'click', showDirectionsHandler);
				};
			}			

			that.storeList_.append(storeLi);
		}

		that.getStoreDistances(that.originMarker.getPosition());

		if (this.gp_) {
			for (var i = 0; i < stores.length; i++) {
				var store = stores[i];
				if (store.getIdSlug() === this.gp_) {
					// console.log(store.getId());
					showDirectionsHandler.call({ store: store });
					this.gp_ = false;
				}
			}
		}

		// ONLY ON FIRST TIME
		if (!this.storesFound) {
			this.storesFound = true;
			// this.getStoreDistances(this.originMarker.getPosition());

			// if (this.gp_) {
			// 	for (var i = 0; i < stores.length; i++) {
			// 		var store = stores[i];
			// 		if (store.getIdSlug() === this.gp_) {
			// 			// console.log(store.getId());
			// 			showDirectionsHandler.call({ store: store });
			// 		}
			// 	}
			// }

			// selected radio
			sr = this.show_ihub_ ? this.featureFilter_.find('#radio-ihub') : this.featureFilter_.find('#radio-gp');
			sr.prop('checked', true).trigger('change');
		}
	};

	CustomPanel.prototype.selectedStore_changed = function() {
		$('.highlighted', this.storeList_).removeClass('highlighted');

		var that = this;
		var store = this.get('selectedStore');
		if (!store) {
			return;
		}
		this.directionsTo_ = store;
		this.storeList_.find('#store-' + store.getIdSlug()).addClass('highlighted');

		if (this.settings_['directions']) {
			this.directionsPanel_.find('.directions-to').val(store.getId());
		}

		$(that.get('view').getInfoWindow().getContent()).find("p.directions-show span, .btn.phone.directions-show").click(function() {
			that.showDirections();
		});
	};

	CustomPanel.prototype.searchPosition = function(searchText) {
		var that = this;
		var request = {
			address: searchText,
			bounds: this.get('view').getMap().getBounds()
		};
		storeLocator.geocoder_.geocode(request, function(result, status) {
			if (status != google.maps.GeocoderStatus.OK) {
				//TODO(cbro): proper error handling
				return;
			}
			google.maps.event.trigger(that, 'geocode', result[0]);
			console.log(result[0].formatted_address);
		});
	};

	return CustomPanel;

});