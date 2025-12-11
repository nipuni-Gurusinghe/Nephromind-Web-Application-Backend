// Path: /src/routes/index.js

const express = require('express');
const router = express.Router();

// Import specific route groups
const authRoutes = require('./authRoutes');

// --- Define Route Groups ---

// All Admin-level authentication routes start with /admin
// Example: /api/admin/register is mapped here
router.use('/admin', authRoutes); 

// Future routes will be mounted here:
router.use('/admin', require('./communityRoutes')); 
// router.use('/admin', require('./doctorRoutes')); 

module.exports = router;