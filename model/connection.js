// Import libraries
require("dotenv").config();
const http2 = require("http2");
const fs = require("fs");
const http2Express = require("http2-express-bridge");
const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const options = {
  key: fs.readFileSync("./certs/key.pem"),
  cert: fs.readFileSync("./certs/cert.pem"),
};

// Invoke app
//const app = http2Express(express);
const app = express(); //HTTP 1.1

// Define PORT
const PORT = process.env.PORT || 3333;

// Connect to Database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB connected`);
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`)); //HTTP 1.1
    /* http2
      .createSecureServer(options, app)
      .listen(PORT, () => console.log(`Listening to port ${PORT}`)); */
  })
  .catch((err) => {
    console.log(err.message);
  });

// Export modules to app.js and schema.js
module.exports = {
  express,
  app,
  mongoose,
  Schema,
};
