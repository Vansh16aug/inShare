// Importing passport-local with Strategy instance
// for a user authentication mechanism with simple usernam and pass
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/user");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match user
      User.findOne({ email })
        .then((user) => {
          console.log("User found in passport.js", user);
          if (!user) {
            return done(null, false, { message: "Email does not exists" });
          }
          if (!user.isVerified) {
            return done(null, false, {
              message: "Please confirm your email to login.",
            });
          }
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              console.log("password in correct");
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );
  passport.serializeUser((user, done) => {
    console.log("Serializing User in passport: ", user.id);
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
