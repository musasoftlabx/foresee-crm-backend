// Import mongoose & schema from connector
const { truncate } = require("fs");
const { mongoose, Schema } = require("./connection");

// Schema definitions
// This references the collection name as called in the DB

// Library schema
const librarySchema = new Schema(
  {},
  {
    timestamps: { createdAt: "ScannedOn", updatedAt: "ModifiedOn" },
    strict: false,
  }
);

// Deleted schema
const deletedSchema = new Schema(
  {},
  {
    timestamps: { createdAt: "DeletedOn", updatedAt: "ModifiedOn" },
    strict: false,
  }
);

// Playlist schema
const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    plays: {
      type: Number,
      required: false,
    },
    tracks: {
      type: [Object],
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdOn", updatedAt: "ModifiedOn" },
  }
);

librarySchema.index({ path: "text", name: "text", type: "text" });
deletedSchema.index({ path: "text", name: "text", type: "text" });
playlistSchema.index({ name: "unique" });

// Export module to app.js
module.exports = {
  mongoose,
  librarySchema,
  libraryCollection: mongoose.model("library", librarySchema),
  deletedCollection: mongoose.model("deleted", deletedSchema),
  playlistCollection: mongoose.model("playlist", playlistSchema),
};
