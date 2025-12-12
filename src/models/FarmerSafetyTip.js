// nephromind-admin-backend/src/models/FarmerSafetyTip.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'farmerSafetyTips'; // Firestore collection name

/**
 * Fetches Farmer Safety Tips from Firestore.
 * (GET /community/farmer-safety)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of tip objects.
 */
exports.getFarmerSafetyTips = async () => {
    try {
        let query = db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const tips = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Format Firestore Timestamp fields for consistency
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return tips;
    } catch (error) {
        console.error("Error fetching Farmer Safety Tips:", error);
        throw new Error("Failed to retrieve Farmer Safety Tips from the database.");
    }
};

/**
 * Creates a new Farmer Safety Tip item in the Firestore database.
 * (POST /admin/community/farmer-safety)
 * @param {object} tipData - The data for the new tip (title, content, imageUrl).
 * @returns {Promise<object>} A promise that resolves to the created item object with its ID.
 */
exports.createFarmerSafetyTip = async (tipData) => {
    try {
        // 1. Prepare data with server-side defaults/timestamps
        const newTipData = {
            ...tipData,
            slug: tipData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate simple slug
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. Add the document to the collection
        const docRef = await db.collection(COLLECTION_NAME).add(newTipData);

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
        console.error("Error creating Farmer Safety Tip:", error);
        throw new Error("Failed to create the Farmer Safety Tip in the database.");
    }
};

/**
 * Deletes a Farmer Safety Tip item from Firestore by ID.
 * (DELETE /admin/community/farmer-safety/:id)
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 */
exports.deleteFarmerSafetyTip = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false; // Not found
        }

        await docRef.delete();
        return true; // Successfully deleted

    } catch (error) {
        console.error("Error deleting Farmer Safety Tip:", error);
        throw new Error("Failed to delete the Farmer Safety Tip from the database.");
    }
};