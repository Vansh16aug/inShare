const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();
module.exports = (passport) => {
	passport.use(
		new GoogleStrategy(
			{
				// passport callback function
				// check if user already exists in our db with the given profile ID
				clientID: process.env.OAUTH_CLIENT_ID,
				clientSecret: process.env.OAUTH_CLIENT_SECRET,
				callbackURL: "/auth/google/redirect",

			},
			(accessToken, refreshToken, profile, done) => {
				// console.log("Access Token: ", accessToken);
				// console.log("Profile: ", profile);
				User.findOne({ googleId: profile.id }).then(currentUser => {
					//if we already have a record with the given profile ID
					if (currentUser) {
						done(null, currentUser);
					} else {
						// if no user found then create a new user
						new User({
							username: profile.displayName,
							isVerified: profile.emails[0].verified,
							gmail: profile.emails[0].value,
							profilePic: profile.photos[0].value,
							googleId: profile.id
						}).save().then(newUser => {
							done(null, newUser, { message: 'user created' });
						})
					}
				})
			}
		)
	);
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		})
	})
}