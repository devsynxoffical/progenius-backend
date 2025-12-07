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

const allowedUrls = [
  "http://localhost:3000",
  "http://10.0.2.2:8000",
  "https://admin.adawat360.com",
  "https://progenius-backend-production.up.railway.app",
  process.env.FRONTEND_URL || "*" // Allow defined frontend or all
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedUrls.indexOf(origin) === -1 && allowedUrls.indexOf("*") === -1) {
        // Optional: Relax this for public API if you want
        // return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        return callback(null, true); // Temporarily allow all for production troubleshooting
      }
      return callback(null, true);
    },
    credentials: true,
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
