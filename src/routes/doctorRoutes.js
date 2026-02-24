const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const healthyHabitsController = require('../models/HealthyHabit');
const doctorController = require('../controllers/doctorController');
router.get('/community/event', communityController.getAllEvents);
router.get('/community/multimedia', communityController.getMultimedia);
router.get('/community/faq', communityController.getFAQs);
router.get('/community/healthy-habits', healthyHabitsController.getHealthyHabitsHandler);
router.get('/questions/pending', doctorController.getPendingQuestions);
router.patch('/questions/answer/:questionId', doctorController.answerQuestion);
router.get('/patient-history/:patientId', doctorController.getPatientHistory);
router.get('/appointments/:doctorId', doctorController.getDoctorAppointments);
router.patch('/appointments/status/:appointmentId', doctorController.updateAppointmentStatus);

module.exports = router;
