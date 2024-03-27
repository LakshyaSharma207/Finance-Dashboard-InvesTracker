$(document).ready(function () {
  // initializing stuff
  const currentPage = window.location.href;
  const header = 'http://localhost:3000'
  var chartData = {};
  var valuesArray = []; 

  // attach header to each page
  $(function(){
    $("header").load("/header.html", function() { 
      const navbar = $('.navbar').children();
      navbar.each(function() {
        let href = header + $(this).attr('href');
        if (href === currentPage) {
          $(this).addClass('navbtn-active')
        }
      })
    })
  });

  // modal script 
  $(".close").click(function(){
    $("#myModal").css("display", "none");
  });
  
  $(window).click(function(event){
    if ($(event.target).is('#myModal')) {
      $("#myModal").css("display", "none");
    }
  });

  // get current Date
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date()
  if ($('#today')) {
    $('#today').text(monthNames[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear())
  }
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();
  $('.currentMonth').html(`For ${month}, ${year}`);

  // Total Asset Calculation
  if (currentPage === header + '/') {
    var total = 0;
    $.ajax({
      url: '/transactions/fetch',
      method: 'GET', 
      success: function(data) {
        transactionData = data.data;
        transactionData.forEach(tr => {
          // set options
          $('#fromAsset').append(`<option value="${tr.amount}">${tr.name}</option>`)

          // get total amount
          total += tr.amount;
          let type = tr.type.toString();
          
          if (chartData[type] === undefined){
            chartData[type] = tr.amount;
          } else {
            chartData[type] += tr.amount;
          }
        });
        $('#assetValue').text(`₹${total}`);

        // pie chart in dashboard
        if ($('#myChart').length) {
          const valuesArray = [chartData['Real Estate'], chartData['Stock'], chartData['Bonds'], chartData['Cryptocurrencies'], chartData['Commodities']];
          const ctx = $('#myChart');
          new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Real Estate', 'Stocks', 'Bonds', 'Cryptocurrencies', 'Commodities'],
              datasets: [{
                label: 'Amount',
                data: valuesArray,
                backgroundColor: [
                  '#ff4400',
                  '#25C45F',
                  '#4d4dff',
                  '#e6bf5e',
                  '#9500FF',
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
      },
      error: function(xhr, status, error) {
        $('#assetValue').text('no assets owned')
      }
    });  

    $('#fromAsset').on('change', function() {
      $('#transferAmount').text(this.value)
    })

    // POST request to transfer money
    $('#transferForm').on('submit', function(e) {
      e.preventDefault();
      const assetName = $('#fromAsset option:selected').text();
      const assetValue = $('#fromAsset').val();

      if (assetValue == 0) {
        $("#myModal").css("display", "block");
        $("#myModal p").text('Transfer cannot be empty');
        return;
      }
      $.ajax({
        url: '/transfer',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ assetName: assetName, assetValue: assetValue }),
        success: function(data) {
          console.log('Success!');
          window.location.reload();
        },
        error: function(xhr, status, error) {
          const errorMessage = JSON.parse(xhr.responseText).error;
          $("#myModal").css("display", "block");
          $("#myModal p").text(errorMessage);
        }
      })
    })
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
      $("#myModal").css("display", "block");
      $("#myModal p").text(errorMessage);
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
          $("#myModal").css("display", "block");
          $("#myModal p").text(errorMessage);
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
        $("#myModal").css("display", "block");
        $("#myModal p").text(errorMessage);
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
            <td>${tr.currency}</td>
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
        $("#myModal").css("display", "block");
        $("#myModal p").text(errorMessage);
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
      $("#myModal").css("display", "block");
      $("#myModal p").text(errorMessage);
      return;
    }
    const type = btn[0].value;
    var currency = $('input[name="currency"]:checked').val();
    if (!currency) {
      var currency = 'Credit';
    }

    $.ajax({
      url: '/transactions/addnew',
      method: 'POST', 
      contentType: 'application/json',
      data: JSON.stringify({ name: name, amount: amount, type: type, currency: currency }),
      success: function() {
        console.log('success');
        window.location.href = header + '/transactions';
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        $("#myModal").css("display", "block");
        $("#myModal p").text(errorMessage);
      }
    })
  })

  // fetch data for wallets page
  if (currentPage === header + "/wallet"){
    $.ajax({
      url: '/wallet/fetch',
      method: 'GET', 
      success: function(data) {
          $('#userName').text(data.name)
          const amount = data.balance[0].amount;
          $('#totalBalance').text(`₹${amount}`)
          // $('#planningContainer')
          data.planning.forEach((item) => {
            const percent = Math.floor((amount / item.total) * 100);
            $('#planningContainer').append(`<div style="display: flex; flex-direction: column; gap: 20px;"><div class="expense-card plan-card">
                <div id="${item.planning_id}" class="info">
                    <p>${item.name}</p>
                    <p class="plan-amount">₹${amount}</p> 
                    <p style="font-weight: bold;">₹${item.total}</p>
                </div>
                <div class="single-chart">
                    <svg viewBox="0 0 36 36" class="circular-chart red">
                      <path class="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path class="circle"
                        stroke-dasharray="${percent}, 100"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" class="percentage">${percent}%</text>
                    </svg>
                </div>
            </div>
            <button class="removePlanning" id="${item.planning_id}">Remove Planning</button></div>`)
        })
      },
      error: function(xhr, status, error) {
      }
    });  

    $('#addPlanning').on('click', function(){
      $("#myModal").css("display", "block");
    })

    $('#planningForm').on('submit', function(e) {
      e.preventDefault();
      const planName = $('#planName').val()
      const target = $('#target').val()

      $.ajax({
        url: '/wallet/addplan',
        method: 'POST', 
        contentType: 'application/json',
        data: JSON.stringify({ name: planName, target: target }),
        success: function() {
          console.log('success');
          $("#myModal").css("display", "none");
          window.location.reload();
        },
        error: function(xhr, status, error) {
          //
        }
      })
    })

    $('#planningContainer').on('click', '.removePlanning', function() {
      const ans = window.confirm('Are you sure you want to remove the planning?');

      if (ans) {
        const id = $(this).attr('id');

        $.ajax({
          url: '/wallet/removeplan',
          method: 'POST', 
          contentType: 'application/json',
          data: JSON.stringify({ id: id }),
          success: function() {
            console.log('remove success');
            window.location.reload();
          },
          error: function(xhr, status, error) {
            //
          }
        })
      } else {
        // whatever
      }
    })
  }
  // GET request for profile
  if (currentPage === header + "/profile"){
    $.ajax({
      url: '/profile/fetch',
      method: 'GET', 
      success: function(data) {
        const userData = data.data[0];

        $('.profile-name').text(userData.userName);
        $('#profileGender').text(`${ userData.gender ?? 'undefined' }`)
        $('#profilePhone').text(`${ userData.phone ?? 'undefined' }`)
        $('#profileEmail').text(`${ userData.email ?? 'undefined' }`)
      },
      error: function(xhr, status, error) {
        const errorMessage = JSON.parse(xhr.responseText).error;
        $("#myModal").css("display", "block");
        $("#myModal p").text(errorMessage);
      }
    });  
  }

  if (currentPage == header + "/profile/edit") {
    $('#editForm').on('submit', function(e) {
      console.log('ok')
      e.preventDefault();
      const newName = $('#editName').val();
      const newPhone = $('#editPhone').val();
      const newEmail = $('#editEmail').val();
      const newGender = $('#editGender').val();

      $.ajax({
        url: '/profile/update',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ newName, newPhone, newEmail, newGender }),
        success: function(data) {
          console.log('success in updating profile');
          window.location.href = header + '/profile';
        },
        error: function(xhr, status, error) { 
          const errorMessage = JSON.parse(xhr.responseText).error;
          $("#myModal").css("display", "block");
          $("#myModal p").text(errorMessage);
        }
      })
    })
  }

});
