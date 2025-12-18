const { default: mongoose } = require("mongoose");
const { envVariables } = require("./Constants");
const { mongoDbURI } = envVariables;
async function connectDb() {
  if (!mongoDbURI) {
    console.error("FATAL ERROR: MONGODB_URI is undefined in environment variables.");
    console.error("Please check your Railway Project Settings -> Variables");
    process.exit(1);
  }

  console.log(`Attempting to connect to MongoDB... (URI starts with: ${mongoDbURI.substring(0, 15)}...)`);

  try {
    await mongoose.connect(mongoDbURI);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDb;
