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
 * @route POST /api/doctor/register
 * @description Registers a new doctor user in Firebase Authentication AND saves their profile to Firestore.
 * Request Body: { email, password, name, specialistArea (optional) }
 * * **NEW FUNCTION ADDED**
 */
exports.registerDoctor = async (req, res) => {
    const { email, password, name, specialistArea } = req.body;

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
        
        const userId = user.uid; // Get the Doctor ID

        // --- 3. Set Custom Claim (Crucial for Doctor Role) ---
        await auth.setCustomUserClaims(userId, { doctor: true });
        
        // --- 4. Save Doctor Data to Firestore (using the 'doctor_user_data' collection) ---
        // The document ID is set to the Firebase Auth User ID (uid)
        const doctorRef = db.collection('doctor_user_data').doc(userId);
        
        // ⚠️ CRITICAL SECURITY WARNING: Saving the plain text password here. 
        // This follows your existing pattern but is highly insecure.
        await doctorRef.set({
            doctor_id: userId, // Explicitly saving the ID as requested
            email: email,
            username: name,
            password: password, // <-- Insecurely stored plain text password
            specialistArea: specialistArea || 'Unspecified', // Optional field
            createdAt: new Date().toISOString(),
        });

        console.log(`[AUTH] New Doctor registered and Firestore profile created: ${userId} (${email})`);

        // --- 5. Success Response ---
        return res.status(201).json({
            status: 'success',
            doctorId: userId,
        });

    } catch (error) {
        // --- 6. Error Handling ---
        console.error('[AUTH] Doctor Registration Error:', error.code, error.message);
        
        let statusCode = 500;
        let errorMessage = 'An unexpected server error occurred during doctor registration.';

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

/**
 * @route DELETE /api/doctor/:doctorId
 * @description Deletes a doctor from Firebase Authentication and their profile from Firestore.
 * Route Params: doctorId (The Firebase Auth UID of the doctor to delete)
 * * **NEW FUNCTION ADDED**
 */
exports.deleteDoctor = async (req, res) => {
    // Get the doctorId from the URL parameter
    const doctorId = req.params.doctorId; 

    if (!doctorId) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required parameter: doctorId.'
        });
    }

    try {
        // --- 1. Delete Firestore Document ---
        const firestoreDeleteResult = await db.collection('doctor_user_data').doc(doctorId).delete();
        console.log(`[AUTH] Firestore document for Doctor ${doctorId} deleted successfully.`);

        // --- 2. Delete Firebase Auth User ---
        await auth.deleteUser(doctorId);
        console.log(`[AUTH] Firebase Auth user ${doctorId} deleted successfully.`);

        // --- 3. Success Response ---
        return res.status(200).json({
            status: 'success',
            message: `Doctor with ID ${doctorId} deleted successfully from Auth and Firestore.`,
            doctorId: doctorId
        });

    } catch (error) {
        console.error('[AUTH] Doctor Deletion Error:', error.code, error.message);
        
        let statusCode = 500;
        let errorMessage = 'An unexpected server error occurred during doctor deletion.';

        if (error.code === 'auth/user-not-found') {
            statusCode = 404;
            errorMessage = 'No doctor found with the given ID in Firebase Authentication.';
        }

        // Handle case where Firestore delete failed (e.g., if doc didn't exist)
        // Note: Firestore delete does not throw a specific error if the document doesn't exist, 
        // but we handle Auth errors explicitly.
        
        return res.status(statusCode).json({
            status: 'error',
            message: errorMessage
        });
    }
};

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

/**
 * @route POST /api/admin/doctor/login
 * @description Generates a custom token for a doctor user.
 * Request Body: { email, password }
 */
exports.loginDoctor = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: email and password.'
    });
  }

  try {
    // 1. Get User from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    const userId = userRecord.uid;

    // 2. Get Doctor Data from Firestore
    const doctorDoc = await db.collection('doctor_user_data').doc(userId).get();

    if (!doctorDoc.exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Doctor profile not found.'
      });
    }

    // 3. Security Check (Plain text check as per your current pattern)
    if (doctorDoc.data().password !== password) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Access denied.'
      });
    }

    // 4. Check for Doctor Claim
    if (!userRecord.customClaims || userRecord.customClaims.doctor !== true) {
      return res.status(403).json({
        status: 'error',
        message: 'Authorization failed. You are not registered as a Doctor.'
      });
    }

    // 5. Generate Custom Token
    const customToken = await auth.createCustomToken(userId, { doctor: true });

    return res.status(200).json({
      status: 'success',
      message: 'Doctor login successful.',
      customToken: customToken,
      uid: userId
    });

  } catch (error) {
    console.error('[AUTH] Doctor Login Error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error during login.' });
  }
};