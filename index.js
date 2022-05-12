const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let foodList = [
  {
    name: 'chicken',
    weight: '100',
    quantity: '--',
    macros: {
      protein: '27',
      carbs: '0',
      fat: '3,6',
      calories: '138',
    },
  },
  {
    name: 'salmon',
    weight: '100',
    quantity: '--',
    macros: {
      protein: '25',
      carbs: '0',
      fat: '11',
      calories: '200',
    },
  },
  {
    name: 'tuna',
    weight: '100',
    quantity: '--',
    macros: {
      protein: '23',
      carbs: '0',
      fat: '12',
      calories: '200',
    },
  },
];

// Gets the list of data about ALL foodList

app.get('/food-list', (req, res) => {
  res.json(foodList);
});
// Gets the data about a single food by name

app.get('/food-list/:name', (req, res) => {
  res.json(
    foodList.find(foodList => {
      return foodList.name === req.params.name;
    })
  );
});

// Adds data for a new food to our list of foodList.
app.post('/food-list', (req, res) => {
  let newFood = req.body;

  if (!newFood.name && !newFood.weight && !newFood.macros) {
    const message =
      'Missing name, weight and nutritional values in request body';
    res.status(400).send(message);
  } else {
    newFood.id = uuid.v4();
    foodList.push(newFood);
    res.status(201).send(newFood);
  }
});

// Deletes a food from our list by Id
app.delete('/food-list/:id', (req, res) => {
  let food = foodList.find(food => {
    return food.id === req.params.id;
  });

  if (food) {
    foodList = foodList.filter(obj => {
      return obj.id !== req.params.id;
    });
    res.status(201).send(`${req.params.id} was deleted.`);
  }
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
