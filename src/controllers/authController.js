// Path: /src/controllers/authController.js

const { firebaseAdmin } = require('../config');

// Get the Firebase Authentication service instance
const auth = firebaseAdmin.auth();

/**
 * @route POST /api/admin/register
 * @description Registers a new admin user in Firebase Authentication.
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
    // This adds a flag to the user's token indicating they are an admin.
    await auth.setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`[AUTH] New Admin registered: ${user.uid} (${email})`);

    // --- 4. Success Response (as per API doc) ---
    return res.status(201).json({
      status: 'success',
      adminId: user.uid,
    });

  } catch (error) {
    // --- 5. Error Handling ---
    console.error('[AUTH] Admin Registration Error:', error.code, error.message);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected server error occurred during registration.';

    // Mapping common Firebase errors to user-friendly messages and status codes
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

// Placeholder for future login logic
exports.loginAdmin = (req, res) => {
  res.status(501).json({ message: "Login endpoint not yet implemented." });
};