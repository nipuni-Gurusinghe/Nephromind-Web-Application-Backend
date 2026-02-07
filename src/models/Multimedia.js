// nephromind-admin-backend/src/models/Multimedia.js

const admin = require('firebase-admin');
// NOTE: Assuming your 'admin' object is initialized globally or handled elsewhere.
// If it's initialized in src/config/index.js, you might need to adjust the import path 
// or ensure this file gets the initialized admin object.
// Based on your CommunityEvent.js, we assume 'admin' is available here.

const db = admin.firestore();
const COLLECTION_NAME = 'multimedia'; // The name of your Firestore collection for multimedia

/**
 * Fetches multimedia items from Firestore based on query parameters.
 * (GET /community/multimedia)
 * @param {object} filters - The query parameters from the request.
 * @param {string} [filters.isActive] - Filter by 'true' or 'false' status.
 * @param {string} [filters.type] - Filter by content type ('video', 'audio', etc.).
 * @returns {Promise<Array<object>>} A promise that resolves to an array of multimedia objects.
 */
exports.getMultimedia = async (filters) => {
    try {
        let query = db.collection(COLLECTION_NAME);

        // Filter by isActive (boolean)
        if (filters.isActive !== undefined) {
            const isActiveBool = filters.isActive === 'true';
            query = query.where('isActive', '==', isActiveBool);
        } else {
             // Default to showing only active items if not specified
             query = query.where('isActive', '==', true); 
        }

        // Filter by type (string)
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        
        // Filter by category (string)
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        
        // Order by creation date descending
        query = query.orderBy('createdAt', 'desc'); 

        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const multimediaItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Format Firestore Timestamp fields for consistency
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return multimediaItems;
    } catch (error) {
        console.error("Error fetching multimedia items:", error);
        throw new Error("Failed to retrieve multimedia items from the database.");
    }
};

/**
 * Creates a new multimedia item in the Firestore database.
 * (POST /admin/community/multimedia)
 * @param {object} multimediaData - The data for the new item.
 * @returns {Promise<object>} A promise that resolves to the created item object with its ID.
 */
exports.createMultimedia = async (multimediaData) => {
    try {
        const newMultimediaData = {
            ...multimediaData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            plays: Number(multimediaData.plays || 0), // Ensure numerical field
            isActive: multimediaData.isActive === undefined ? true : multimediaData.isActive,
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newMultimediaData);
        const snapshot = await docRef.get();
        
        return {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: snapshot.data().createdAt.toDate().toISOString(),
            updatedAt: snapshot.data().updatedAt.toDate().toISOString(),
        };
    } catch (error) {
        throw new Error("Failed to create the multimedia item.");
    }
};

/**
 * Deletes a multimedia item from Firestore by ID.
 * (DELETE /admin/community/multimedia/:id)
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 */
exports.deleteMultimedia = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();
        if (!doc.exists) return false;

        await docRef.delete();
        return true;
    } catch (error) {
        throw new Error("Failed to delete the multimedia item.");
    }
};

// Export the collection name for use in other files if needed
exports.COLLECTION_NAME = COLLECTION_NAME;