const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paidEventsSchema = new Schema({
    eventDetails: {
        event: {
            type: Object,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    },
    reference: {
        type: String,
        required: true,
    },
    eventId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Events',
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model('Tickets', paidEventsSchema);