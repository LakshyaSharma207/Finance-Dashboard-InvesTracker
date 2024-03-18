const express = require('express');

const app = express();
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'pass1234',
    database: 'finance_dashboard'
};

const sessionStore = new MySQLStore(options);


// create user sessions
app.use(session({
    key: 'session_cookie_name',
    secret: 'secret pass',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
})); 

// serve files from client folder
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// get routes
const transactionsRoute = require('./routes/transactions.js');
const signUpRoute = require('./routes/newUser.js');
const loginRoute = require('./routes/login.js');
const walletRoute = require('./routes/wallet.js');

// parsing middleware
app.use(express.json());

// create new user
app.use('/signup', signUpRoute);

// authenticate users when logging
app.use('/login', loginRoute);

// handle transaction page routing
app.use('/transactions', transactionsRoute);

// handle wallet page routing
app.use('/wallet', walletRoute);

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