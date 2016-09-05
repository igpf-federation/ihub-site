$(function() {
	var $nav = $("nav.nav-main")
	var $menuBtn = $nav.find("button.menu");
	var $links = $nav.find(".links");
	var $dark = $nav.find(".dark");
	var $transition = 300;
	
	$menuBtn.add($dark).click(function() {
		if($(this).hasClass("open")) {
			$menuBtn.removeClass("open");
			$links.removeClass("open");
			$dark.removeClass("open").fadeOut($transition);
		}
		else {
			$menuBtn.addClass("open");
			$links.addClass("open");
			$dark.addClass("open").fadeIn($transition);
		}
	});
});
