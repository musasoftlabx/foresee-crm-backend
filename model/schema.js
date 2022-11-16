// Import libraries
const _ = require("lodash");
const { isEmail } = require("validator");

// Import mongoose & schema from connector
const { mongoose, Schema } = require("./connection");
//const AutoIncrement = require("mongoose-sequence")(mongoose);

// Schema definitions
// This references the collection name as called in the DB

// User schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name must be provided."],
      maxLength: [20, "First name cannot be more than 20 characters."],
      trim: true,
      set: (v) => _.capitalize(v),
    },
    lastName: {
      type: String,
      required: [true, "Last name must be provided."],
      maxLength: [20, "Last name cannot be more than 20 characters."],
      trim: true,
      set: (v) => _.capitalize(v),
    },
    emailAddress: {
      type: String,
      required: [true, "An email must be provided."],
      unique: true,
      lowercase: true,
      validate: [isEmail, "The email provided is not valid."],
    },
    username: {
      type: String,
      required: [true, "A username must be provided."],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password must be greater than 7 characters."],
    },
    domain: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Domains schema
const domainsSchema = new Schema(
  {
    domain: {
      type: String,
      required: [true, "A domain must be provided."],
      trim: true,
    },
  },
  { timestamps: true }
);

// Stores schema
const storesSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Store code must be provided."],
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Store name must be provided."],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country must be provided."],
      trim: true,
    },
    client: {
      type: String,
      required: [true, "Client must be provided."],
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Categories schema
const categoriesSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Category must be provided."],
      trim: true,
    },
    subcategories: [{ type: String, trim: true, set: (v) => _.capitalize(v) }],
  },
  { timestamps: true }
);

// Tickets schema
const ticketsSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Category must be provided."],
    },
    subcategory: {
      type: String,
      required: [true, "Sub-category must be provided."],
    },
    details: {
      type: String,
      maxLength: [50, "Cannot be more than 50 characters. Got {VALUE}"],
    },
    stage: {
      type: String,
      enum: ["New", "In Progress", "Rejected", "Done"],
      default: "New",
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    forStore: String,
    quotation: {
      offerDate: String,
      offer: { type: String, trim: true },
      issue: { type: String, trim: true },
      solution: { type: String, trim: true },
      warranty: { type: String, trim: true },
      timeframe: { type: String, trim: true },
      notes: String,
      workDetails: [
        {
          scope: String,
          brand: String,
          quantity: Number,
          price: Number,
        },
      ],
      total: Number,
    },
    actions: [
      {
        action: String,
        actionedBy: String,
        actionedOn: Date,
      },
    ],
    serviceCard: String,
  },
  { timestamps: true }
);

// Export module to app.js
//mongoose.models = {};
let usersCollection = mongoose.model("user", userSchema);
let domainsCollection = mongoose.model("domain", domainsSchema);
let storesCollection = mongoose.model("store", storesSchema);
let categoriesCollection = mongoose.model("category", categoriesSchema);
let ticketsCollection = mongoose.model("ticket", ticketsSchema);

module.exports = {
  mongoose,
  usersCollection,
  domainsCollection,
  storesCollection,
  categoriesCollection,
  ticketsCollection,
};
