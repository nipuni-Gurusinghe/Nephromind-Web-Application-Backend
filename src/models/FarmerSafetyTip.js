// nephromind-admin-backend/src/models/FarmerSafetyTip.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'farmerSafetyTips';

/**
 * Fetches all farmer safety tips from Firestore.
 * (GET /api/community/farmer-safety)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of farmer safety tip objects.
 */
exports.getFarmerSafetyTips = async () => {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();

    if (snapshot.empty) {
      return [];
    }

    const tips = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        slug: data.slug,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      };
    });

    return tips;
  } catch (error) {
    console.error("Error fetching farmer safety tips:", error);
    throw new Error("Failed to retrieve farmer safety tips from the database.");
  }
};

/**
 * Creates a new farmer safety tip in the Firestore database.
 * (POST /api/admin/community/farmer-safety)
 * @param {object} tipData - The data for the new farmer safety tip.
 * @returns {Promise<object>} A promise that resolves to the created tip object with its ID.
 */
exports.createFarmerSafetyTip = async (tipData) => {
  try {
    const newTip = {
      title: tipData.title,
      content: tipData.content,
      slug: tipData.slug || generateSlug(tipData.title),
      
      // Server-side timestamps for record keeping
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newTip);
    const snapshot = await docRef.get();
    
    // Convert the timestamp back to an ISO string for the API response
    const data = snapshot.data();
    return { 
      id: snapshot.id, 
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
    };
  } catch (error) {
    throw new Error("Failed to create farmer safety tip: " + error.message);
  }
};

/**
 * Deletes a farmer safety tip by its document ID.
 * (DELETE /api/admin/community/farmer-safety/:id)
 * @param {string} tipId - The ID of the farmer safety tip document to delete.
 * @returns {Promise<boolean>} True if the deletion attempt succeeded.
 */
exports.deleteFarmerSafetyTip = async (tipId) => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(tipId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new Error("Farmer Safety Tip not found");
    }
    
    await docRef.delete();
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} A URL-friendly slug
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}