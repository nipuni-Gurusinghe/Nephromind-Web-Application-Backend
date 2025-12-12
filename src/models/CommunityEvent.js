// nephromind-admin-backend/src/models/CommunityEvent.js

const admin = require('firebase-admin');
const db = admin.firestore();
const COLLECTION_NAME = 'events';

/**
 * Fetches community events from Firestore based on query parameters.
 * (GET /api/community/events)
 * @param {object} filters - The query parameters from the request.
 * @param {string} [filters.isActive] - Filter by 'true' or 'false' status.
 * @param {string} [filters.type] - Filter by event type (e.g., 'Community Event').
 * @returns {Promise<Array<object>>} A promise that resolves to an array of event objects.
 */
exports.getEvents = async (filters) => {
  try {
    let query = db.collection(COLLECTION_NAME);

    // Filter by isActive (boolean)
    if (filters.isActive !== undefined) {
      const isActiveBool = filters.isActive === 'true';
      query = query.where('isActive', '==', isActiveBool);
    }

    // Filter by type (string)
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
    // 1. Prepare data with server-side defaults/timestamps
    const newEventData = {
      ...eventData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Firestore timestamp for creation
      // Ensure numerical fields are numbers, if they are passed as strings (e.g., from form data)
      maxCapacity: Number(eventData.maxCapacity || 0), 
      registeredCount: Number(eventData.registeredCount || 0),
      isActive: eventData.isActive === undefined ? true : eventData.isActive, // Default to true if not specified
    };

    // 2. Add the document to the 'events' collection
    const docRef = await db.collection(COLLECTION_NAME).add(newEventData);

    // 3. Fetch the created document to return the full object with ID
    const snapshot = await docRef.get();
    
    // 4. Format the output
    const createdEvent = {
        id: snapshot.id,
        ...snapshot.data(),
        // Convert Firestore Timestamp back to a readable string for the API response
        createdAt: snapshot.data().createdAt.toDate().toISOString(), 
    };

    return createdEvent;
  } catch (error) {
    console.error("Error creating community event:", error);
    throw new Error("Failed to create the event in the database.");
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
        // Check if the event exists before attempting to delete (optional but helpful)
        const docRef = db.collection(COLLECTION_NAME).doc(eventId);
        const doc = await docRef.get();

        if (!doc.exists) {
            // Throw an error that the controller can catch to return a 404
            throw new Error("Event not found.");
        }

        await docRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting community event:", error);
        // Re-throw the error to be handled by the controller
        throw error;
    }
};