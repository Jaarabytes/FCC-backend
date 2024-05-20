const mongoose = require('mongoose');

// Try populating the data like ChaGPT said

// user schema
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    }
  })

// exercise schema

const exerciseSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    //Referencing the User model
        required: true
    },
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
    }
})


const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);


module.exports = User;
module.exports = Exercise;
