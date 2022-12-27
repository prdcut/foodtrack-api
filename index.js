//Global variables
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

const { check, validationResult, body } = require('express-validator');
const app = express();
const Models = require('./models.js');
const User = Models.User;
const Food = Models.Food;

// Middlewear

/* 
  Uncomment here to run project local ⬇️
*/

// mongoose.connect('mongodb://127.0.0.1/foodtrack', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

/* 
  Comment out here if running project local ⬇️
*/

// Make sure to set before any app.use
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());
let allowedOrigins = [
  'http://localhost:8080',
  'https://foodtrackbackend.herokuapp.com/',
  'https://foodtrack.netlify.app',
  'ws://192.168.2.111:8080/',
];
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

app.all('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

/* 
  FOOD ENDPOINTS
*/

// Returns a list of all foods
app.get(
  '/food-list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.find()
      .then((food) => {
        res.status(201).json(food);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Returns data about single food by name
app.get(
  '/food-list/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOne({ name: req.params.name })
      .then((food) => {
        res.json(food);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Adds new food to list of foods
app.post(
  '/food-list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOne({ name: req.body.name })
      .then((food) => {
        if (food) {
          return res.status(400).send(`${req.body.name} already exists`);
        } else {
          Food.create({
            name: req.body.name,
            weight: req.body.weight,
            quantity: req.body.quantity,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            calories: req.body.calories,
          })
            .then((food) => {
              res.status(201).json(food);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send(`Error ${error}`);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Deletes food from list of foods
app.delete(
  '/food-list/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOneAndRemove({ name: req.params.name })
      .then((food) => {
        if (!food) {
          res.status(400).send(`${req.params.name} was not found.`);
        } else {
          res.status(200).send(`${req.params.name} was deleted.`);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Updates food data of a food by name
app.put(
  '/food-list/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOneAndUpdate(
      { name: req.params.name },
      {
        $set: {
          name: req.body.name,
          weight: req.body.weight,
          quantity: req.body.quantity,
          protein: req.body.protein,
          carbs: req.body.carbs,
          fat: req.body.fat,
          calories: req.body.calories,
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

/* 
  USER ENDPOINTS
*/

// Allows new user to register
app.post(
  '/users',
  [
    check('username', 'Username is required').isLength({ min: 5, max: 15 }),
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

    let hashedPassword = User.hashPassword(req.body.password);
    User.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(`${req.body.email} already exists`);
        } else {
          User.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthdate: req.body.birthdate,
            sex: req.body.sex,
            height: req.body.height,
            currentWeight: req.body.currentWeight,
            goalWeight: req.body.goalWeight,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send(`Error ${error}`);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Returns user profile
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ username: req.params.username })
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Allows existing user to update basic info
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          birthdate: req.body.birthdate,
          sex: req.body.sex,
          height: req.body.height,
          currentWeight: req.body.currentWeight,
          goalWeight: req.body.goalWeight,
          macros: {
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            calories: req.body.calories,
          },
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

// Allows user to add a diary entry to profile
app.post(
  '/users/:username/diary',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: {
          diary: {
            type: req.body.type,
            date: req.body.date,
            weightValue: req.body.weightValue,
            diaryMeal: req.body.diaryMeal,
            nutritionalCont: {
              name: req.body.diaryFoodName,
              weight: req.body.diaryFoodWeight,
              quantity: req.body.diaryFoodQuantity,
              protein: req.body.diaryProtein,
              carbs: req.body.diaryCarbs,
              fat: req.body.diaryFat,
              calories: req.body.diaryCalories,
            },
          },
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

// Allows user to update a food entry from diary
app.put(
  '/users/:username/:diaryId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      {
        username: req.params.username,
        'diary._id': req.params.diaryId,
      },
      {
        $set: {
          'diary.$.date': req.body.date,
          'diary.$.weightvalue': req.body.weightvalue,
          'diary.$.diaryMeal': req.body.diaryMeal,
          'diary.$.weightValue': req.body.weightValue,
          'diary.$.nutritionalCont.name': req.body.diaryFoodName,
          'diary.$.nutritionalCont.weight': req.body.diaryFoodWeight,
          'diary.$.nutritionalCont.quantity': req.body.diaryFoodQuantity,
          'diary.$.nutritionalCont.protein': req.body.diaryProtein,
          'diary.$.nutritionalCont.carbs': req.body.diaryCarbs,
          'diary.$.nutritionalCont.fat': req.body.diaryFat,
          'diary.$.nutritionalCont.calories': req.body.diaryCalories,
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

// Allows user to delete a diary entry from profile
app.delete(
  '/users/:diaryId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      {
        'diary._id': req.params.diaryId,
      },
      {
        $pull: {
          diary: { _id: req.params.diaryId },
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

// Allows user to deregister
app.delete(
  '/users/:username/:email',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({
      username: req.params.username,
      email: req.params.email,
    })
      .then((user) => {
        if (!user) {
          res.status(400).send(`${req.params.username} was not found`);
        } else {
          res
            .status(200)
            .send(`${req.params.username} was successfully deleted`);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Listen for requests

/* 
  Comment out here if running project local ⬇️
*/

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});

/* 
  Uncomment here to run project local
*/

// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080');
// });
