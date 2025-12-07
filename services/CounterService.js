const Counter = require("../models/CounterModel");

async function generateId(tableName, pad = 2) {
  const counter = await Counter.findOneAndUpdate(
    { model: tableName }, // Match the model name
    { $inc: { count: 1 } }, // Increment counter
    { new: true, upsert: true } // Create if not exists
  );
  return counter.count.toString().padStart(pad, "0");
}

async function getNextDocumentId(tableName, pad = 2) {
  const counter = await Counter.findOne({ model: tableName });
  if (!counter) return "1".padStart(pad, "0"); // If no counter exists, return "01" or "001"

  return (counter.count + 1).toString().padStart(pad, "0"); // Get next ID without updating
}

module.exports = { generateId, getNextDocumentId };
