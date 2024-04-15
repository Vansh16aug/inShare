const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth.js");
const passport = require('passport');

router.get('/', ensureAuthenticated, (req, res) => {
	res.render('share', {
		user: req.user
	});
})

// Login page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
	res.render('dashboard', {
		user: req.user
	});
})

// About page
// router.get('/about', (req, res) => {
// 	res.render('about');
// })

// Register page 
router.get('/register', (req, res) => {
	res.render('register');
});

// Google Auth
router.get('/auth/google', passport.authenticate('google', {
	scope: ['profile', 'email'],
	includeGrantedScopes: true,
	prompt: 'select_account'
}));
router.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
	res.redirect('/');
	// res.send('You reached the redirect URI');
});

router.get('/auth/logout', (req, res) => {
	req.logout();
	res.render('login');
})

router.get('/login', (req, res) => {
	res.render('login');
})


module.exports = router;