const router = require('express').Router();
const File = require('../models/file');
const User = require('../models/user');
const { ensureAuthenticated } = require("../config/auth.js");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { nanoid } = require('nanoid');
require('dotenv').config();
const bcrypt = require('bcrypt');

const randomString = nanoid(24);

// Function that check received token from JWT againt "randomString"
const verifyToken = (token, tokenFromJWT) => {
	console.log('TOKEN: ' + token + '; RANDOM: ' + tokenFromJWT);
	if (token === tokenFromJWT) {
		return true
	};
	return false;
}

// Nodemailer Transoporter
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

// Function that sends email
const sendTokenLink = (email) => {
	// console.log("Token: " + token)
	// ASYNC EMAIL
	jwt.sign(
		{token: randomString, email},
		process.env.EMAIL_SECRET,
		{expiresIn: '1h'},
		(err, emailToken) => {
			if (err) throw err;
			const url = `http://localhost:3000/forgot/reset/${emailToken}`;

			transporter.sendMail({
				to: email,
				subject: '[inShare] Reset your password',
				html: `<h3>Please click the link below to change your password</h3><br>` + 
						`<a href="${url}">${url}</a> <br>` +
						`<b>NOTE: This link is valid for 1 hour</b>`
			})
		}
	)

}

router.post('/', (req, res) => {
	// console.log(req.body);
	const { email } = req.body;
	// Check for the user and send email
	User.findOne({email}, (err, user) => {
		if (err) throw err;

		if (!user) {
			req.flash('error', 'No user found with that email!');
			return res.redirect('login');
		}

		sendTokenLink(user.email);
		req.flash('success_msg', 'Reset link sent!');
		res.redirect('login');
	})
	// res.send('Password Reset Email Sent');
})

// Forgot Password
router.get('/reset/:token', (req, res) => {
	const token = req.params.token;
	// console.log('token: ' + token)
	try {
		const { token: resetToken, email } = jwt.verify(token, process.env.EMAIL_SECRET);
		console.log('EMAIL FROM JWT API' + email);
		if (verifyToken(randomString, resetToken)) {
			// remember "randomString" is a gloabl variable;
			// console.log('RESETTOKEN: ' + resetToken + '; TOKEN: ' + token);
			req.session.email = email;
			res.redirect('/forgot/password-reset');
		} else {
			console.log('Token Verification Failed!');
			res.send('Random String mismatched!');
		}
	} catch (e) {
		console.log(e)
		return res.send(e.message);
	}
})

router.get('/password-reset', (req, res) => {
	let email = req.session.email;
	res.render('forgot', {email});
})

// Change the password
router.post('/password-reset', (req, res) => {
	// console.log(req.body);
	let { newpass, newpass2, email } = req.body;

	User.findOne({ email })
		.then(user => {
			if (!user) {
				req.flash('error', 'User doesn\'t exist')
				return res.redirect('/forgot/password-reset');
			}
			if (newpass !== newpass2) {
				req.flash('error', 'Passwords didn\'t match')
				return res.redirect('/forgot/password-reset')
			}
			 // Hash the password
			bcrypt.hash(newpass, 13, async (err, hash) => {
				if (err) throw err;
				// Else save the person to the database
				newpass = hash;
				await User.updateOne({ email: user.email }, { password: newpass }, (err, docs) => {
					if (err) {
						console.log(err);
						res.redirect('login');
					}
					req.flash('success_msg', 'Password Changed Succesfully!');
					res.redirect('/login');
				})
			})
		})

})

module.exports = router;