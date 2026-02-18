

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'safeWaterGuides';

/**
 * Fetches Safe Water Guides from Firestore.
 * (GET /community/safe-water-guide)
 * @returns {Promise<Array<object>>} 
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
 
 * (POST /admin/community/safe-water-guide)
 * @param {object} guideData - The data for the new guide (title, content, imageUrl).
 * @returns {Promise<object>}
 */
exports.createSafeWaterGuide = async (guideData) => {
    try {
        const newGuideData = {
            ...guideData,
            slug: guideData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate simple slug
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection(COLLECTION_NAME).add(newGuideData);
        const snapshot = await docRef.get();
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
 * @returns {Promise<boolean>} 
 */
exports.deleteSafeWaterGuide = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false; 
        }

        await docRef.delete();
        return true; 

    } catch (error) {
        console.error("Error deleting Safe Water Guide:", error);
        throw new Error("Failed to delete the Safe Water Guide from the database.");
    }
};