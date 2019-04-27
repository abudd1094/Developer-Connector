const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users', // referencing collection with users
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  likes: [ // likes on a post are stored as an array of users
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [ // comments on a post are stored as an array of objects that include user info etc.
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: { // date for the comment
        type: Date,
        default: Date.now
      }
    }
  ],
  date: { // date for the post
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema)