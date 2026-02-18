const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
router.get('/community/event', communityController.getAllEvents);

module.exports = router;