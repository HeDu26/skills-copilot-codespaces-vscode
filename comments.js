// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

// Create express app
const app = express();

// Use body parser
app.use(bodyParser.json());

// Enable cors
app.use(cors());

// Object to store comments
const commentsByPostId = {};

// Route to handle post request to create comment
app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const { id: postId } = req.params;

  // Get comments for the post id
  const comments = commentsByPostId[postId] || [];

  // Push new comment
  comments.push({ id: comments.length + 1, content, status: 'pending' });

  // Update comments for the post id
  commentsByPostId[postId] = comments;

  // Emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: comments.length, content, postId, status: 'pending' },
  });

  // Send response
  res.status(201).send(comments);
});

// Route to handle get request to get comments for a post id
app.get('/posts/:id/comments', (req, res) => {
  const { id: postId } = req.params;

  // Get comments for the post id
  const comments = commentsByPostId[postId] || [];

  // Send response
  res.send(comments);
});

// Route to handle post request to update comment status
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  // Check for comment created event
  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    // Get comments for the post id
    const comments = commentsByPostId[postId];

    // Find the comment with the id
    const comment = comments.find((c) => c.id === id);

    // Update status
    comment.status = status;

    // Emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { id, postId, status, content },
    });
    }
    });