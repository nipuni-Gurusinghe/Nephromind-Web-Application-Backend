const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
router.post('/register', authController.registerAdmin);
router.post('/login', authController.loginAdmin); 
router.post('/doctor/register', authController.registerDoctor);
router.post('/doctor/login', authController.loginDoctor);
router.delete('/doctor/:doctorId', authController.deleteDoctor);
module.exports = router;