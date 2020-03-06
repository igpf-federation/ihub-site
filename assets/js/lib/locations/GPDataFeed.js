// make  a storeLocator.staticDataFeed

define(["locations/togeojson"], function(toGeoJSON) {
	function GPDataFeed() {
		$.extend(this, new storeLocator.StaticDataFeed);

		var that = this;
		$.get('/map/hubs.kml', function(kml) {
			// var json = that.parseJSON(kml);
			// var stores = that.parseStores(json);
			// that.setStores(stores);
			var json = that.getJsonFromGeoJson(that.getGeoJsonFromKml(kml));
			that.setStores(that.getStoresFromJson(json));
			that.getJSON = function() {
				return that.getStringFromJson(that.addDistancesToJSON(json));
			};
			that.JSON = that.getJSON();			
		});
	};

	GPDataFeed.prototype.FEATURES_ = new storeLocator.FeatureSet(
		new storeLocator.Feature('ihub', 'Show I:HUBs'),
		new storeLocator.Feature('gp', 'Show GPs')
	);

	GPDataFeed.prototype.getFeatures = function() {
		return this.FEATURES_;
	};

	GPDataFeed.prototype.getGeoJsonFromKml = function(kml) {
		return toGeoJSON.kml(kml);
	}

	GPDataFeed.prototype.getJsonFromGeoJson = function(geojson) {
		var input = geojson.features;
		var output = [];

		for (var i = 0; i < input.length; i++) {
			var gpIn = input[i];
			var gpOut = {};

			var coords = gpIn.geometry.coordinates;
			var latLng = new google.maps.LatLng(coords[1], coords[0]);
			var name = gpIn.properties.name;
			var desc = gpIn.properties.description;
			var slug = (name + coords[0] + coords[1]).toLowerCase(0).replace(/[^\w]/g,'');
			var props = { title: name, slug: slug };
			if (desc) {
				var descArr = desc.split("<br>");
				for(var j = 0; descArr[j]; j++) {
					if(descArr[j].indexOf(',') !== -1) props.address = descArr[j];
					if(descArr[j].indexOf('www') !== -1) props.web = descArr[j];
					if(descArr[j].indexOf('+44') !== -1) props.phone = descArr[j];
				}
			};
			var is_ihub = 'Andover Medical Centre Ritchie Street Group Practice Islington Medical Centre'.indexOf(name) !== -1;
			gpOut = {
				name: name,
				latLng: latLng,
				props: props,
				is_ihub: is_ihub
			};
			output.push(gpOut);
		};
		return output;
	};

	GPDataFeed.prototype.addDistancesToJSON = function(json) {
		var gps = json;
		var gpstores = {};
		var ihubs = [];
		for (var i = 0; i < gps.length; i++) {
			//console.log(gps[i]);
			if (gps[i].is_ihub) ihubs.push(gps[i]);
			var store = new storeLocator.Store(gps[i].name, gps[i].latLng, null, null);
			gpstores[gps[i].props.slug] = store;
		}

		for (var i = 0; i < gps.length; i++) {
			gps[i].distances = {};
			var distances = [];
			for (var j = 0; j < ihubs.length; j++) {
				distances.push({
					name: ihubs[j].name,
					distance: gpstores[gps[i].props.slug].distanceTo(ihubs[j].latLng).toFixed(1)
				});
			};
			distances.sort(function(a, b) {
				if (a.distance > b.distance) return 1;
				if (a.distance == b.distance) return 0;
				if (a.distance < b.distance) return -1;
			});
			for (var j = 0; j < distances.length; j++) {
				gps[i].distances[j.toString()] = distances[j];
			}
		}
		return gps;
	}

	GPDataFeed.prototype.getStringFromJson = function(json) {
		return JSON.stringify(json);
	};

	GPDataFeed.prototype.getStoresFromJson = function(json) {
		var stores = [];

		var getInfoWindowContent = function() {
			if (!this.content_) {
				var is_ihub = !!this.getFeatures().getById('ihub');
				// console.log(this.props_["title"], this.getFeatures());
				//console.log(this.props_["title"], is_ihub);
		        var a = ['<div class="store '+(is_ihub ? 'ihub' : '')+' '+this.props_["slug"]+'" id="'+this.props_["slug"]+'">'];	
		        a.push("<h2>"+(false ? '<span class="ihub">I:HUB</span> ' : '')+this.getId()+"</h2>");
		        a.push('<p class="distance-wrapper"><span><i class="fa fa-fw fa-location-arrow" aria-hidden="true"></i> <span class="distance"></span> away</span></p>');
		        //a.push('<p class="directions-show"><span><i class="fa fa-fw fa-compass" aria-hidden="true"></i> Get directions</span></p>');
		        if(!is_ihub) a.push('<p class="call-reminder-on-marker"></p>');		        
		        a.push('<p class="map-show"><span><i class="fa fa-fw fa-map-marker" aria-hidden="true"></i> Show on map</span></p>');
		        a.push('<p class="details-show"><span>'
		        	+'<i class="fa fa-fw fa-plus show-more" aria-hidden="true"></i> <span class="show-more">Show more details</span>'
		        	+'<i class="fa fa-fw fa-minus show-less" aria-hidden="true"></i> <span class="show-less">Show less details</span>'
		        	+'</span></p>');

		        a.push('<div class="more-details">');
		        a.push('<p class="address"><i class="fa fa-fw fa-home" aria-hidden="true"></i> '+this.props_["address"].replace(", UK","").replace(/, /g,",<br>")+'</p>');
		        if (this.props_["web"] && !is_ihub) a.push('<p class="web"><i class="fa fa-fw fa-globe" aria-hidden="true"></i> <a href="//'+this.props_["web"]+'">'+this.props_["web"]+'</a></p>');
		        a.push('<p class="more-info"><i class="fa fa-fw fa-info-circle" aria-hidden="true"></i> <a href="'+(is_ihub ? '/ihub/' : '/gp/')+this.getId().replace(/ /g,'-').replace(/[^0-9a-zA-Z_\-]/g,'').replace('IHUB--','').toLowerCase()+'">More information</a></p>');
		        //console.log(this.getId().replace(/ /g,'-').replace(/[^0-9a-zA-Z_\-]/g,''));
		        a.push('<p class="external"><i class="fa fa-fw fa-link" aria-hidden="true"></i> <a href="https://www.google.com/maps/search/'+this.props_["title"].replace(/ /g,'+').replace(/[^0-9a-zA-Z_\+]/g,'').toLowerCase()+'">Open in Google Maps</a></p>');
		        a.push("</div>");

		        if (!is_ihub && this.props_["phone"]) a.push('<a href="tel:'+this.props_["phone"]+'" class="phone btn"><i class="fa fa-phone" aria-hidden="true"></i> '+this.props_["phone"].replace("+44 ","0")+'</a>');
		        if (is_ihub) a.push('<a class="phone btn directions-show"><i class="fa fa-compass" aria-hidden="true"></i> Get directions</a>');
		        a.push("</div>");
		        this.content_ = a.join("");
		    }
		    return this.content_;
		}

		var getInfoPanelItem = function() {
			// console.log("function: getInfoPanelItem");
			var cache = storeLocator.Store.infoPanelCache_;
			var store = this;
			var key = store.getId();
			if (!cache[key]) {
				var content = store.getInfoPanelContent();
				var is_ihub = !!this.getFeatures().getById('ihub') ? 'ihub' : '';
				cache[key] = $('<li class="store tile' + (false ? ' color-bar' : '') + '" id="store-' + store.getId() +
					'">' + content + '</li>')[0];
			}
			return cache[key];
		};

		var ihubFeatures = new storeLocator.FeatureSet;
		ihubFeatures.add(this.FEATURES_.getById('ihub'));
		var gpFeatures = new storeLocator.FeatureSet;
		gpFeatures.add(this.FEATURES_.getById('gp'));

		for (var i = 0; i < json.length; i++) {
			var gp = json[i];			

			var store = new storeLocator.Store(gp.name, gp.latLng, gpFeatures, gp.props);
			store.getInfoWindowContent = getInfoWindowContent;
			store.getInfoPanelItem = getInfoPanelItem;
			store.getIdSlug = function() {
				return this.getId().replace(/ /g,'-').replace(/[^0-9a-zA-Z_\-]/g,'').toLowerCase();
			}
			stores.push(store);

			if (gp.is_ihub) {
				var ihubStore = new storeLocator.Store(
					"I:HUB @ " + gp.name.replace('Andover Medical Centre', 'Hornsey Road')
										.replace('Ritchie Street Group Practice', 'Ritchie Street')
										.replace('Islington Medical Centre', 'Laycock Street')
										,
					gp.latLng, ihubFeatures, gp.props
				);
				ihubStore.getInfoWindowContent = getInfoWindowContent;
				ihubStore.getInfoPanelItem = getInfoPanelItem;
				ihubStore.getIdSlug = function() {
					return this.getId().replace(/ /g,'-').replace(/[^0-9a-zA-Z_\-]/g,'').toLowerCase();
				}
				stores.push(ihubStore);	
			}			
		}
		return stores;
	};

	return GPDataFeed;
});