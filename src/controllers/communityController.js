// nephromind-admin-backend/src/controllers/communityController.js

// Import all required Firebase Model utilities
const CommunityEvent = require('../models/CommunityEvent');          
const Multimedia = require('../models/Multimedia');          
const CommunityFAQ = require('../models/CommunityFAQ'); // <-- FULLY IMPLEMENTED
const FarmerSafetyTip = require('../models/FarmerSafetyTip'); 
const HealthyHabit = require('../models/HealthyHabit');       
const SafeWaterGuide = require('../models/SafeWaterGuide');

// ----------------------------------------------------------------------
//                        COMMUNITY EVENT HANDLERS (FIREBASE IMPLEMENTATION)
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
        const wasDeleted = await CommunityEvent.deleteEvent(req.params.id); 
        if (!wasDeleted) return res.status(404).json({ message: 'Event not found.' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', details: error.message });
    }
};


// ----------------------------------------------------------------------
//                        MULTIMEDIA HANDLERS (FIREBASE IMPLEMENTATION)
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
//                        SAFE WATER GUIDE HANDLERS (FIREBASE IMPLEMENTATION)
// ----------------------------------------------------------------------

/**
 * @route GET /community/safe-water-guide
 * @desc Get all safe water guides.
 * @access Public / Admin
 */
exports.getSafeWaterGuides = async (req, res) => {
    try {
        const guides = await SafeWaterGuide.getSafeWaterGuides();
        res.status(200).json(guides);
    } catch (error) {
        console.error("Error in getSafeWaterGuides controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not retrieve safe water guides.", 
            details: error.message 
        });
    }
};

/**
 * @route POST /admin/community/safe-water-guide
 * @desc Create a new safe water guide.
 * @access Private/Admin
 */
