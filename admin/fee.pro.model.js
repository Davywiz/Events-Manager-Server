const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feeSchema = new Schema({
    fee: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('ProFee', feeSchema);