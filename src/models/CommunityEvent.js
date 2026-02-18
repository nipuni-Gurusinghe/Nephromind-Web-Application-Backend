
const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'events';

/**
 * Fetches community events from Firestore based on query parameters.
 * (GET /api/community/events)
 * @param {object} filters 
 * @param {string} [filters.isActive] 
 * @param {string} [filters.type] 
 * @returns {Promise<Array<object>>} 
 */
exports.getEvents = async (filters) => {
  try {
    let query = db.collection(COLLECTION_NAME);
    if (filters.isActive !== undefined) {
      const isActiveBool = filters.isActive === 'true';
      query = query.where('isActive', '==', isActiveBool);
    }
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    
    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        maxCapacity: data.maxCapacity,
        registeredCount: data.registeredCount,
        organizer: data.organizer,
        type: data.type,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      };
    });

    return events;
  } catch (error) {
    console.error("Error fetching community events:", error);
    throw new Error("Failed to retrieve events from the database.");
  }
};

/**
 * Creates a new community event in the Firestore database.
 * (POST /api/community/events)
 * @param {object} eventData - The data for the new event.
 * @returns {Promise<object>} A promise that resolves to the created event object with its ID.
 */
exports.createEvent = async (eventData) => {
  try {
    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date ? admin.firestore.Timestamp.fromDate(new Date(eventData.date)) : null,
      
      time: eventData.time,
      location: eventData.location,
      organizer: eventData.organizer || "NephroMind Foundation",
      type: eventData.type || "Community Event",
      maxCapacity: Number(eventData.maxCapacity || 0),
      registeredCount: Number(eventData.registeredCount || 0),
      isActive: eventData.isActive ?? true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newEvent);
    const snapshot = await docRef.get();
    const data = snapshot.data();
    return { 
      id: snapshot.id, 
      ...data,
      date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
    };
  } catch (error) {
    throw new Error("Failed to create event: " + error.message);
  }
};

/**
 * Deletes a community event by its document ID.
 * (DELETE /api/community/events/:id)
 * @param {string} eventId - The ID of the event document to delete.
 * @returns {Promise<boolean>} True if the deletion attempt succeeded.
 */
exports.deleteEvent = async (eventId) => {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(eventId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Event not found");
    await docRef.delete();
    return true;
  } catch (error) {
    throw error;
  }
};