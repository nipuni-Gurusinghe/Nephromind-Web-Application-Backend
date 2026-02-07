const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// ---------------------------------------------------------------------
// --- PUBLIC VIEW ENDPOINTS (Base path: /community/...) ---------------
// ---------------------------------------------------------------------

// Community Events
router.get('/event', communityController.getCommunityEvents);

// Multimedia Content
router.get('/multimedia', communityController.getMultimedia);

// FAQ Section
router.get('/faq', communityController.getFAQs);

// Resource Guides
router.get('/safe-water-guide', communityController.getSafeWaterGuides); 
router.get('/farmer-safety', communityController.getFarmerSafetyTips); 
router.get('/healthy-habits', communityController.getHealthyHabits); 


// ---------------------------------------------------------------------
// --- ADMIN MANAGEMENT ENDPOINTS (Base path: /admin/community/...) ----
// ---------------------------------------------------------------------

/**
 * NOTE: If you have authentication middleware (e.g., verifyToken), 
 * apply it here to protect these routes.
 */

// --- POST (Creation) Routes ---
router.post('/event', communityController.createCommunityEvent); 
router.post('/multimedia', communityController.createMultimedia);
router.post('/faq', communityController.createFAQ);
router.post('/safe-water-guide', communityController.createSafeWaterGuide);
router.post('/farmer-safety', communityController.createFarmerSafetyTip); 
router.post('/healthy-habits', communityController.createHealthyHabit);


// --- DELETE Routes ---
router.delete('/event/:id', communityController.deleteCommunityEvent);
router.delete('/multimedia/:id', communityController.deleteMultimedia);
router.delete('/faq/:id', communityController.deleteFAQ);
router.delete('/safe-water-guide/:id', communityController.deleteSafeWaterGuide);
router.delete('/farmer-safety/:id', communityController.deleteFarmerSafetyTip); 
router.delete('/healthy-habits/:id', communityController.deleteHealthyHabit); 


module.exports = router;