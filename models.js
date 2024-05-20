const mongoose = require('mongoose');

// For this git branch, I intend to only use one schema to avoid redundancy
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        unique: true,
        required: true
    },
    descriptions: [{
        description :{
            type: String,
        },
        duration: {
            type: Number,
        },
        date : {
            type: Date,
        }
    }]
})


const User = mongoose.model("User", userSchema);
module.exports = User;
