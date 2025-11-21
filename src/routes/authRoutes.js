const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registering a new Admin user
// Maps POST request to the registerAdmin controller function
router.post('/register', authController.registerAdmin); // Path: /admin/register

// Route for admin login (placeholder)
router.post('/login', authController.loginAdmin); // Path: /admin/login

module.exports = router;