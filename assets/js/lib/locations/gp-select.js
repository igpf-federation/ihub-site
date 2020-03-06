$(function() {
	$("select#gp-select").change(function () {
		var $selected = $(this).find("option:selected");
		if ($selected.hasClass("gp-option")) {
			var url = '/gp/'+$selected.text().replace(/ /g,'-').replace(/[^0-9a-zA-Z_ \-]/g,'').toLowerCase();
			window.location = url;
		}		
	});
	$("select#ihub-select").change(function () {
		var $selected = $(this).find("option:selected");
		if ($selected.hasClass("ihub-option")) {
			var url = '/ihub/'+$selected.text().replace(/ /g,'-').replace(/[^0-9a-zA-Z_ \-]/g,'').toLowerCase();
			window.location = url;
		}		
	});
});