exports.createSafeWaterGuide = async (req, res) => {
    const guideData = req.body;
    if (!guideData.title || !guideData.content) {
        return res.status(400).json({ 
            message: 'Missing required fields: title and content are mandatory.' 
        });
    }

    try {
        const newGuide = await SafeWaterGuide.createSafeWaterGuide(guideData);
        res.status(201).json(newGuide);

    } catch (error) {
        console.error("Error in createSafeWaterGuide controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the safe water guide.", 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/safe-water-guide/:id
 * @desc Delete a safe water guide.
 * @access Private/Admin
 */
exports.deleteSafeWaterGuide = async (req, res) => {
    try {
        const wasDeleted = await SafeWaterGuide.deleteSafeWaterGuide(req.params.id);
        if (!wasDeleted) return res.status(404).json({ message: 'Safe Water Guide not found.' });
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteSafeWaterGuide controller:", error.message);
        res.status(500).json({ 
            message: 'Error deleting safe water guide', 
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
//                        FARMER SAFETY TIPS HANDLERS (FIREBASE IMPLEMENTATION)
// ----------------------------------------------------------------------

/**
 * @route GET /community/farmer-safety
 * @desc Get all farmer safety tips.
 * @access Public / Admin
 */
exports.getFarmerSafetyTips = async (req, res) => {
    try {
        const tips = await FarmerSafetyTip.getFarmerSafetyTips();
        res.status(200).json(tips);
    } catch (error) {
        console.error("Error in getFarmerSafetyTips controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not retrieve farmer safety tips.", 
            details: error.message 
        });
    }
};

/**
 * @route POST /admin/community/farmer-safety
 * @desc Create a new farmer safety tip.
 * @access Private/Admin
 */
exports.createFarmerSafetyTip = async (req, res) => {
    const tipData = req.body;
    if (!tipData.title || !tipData.content) {
        return res.status(400).json({ 
            message: 'Missing required fields: title and content are mandatory.' 
        });
    }

    try {
        const newTip = await FarmerSafetyTip.createFarmerSafetyTip(tipData);
        res.status(201).json(newTip);

    } catch (error) {
        console.error("Error in createFarmerSafetyTip controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the farmer safety tip.", 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/farmer-safety/:id
 * @desc Delete a farmer safety tip.
 * @access Private/Admin
 */
exports.deleteFarmerSafetyTip = async (req, res) => {
    try {
        const wasDeleted = await FarmerSafetyTip.deleteFarmerSafetyTip(req.params.id);
        if (!wasDeleted) return res.status(404).json({ message: 'Farmer Safety Tip not found.' });
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteFarmerSafetyTip controller:", error.message);
        res.status(500).json({ 
            message: 'Error deleting farmer safety tip', 
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
//                        HEALTHY HABITS HANDLERS (FIREBASE IMPLEMENTATION)
// ----------------------------------------------------------------------

/**
 * @route GET /community/healthy-habits
 * @desc Get all healthy habits.
 * @access Public / Admin
 */
exports.getHealthyHabits = async (req, res) => {
    try {
        const habits = await HealthyHabit.getHealthyHabits();
        res.status(200).json(habits);
    } catch (error) {
        console.error("Error in getHealthyHabits controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not retrieve healthy habits.", 
            details: error.message 
        });
    }
};

/**
 * @route POST /admin/community/healthy-habits
 * @desc Create a new healthy habit.
 * @access Private/Admin
 */
exports.createHealthyHabit = async (req, res) => {
    const habitData = req.body;
    if (!habitData.title || !habitData.description) {
        return res.status(400).json({ 
            message: 'Missing required fields: title and description are mandatory.' 
        });
    }

    try {
        const newHabit = await HealthyHabit.createHealthyHabit(habitData);
        res.status(201).json(newHabit);

    } catch (error) {
        console.error("Error in createHealthyHabit controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the healthy habit.", 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/healthy-habits/:id
 * @desc Delete a healthy habit.
 * @access Private/Admin
 */
exports.deleteHealthyHabit = async (req, res) => {
    try {
        const wasDeleted = await HealthyHabit.deleteHealthyHabit(req.params.id);
        if (!wasDeleted) return res.status(404).json({ message: 'Healthy Habit not found.' });
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteHealthyHabit controller:", error.message);
        res.status(500).json({ 
            message: 'Error deleting healthy habit', 
            details: error.message 
        });
    }
};

// ----------------------------------------------------------------------
//                        COMMUNITY FAQ HANDLERS (FIREBASE IMPLEMENTATION)
// ----------------------------------------------------------------------

/**
 * @route GET /community/faq
 * @desc Get all FAQs.
 * @access Public / Admin
 */
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await CommunityFAQ.getFAQs();
        res.status(200).json(faqs);
    } catch (error) {
        console.error("Error in getFAQs controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not retrieve FAQs.", 
            details: error.message 
        });
    }
};

/**
 * @route POST /admin/community/faq
 * @desc Create a new FAQ.
 * @access Private/Admin
 */
exports.createFAQ = async (req, res) => {
    const faqData = req.body;
    if (!faqData.question || !faqData.answer) {
        return res.status(400).json({ 
            message: 'Missing required fields: question and answer are mandatory.' 
        });
    }

    try {
        const newFAQ = await CommunityFAQ.createFAQ(faqData);
        res.status(201).json(newFAQ);

    } catch (error) {
        console.error("Error in createFAQ controller:", error.message);
        res.status(500).json({ 
            message: "Server Error: Could not create the FAQ.", 
            details: error.message 
        });
    }
};

/**
 * @route DELETE /admin/community/faq/:id
 * @desc Delete an FAQ.
 * @access Private/Admin
 */
exports.deleteFAQ = async (req, res) => {
    try {
        const wasDeleted = await CommunityFAQ.deleteFAQ(req.params.id);
        if (!wasDeleted) return res.status(404).json({ message: 'FAQ not found.' });
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteFAQ controller:", error.message);
        res.status(500).json({ 
            message: 'Error deleting FAQ', 
            details: error.message 
        });
    }
};