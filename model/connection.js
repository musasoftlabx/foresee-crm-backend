// Import libraries
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Invoke app
const app = express();

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
    app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
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
