
const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'multimedia'; 

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
        if (filters.isActive !== undefined) {
            const isActiveBool = filters.isActive === 'true';
            query = query.where('isActive', '==', isActiveBool);
        } else {
             query = query.where('isActive', '==', true); 
        }
        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }
        
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
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
// Ensure this name matches the one used in doctorRoutes.js
exports.getAllMultimedia = async (req, res) => {
    try {
        // Example logic to fetch from Firestore
        const snapshot = await db.collection('multimedia').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
/**
 * Creates a new multimedia item in the Firestore database.
 * (POST /admin/community/multimedia)
 * @param {object} multimediaData - The data for the new item.
 * @returns {Promise<object>}
 */
exports.createMultimedia = async (multimediaData) => {
    try {
        const newMultimediaData = {
            ...multimediaData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            plays: Number(multimediaData.plays || 0), 
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
 * @returns {Promise<boolean>} 
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
exports.COLLECTION_NAME = COLLECTION_NAME;