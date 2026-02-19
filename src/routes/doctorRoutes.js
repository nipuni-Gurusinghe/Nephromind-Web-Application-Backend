const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
router.get('/community/event', communityController.getAllEvents);
router.get('/community/multimedia', communityController.getMultimedia);
router.get('/community/faq', communityController.getFAQs);
module.exports = router;
