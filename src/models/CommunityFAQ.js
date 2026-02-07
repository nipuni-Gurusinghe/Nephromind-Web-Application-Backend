// nephromind-admin-backend/src/models/CommunityFAQ.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'faqs';
/**
 * Fetches Community FAQs from Firestore.
 * (GET /community/faq)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of FAQ objects.
 */
exports.getFAQs = async () => {
    try {
        let query = db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const faqs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Format Firestore Timestamp fields for consistency
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return faqs;
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        throw new Error("Failed to retrieve FAQs from the database.");
    }
};

/**
 * Creates a new FAQ item in the Firestore database.
 * (POST /admin/community/faq)
 * @param {object} faqData - The data for the new FAQ (question, answer, category).
 * @returns {Promise<object>} A promise that resolves to the created item object with its ID.
 */
exports.createFAQ = async (faqData) => {
    try {
        const newFAQData = {
            ...faqData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // This will now point to the collection visible in your screenshot
        const docRef = await db.collection(COLLECTION_NAME).add(newFAQData);
        const snapshot = await docRef.get();
        
        return {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: snapshot.data().createdAt.toDate().toISOString(),
            updatedAt: snapshot.data().updatedAt.toDate().toISOString(),
        };
    } catch (error) {
        throw new Error("Failed to create the FAQ: " + error.message);
    }
};

/**
 * Deletes an FAQ item (DELETE /admin/community/faq/:id)
 */
exports.deleteFAQ = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return false;

        await docRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        throw new Error("Failed to delete the FAQ from the database.");
    }
};