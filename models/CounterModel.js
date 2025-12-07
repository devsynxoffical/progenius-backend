const { default: mongoose } = require("mongoose");

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true }, // Model name
  count: { type: Number, default: 0 }, // Counter value
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;
