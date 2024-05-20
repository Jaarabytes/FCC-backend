const mongoose = require('mongoose');

// For this git branch, I intend to only use one schema to avoid redundancy
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        unique: true,
        required: true
    },
    log : [{
        description :{
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        date : {
            type: Date,
            required: true
        },
    },
]
})


const User = mongoose.model("User", userSchema);
module.exports = User;
