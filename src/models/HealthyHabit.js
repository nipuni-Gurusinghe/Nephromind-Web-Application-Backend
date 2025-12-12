// nephromind-admin-backend/src/models/HealthyHabit.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'healthyHabits'; // Firestore collection name

/**
 * Fetches Healthy Habits from Firestore.
 * (GET /community/healthy-habits)
 * @returns {Promise<Array<object>>} A promise that resolves to an array of habit objects.
 */
exports.getHealthyHabits = async () => {
    try {
        let query = db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc');
        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const habits = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Format Firestore Timestamp fields for consistency
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            };
        });

        return habits;
    } catch (error) {
        console.error("Error fetching Healthy Habits:", error);
        throw new Error("Failed to retrieve Healthy Habits from the database.");
    }
};

/**
 * Creates a new Healthy Habit item in the Firestore database.
 * (POST /admin/community/healthy-habits)
 * @param {object} habitData - The data for the new habit (title, description, imageUrl, category).
 * @returns {Promise<object>} A promise that resolves to the created item object with its ID.
 */
exports.createHealthyHabit = async (habitData) => {
    try {
        // 1. Prepare data with server-side defaults/timestamps
        const newHabitData = {
            ...habitData,
            slug: habitData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Generate simple slug
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. Add the document to the collection
        const docRef = await db.collection(COLLECTION_NAME).add(newHabitData);

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
        console.error("Error creating Healthy Habit:", error);
        throw new Error("Failed to create the Healthy Habit in the database.");
    }
};

/**
 * Deletes a Healthy Habit item from Firestore by ID.
 * (DELETE /admin/community/healthy-habits/:id)
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
 */
exports.deleteHealthyHabit = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return false; // Not found
        }

        await docRef.delete();
        return true; // Successfully deleted

    } catch (error) {
        console.error("Error deleting Healthy Habit:", error);
        throw new Error("Failed to delete the Healthy Habit from the database.");
    }
};