
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
  console.log("---------------------------------")
  console.log("POST /api/users/:_id/exercises")
  const { _id, description, duration, date } = req.body;
  console.log(`The request body is: ${JSON.stringify(req.body)}`);

  try {
    // Find the user by their ID (if needed for username or other references)
    console.log("The _id parameter is: ", req.params._id);
    const user = await User.findById(req.params._id); // Assuming you have a User model
    console.log(`User is: ${JSON.stringify(user)}`)
    if (!user) {
      return res.status(400).send("[object Object]");
    }

    user.log.push({ description , date , duration });
    console.log("Pushed into user.log")
    console.log("User.log is: ", user.log)

    const savedUser = await user.save();
    console.log("The log count is: ", savedUser.log.length);
    const lastIndex = savedUser.log.length - 1;
    const requiredDate = new Date(user.log[lastIndex].date);
    const returnedJSON = {
      _id: req.params._id,
      username: user.username, 
      date: date ? requiredDate.toDateString() : new Date(),
      duration: Number(duration),
      description: description,
    }

    console.log(`Returned JSON is: ${JSON.stringify(returnedJSON)}`)
    console.log("------------------------------------------")
    return res.json(returnedJSON);
  } catch (err) {
    console.error(`Error encountered: ${err}`);
    return res.status(500).json({ error: "Error creating exercise" });
  }
});

// @ GET /api/users/:_id/logs?[from][&to][&limit]

app.get("/api/users/:_id/logs", async (req, res) => {
  console.log("--------------------------------------------------")
  console.log("@ GET /api/users/:_id/logs?[from][&to][&limit]")
  const { from, to, limit } = req.query;
  console.log("Req.query = ", req.query);
  console.log("User id = ", req.params._id);
  const userId = req.params._id;

  const filter = {};
  if (from) filter.date = { $gte: new Date(from) };
  if (to) filter.date = { ...filter.date, $lte: new Date(to) }; // Add lte if to exists

  try {
    const user = await User.findById(userId, { username: 1, log: { _id : 0, $elemMatch: filter, date : { $toString : "%Y-%m-%d"} } }); // Use Mongoose filtering
    if (!user) {
      // Free code camp be weird
      console.log("User not found")
      return res.status(400).send("object Object");
    }

    // const count = user.log.length; // Get count from filtered log
    const filteredLogs = limit ? user.log.slice(0, limit) : user.log; // Limit if provided

  //  return res.json({
  //    _id: user._id,
  //    username: user.username,
  //    count,
  //    log: filteredLogs,
  //    });

    const transformedUser = {
      _id: user._id,
      username: user.username,
      count: user.log.length,
      log: (filteredLogs).map(entryLog => {
        return {
          description: entryLog.description,
          duration: entryLog.duration,
          date: new Date(entryLog.date).toDateString()
        }
      })
    };
    console.log(`Transormed user is: ${JSON.stringify(transformedUser)}`)
    console.log("--------------------------------------------------")
    return res.json(transformedUser);
  } catch (err) {
    console.error("An error occurred:", err);
    return res.status(500).json({ error: "Error during GET request" });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
