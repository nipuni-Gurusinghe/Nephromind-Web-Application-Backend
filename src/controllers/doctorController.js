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

// Add this function to your existing doctorController.js

/**
 * GET: Fetch water intake history for a specific patient
 * Route: GET /admin/doctor/patient-water-intake/:patientId
 */
exports.getPatientWaterIntake = async (req, res) => {
    try {
        const { patientId } = req.params;

        const snapshot = await db.collection('waterIntake')
            .where('uid', '==', patientId)
            .orderBy('timestamp', 'asc')
            .get();

        if (snapshot.empty) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        const waterIntake = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                amount: data.amount,
                timestamp: data.timestamp,
                uid: data.uid
            };
        });

        return res.status(200).json({ status: 'success', data: waterIntake });

    } catch (error) {
        console.error('Error fetching water intake history:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * POST: Mark doctor availability for a specific date
 * Route: POST /admin/doctor/availability
 * Body: { doctorId, doctorName, hospitalName, date, isAvailable, slots }
 */
exports.markDoctorAvailability = async (req, res) => {
    try {
        const { doctorId, doctorName, hospitalName, date, isAvailable, slots } = req.body;

        // --- Validation ---
        if (!doctorId) return res.status(400).json({ status: 'error', message: 'doctorId is required.' });
        if (!doctorName) return res.status(400).json({ status: 'error', message: 'doctorName is required.' });
        if (!hospitalName) return res.status(400).json({ status: 'error', message: 'hospitalName is required.' });
        if (!date) return res.status(400).json({ status: 'error', message: 'date is required (YYYY-MM-DD).' });
        if (typeof isAvailable !== 'boolean') return res.status(400).json({ status: 'error', message: 'isAvailable must be a boolean.' });
        if (!slots || typeof slots !== 'object' || Object.keys(slots).length === 0) {
            return res.status(400).json({ status: 'error', message: 'slots map is required and must not be empty.' });
        }

        for (const [slotName, maxPatients] of Object.entries(slots)) {
            if (typeof maxPatients !== 'number' || maxPatients < 1 || !Number.isInteger(maxPatients)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Slot "${slotName}" must have a positive integer value for max patients.`
                });
            }
        }

        const parsedDate = new Date(date + 'T00:00:00+05:30');
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ status: 'error', message: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        // ✅ Use doctorId_date as document ID — unique per doctor per date, no overwrite across dates
        const docId = `${doctorId}_${date}`;
        const docRef = db.collection('doctor_availability').doc(docId);

        await docRef.set({
            doctorId,
            doctorName,
            hospitalName,
            date: parsedDate,
            isAvailable,
            slots,
            updatedAt: new Date(),
        }, { merge: true });

        return res.status(200).json({
            status: 'success',
            message: `Availability for ${doctorName} on ${date} saved successfully.`,
            data: { doctorId, doctorName, hospitalName, date, isAvailable, slots }
        });

    } catch (error) {
        console.error('Error marking doctor availability:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * GET: Fetch ALL availability records for a specific doctor
 * Route: GET /admin/doctor/availability/:doctorId
 */
exports.getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // ✅ Query all docs where doctorId matches, instead of fetching a single doc
        const snapshot = await db.collection('doctor_availability')
            .where('doctorId', '==', doctorId)
            .orderBy('date', 'asc')
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ status: 'error', message: 'No availability found for this doctor.' });
        }

        const availability = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                availabilityId: doc.id,        // e.g. "5Em6D..._2026-02-26"
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                hospitalName: data.hospitalName,
                date: data.date?.toDate?.()?.toISOString() ?? data.date,
                isAvailable: data.isAvailable,
                slots: data.slots,
            };
        });

        return res.status(200).json({ status: 'success', data: availability });

    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * PATCH: Toggle isAvailable for a specific availability record
 * Route: PATCH /admin/doctor/availability/:availabilityId
 * Body: { isAvailable }
 */
exports.toggleDoctorAvailability = async (req, res) => {
    try {
        const { availabilityId } = req.params;   // ✅ now uses full doc ID like "doctorId_date"
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ status: 'error', message: 'isAvailable must be a boolean.' });
        }

        await db.collection('doctor_availability').doc(availabilityId).update({
            isAvailable,
            updatedAt: new Date(),
        });

        return res.status(200).json({
            status: 'success',
            message: `Doctor availability set to ${isAvailable}.`,
        });

    } catch (error) {
        console.error('Error toggling availability:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};


/**
 * GET: Fetch a single doctor's profile from doctor_user_data
 * Route: GET /admin/doctor/profile/:doctorId
 */
exports.getDoctorProfile = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doc = await db.collection('doctor_user_data').doc(doctorId).get();

        if (!doc.exists) {
            return res.status(404).json({ status: 'error', message: 'Doctor not found.' });
        }

        const data = doc.data();

        return res.status(200).json({
            status: 'success',
            data: {
                doctorId: doc.id,
                username: data.username || '',      
                hospital: data.hospital || '',      
                email: data.email || '',
                specialistArea: data.specialistArea || '',
                area: data.area || '',
                phone: data.phone || '',
            }
        });

    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};
























