$(document).ready(function () {
    // attach header to each page
    $(function(){
        $("header").load("./header.html"); 
    });

    // Initialize jQuery Address
    $.address.init(function (event) {
      // Get the current path from the URL
      var path = event.pathNames[0];
  
      // Remove .navbtn-active class from all buttons
      $('.navbtn').removeClass('navbtn-active');
  
      // Add .navbtn-active class to the matching button
      $('a.navbtn').each(function () {
        if ($(this).attr('href') === path) {
          $(this).addClass('navbtn-active');
        }
      });
    });
  
    // Listen for clicks on the links and update the URL
    $('a.navbtn').click(function (e) {
      e.preventDefault();
      var targetUrl = $(this).attr('href');
      $.address.path(targetUrl);
    });
});
