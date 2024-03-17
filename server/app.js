const express = require('express');

const app = express();
const path = require('path');
const session = require('express-session');

// create user sessions
app.use(session({
    secret: 'secret pass',
    resave: false,  
    saveUninitialized: false,
    cookie: { secure: true }
  }))  

// serve files from client folder
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// get routes
const investmentsRoute = require('./routes/investments.js');
const signUpRoute = require('./routes/newUser.js');
const loginRoute = require('./routes/login.js');

// parsing middleware
app.use(express.json());

// create new user
app.use('/signup', signUpRoute);

// authenticate users when logging
app.use('/login', loginRoute);

// handle investments page routing
app.use('/investments', investmentsRoute);

app.listen(3000, () => {
    console.log('server running at localhost:3000');
})

app.post('/add', (req, res) => {
    const name = 'Apple';

    db.query('INSERT INTO transaction (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('successfully inserted values');
        res.send(result);
    })
})