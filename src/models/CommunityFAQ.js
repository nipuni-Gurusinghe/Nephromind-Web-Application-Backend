// nephromind-admin-backend/src/models/CommunityFAQ.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'communityFAQs'; // Firestore collection name

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
        // 1. Prepare data with server-side defaults/timestamps
        const newFAQData = {
            ...faqData,
            slug: faqData.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate simple slug
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. Add the document to the collection
        const docRef = await db.collection(COLLECTION_NAME).add(newFAQData);

        // 3. Fetch the created document to return the full object with ID
        const snapshot = await docRef.get();
        
        // 4. Format the output
        const createdItem = {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: snapshot.data().createdAt.toDate().toISOString(),
            updatedAt: snapshot.data().updatedAt.toDate().toISOString(),
        };

        return createdItem;
    } catch (error) {
        console.error("Error creating FAQ:", error);
        throw new Error("Failed to create the FAQ in the database.");
    }
};

/**
 * Deletes an FAQ item from Firestore by ID.
 * (DELETE /admin/community/faq/:id)
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 */
exports.deleteFAQ = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false; // Not found
        }

        await docRef.delete();
        return true; // Successfully deleted

    } catch (error) {
        console.error("Error deleting FAQ:", error);
        throw new Error("Failed to delete the FAQ from the database.");
    }
};