$(function() {
	//console.log("home script");
	var $carousel = $(".carousel");
	var $cards = $carousel.find(".card");
	var $navBtns = $carousel.find(".carousel-nav .circle");

	window.carouselIndex = $cards.filter(".active").index();

	var switchCarousel = function(i) {
		$cards.filter(".active").fadeOut().removeClass("active");
		$cards.eq(i).fadeIn().addClass("active");
		$navBtns.removeClass("active");
		$navBtns.eq(i).addClass("active");
		window.carouselIndex = i;
	}

	var currentIndex = 0;

	var loopCarousel = function() {
		//console.log("looping");
		var nextIndex = (window.carouselIndex + 1) % 3;
		switchCarousel(nextIndex);
	}

	var setLoop = function() {
		return setInterval(loopCarousel, 5000);
	}

	var loop = setLoop();

	var navHandler = function() {
		switchCarousel($(this).index());
		clearInterval(loop);
		loop = setLoop();
	}

	$navBtns.click(navHandler);
});
