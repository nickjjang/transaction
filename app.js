require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Promise = require("bluebird");
const RPC = require("./controller/rpc");

const app = express();
// var mongodbUri = "mongodb://127.0.0.1:27017/database";
var mongodbUri = process.env.MONGODB_URI || "mongodb://mongo:27017/database";

Promise.promisifyAll(mongoose);

mongoose.connect(mongodbUri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.error(err);
  console.error(
    "%s MongoDB connection error. Please make sure MongoDB is running."
  );
  process.exit();
});

mongoose.connection.once("open", function () {
  console.log("Successfully connected to MongoDB!");
});

const port = 3000;

app.listen(port, function () {
  console.log("starting the app!");
  RPC.runRPC();
});
