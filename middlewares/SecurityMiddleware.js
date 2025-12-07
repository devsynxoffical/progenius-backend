const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// Rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs,
        max,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Specific rate limiters
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes for auth
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes for API

// Security middleware configuration
const securityMiddleware = {
    // Helmet for security headers
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    }),

    // MongoDB injection protection
    mongoSanitize: mongoSanitize(),

    // Rate limiters
    authLimiter,
    apiLimiter,
};

module.exports = securityMiddleware;
