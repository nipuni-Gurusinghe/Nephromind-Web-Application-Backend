// src/routes/communityRoutes.js

const express = require('express');
const router = express.Router();

// Import all necessary controller functions using destructuring
const {
    // Event Handlers
    getCommunityEvents,
    createCommunityEvent,
    deleteCommunityEvent,
    
    // Multimedia Handlers (New)
    getMultimedia,
    createMultimedia,
    deleteMultimedia,

    // Other Community Handlers (Placeholders)
    getFAQs, createFAQ, deleteFAQ,
    getSafeWaterGuides, createSafeWaterGuide, deleteSafeWaterGuide,
    getFarmerSafetyTips, createFarmerSafetyTip, deleteFarmerSafetyTip,
    getHealthyHabits, createHealthyHabit, deleteHealthyHabit

} = require('../controllers/communityController'); 

// NOTE: Add your authorization middleware (e.g., const { protect } = require('../middlewares/authMiddleware');)
// and apply it to the Admin routes below.

// ---------------------------------------------------------------------
// --- PUBLIC VIEW ENDPOINTS (Base path: /community/...) ---------------
// ---------------------------------------------------------------------

router.get('/event', getCommunityEvents);
router.get('/multimedia', getMultimedia);
router.get('/faq', getFAQs);
router.get('/safe-water-guide', getSafeWaterGuides);
router.get('/farmer-safety', getFarmerSafetyTips);
router.get('/healthy-habits', getHealthyHabits);


// ---------------------------------------------------------------------
// --- ADMIN MANAGEMENT ENDPOINTS (Base path: /admin/community/...) ----
// ---------------------------------------------------------------------

// --- POST (Creation) Routes ---
router.post('/event', createCommunityEvent); 
router.post('/multimedia', createMultimedia);
router.post('/faq', createFAQ);
router.post('/safe-water-guide', createSafeWaterGuide);
router.post('/farmer-safety', createFarmerSafetyTip);
router.post('/healthy-habits', createHealthyHabit);


// --- DELETE Routes ---
router.delete('/event/:id', deleteCommunityEvent);
router.delete('/multimedia/:id', deleteMultimedia);
router.delete('/faq/:id', deleteFAQ);
router.delete('/safe-water-guide/:id', deleteSafeWaterGuide);
router.delete('/farmer-safety/:id', deleteFarmerSafetyTip);
router.delete('/healthy-habits/:id', deleteHealthyHabit);


module.exports = router;