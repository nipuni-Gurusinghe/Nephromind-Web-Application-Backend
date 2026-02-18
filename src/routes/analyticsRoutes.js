const express = require('express');
const router = express.Router();
router.get('/user-distribution', (req, res) => res.status(501).json({ message: "GET /admin/analytics/user-distribution endpoint not yet implemented." }));
router.get('/ckd-overview', (req, res) => res.status(501).json({ message: "GET /admin/analytics/ckd-overview endpoint not yet implemented." }));

module.exports = router;