const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    contacts: {
        type: Array,
        required: true,
    },
});

module.exports = mongoose.model('AdminContacts', contactSchema);