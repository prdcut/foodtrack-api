const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

const { check, validationResult } = require('express-validator');
const app = express();
const Models = require('./models.js');
const Food = Models.Food;
const User = Models.User;

mongoose.connect('mongodb://localhost:27017/foodtrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// Gets the list of data about ALL foodList
app.get(
  '/food-list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.find()
      .then(food => {
        res.status(201).json(food);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Gets the data about a single food by name
app.get(
  '/food-list/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOne({ name: req.body.name })
      .then(food => {
        res.json(food);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Adds data for a new food to our list of foodList.
app.post(
  '/food-list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOne({ name: req.body.name })
      .then(food => {
        if (food) {
          return res.status(400).send(`${req.body.name} already exists`);
        } else {
          Food.create({
            name: req.body.name,
            weight: req.body.weight,
            quantity: req.body.quantity,
            macros: {
              protein: req.body.macros.protein,
              carbs: req.body.macros.carbs,
              fat: req.body.macros.fat,
              calories: req.body.macros.calories,
            },
          })
            .then(food => {
              res.status(201).json(food);
            })
            .catch(error => {
              console.error(error);
              res.status(500).send(`Error ${error}`);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Deletes a food from our list by name
app.delete(
  '/food-list/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOneAndRemove({ name: req.params.name })
      .then(food => {
        if (!food) {
          res.status(400).send(`${req.params.name} was not found.`);
        } else {
          res.status(200).send(`${req.params.name} was deleted.`);
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Update nutrional values of a food by food name
app.put(
  '/food-list/:name/:macro/:value',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOneAndUpdate(
      { name: req.params.name },
      {
        $set: {
          name: req.body.name,
          weight: req.body.weight,
          quantity: req.body.quantity,
          macros: {
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            calories: req.body.calories,
          },
        },
      },
      { new: true },
      (error, updatedFood) => {
        if (error) {
          console.error(error);
          res.status(500).send(`Error ${error}`);
        } else {
          res.json(updatedFood);
        }
      }
    );
  }
);

// return user profile
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ username: req.params.username })
      .then(user => {
        res.status(201).json(user);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// allow new users to register
app.post(
  '/users',
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check(
      'username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = User.hashPassword(req.body.Password);
    User.findOne({ username: req.body.username })
      .then(user => {
        if (user) {
          return res.status(400).send(`${req.body.username} already exists`);
        } else {
          User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
          })
            .then(user => {
              res.status(201).json(user);
            })
            .catch(error => {
              console.log(error);
              res.status(500).send(`Error ${error}`);
            });
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// allow users to update their user info
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.params.email,
        },
      },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.error(error);
          res.status(500).send(`Error ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// allow users to add a meal to their list of meals
app.post(
  '/users/:username/meals/:foodId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      { $addToSet: { meals: req.params.foodId } },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.log(error);
          res.status(500).send(`Error ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// allow users to remove a meal form their list of meals
app.delete(
  '/users/:username/meals/:foodId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { meals: req.params.foodId } },
      { new: true },
      (error, updatedUser) => {
        if (error) {
          console.log(error);
          res.status(500).send(`Error ${error}`);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// allow existing users to deregister
app.delete(
  '/users/:username/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({ username: req.params.username })
      .then(user => {
        if (!user) {
          res.status(400).send(`${req.params.username} was not found`);
        } else {
          res.status(200).send(`${req.params.username} was deleted`);
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
