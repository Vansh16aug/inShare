const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Import model
const User = require('../models/user');

router.get('/:token', async (req, res) => {
	try {
		const { user: email } = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
		await User.updateOne({ email }, { isVerified: true }, (err, docs) => {
			if (err) throw err;
			console.log('User verified: ' + email);
		})
	} catch (e) {
		req.flash('error_msg', e.message);
		return res.render('login');
	}

	req.flash('success_msg', 'Email Verified Succesfully!');
	return res.redirect('/users/login');
})

module.exports = router;