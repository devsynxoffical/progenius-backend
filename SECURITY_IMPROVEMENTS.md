# Security Improvements for ProGenius Backend

## Required NPM Packages

Install these security packages:

```bash
npm install express-rate-limit express-mongo-sanitize helmet xss-clean
```

## Implementation

### 1. Update `index.js`

Add security middleware:

```javascript
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const ErrorMiddleware = require("./middlewares/Error");
const { envVariables } = require("./config/Constants");
const { makeRequiredDirectories } = require("./utils/fileDirectory");
const ErrorHandler = require("./utils/ErrorHandler");
const connectDb = require("./config/db");

// NEW: Import security middleware
const securityMiddleware = require("./middlewares/SecurityMiddleware");

const app = express();
const { appPort } = envVariables;

makeRequiredDirectories();

const allowedUrls = [
  "http://localhost:3000",
  "http://10.0.2.2:8000", // Android Emulator
  process.env.FRONTEND_URL || "https://yourdomain.com"
];

app.use(
  cors({
    origin: allowedUrls,
    credentials: true,
  })
);

// NEW: Add security headers
app.use(securityMiddleware.helmet);

// NEW: Add MongoDB injection protection
app.use(securityMiddleware.mongoSanitize);

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NEW: Apply rate limiting to all API routes
app.use("/v1", securityMiddleware.apiLimiter);

// NEW: Apply stricter rate limiting to auth routes
app.use("/v1/auth", securityMiddleware.authLimiter);
app.use("/v1/admin/signin", securityMiddleware.authLimiter);
app.use("/v1/customer/signin", securityMiddleware.authLimiter);
app.use("/v1/customer/signup", securityMiddleware.authLimiter);

app.use("/v1", routes);

app.use((req, res, next) => {
  next(new ErrorHandler("Route not found", 404));
});

app.use(ErrorMiddleware);

app.listen(appPort, async () => {
  console.log(`Listening to port ${appPort}`);
  await connectDb();
});
```

### 2. Update `.env`

Add these variables:

```env
# Existing variables...
PORT = 8000
MONGODB_URI = mongodb://127.0.0.1:27017/progenius
ACCESS_TOKEN_SECRET = your-secret-key
SHORT_TOKEN_SECRET = your-short-secret
HASH_SECRET = your-hash-secret

# NEW: Add these
NODE_ENV = development
FRONTEND_URL = http://localhost:3000
```

### 3. CORS Configuration for Production

Update CORS for production:

```javascript
const allowedUrls = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : [
      "http://localhost:3000",
      "http://10.0.2.2:8000",
      "http://localhost:8000"
    ];
```

## Benefits

1. **Rate Limiting**: Prevents brute force attacks and DDoS
2. **MongoDB Sanitization**: Prevents NoSQL injection
3. **Helmet**: Adds security headers (XSS, clickjacking protection)
4. **Payload Limits**: Prevents large payload attacks

## Testing

Test rate limiting:
```bash
# Should block after 5 attempts
for i in {1..10}; do curl -X POST http://localhost:8000/v1/customer/signin; done
```

## Optional: Add Request Logging

```bash
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('combined')); // Add after cors
```

This will log all requests for debugging and security auditing.
