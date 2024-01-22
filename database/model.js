const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Data = new Schema({
    username: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    pickupDate: {
        type: Date,
        require: true,
    },
    returnDate: {
        type: Date,
        require: true,
    },
    cost: {
        type: Number,
        require: true,
    },
    carName: {
        type: String,
        require: true,
    },
    carPrice: {
        type: Number,
        require: true,
    },
});


module.exports = mongoose.model('Data', Data);