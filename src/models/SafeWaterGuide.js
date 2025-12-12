// nephromind-admin-backend/src/models/SafeWaterGuide.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'safeWaterGuides'; // Firestore collection name

/**
 * Fetches Safe Water Guides from Firestore.
 * (GET /community/safe-water-guide)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of guide objects.
 */
exports.getSafeWaterGuides = async () => {
    try {
        let query = db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const guides = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Format Firestore Timestamp fields for consistency
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return guides;
    } catch (error) {
        console.error("Error fetching Safe Water Guides:", error);
        throw new Error("Failed to retrieve Safe Water Guides from the database.");
    }
};

/**
 * Creates a new Safe Water Guide item in the Firestore database.
 * (POST /admin/community/safe-water-guide)
 * @param {object} guideData - The data for the new guide (title, content, imageUrl).
 * @returns {Promise<object>} A promise that resolves to the created item object with its ID.
 */
exports.createSafeWaterGuide = async (guideData) => {
    try {
        // 1. Prepare data with server-side defaults/timestamps
        const newGuideData = {
            ...guideData,
            slug: guideData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate simple slug
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. Add the document to the collection
        const docRef = await db.collection(COLLECTION_NAME).add(newGuideData);

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
        console.error("Error creating Safe Water Guide:", error);
        throw new Error("Failed to create the Safe Water Guide in the database.");
    }
};

/**
 * Deletes a Safe Water Guide item from Firestore by ID.
 * (DELETE /admin/community/safe-water-guide/:id)
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 */
exports.deleteSafeWaterGuide = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false; // Not found
        }

        await docRef.delete();
        return true; // Successfully deleted

    } catch (error) {
        console.error("Error deleting Safe Water Guide:", error);
        throw new Error("Failed to delete the Safe Water Guide from the database.");
    }
};