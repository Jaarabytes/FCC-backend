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

    // I'm coming for you
    user.log.push({ description , date: new Date(), duration });
    console.log("Pushed into user.log")
    console.log("User.log is: ", user.log)
    // Create a new exercise instance
    const newUser = new User({
      username: user.username,
      log: [{
        description,
        duration,
        date: date ? new Date(date) : new Date(), // Set date to now if not provided
      }]
    });
    console.log("Successfully created a new exercise instance")
    // Save the new exercise instance
    const savedUser = await newUser.save();
    // console.log("Successfully saved the exercise instance");
    // console.log("Now returning the JSON file");
    // console.log("log array : ", savedUser.log);
    // console.log("Saved user is : ", savedUser);   
    // console.log("The date is :", savedUser.log[0].date) 
    console.log("The log count is: ", savedUser.log.length);
    return res.json({
      _id: user._id,
      username: user.username, 
      date: savedUser.log[0].date.toDateString(), // Format date as needed
      duration: savedUser.log[0].duration,
      description: savedUser.log[0].description,
    });
  } catch (err) {
    console.error(`Error encountered: ${err}`);
    return res.status(500).json({ error: "Error creating exercise" });
  }
});



// @ GET /api/users/:_id/logs?[from][&to][&limit]

app.get("/api/users/:_id/logs", async ( req, res) => {
  console.log("The request body is: ", req.body);
  console.log(req.params._id)
  const user = await User.findById(req.params._id);
  if( !user ) {
    return res.json({Error: "User not found"})
  }

  try {
    // Find his _id and return hsi username
    console.log("The user's name is: ", user.username)
    console.log("The user object is: ", user);
    return res.json({
      log: user.log
    })
  }
  catch (err) {
    console.log(`An error occured: ${err}`);
    return res.status(500).json({error: "Error during GET request"});
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
