const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    accountDetails: {
        name: {
            type: String,
            default: '',
        },
        bank: {
            type: String,
            default: '',
        },
        number: {
            type: Number,
            default: 0,
        },
        bankCode: {
            type: String,
            default: '',
        }
    },
    pro: {
        type: Boolean,
        default: false,
    },
    avatarUrl: {
        type: String,
        required: true,
    },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'Events',
    }],
});

module.exports = mongoose.model('User', userSchema);