// src/routes/communityRoutes.js

const express = require('express');
const router = express.Router();

// Import all necessary controller functions using destructuring
const {
    // Event Handlers
    getCommunityEvents,
    createCommunityEvent,
    deleteCommunityEvent,
    
    // Multimedia Handlers
    getMultimedia,
    createMultimedia,
    deleteMultimedia,

    // Safe Water Guide Handlers
    getSafeWaterGuides, 
    createSafeWaterGuide, 
    deleteSafeWaterGuide, 
    
    // Farmer Safety Tip Handlers
    getFarmerSafetyTips, 
    createFarmerSafetyTip, 
    deleteFarmerSafetyTip,

    // Healthy Habit Handlers
    getHealthyHabits, 
    createHealthyHabit, 
    deleteHealthyHabit, 

    // Community FAQ Handlers 
    getFAQs, // <-- Implemented
    createFAQ, // <-- Implemented
    deleteFAQ // <-- Implemented

} = require('../controllers/communityController'); 

// ---------------------------------------------------------------------
// --- PUBLIC VIEW ENDPOINTS (Base path: /community/...) ---------------
// ---------------------------------------------------------------------

router.get('/event', getCommunityEvents);
router.get('/multimedia', getMultimedia);
router.get('/faq', getFAQs); // <-- GET Route
router.get('/safe-water-guide', getSafeWaterGuides); 
router.get('/farmer-safety', getFarmerSafetyTips); 
router.get('/healthy-habits', getHealthyHabits); 


// ---------------------------------------------------------------------
// --- ADMIN MANAGEMENT ENDPOINTS (Base path: /admin/community/...) ----
// ---------------------------------------------------------------------

// --- POST (Creation) Routes ---
router.post('/event', createCommunityEvent); 
router.post('/multimedia', createMultimedia);
router.post('/faq', createFAQ); // <-- POST Route
router.post('/safe-water-guide', createSafeWaterGuide);
router.post('/farmer-safety', createFarmerSafetyTip); 
router.post('/healthy-habits', createHealthyHabit);


// --- DELETE Routes ---
router.delete('/event/:id', deleteCommunityEvent);
router.delete('/multimedia/:id', deleteMultimedia);
router.delete('/faq/:id', deleteFAQ); // <-- DELETE Route
router.delete('/safe-water-guide/:id', deleteSafeWaterGuide);
router.delete('/farmer-safety/:id', deleteFarmerSafetyTip); 
router.delete('/healthy-habits/:id', deleteHealthyHabit); 


module.exports = router;