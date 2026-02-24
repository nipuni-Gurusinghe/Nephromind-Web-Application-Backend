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

        await questionRef.update({
            answer: answerText,
            answeredBy: doctorId,
            answeredAt: new Date().toISOString(),
            status: 'Answered'
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

        const snapshot = await db.collection('book_appointment')
            .where('doctor_id', '==', doctorId)
            .get();

        if (snapshot.empty) return res.status(200).json([]);

        const appointments = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let patientName = "Unknown Patient";

            if (data.patientId) {
                let patientDoc = await db.collection('users').doc(data.patientId).get();

                if (patientDoc.exists) {
                    const pData = patientDoc.data();
                    patientName = pData.name || pData.username || pData.fullName || "Unknown Patient";
                } else {
                    const adminPatientDoc = await db.collection('admin_users_data').doc(data.patientId).get();
                    if (adminPatientDoc.exists) {
                        const aData = adminPatientDoc.data();
                        patientName = aData.username || aData.name || "Unknown Patient";
                    }
                }
            }

            return {
                id: doc.id,
                patientId: data.patientId,  // ✅ Required for View History button
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
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const appointmentRef = db.collection('book_appointment').doc(appointmentId);

        await appointmentRef.update({ status: status });

        res.status(200).json({
            status: 'success',
            message: `Appointment marked as ${status}`
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// 3. Fetch patient CKD history for a specific patient
exports.getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        const snapshot = await db.collection('ckd_results')
            .where('userId', '==', patientId)
            .orderBy('checkedAt', 'asc')
            .get();

        if (snapshot.empty) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                checkedAt: data.checkedAt,
                checkedAtLocal: data.checkedAtLocal,
                diagnosisLabel: data.diagnosisLabel,
                hasCkd: data.hasCkd,
                severityLabel: data.severityLabel,
                severityCode: data.severityCode,
                fileName: data.fileName,
                lab_age: data.lab_age,
                lab_al: data.lab_al,
                lab_ca: data.lab_ca,
                lab_cl: data.lab_cl,
                lab_cr: data.lab_cr,
                lab_gender: data.lab_gender,
                lab_k: data.lab_k,
                lab_na: data.lab_na,
                lab_pr: data.lab_pr,
                lab_ua: data.lab_ua,
                userEmail: data.userEmail,
                userId: data.userId
            };
        });

        return res.status(200).json({ status: 'success', data: history });
    } catch (error) {
        console.error('Error fetching patient history:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};