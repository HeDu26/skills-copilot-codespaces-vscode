// create web server
const express = require('express');
const app = express();
// create server
const server = require('http').Server(app);
// create socket
const io = require('socket.io')(server);
// create mongoose
const mongoose = require('mongoose');
// create port
const port = process.env.PORT || 3000;
// create database
const db = require('./config/keys').mongoURI;
// connect to database
mongoose.connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
// create schema
const Comment = require('./models/Comment');
// create cors
const cors = require('cors');
// use cors
app.use(cors());

// create route
app.get('/', (req, res) => {
    res.send('Hello World');
});

// create socket connection
io.on('connection', socket => {
    console.log('a user connected');
    // get all comments
    Comment.find().then(comments => {
        // send comments to client
        socket.emit('initial comments', comments);
    });
    // listen to add comment
    socket.on('add comment', comment => {
        // create new comment
        const newComment = new Comment({
            username: comment.username,
            content: comment.content,
            created_at: comment.created_at
        });
        // save comment
        newComment.save().then(comment => {
            // send comment to client
            io.emit('new comment', comment);
        });
    });
    // listen to delete comment
    socket.on('delete comment', id => {
        // delete comment
        Comment.findByIdAndDelete(id).then(comment => {
            // send comment to client
            io.emit('deleted comment', comment);
        });
    });
    // listen to update comment
    socket.on('update comment', comment => {
        // update comment
        Comment.findByIdAndUpdate(comment._id, {content: comment.content}).then(comment => {
            // send comment to client
            io.emit('updated comment', comment);
        });
    });
    // listen to disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// listen to port
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});