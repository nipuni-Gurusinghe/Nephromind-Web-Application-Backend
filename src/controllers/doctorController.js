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