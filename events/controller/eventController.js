const fs = require("fs");
const path = require("path");
const {
    validationResult
} = require("express-validator");

const Event = require("../models/events_model");
//const Ticket = require('../../tickets/models/ticket_model');
const User = require("../../accounts/models/user_model");

exports.getAllEvents = async (req, res, next) => {
    try {
        const event = await Event.find()
            .populate("creator", "name avatarUrl")
            .sort({
                createdAt: -1,
            });
        res.status(200).json({
            message: "Fetched events successfully",
            events: event,
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserEvents = async (req, res, next) => {
    try {
        const checkUser = await User.findById(req.userId);
        if (!checkUser) {
            const error = new Error("No user Found");
            error.statusCode = 404;
            throw error;
        }
        const event = await Event.find({
            creator: req.userId,
        }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            message: "Fetched events successfully",
            events: event,
        });
    } catch (error) {
        next(error);
    }
};
exports.createEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation Failed, entered data is incorrect");
            error.statusCode = 422;
            throw error;
            // return res.status(422).json({
            //     message: "Validation Failed, entered data is incorrect",
            //     errors: errors.array(),
            // });
        }
        const checkUser = await User.findById(req.userId);
        if (!checkUser) {
            const error = new Error("No user Found");
            error.statusCode = 404;
            throw error;
        }
        if (!req.files.event_image) {
            const error = new Error("No image Provided");
            error.statusCode = 422;
            throw error;
        }
        const event_image = req.files.event_image[0].path.replace(/\\/g, "/");

        // Create event in db
        const event = new Event({
            title: req.body.title,
            event_day: req.body.event_day,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            event_image: event_image,
            location: req.body.location,
            available_tickets: req.body.available_tickets,

            free: req.body.free,
            description: req.body.description,
            price: req.body.price,
            creator: req.userId,
        });
        const result = await event.save();
        const user = await User.findById(req.userId);
        user.events.push(event);
        await user.save();
        res.status(201).json({
            message: "Event created Successfully",
            event: result,
            creator: {
                _id: user._id,
                name: user.name,
            },
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.completedEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation Failed, entered data is incorrect");
            error.statusCode = 422;
            throw error;
        }
        const checkUser = await User.findById(req.userId);
        if (!checkUser) {
            const error = new Error("No user Found");
            error.statusCode = 404;
            throw error;
        }
        const eventId = req.params.eventId;

        const event = await Event.findById(eventId).populate("creator");
        if (!event) {
            const error = new Error("Could not find event");
            error.statusCode = 404;
            throw error;
        }
        if (event.creator._id.toString() !== req.userId) {
            const error = new Error("Not Authorized");
            error.statusCode = 403;
            throw error;
        }
        if (event.completed === true) {
            const error = new Error("Event is already completed.");
            error.statusCode = 403;
            throw error;
        }

        event.completed = req.body.completed;
        const result = await event.save();
        res.status(200).json({
            message: "Event Completed!",
            event: result,
        });

    } catch (error) {
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error("Validation Failed, entered data is incorrect");
            error.statusCode = 422;
            throw error;
        }
        const checkUser = await User.findById(req.userId);
        if (!checkUser) {
            const error = new Error("No user Found");
            error.statusCode = 404;
            throw error;
        }
        const eventId = req.params.eventId;
        let event_image = req.body.event_image;
        if (req.files.event_image) {
            event_image = req.files.event_image[0].path.replace(/\\/g, "/");
        }
        if (!event_image) {
            const error = new Error("No Event Image Selected");
            error.statusCode = 422;
            throw error;
        }
        const event = await Event.findById(eventId).populate("creator");
        if (!event) {
            const error = new Error("Could not find event");
            error.statusCode = 404;
            throw error;
        }
        if (event.creator._id.toString() !== req.userId) {
            const error = new Error("Not Authorized");
            error.statusCode = 403;
            throw error;
        }
        if (event.completed == true) {
            const error = new Error("Can't edit an event that has been completed!");
            error.statusCode = 403;
            throw error;
        }
        if (event_image !== event.event_image) {
            clearImage(event.event_image);
        }
        event.title = req.body.title;
        event.event_day = req.body.event_day;
        event.start_date = req.body.start_date;
        event.end_date = req.body.end_date;
        event.event_image = event_image;
        event.location = req.body.location;
        event.available_tickets = req.body.available_tickets;

        event.free = req.body.free;
        event.description = req.body.description;
        event.price = req.body.price;

        const result = await event.save();
        res.status(200).json({
            message: "Event updated!",
            event: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);
        //Check logged in user
        if (!event) {
            const error = new Error("Could not find Event");
            error.statusCode = 404;
            throw error;
        }
        if (event.creator.toString() !== req.userId) {
            const error = new Error("Not Authorized");
            error.statusCode = 403;
            throw error;
        }
        clearImage(event.event_image);
        await Event.findByIdAndRemove(eventId);

        const user = await User.findById(req.userId);
        user.events.pull(eventId);
        await user.save();
        res.status(200).json({
            message: "Event has been deleted",
        });
    } catch (error) {
        next(error);
    }
};

const clearImage = (filePath) => {
    filePath = path.join(__dirname, "../..", filePath);
    fs.unlink(filePath, (err) => console.log(err));
};