const mongoose = require("mongoose");
const setupChangeStream = require("./triggers/triggerService");
const Students = require("./Schemas/Students");
const {
  studentsTrigger,
  collegesTrigger,
  eventsTrigger,
  registrationsTrigger,
} = require("./triggers/triggerHandlers");
const Colleges = require("./Schemas/Colleges");
const Events = require("./Schemas/Events");
const Registrations = require("./Schemas/Registrations");
require("dotenv").config();

const mongoURL = process.env.MONGO_URL;

const connectToMongo = () => {
  try {
    mongoose
      .connect(mongoURL)
      .then(() => {
        console.log("You are connected to mongodb");
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        return;
      });

    setupChangeStream(Students, "students", studentsTrigger);
    setupChangeStream(Colleges, "colleges", collegesTrigger);
    setupChangeStream(Events, "events", eventsTrigger);
    setupChangeStream(Registrations, "registraions", registrationsTrigger);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectToMongo();
