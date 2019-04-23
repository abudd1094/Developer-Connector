const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => { // we pass in passport in our server.js file when calling this export
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => { // pass in payload and done function to run on success
    User.findById(jwt_payload.id) // find user by the id included in the payload object
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
    })
  );
}