// Path: /src/app.js

const express = require('express');
const cors = require('cors');

// Import config (This ensures Firebase is ready when the app starts)
const { firebaseAdmin } = require('./config'); 
const mainRouter = require('./routes'); 

const app = express();

// ---------------------------------
// Global Middleware Setup
// ---------------------------------

// 1. CORS: Allows your React frontend to communicate with this backend
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 

// 2. Body Parser: Express built-in middleware to read JSON data from the request body
app.use(express.json({ limit: '10kb' })); 

// ---------------------------------
// Routes
// ---------------------------------

// Mount the main router (which includes all other routes) at the /api path
app.use('/api', mainRouter);

// Simple root health check route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'NephroMind Admin Backend is operational.' });
});

// Export the Express app instance
module.exports = app;