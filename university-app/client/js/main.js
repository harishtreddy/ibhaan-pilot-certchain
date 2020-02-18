window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    $('.navbar').addClass('scrolled');
  } else {
    $('.navbar').removeClass('scrolled');
  }
}

$('.launch-loader').click(function(){

  $('.display-loader').addClass('show');

  setTimeout(
    function(){ $('.display-loader').removeClass('show') },
    3000
  );

});


$("a[href^='#']").click(function(e) {
	e.preventDefault();
	var position = $($(this).attr("href")).offset().top - 50;
	$("body, html").animate({
		scrollTop: position
	}, 700 );
});

$(document).ready(function(){
  displayCollegeList();
  displayStudentList();
});
