$(document).ready(function () {
  // attach header to each page
  $(function(){
      $("header").load("/header.html"); 
  });

  const currentPage = window.location.href;
  const header = 'http://localhost:3000'

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
  $('#investmentTable').on('click', '.copy-svg', function() {
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
      alert('Error:', errorMessage);
      return;
    }

    $.ajax({
        url: '/signup/createUser',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name: name, password: password }),
        success: function(data) {
          window.location.href = header + '/';
        },
        error: function(xhr, status, error) {
          const errorMessage = JSON.parse(xhr.responseText).error;
          alert('Error:', errorMessage);
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
        if(data.success === true){
          window.location.href = header + '/';
        }
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        alert('Error:', errorMessage);
      }
    })
  })

  // GET request for transactions data
  if (currentPage === header + "/transactions"){
    $.ajax({
      url: '/transactions/fetch',
      method: 'GET', 
      success: function(data) {
          var table = $('#investmentTable tbody');
          transactionData = data.data;
          transactionData.forEach(tr => {
            let type = (tr.type).toLowerCase();
            table.append(`<tr id="${tr.id}">
            <td><div class="invest-name"><img class="svg invest-icon ${type}" src="assets/${type}.svg" alt="icon" /><span>${tr.name}</span></div></td>
            <td>${tr.date}</td>
            <td><div class="${type} invest-type">${tr.type}</div></td>
            <td>₹${tr.amount}</td>
            <td><div class="copy-svg"><svg class="svg" style="cursor: pointer;" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z" clip-rule="evenodd"/>
                <path fill-rule="evenodd" d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" clip-rule="evenodd"/>
              </svg></div></td>
        </tr>`)
          });
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        alert(errorMessage);
      }
    });  
  }

  // ensuring only one button is clicked
  $('#addTransactionForm fieldset .btn').on('click', function() {
    $('.btn').removeClass('selected');
    $(this).toggleClass('selected');
  })

  // send POST request to backend for adding transaction
  $('#addTransactionForm').on('submit', function(e) {
    e.preventDefault();

    const name = $('#nameInput').val();
    const amount = $('#amountInput').val();
    const buttons = $('#addTransactionForm fieldset .btn');
    const btn = buttons.filter(function() {
        return $(this).hasClass('selected');
    });
    if (!btn[0]) {
      const errorMessage = 'Selecting type is required';
      alert(errorMessage);
      return;
    }
    const type = btn[0].value;

    $.ajax({
      url: '/transactions/addnew',
      method: 'POST', 
      contentType: 'application/json',
      data: JSON.stringify({ name: name, amount: amount, type: type }),
      success: function() {
        console.log('success');
        // window.location.href = header + '/transactions';
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        alert(errorMessage);
      }
    })
  })

});
