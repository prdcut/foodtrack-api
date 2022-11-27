const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User model
let userSchema = mongoose.Schema({
  username: { type: String, unique: true, required: true, dropDups: true },
  password: String,
  email: String,
  birthdate: Date,
  sex: String,
  height: Number,
  macros: {
    protein: Number,
    carbs: Number,
    fat: Number,
    calories: Number,
  },
  currentWeight: Number,
  goalWeight: Number,
  diary: [
    mongoose.Schema({
      type: { type: String, required: true, enum: ['weight', 'food'] },
      date: { type: String, required: true },
      weightValue: Number,
      diaryMeal: String,
      nutritionalCont: {
        type: mongoose.Schema.Types.Object,
        ref: 'nutritionalCont',
        required: function () {
          return this.type === 'food';
        },
      },
    }),
  ],
});

// Nutritional content model
let nutritionalContSchema = mongoose.Schema({
  protein: Number,
  carbs: Number,
  fat: Number,
  calories: Number,
});

// Food model
let foodSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true, dropDups: true },
  weight: Number || null,
  quantity: Number || null,
  protein: Number,
  carbs: Number,
  fat: Number,
  calories: Number,
});

userSchema.statics.hashPassword = (p) => {
  return bcrypt.hashSync(p, 10);
};

userSchema.methods.validatePassword = function (p) {
  return bcrypt.compareSync(p, this.password);
};

let User = mongoose.model('user', userSchema);
let Food = mongoose.model('food', foodSchema);
let NutritionalCont = mongoose.model('nutritionalCont', nutritionalContSchema);

module.exports.User = User;
module.exports.Food = Food;
