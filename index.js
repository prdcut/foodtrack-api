//Global variables
const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

const { check, validationResult } = require('express-validator');
const app = express();
const Models = require('./models.js');
const Food = Models.Food;
const User = Models.User;
const Meal = Models.Meal;
const Diary = Models.Diary;

// Middlewear

/* 
  Uncomment here to run project local ⬇️
*/

// mongoose.connect('mongodb://localhost:27017/foodtrack', {
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
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
});

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

// Endpoints

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
            email: req.body.email,
            password: hashedPassword,
            gender: req.body.gender,
            username: req.body.username,
            age: req.body.age,
            height: req.body.height,
            currentWeight: req.body.currentWeight,
            goalWeight: req.body.goalWeight,
            macros: {
              protein: req.body.protein,
              carbs: req.body.carbs,
              fat: req.body.fat,
              calories: req.body.calories,
            },
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

// Allows existing user to update their info
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          email: req.body.email,
          gender: req.body.gender,
          username: req.body.username,
          age: req.body.age,
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

// Allows user to deregister
app.delete(
  '/users/:username/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(`${req.params.username} was not found`);
        } else {
          res.status(200).send(`${req.params.username} was deleted`);
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Allows user to create a meal
app.post(
  '/meals',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Meal.findOne({ name: req.body.name })
      .then((meal) => {
        if (meal) {
          return res.status(400).send(`${req.body.name} already exists`);
        } else {
          Meal.create({
            name: req.body.name,
            foods: req.body.foods,
            protein: req.body.protein,
            carbs: req.body.carbs,
            fat: req.body.fat,
            calories: req.body.calories,
          })
            .then((meal) => {
              res.status(201).json(meal);
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

// Returns a list of all meals
app.get(
  '/meals',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Meal.find()
      .then((meal) => {
        res.status(201).json(meal);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Allows user to update a meal
app.put(
  '/meals/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Meal.findOneAndUpdate(
      { name: req.params.name },
      {
        $set: {
          name: req.body.name,
          foods: req.body.foods,
          protein: req.body.protein,
          carbs: req.body.carbs,
          fat: req.body.fat,
          calories: req.body.calories,
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

// Allows user to delete a meal
app.delete(
  '/meals/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Meal.findOneAndRemove({ name: req.params.name })
      .then((meal) => {
        if (!meal) {
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

// Allows user to add a meal to their profile
app.post(
  '/users/:username/meals/:mealId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { meals: req.params.mealId } },
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

// Allows user to delete a meal from their profile
app.delete(
  '/users/:username/meals/:mealId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { meals: req.params.mealId } },
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

// Allows user to create a diary entry
app.post(
  '/diary',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Diary.findOne({ date: req.body.date })
      .then((diary) => {
        if (diary) {
          return res.status(400).send(`${req.body.diary} entry already exists`);
        } else {
          Diary.create({
            currentWeight: req.body.currentWeight,
            date: req.body.date,
            breakfast: req.body.breakfast,
            lunch: req.body.lunch,
            dinner: req.body.dinner,
            snacks: req.body.snacks,
            totalMacros: req.body.totalMacros,
          })
            .then((diary) => {
              res.status(201).json(diary);
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

// Allows user to add a diary to their profile
app.post(
  '/users/:username/diary/:dateId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { username: req.params.username },
      { $push: { diary: req.params.dateId } },
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

// Returns diary entry by id
app.get(
  '/users/:username/diary/:dateId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Diary.findOne({
      username: req.params.username,
      _id: req.params.dateId,
    })
      .then((diaryEntry) => {
        res.status(201).json(diaryEntry);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(`Error ${error}`);
      });
  }
);

// Allows user to update diary entry by date id
app.put(
  '/users/:username/diary/:dateId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      {
        username: req.params.username,
        date: req.params.dateId,
      },
      {
        $set: {
          breakfast: req.body.breakfast,
          lunch: req.body.lunch,
          dinner: req.body.dinner,
          snacks: req.body.snacks,
          totalMacros: req.body.totalMacros,
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

// Deletes diary entry from user profile
app.delete(
  '/users/:username/diary/:dateId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Food.findOneAndRemove({
      username: req.params.username,
      date: req.params.dateId,
    })
      .then((diaryEntry) => {
        if (!diaryEntry) {
          res.status(400).send(`${req.params.date} was not found.`);
        } else {
          res.status(200).send(`${req.params.date} was deleted.`);
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
