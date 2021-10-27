const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    event_day: {
        type: Date,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    event_image: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    available_tickets: {
        type: Number,
        required: true,
    },
    sold_tickets: {
        type: Number,
        default: 0,
    },
    free: {
        type: Boolean,
        required: true,
    },
    earnings: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Events", eventSchema);