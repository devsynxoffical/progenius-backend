const fs = require("fs");
const path = require("path");

// Create a writable stream for the error log
const errorLogStream = fs.createWriteStream(
  path.join(__dirname, "../error.log"),
  {
    flags: "a",
  }
);

// Custom error logging function
function logError(error) {
  const errorMessage = `[${new Date().toISOString()}] ${
    error.stack || JSON.stringify(error, Object.getOwnPropertyNames(error))
  }\n`;
  errorLogStream.write(errorMessage);
}

module.exports = logError;
