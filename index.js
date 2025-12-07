const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const ErrorMiddleware = require("./middlewares/Error");
const { envVariables } = require("./config/Constants");
const { makeRequiredDirectories } = require("./utils/fileDirectory");
const ErrorHandler = require("./utils/ErrorHandler");
const connectDb = require("./config/db");
const app = express();
const { appPort } = envVariables;

makeRequiredDirectories();

const allowedUrls = ["http://localhost:3000", "https://admin.adawat360.com"];

app.use(
  cors({
    origin: allowedUrls, // for development only
    credentials: true, // enables setting cookies in the response
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1", routes);

app.use((req, res, next) => {
  next(new ErrorHandler("Route not found", 404));
});

app.use(ErrorMiddleware);
app.listen(appPort, async () => {
  console.log(`Listening to port ${appPort}`);
  await connectDb();
});
