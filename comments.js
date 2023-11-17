//create web server
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

//set up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set up cors
app.use(cors());

//set up mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/comments');

//set up comments model
const Comment = mongoose.model('Comment', {
  username: String,
  body: String,
  date: String
});

//get all comments
app.get('/api/comments', (req, res) => {
  Comment.find({}, (err, comments) => {
    res.send(comments);
  });
});

//add comment
app.post('/api/comments', (req, res) => {
  const newComment = new Comment(req.body);
  newComment.save((err, comment) => {
    res.send(comment);
  });
});

//delete comment
app.delete('/api/comments/:id', (req, res) => {
  Comment.findByIdAndRemove(req.params.id, (err, comment) => {
    res.send(comment);
  });
});

//update comment
app.put('/api/comments/:id', (req, res) => {
  Comment.findByIdAndUpdate(req.params.id, req.body, (err, comment) => {
    res.send(comment);
  });
});

//start server
app.listen(3001, () => {
  console.log("Server listening on port 3001");
});