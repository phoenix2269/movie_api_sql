const express = require('express'),
    bodyParser = require('body-parser'),
//    morgan = require('morgan'),
    uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');
    
const Movies = Models.Movie;
const Users = Models.User;
    
mongoose.connect('mongodb://127.0.0.1:27017/movies', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());

/* const express = require('express'),
    morgan = require('morgan');
//    fs = require('fs'),
//    path = require('path');
const app = express(); */
// create a write stream (in append mode)
// a 'log.txt file is created in root directory
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//app.use(morgan('common'));
//app.use(morgan('combined', {stream: accessLogStream}));
//app.use(express.static('public'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// GET list of ALL movies
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// GET movie details by Title
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(400).send('Error: ' + err);
        });
});

// GET genre (description) by name
app.get('/movies/genre/:Name', (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
        res.status(201).json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
    });
});

// GET data about a director (bio, birth year, death year) by name
app.get('/movies/directors/:Name', (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
        res.status(201).json(movie.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
    });
});

//  GET a list of ALL Users
app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Add a user
/* We'll expect JSON in this format
{
    ID: Integer,
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
} */
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// GET a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Update a user's info, by username
/* We'll expect JSON in this format
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
} */
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {$set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true })  // This line makes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// POST/Add movie to favorites - NOTE: DO NOT use ObjectID
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true })  // This line makes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// DELETE/Remove a movie from favorites - show deleted msg
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndDelete({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true })  // This line makes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(400).send('Error: ' + err);
    });
});

// DELETE/Remove User by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted');
        }
    })
    .catch((err) => {
        console.err(err);
        res.status(500).send('Error: ' + err);
    });
});

// API documentation/how to
// app.get('/documentation.html', (req, res) => {
//     res.send('Top 10 Movies');
// });

// Listener
app.listen(8080, () => {
    console.log('App is listening on port 8080.');
});