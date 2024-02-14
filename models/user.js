const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		// unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	resetPasswordToken: {
		type: String,
	},
	resetPasswordExpires: {
		type: Date,
	},
	roles: {
		type: [String], // Array of roles
		default: [], // Default is an empty array
		enum: ["admin", "superAdmin", "editor"], // Allowed roles
	},
});

module.exports = mongoose.model("User", userSchema);
