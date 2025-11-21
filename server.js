// 1. *** IMPORTANT: Load environment variables FIRST ***
// This must be the very first line of executable code to ensure process.env is populated.
require('dotenv').config();

// --- Application Setup ---

// 2. Import core packages and Firebase Admin
const express = require('express');
const cors = require('cors'); 
const admin = require('firebase-admin'); 

// 3. Initialize the app
const app = express();

// --- Global Middleware ---
// Enable CORS for all requests
app.use(cors()); 
// Enable body parser for JSON requests
app.use(express.json());

// 4. Check for critical environment variables early
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
    console.error('FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_PATH is not defined in .env.');
    console.error('Please ensure your .env file is loaded and contains the correct path.');
    process.exit(1); 
}

// 5. Integrate API Routes
// Load route files based on your API Documentation and file structure:
const authRoutes = require('./src/routes/authRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

// Public Community Routes (GET /community/...)
// Used for public viewing endpoints defined in your docs (e.g., GET /community/event)
app.use('/community', communityRoutes);

// Admin Routes (POST/DELETE/GET /admin/...)
// NOTE: We are using the simpler '/admin' prefix based on your API documentation.

// Authentication Routes (e.g., POST /admin/register, POST /admin/login)
app.use('/admin', authRoutes); 

// Community Management Routes (e.g., POST /admin/community/event, DELETE /admin/community/event/:id)
app.use('/admin/community', communityRoutes); 

// Doctor Management Routes (e.g., POST /admin/doctor, DELETE /admin/doctor/:id)
app.use('/admin/doctor', doctorRoutes);

// Analytics Routes (e.g., GET /admin/analytics/user-distribution)
app.use('/admin/analytics', analyticsRoutes);


// 6. Root Route (Health Check / Welcome Message)
// This is the primary entry point for a server health check.
app.get('/', (req, res) => {
    res.status(200).send('<h1>Nephromind Backend API</h1><p>API is operational and serving requests.</p>');
});

// 7. Firebase Initialization
const initializeFirebaseAdmin = () => {
    // FIX: Check if an app has already been initialized (prevents 'The default Firebase app already exists' with nodemon)
    if (admin.apps.length > 0) {
        console.log('Firebase Admin SDK already initialized. Skipping.');
        return;
    }

    try {
        const serviceAccount = require(serviceAccountPath); 
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        console.log('Firebase Admin SDK initialized successfully!');

    } catch (e) {
        console.error(`FATAL ERROR: Firebase Initialization Failed.`);
        console.error(`Ensure service account file exists at: ${serviceAccountPath}`);
        console.error(`Error Details: ${e.message}`);
        process.exit(1);
    }
}

// 8. Start Server Function
const startServer = () => {
    // 8a. Initialize Firebase Admin SDK
    initializeFirebaseAdmin();

    // 8b. Start listening for incoming requests
    // Use the PORT from .env or default to 4000
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

// Execute the server start function
startServer();