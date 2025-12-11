// Path: /src/controllers/authController.js

const { firebaseAdmin } = require('../config');

// Get the Firebase Authentication and Firestore service instances
const auth = firebaseAdmin.auth();
const db = firebaseAdmin.firestore(); 

/**
 * @route POST /api/admin/register
 * @description Registers a new admin user in Firebase Authentication AND saves their profile to Firestore.
 * Request Body: { email, password, name }
 */
exports.registerAdmin = async (req, res) => {
  const { email, password, name } = req.body;

  // --- 1. Validation ---
  if (!email || !password || !name) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Missing required fields: email, password, and name.' 
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long (Firebase minimum).'
    });
  }

  try {
    // --- 2. Create User in Firebase Auth ---
    const user = await auth.createUser({
      email: email,
      password: password,
      displayName: name
    });

    // --- 3. Set Custom Claim (Crucial for Admin Role) ---
    await auth.setCustomUserClaims(user.uid, { admin: true });
    
    // --- 4. Save Admin Data to Firestore (Updated Step) ---
    const adminRef = db.collection('admin_users_data').doc(user.uid);
    
    // ⚠️ CRITICAL SECURITY WARNING: Saving the plain text password here. 
    // This is highly insecure and should only be done if you have a 
    // specific, non-standard requirement AND a highly secure environment.
    await adminRef.set({
        email: email,
        username: name,
        password: password, // <-- **The requested change is here**
        createdAt: new Date().toISOString(),
    });

    console.log(`[AUTH] New Admin registered and Firestore profile created: ${user.uid} (${email})`);

    // --- 5. Success Response ---
    return res.status(201).json({
      status: 'success',
      adminId: user.uid,
    });

  } catch (error) {
    // ... (Error handling remains the same) ...
    console.error('[AUTH] Admin Registration Error:', error.code, error.message);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected server error occurred during registration.';

    if (error.code === 'auth/email-already-exists') {
        statusCode = 409; 
        errorMessage = 'This email address is already registered.';
    } else if (error.code === 'auth/invalid-email') {
        statusCode = 400; 
        errorMessage = 'The provided email address is not valid.';
    }

    return res.status(statusCode).json({ 
        status: 'error', 
        message: errorMessage 
    });
  }
};

// ... (exports.loginAdmin remains unchanged) ...



// Path: /src/controllers/authController.js
// ... (RegisterAdmin remains the same) ...


/**
 * @route POST /api/admin/login
 * @description Generates a custom token for an admin user.
 * Request Body: { email, password }
 */
exports.loginAdmin = async (req, res) => {
  // Destructure both email AND password from the request body
  const { email, password } = req.body; 

  // --- 1. Basic Validation ---
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: email and password.'
    });
  }

  try {
    // --- 2. Get User from Firebase Auth ---
    const userRecord = await auth.getUserByEmail(email);
    const userId = userRecord.uid;

    // --- 3. Get User Data (including the insecurely stored password) from Firestore ---
    const adminDoc = await db.collection('admin_users_data').doc(userId).get();

    // Check if the admin profile exists in Firestore
    if (!adminDoc.exists) {
        return res.status(404).json({
            status: 'error',
            message: 'User profile data not found.'
        });
    }

    // ⚠️ CRITICAL SECURITY STEP: Check the user-provided password against the 
    // plain text password stored in Firestore.
    // In a SECURE system, you would use a library like `bcrypt` to compare 
    // the provided password with a hashed version stored in Firestore.
    if (adminDoc.data().password !== password) {
        console.log(`[AUTH] Login attempt failed: Invalid password for ${email}.`);
        // Use a generic message to prevent password enumeration
        return res.status(401).json({
            status: 'error',
            message: 'Invalid credentials. Access denied.'
        });
    }

    // --- 4. Check for Admin Claim (Authorization) ---
    // Check if the user has the 'admin: true' custom claim
    if (!userRecord.customClaims || userRecord.customClaims.admin !== true) {
      console.log(`[AUTH] Login attempt failed: User ${email} is not an Admin.`);
      return res.status(403).json({
        status: 'error',
        message: 'Authorization failed. Access denied.'
      });
    }

    // --- 5. Generate Custom Token with Admin Claim ---
    const customToken = await auth.createCustomToken(userId, { admin: true });
    
    console.log(`[AUTH] Admin login successful: ${userId} (${email})`);

    // --- 6. Success Response ---
    return res.status(200).json({
      status: 'success',
      message: 'Custom token generated successfully.',
      customToken: customToken,
      uid: userId
    });

  } catch (error) {
    // --- 7. Error Handling ---
    console.error('[AUTH] Admin Login Error:', error.code, error.message);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected server error occurred during login.';

    if (error.code === 'auth/user-not-found') {
      statusCode = 404;
      errorMessage = 'No user found with the given email.';
    } else if (error.code === 'auth/invalid-email') {
      statusCode = 400;
      errorMessage = 'The provided email address is not valid.';
    }

    return res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
};