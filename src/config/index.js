// Path: /src/config/index.js

const admin = require('firebase-admin');
const path = require('path');

// 1. Get the path to the Service Account Key from the .env file
const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

// Simple check to ensure the config path is defined
if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    console.error("FATAL ERROR: FIREBASE_SERVICE_ACCOUNT_PATH is not defined in .env.");
    process.exit(1); 
}

try {
    // 2. Load the service account credentials JSON file
    const serviceAccount = require(serviceAccountPath);

    // 3. Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    
    console.log("✅ Firebase Admin SDK initialized.");

    // 4. Export the initialized admin object
    module.exports = {
        firebaseAdmin: admin
    };

} catch (error) {
    console.error(`\n---------------------------------------------------------`);
    console.error(`FATAL ERROR: Could not initialize Firebase Admin SDK.`);
    console.error(`- Check if the file '${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}' exists in the root folder.`);
    console.error(`- Error: ${error.message}`);
    console.error(`---------------------------------------------------------\n`);
    process.exit(1);
}