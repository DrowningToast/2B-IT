const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    isWarned: {
        type: Boolean
    }
});

module.exports = mongoose.model("Message", MessageSchema);