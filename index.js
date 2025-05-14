const express = require("express");
const cors = require("cors");
const connectToMongo = require("./dbs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Successful response.");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api", require("./routes/events"));
app.use("/api", require("./routes/registration"));
app.get('/working', (req, res)=>{
  res.send({success:true,working:"its working properlu"})
})

app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);
