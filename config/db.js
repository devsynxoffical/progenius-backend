const { default: mongoose } = require("mongoose");
const { envVariables } = require("./Constants");
const { mongoDbURI } = envVariables;
async function connectDb() {
  mongoose
    .connect(mongoDbURI)
    .then(() => {
      console.log("database connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = connectDb;
