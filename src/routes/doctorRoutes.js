const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const healthyHabitsController = require('../models/HealthyHabit');
router.get('/community/event', communityController.getAllEvents);
router.get('/community/multimedia', communityController.getMultimedia);
router.get('/community/faq', communityController.getFAQs);
router.get('/community/healthy-habits', healthyHabitsController.getHealthyHabitsHandler);
module.exports = router;
