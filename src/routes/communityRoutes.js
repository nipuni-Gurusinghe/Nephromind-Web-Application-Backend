const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

router.get('/event', communityController.getCommunityEvents);
router.get('/multimedia', communityController.getMultimedia);
router.get('/faq', communityController.getFAQs);

router.get('/safe-water-guide', communityController.getSafeWaterGuides); 
router.get('/farmer-safety', communityController.getFarmerSafetyTips); 
router.get('/healthy-habits', communityController.getHealthyHabits); 


router.post('/event', communityController.createCommunityEvent); 
router.post('/multimedia', communityController.createMultimedia);
router.post('/faq', communityController.createFAQ);
router.post('/safe-water-guide', communityController.createSafeWaterGuide);
router.post('/farmer-safety', communityController.createFarmerSafetyTip); 
router.post('/healthy-habits', communityController.createHealthyHabit);


router.delete('/event/:id', communityController.deleteCommunityEvent);
router.delete('/multimedia/:id', communityController.deleteMultimedia);
router.delete('/faq/:id', communityController.deleteFAQ);
router.delete('/safe-water-guide/:id', communityController.deleteSafeWaterGuide);
router.delete('/farmer-safety/:id', communityController.deleteFarmerSafetyTip); 
router.delete('/healthy-habits/:id', communityController.deleteHealthyHabit); 


module.exports = router;