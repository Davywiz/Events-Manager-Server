const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    encryptedPassword: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Admin', adminSchema);