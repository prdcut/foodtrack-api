const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Food model
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

// User model
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }],
});

userSchema.statics.hashPassword = p => {
  return bcrypt.hashSync(p, 10);
};

userSchema.methods.validatePassword = function (p) {
  return bcrypt.compareSync(p, this.password);
};

let Food = mongoose.model('Food', foodSchema);
let User = mongoose.model('User', userSchema);

module.exports.Food = Food;
module.exports.User = User;
