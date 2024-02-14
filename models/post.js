const mongoose = require("mongoose");
const postImageBasePath = "uploads/postImages";
const path = require("path");
require("dotenv").config();
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  postImage: {
    type: String,
    require: true,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
module.exports.postImageBasePath = postImageBasePath;