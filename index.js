const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');

const app = express();
const Models = require('./models.js');
const Food = Models.Food;

mongoose.connect('mongodb://localhost:27017/foodtrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Gets the list of data about ALL foodList
app.get('/food-list', (req, res) => {
  Food.find()
    .then(food => {
      res.status(201).json(food);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(`Error ${error}`);
    });
});

// Gets the data about a single food by name
app.get('/food-list/:name', (req, res) => {
  Food.findOne({ name: req.body.name })
    .then(food => {
      res.json(food);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(`Error ${error}`);
    });
});

// Adds data for a new food to our list of foodList.
app.post('/food-list', (req, res) => {
  Food.findOne({ name: req.body.name })
    .then(food => {
      if (food) {
        return res.status(400).send(`${req.body.name} already exist`);
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
});

// Deletes a food from our list by name
app.delete('/food-list/:name', (req, res) => {
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
});

// Update nutrional values of a food by food name
app.put('/food-list/:name/:macro/:value', (req, res) => {
  let food = foodList.find(food => {
    return food.name === req.params.name;
  });

  if (food) {
    food.macros[req.params.macro] = parseInt(req.params.value);
    res
      .status(201)
      .send(
        `${req.params.name}'s ${req.params.macro} was updated to ${req.params.value}.`
      );
  } else {
    res.status(404).send(`${req.params.name} was not found.`);
  }
});

app.put('/food-list/:name/:macro/:value', (req, res) => {
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
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
