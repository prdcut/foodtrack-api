const mongoose = require('mongoose');

let foodSchema = mongoose.Schema({
  name: { type: String, required: true },
  weight: Number || null,
  quantity: Number || null,
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    calories: { type: Number, required: true },
  },
});

let Food = mongoose.model('Food', foodSchema);

module.exports.Food = Food;
