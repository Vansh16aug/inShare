const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// User Model
const User = require('../models/user.js');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
	service: 'GMAIL',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, 
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS
	}
})

// Generate new verification link and send email
const sendVerificationLink = (newUser) => {
	// ASYNC EMAIL
	jwt.sign(
		{user: newUser.email},
		process.env.EMAIL_SECRET,
		{expiresIn: '1d'},
		(err, emailToken) => {
			if (err) throw err;
			const url = `http://localhost:3000/confirmation/${emailToken}`;

			transporter.sendMail({
				to: newUser.email,
				subject: '[inShare] Confirm you email',
				html: `<h3>Please click the link below to verify your email</h3><br>` + 
						`<a href="${url}">${url}</a> <br>` +
						`<b>NOTE: This link is valid for 24hrs</b>`
			})
		}
	)
	console.log('Verfication Link Sent!')
}

// Login 
router.get('/login', (req, res) => {
	res.render('login');
})
// Register 
router.get('/register', (req, res) => {
	res.render('register');
})

// Handler Register
router.post('/register', (req, res) => {
	// console.log(req.body);
	const { username, email, password, password2 } = req.body;

	// Array of errors
	const errors = [];

	if (!username || !email || !password || !password2) {
		errors.push({ msg: 'Please fill in all the fields' });
	}

	// Check if both passwords match
	if (password !== password2) {
		errors.push({ msg: 'Passwords did not match' });
	}

	// Check if password is more than 5 characters
	if (password.length < 5) {
		errors.push ({ msg: 'Password must be of atleast 5 characters longs' });
	}

	if (errors.length > 0) {
		res.render('register', { errors, username, password, email })
	} else {
		User.findOne({ email: email }).exec((err, user) => {
			console.log("USER EXISTS: ", user);
			if (user) {
				console.log("EMAIL EXISTS");
				errors.push({ msg: 'Email already exists' });
				res.render('register', { errors, username, password, email })
			} else {
				const newUser = new User ({
					username,
					email,
					password
				});

				// Send new verification email
				sendVerificationLink(newUser);

				// Hash the password
				bcrypt.hash(newUser.password, 13, (err, hash) => {
					if (err) throw err;
					// Else save the person to the database
					newUser.password = hash;
					newUser.save()
						.then(value => {
							// console.log('New user saved: ' + value);
							req.flash('success_msg', 'Success! A verification link is sent to your email.');
							res.redirect('/users/login');
						})
						.catch(err => {
							console.log(err);
							req.flash('error_msg', err.message);
							res.redirect('/users/login');
						});
				})
			}
		})
	}
});


router.post('/login', (req, res, next) => {
	console.log('Request arrived');
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'Logged out!');
	res.redirect('/users/login');
});


module.exports = router;