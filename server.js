require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Assign the LocalStrategy configuration
require('./config/passport')(passport);
require('./config/passport-google')(passport);

// Cors 
const corsOptions = {
  // origin: process.env.ALLOWED_CLIENTS.split(',')
  // ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:3300']
}

// Default configuration looks like
// {
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204
//   }

app.use(cors())
app.use(express.static(__dirname + '/public'));

// Express Session
app.use(session({
	secret: 'arsen1c',
	resave: true,
	saveUninitialized: true
}))

const connectDB = require('./config/db');
connectDB();

// Bodyparser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Use flash
app.use(flash());

// Use Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Routes 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));
app.use('/confirmation', require('./routes/confirmation'));
app.use('/forgot', require('./routes/forgotpass'));
app.use('/delete', require('./routes/delete'));

app.listen(PORT, console.log(`Listening on port ${PORT}.`));