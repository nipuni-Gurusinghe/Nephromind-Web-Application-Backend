const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// --- DOCTOR ENDPOINTS ---

/** * This is where the error was triggered. 
 * We must ensure communityController.getAllEvents exists.
 */
router.get('/community/event', communityController.getAllEvents);

module.exports = router;