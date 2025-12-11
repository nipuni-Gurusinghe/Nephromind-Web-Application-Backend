// nephromind-admin-backend/src/controllers/communityController.js

const CommunityEvent = require('../models/CommunityEvent');

/**
 * @route GET /api/community/events
 * @desc Get a list of community events, optionally filtered by isActive and type.
 * @access Public 
 */
exports.getCommunityEvents = async (req, res) => {
  try {
    // Extract query parameters. These come as strings.
    const { isActive, type } = req.query;

    // Build the filters object to pass to the model
    const filters = {};
    if (isActive !== undefined) {
      // A simple check to ensure it's a valid boolean string
      if (isActive === 'true' || isActive === 'false') {
        filters.isActive = isActive;
      } else {
        return res.status(400).json({ 
          message: "Invalid value for 'isActive'. Must be 'true' or 'false'." 
        });
      }
    }
    if (type) {
      filters.type = type;
    }

    // Call the model function to fetch the events
    const events = await CommunityEvent.getEvents(filters);

    // Respond with the list of events
    res.status(200).json(events);

  } catch (error) {
    console.error("Error in getCommunityEvents controller:", error.message);
    res.status(500).json({ 
      message: "Server Error: Could not retrieve community events.",
      details: error.message 
    });
  }
};

/**
 * @route POST /api/community/events
 * @desc Create a new community event.
 * @access Protected (Requires authentication/admin privileges)
 */
exports.createCommunityEvent = async (req, res) => {
    // The request body should match the structure shown in your image:
    // { title, description, date, time, location, maxCapacity, organizer, type, isActive, registeredCount }
    const eventData = req.body;

    // Basic validation (Add more robust validation using libraries like Joi or Express-Validator)
    if (!eventData.title || !eventData.date || !eventData.location) {
        return res.status(400).json({ 
            message: 'Missing required fields: title, date, and location are mandatory.' 
        });
    }

    try {
        // Call the model function to create the event
        const newEvent = await CommunityEvent.createEvent(eventData);

        // Respond with the created event object and a 201 Created status
        res.status(201).json(newEvent);

    } catch (error) {
        console.error("Error in createCommunityEvent controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the community event.",
            details: error.message 
        });
    }
};