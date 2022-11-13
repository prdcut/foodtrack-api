const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Food model
let foodSchema = mongoose.Schema({
  name: { type: String, required: true },
  weight: Number || null,
  quantity: Number || null,
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  calories: { type: Number, required: true },
});

// // Meal model
// let mealSchema = mongoose.Schema({
//   name: String,
//   foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
//   protein: Number,
//   carbs: Number,
//   fat: Number,
//   calories: Number,
// });

// // Diary model
// let diarySchema = mongoose.Schema({
//   currentWeight: Number,
//   date: Date || String,
//   breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
//   lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
//   dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
//   snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
//   totalMacros: mongoose.Schema({
//     protein: Number,
//     carbs: Number,
//     fat: Number,
//     calories: Number,
//   }),
// });

// User model
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: String,
  email: { type: String, required: true },
  gender: String,
  age: Number,
  height: Number,
  currentWeight: Number,
  goalWeight: Number,
  macros: mongoose.Schema({
    protein: Number,
    carbs: Number,
    fat: Number,
    calories: Number,
  }),
  diary: [
    mongoose.Schema({
      date: Date || String,
      breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
      lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
      dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
      snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
      diaryMacros: mongoose.Schema({
        protein: Number,
        carbs: Number,
        fat: Number,
        calories: Number,
      }),
    }),
  ],
  meals: [
    mongoose.Schema({
      name: String,
      foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
      protein: Number,
      carbs: Number,
      fat: Number,
      calories: Number,
    }),
  ],
  weightHistory: [
    mongoose.Schema({
      weights: [Number],
      dates: [Date || String],
    }),
  ],
});

userSchema.statics.hashPassword = (p) => {
  return bcrypt.hashSync(p, 10);
};

userSchema.methods.validatePassword = function (p) {
  return bcrypt.compareSync(p, this.password);
};

let Food = mongoose.model('Food', foodSchema);
let User = mongoose.model('User', userSchema);
// let Meal = mongoose.model('Meal', mealSchema);
// let Diary = mongoose.model('Diary', diarySchema);

module.exports.Food = Food;
module.exports.User = User;
// module.exports.Meal = Meal;
// module.exports.Diary = Diary;
