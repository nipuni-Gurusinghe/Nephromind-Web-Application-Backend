// Path: /src/controllers/doctorController.js
const { firebaseAdmin } = require('../config');
const db = firebaseAdmin.firestore();

/**
 * GET: Fetch only questions where status is "pending"
 */
exports.getPendingQuestions = async (req, res) => {
    try {
        const questionsSnapshot = await db.collection('doctor_questions')
            .where('status', '==', 'pending')
            .get();

        if (questionsSnapshot.empty) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        const questions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return res.status(200).json({ status: 'success', data: questions });
    } catch (error) {
        console.error('Error fetching pending questions:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * PATCH: Answer a specific question
 * Request Body: { doctorId, answerText }
 */
exports.answerQuestion = async (req, res) => {
    const { questionId } = req.params;
    const { doctorId, answerText } = req.body;

    if (!doctorId || !answerText) {
        return res.status(400).json({ status: 'error', message: 'Doctor ID and Answer text are required.' });
    }

    try {
        const questionRef = db.collection('doctor_questions').doc(questionId);
        
        // Update the document fields as requested
        await questionRef.update({
            answer: answerText,
            answeredBy: doctorId, // Storing the doctor who answered
            answeredAt: new Date().toISOString(), // Setting the timestamp
            status: 'Answered' // Changing status
        });

        return res.status(200).json({ 
            status: 'success', 
            message: 'Question answered successfully.' 
        });
    } catch (error) {
        console.error('Error answering question:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// 1. Fetch all appointments for a specific doctor
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Get appointments from 'book_appointment' where 'doctor_id' matches
        const snapshot = await db.collection('book_appointment')
            .where('doctor_id', '==', doctorId) 
            .get();

        if (snapshot.empty) return res.status(200).json([]);

        // Map through appointments and fetch the real patient names
        const appointments = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let patientName = "Unknown Patient";

            if (data.patientId) {
                // Try 'users' collection first
                let patientDoc = await db.collection('users').doc(data.patientId).get();
                
                if (patientDoc.exists) {
                    const pData = patientDoc.data();
                    patientName = pData.name || pData.username || pData.fullName || "Unknown Patient";
                } else {
                    // Backup: Try 'admin_users_data' collection
                    const adminPatientDoc = await db.collection('admin_users_data').doc(data.patientId).get();
                    if (adminPatientDoc.exists) {
                        const aData = adminPatientDoc.data();
                        patientName = aData.username || aData.name || "Unknown Patient";
                    }
                }
            }

            return {
                id: doc.id, // This is the appointmentId needed for updating
                patientName,
                date: data.date,
                timeSlot: data.timeSlot,
                status: data.status || "pending"
            };
        }));

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 2. Update the status of a specific appointment
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body; // Usually "Completed" or "Cancelled"

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const appointmentRef = db.collection('book_appointment').doc(appointmentId);
        
        // Update the document in Firestore
        await appointmentRef.update({
            status: status
        });

        res.status(200).json({ 
            status: 'success', 
            message: `Appointment marked as ${status}` 
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};