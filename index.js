const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.json())
const User = require('./models')
const nodemon = require("nodemon");


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

const mongoose = require('mongoose');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//mongoose connection setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser : true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB has connected succesfully"))
.catch((err) => console.log(`Error encountered: ${err}`))

// @ POST /api/users
app.post("/api/users", async ( req, res ) => {
  const { username } = req.body;

  console.log("The request body is: ", req.body);
  console.log("The username is: ", username);
  
  if (!username) {
    return res.status(400).send({message: "Username is required!!"});
  }
  try {
    const newUser = new User({username});
    console.log(newUser.toJSON());
    const savedUser = await newUser.save();
    console.log(savedUser.toJSON());

    return res.json({username: savedUser.username, _id: savedUser._id})
  }
  catch (err) {
    console.error(`An error was encountered: ${err}`);
    res.status(500).send({message: "Error creating user"});
  }
});

// @ POST /api/users/:_id/exercises

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id, description, duration, date } = req.body;
  console.log(req.body);

  try {
    // Find the user by their ID (if needed for username or other references)
    console.log("The _id parameter is: ", req.params._id);
    const user = await User.findById(req.params._id); // Assuming you have a User model
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new exercise instane
    const newUser = new User({
      username: user.username,
      descriptions: [{
        description,
        duration,
        date: date ? new Date(date) : new Date(), // Set date to now if not provided
      }]
    });
    console.log("Successfully created a new exercise instance")
    // Save the new exercise instance
    const savedUser = await newUser.save();
    console.log("Successfully saved the exercise instance");

    console.log("Now returning the JSON file");
    console.log("Descriptions array : ", savedUser.descriptions);
    console.log("Saved user is : ", savedUser);   
    console.log("The date is :", savedUser.descriptions[0].date) 
    return res.json({
      _id: user._id,
      username: user.username, // Access username from populated user object
      date: savedUser.descriptions[0].date.toDateString(), // Format date as needed
      duration: savedUser.descriptions[0].duration,
      description: savedUser.descriptions[0].description,
    });
  } catch (err) {
    console.error(`Error encountered: ${err}`);
    return res.status(500).json({ error: "Error creating exercise" });
  }
});



// @ GET /api/users/:_id/logs?[from][&to][&limit]

app.get("", ( req, res) => {
  console.log(req.body);

  try {

  }
  catch (err) {
    console.log(`An error occured: ${err}`);
    return res.status(500).json({error: "Error during GET request"});
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
