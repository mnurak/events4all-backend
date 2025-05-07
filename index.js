const express = require("express");
const cors = require("cors");
const connectToMongo = require('./dbs')
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET)

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.use('/api/auth', require('./routes/auth'))
app.use('/api', require('./routes/events'))
app.use('/api', require('./routes/registration'))

app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);