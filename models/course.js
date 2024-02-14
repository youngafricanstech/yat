const mongoose = require("mongoose");
const courseImageBasePath = "uploads/courseImages";
const path = require("path");
require("dotenv").config();
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const coursechema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Course", coursechema);
module.exports.courseImageBasePath = courseImageBasePath;
