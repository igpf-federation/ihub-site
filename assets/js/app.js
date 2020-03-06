 define([ "jquery" ], function($) {
	require.config({
		baseUrl: "/assets/js/lib"
	});

	require([ "nav", "mq" ]);

	var body = document.body;
	body.hasClass = function(className) {
		return this.classList ? this.classList.contains(className) : new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
	}

	if(body.hasClass("home")) {
		require([ "home" ]);
	};

	if(body.hasClass("map-api")) {
		require([ `https://maps.googleapis.com/maps/api/js?libraries=places&key=${process.env.GOOGLE_MAPS_KEY}`], function() {

			if(body.hasClass("gp-map")) {
				require(["locations/store-locator.min"], function() {

					if(body.hasClass("gp-json")) {
						require(["locations/gp-json"]);
					} else {
						require(["locations/gp-map"]);
					};					
				});
			};

			if(body.hasClass("gp-search")) {
				require(["locations/gp-search"]);
			};

			if(body.hasClass("gp-select")) {
				require(["locations/gp-select"]);
			};

			if(body.hasClass("ihub")) {
				require(["locations/ihub-page-map"]);
			};

			if(body.hasClass("get-to")) {
				require(["locations/getting-there-map"]);
			};
		});
	};
});


