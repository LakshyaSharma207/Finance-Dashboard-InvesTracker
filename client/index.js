$(document).ready(function () {
  // attach header to each page
  $(function(){
      $("header").load("./header.html"); 
  });

  // get current Date
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date()
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();
  $('.currentMonth').html(`For ${month}, ${year}`);

  // pie chart in dashboard
  if ($('#myChart').length) {
    const ctx = $('#myChart');
    tempdata = [12, 19, 3, 5, 2];
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Real Estate', 'Stocks', 'Bonds', 'Cryptocurrencies', 'Commodities'],
        datasets: [{
          label: '# of Votes',
          data: tempdata,
          backgroundColor: [
            '#ff4400',
            'rgb(37, 196, 95)',
            'rgb(255, 205, 86)'
          ], 
          borderWidth: 1,
          hoverOffset: 4,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          }
        }  
      }
    });
  }

  // copy event in Investments table
  $('#investmentTable .copy-svg').click(function() {
    const elem = $(this)
    const copydata = elem.parent().parent().children();
    let textContents = [];

    for (let key in copydata) {
        if (copydata.hasOwnProperty(key) && copydata[key].textContent) {
            textContents.push(copydata[key].textContent.trim());
        }
    }
    let result = textContents.join(' ');
    navigator.clipboard.writeText(result).then(function() {
      elem.addClass('show');
      setTimeout(() => {
        elem.removeClass('show');
      }, 3000);
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
  })

  // send POST request for sign up form
  $('#signup-form').on('submit', function(e) {
    e.preventDefault();

    const name = $('#name').val();
    const password = $('#password').val();
    const re_password = $('#re-password').val();

    if (password !== re_password) {
      const errorMessage = 'Passwords don\'t match';
      console.error('Error:', errorMessage);
      return;
    }

    $.ajax({
        url: '/signup/createUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name: name, password: password }),
        success: function(data) {
          window.location.href = '/';
        },
        error: function(xhr, status, error) {
          const errorMessage = JSON.parse(xhr.responseText).error;
          console.error('Error:', errorMessage);
        }
    });
  });

  // send POST request for login form
  $('#login-form').on('submit', function(e) {
    e.preventDefault();

    const name = $('#name').val();
    const password = $('#password').val();

    $.ajax({
      url: '/login/authenticate',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ name: name, password: password }),
      success: function(data) {
        window.location.href = '/';
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        console.error('Error:', errorMessage);
      }
    })
  })
});
