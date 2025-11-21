const express = require('express');
const router = express.Router();
// NOTE: You will need to create the corresponding controller file: doctorController.js
// const doctorController = require('../controllers/doctorController');

// --- DOCTOR MANAGEMENT ENDPOINTS (/admin/doctor/...) ---
// POST /admin/doctor (Add doctor)
router.post('/', (req, res) => res.status(501).json({ message: "POST /admin/doctor endpoint not yet implemented." }));

// DELETE /admin/doctor/:id (Delete doctor)
router.delete('/:id', (req, res) => res.status(501).json({ message: "DELETE /admin/doctor/:id endpoint not yet implemented." }));

module.exports = router;