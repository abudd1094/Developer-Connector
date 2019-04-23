const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User Model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Test users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: 'Users works'}));

// @route   GET api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body); // validate everything sent to this route, destructures the validateRegisterInput return properties errors and isValid
  
  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors); // if theres an error return entire errors object from register.js
  }

  User.findOne({ email: req.body.email }) // search for a user with the requested username in the database
    .then(user => {
      if(user) { // if the user already exists in the db, return an error
        errors.email = 'Email already exists' // define error message for pre-existing email
        return res.status(400).json(errors)
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', // size
          r: 'pg', // rating
          d: 'mm' // default
        });
        
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar: avatar, // can shorten line to just avatar w ES6 bc key and value are the same
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => { // generating and saving an encrypted password
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    });
});

// @route   GET api/users/login
// @desc    Login user / returning JWT JSON Web Token
// @access  Public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body); 
  
  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors); 
  }
  
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email: email }) // search for user in User db with this email
    .then(user => { // if found, return the user as 'user'
      // Check for user
      if (!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }

      // Check password
      bcrypt.compare(password, user.password) // compare text password to encrypted password in database
        .then(isMatch => { // returns true or false value that we call isMatch
          if(isMatch) { // if user passes, generate the token
            // User matched

            const payload = {id: user.id, name: user.name, avatar: user.avatar} // create JWT payload

            // Sign Token 
            jwt.sign(
              payload, // created above
              keys.secretOrKey, // keys is imported from config/keys
              { expiresIn: 3600 }, // expiration time for user login
              (err ,token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token // we are using a Bearer token which is a certain type of protocol
                })
            }); 
          } else {
            return res.status(400).json({password: 'Password incorrect'})
          }
        })
    })
})

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;

