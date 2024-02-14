const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

 const commentSchema = new mongoose.Schema({

    description: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
    },
    post: { type: Schema.Types.ObjectId, ref: 'Post'}
 })



 module.exports = mongoose.model('Comment', commentSchema)