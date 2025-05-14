const express = require("express");
const cors = require("cors");
const connectToMongo = require("./dbs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: 'https://events4all.vercel.app', // your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you're using cookies or auth headers
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/events"));
app.use("/api", require("./routes/registration"));

app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);
