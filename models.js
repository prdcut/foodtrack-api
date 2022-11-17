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
  goalWeight: Number,
  foodDiary: [
    mongoose.Schema({
      date: Date,
      diaryMeal: String,
      nutritionalCont: mongoose.Schema({
        protein: Number,
        carbs: Number,
        fat: Number,
        calories: Number,
      }),
    }),
  ],
  weightDiary: [
    mongoose.Schema({
      date: Date,
      value: Number,
    }),
  ],
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

module.exports.User = User;
module.exports.Food = Food;
