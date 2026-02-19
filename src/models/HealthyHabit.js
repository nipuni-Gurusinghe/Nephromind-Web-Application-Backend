
const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'healthyHabits';
const formatDoc = (doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    };
};
exports.getHealthyHabits = async () => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => formatDoc(doc));
    } catch (error) {
        console.error("Error fetching Healthy Habits:", error);
        throw new Error("Failed to retrieve Healthy Habits.");
    }
};

exports.createHealthyHabit = async (habitData) => {
    try {
        const newHabitData = {
            ...habitData,
            slug: habitData.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection(COLLECTION_NAME).add(newHabitData);
        const snapshot = await docRef.get();
        return formatDoc(snapshot);
    } catch (error) {
        console.error("Error creating Healthy Habit:", error);
        throw new Error("Failed to create the Healthy Habit.");
    }
};
exports.deleteHealthyHabit = async (id) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) return false;

        await docRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting Healthy Habit:", error);
        throw new Error("Failed to delete the Healthy Habit.");
    }
};
/**
 * Express Handler to allow Doctors to view Healthy Habits.
 * (GET /api/admin/doctor/community/healthy-habits)
 */
exports.getHealthyHabitsHandler = async (req, res) => {
  try {
    // Assuming you have a function named getHealthyHabits defined in this file
    const habits = await exports.getHealthyHabits(); 
    
    return res.status(200).json({
      status: 'success',
      data: habits
    });
  } catch (error) {
    console.error("[DOCTOR API] Healthy Habits Error:", error.message);
    return res.status(500).json({
      status: 'error',
      message: "Failed to retrieve healthy habits."
    });
  }
};