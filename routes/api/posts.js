const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Post & Profile Model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Load Post Validator
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => res.json({msg: 'Posts works'}));

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({date: -1}) // sort posts by date
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound: 'No posts found'}))
})

// @route   GET api/posts/:id
// @desc    Get a single post by id
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({nopostfound: 'No post found with that ID'})
  );
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check Validation
  if(!isValid) {
    // If any errors send 400 with errors object
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id // current login
  })

  newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if(post.user.toString() !== req.user.id) {// compare post user string to user id of logged in user
            return res.status(401).json({ notauthorized: 'User not authorized' });
          }

          // Delete
          post.remove().then(() => res.json({ succes: true }))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
})

// @route   POST api/posts/like/:id     this will be the id of the post being liked
// @desc    Like post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if user has already liked post
          if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) { // convert the user object stored in the likes array to a string and compare it to the logged in user's id, if you filter the likes array in this manner that means it will be greater than 0 if the user has already liked the post
            return res.status(400).json({ alreadyliked: 'User already liked this post' });
          }

          // Add user id to the likes array
          post.likes.unshift({ user: req.user.id })

          post.save().then(post => res.json(post)); // save to DB and return the whole post
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
})

// @route   POST api/posts/unlike/:id     this will be the id of the post being liked
// @desc    Unlike post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if user has already liked post
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) { 
            return res.status(400).json({ notliked: 'You have not yet liked this post' });
          }

          // Get index of like to remove
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice that like out of the likes array
          post.likes.splice(removeIndex, 1)

          // Save
          post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
})

// @route   POST api/posts/comment/:id     this will be the id of the post being liked
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check Validation
  if(!isValid) {
    // If any errors send 400 with errors object
    return res.status(400).json(errors);
  }
  
  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }

      // Add comments to array
      post.comments.unshift(newComment);

      // Save
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' })); 
});

// @route   DELETE api/posts/comment/:id/:comment_id     we need post id and comment id here
// @desc    Delete comment from post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

  Post.findById(req.params.id)
    .then(post => {
      // Check to see if the comment exists
      if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentnonexistent: 'Comment does not exist' })
      }

      // Get index of comment to remove from comments array
      const removeIndex = post.comments
        .map(item => item._id.toString()) // convert comments array to array of comment ID strings
        .indexOf(req.params.comment_id); // grab the index of the appropriate comment

      // Splice comment out of array
      post.comments.splice(removeIndex, 1);

      // Save
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' })); 
});

module.exports = router;