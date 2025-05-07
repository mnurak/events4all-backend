const mongoose = require('mongoose')

const mongoURL = "mongodb://localhost:27017/fun?appName=MongoDB+Compass&directConnection=true&serverSelectionTimeoutMS=2000"

const connectToMongo = () => {
    mongoose.connect(mongoURL).then(() => {
        console.log("You are connected to mongodb")
    }).catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
}

connectToMongo();