// nephromind-admin-backend/src/controllers/communityController.js

// Import all required Firebase Model utilities
const CommunityEvent = require('../models/CommunityEvent'); // Assumed Firebase structure
const Multimedia = require('../models/Multimedia');          // NEW Firebase structure
const CommunityFAQ = require('../models/CommunityFAQ');
const FarmerSafetyTip = require('../models/FarmerSafetyTip');
const HealthyHabit = require('../models/HealthyHabit');
const SafeWaterGuide = require('../models/SafeWaterGuide');

// ----------------------------------------------------------------------
//                        COMMUNITY EVENT HANDLERS (Based on your provided Firebase model)
// ----------------------------------------------------------------------

/**
 * @route GET /community/event
 * @desc Get a list of community events.
 * @access Public 
 */
exports.getCommunityEvents = async (req, res) => {
    try {
        const { isActive, type } = req.query;
        
        const filters = {};
        if (isActive !== undefined) filters.isActive = isActive;
        if (type) filters.type = type;

        // Calls the Firebase logic in CommunityEvent.js
        const events = await CommunityEvent.getEvents(filters); 
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
 * @route POST /admin/community/event
 * @desc Create a new community event.
 * @access Protected
 */
exports.createCommunityEvent = async (req, res) => {
    const eventData = req.body;
    if (!eventData.title || !eventData.date || !eventData.location) {
        return res.status(400).json({ 
            message: 'Missing required fields: title, date, and location are mandatory.' 
        });
    }

    try {
        // Calls the Firebase logic in CommunityEvent.js
        const newEvent = await CommunityEvent.createEvent(eventData); 
        res.status(201).json(newEvent);

    } catch (error) {
        console.error("Error in createCommunityEvent controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the community event.", 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/event/:id
 * @desc Delete a community event.
 * @access Protected
 */
exports.deleteCommunityEvent = async (req, res) => {
    try {
        // You may need validation here if your IDs are not simple Firestore IDs
        const wasDeleted = await CommunityEvent.deleteEvent(req.params.id); // Assuming this static method exists
        if (!wasDeleted) return res.status(404).json({ message: 'Event not found.' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', details: error.message });
    }
};


// ----------------------------------------------------------------------
//                        MULTIMEDIA HANDLERS (FIREBASE IMPLEMENTATION)
// ----------------------------------------------------------------------

/**
 * @route GET /community/multimedia
 * @desc Get all multimedia items.
 * @access Public / Admin
 */
exports.getMultimedia = async (req, res) => {
    try {
        const { category, type, isActive } = req.query;
        
        const filters = {};
        if (category) filters.category = category;
        if (type) filters.type = type;
        if (isActive !== undefined) filters.isActive = isActive;

        // Calls the Firebase logic in Multimedia.js
        const multimediaItems = await Multimedia.getMultimedia(filters);

        res.status(200).json(multimediaItems);
    } catch (error) {
        console.error('Error fetching multimedia:', error);
        res.status(500).json({ 
            message: 'Server error fetching multimedia content', 
            details: error.message 
        });
    }
};

/**
 * @route POST /admin/community/multimedia
 * @desc Add a new multimedia item.
 * @access Private/Admin
 */
exports.createMultimedia = async (req, res) => {
    const multimediaData = req.body;
    
    // Basic validation
    if (!multimediaData.title || !multimediaData.description || !multimediaData.type || !multimediaData.url) {
        return res.status(400).json({ 
            message: 'Missing required fields: title, description, type, and url are mandatory.' 
        });
    }

    try {
        // Calls the Firebase logic in Multimedia.js
        const savedItem = await Multimedia.createMultimedia(multimediaData);

        res.status(201).json(savedItem);

    } catch (error) {
        console.error('Error creating multimedia:', error);
        // Firebase errors typically have different structures than Mongoose 
        res.status(500).json({ 
            message: 'Server error creating multimedia content', 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/multimedia/:id
 * @desc Delete a multimedia item.
 * @access Private/Admin
 */
exports.deleteMultimedia = async (req, res) => {
    try {
        const { id } = req.params;

        // Calls the Firebase logic in Multimedia.js
        const wasDeleted = await Multimedia.deleteMultimedia(id);

        if (!wasDeleted) {
            return res.status(404).json({ message: 'Multimedia item not found.' });
        }

        res.status(204).send(); 

    } catch (error) {
        console.error('Error deleting multimedia:', error);
        res.status(500).json({ 
            message: 'Server error deleting multimedia content', 
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
//                        OTHER COMMUNITY HANDLERS (PLACEHOLDERS)
// ----------------------------------------------------------------------

exports.getFAQs = (req, res) => res.status(501).json({ message: "FAQ handler not implemented (Firebase)" });
exports.createFAQ = (req, res) => res.status(501).json({ message: "FAQ handler not implemented (Firebase)" });
exports.deleteFAQ = (req, res) => res.status(501).json({ message: "FAQ handler not implemented (Firebase)" });

exports.getSafeWaterGuides = (req, res) => res.status(501).json({ message: "Safe Water Guide handler not implemented (Firebase)" });
exports.createSafeWaterGuide = (req, res) => res.status(501).json({ message: "Safe Water Guide handler not implemented (Firebase)" });
exports.deleteSafeWaterGuide = (req, res) => res.status(501).json({ message: "Safe Water Guide handler not implemented (Firebase)" });

exports.getFarmerSafetyTips = (req, res) => res.status(501).json({ message: "Farmer Safety Tip handler not implemented (Firebase)" });
exports.createFarmerSafetyTip = (req, res) => res.status(501).json({ message: "Farmer Safety Tip handler not implemented (Firebase)" });
exports.deleteFarmerSafetyTip = (req, res) => res.status(501).json({ message: "Farmer Safety Tip handler not implemented (Firebase)" });

exports.getHealthyHabits = (req, res) => res.status(501).json({ message: "Healthy Habit handler not implemented (Firebase)" });
exports.createHealthyHabit = (req, res) => res.status(501).json({ message: "Healthy Habit handler not implemented (Firebase)" });
exports.deleteHealthyHabit = (req, res) => res.status(501).json({ message: "Healthy Habit handler not implemented (Firebase)" });