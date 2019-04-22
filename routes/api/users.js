const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

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
  User.findOne({ email: req.body.email }) // search for a user with the requested username in the database
    .then(user => {
      if(user) { // if the user already exists in the db, return an error
        return res.status(400).json({ email: 'Email already exists' })
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

        bcrypt.genSalt(10, (err, salt) => {
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

module.exports = router;

