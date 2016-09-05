define([], function() {
	//console.log("marker-icons");
    var ihub = new google.maps.MarkerImage("/img/new-ihub-marker-small.png", null, null, null, new google.maps.Size(45,60));
    var gp = new google.maps.MarkerImage("/img/new-gp-marker-small.png", null, null, null, new google.maps.Size(45,60));
    var me = new google.maps.MarkerImage("/img/new-me-marker-small.png", null, null, null, new google.maps.Size(45,60));
    
    return {
    	ihub: ihub,
    	gp: gp,
    	me: me,
    };
});