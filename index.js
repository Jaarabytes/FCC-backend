const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(express.json())
const User = require('./models')

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

  // @ GET /api/users
  // it returns all users stored in the database
app.get("/api/users", async ( req, res ) => {
  const users = await User.find().select({_id : 1, username: 1});
  try {
    console.log("User's are: ", users);
    return res.json(users);
  }
  catch (err) {
    console.error("Error encountered: ", err);
    return res.status(500).json({Error: "Error when fetching users"})
  }
})

// @ POST /api/users
  // adds the user into the database
app.post("/api/users", async ( req, res ) => {
  const { username } = req.body;

  console.log("The request body is: ", req.body);
  console.log("The username is: ", username);
  
  if (!username) {
    return res.status(400).send({message: "Username is required!!"});
  }
  try {
    const newUser = new User({username});
    const savedUser = await newUser.save();

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

    user.log.push({ description , date: new Date(), duration });
    console.log("Pushed into user.log")
    console.log("User.log is: ", user.log)

    const savedUser = await user.save();
    console.log("The log count is: ", savedUser.log.length);
    return res.json({
      _id: user._id,
      username: user.username, 
      date: date ? new Date() : savedUser.log[0].date.toDateString(), // Format date as needed
      duration: savedUser.log[0].duration,
      description: savedUser.log[0].description,
    });
  } catch (err) {
    console.error(`Error encountered: ${err}`);
    return res.status(500).json({ error: "Error creating exercise" });
  }
});



// @ GET /api/users/:_id/logs?[from][&to][&limit]

app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query;
  console.log("Req.query = ", req.query);
  console.log("User id = ", req.params._id);
  const userId = req.params._id;

  const filter = {};
  if (from) filter.date = { $gte: new Date(from) };
  if (to) filter.date = { ...filter.date, $lte: new Date(to) }; // Add lte if to exists

  try {
    const user = await User.findById(userId, { username: 1, log: { $elemMatch: filter } }); // Use Mongoose filtering
    if (!user) {
      return res.status(404).json({ Error: "User not found" });
    }

    const count = user.log.length; // Get count from filtered log
    const filteredLogs = limit ? user.log.slice(0, limit) : user.log; // Limit if provided

    return res.json({
      _id: user._id,
      username: user.username,
      count,
      log: filteredLogs,
    });
  } catch (err) {
    console.error("An error occurred:", err);
    return res.status(500).json({ error: "Error during GET request" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
