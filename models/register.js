const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const generateRegistrationCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 15; i++) {
    const charIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(charIndex);
  }
  return code;
};

const registerschema = new mongoose.Schema({
  parent_firstname: {
    type: String,
    required: true,
  },
  parent_lastname: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cellnumber: {
    type: String,
    required: true,
  },
  childs_fullname: {
    type: String,
    required: true,
  },
  child_age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  registrationcode: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Mongoose pre-save hook to generate a registration code
registerschema.pre("save", async function (next) {
  // Generate a unique registration code
  this.registrationcode = generateRegistrationCode();

  // Continue with the save operation
  next();
});

module.exports = mongoose.model("Register", registerschema);
