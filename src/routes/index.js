
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const doctorRoutes = require('./doctorRoutes');
const communityRoutes = require('./communityRoutes'); 
router.use('/admin', authRoutes); 
router.use('/doctor', doctorRoutes);
router.use('/admin/community', communityRoutes);   
router.use('/doctor/community', communityRoutes); 
module.exports = router;