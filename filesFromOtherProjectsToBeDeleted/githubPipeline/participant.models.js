const mongoose = require("mongoose")
const transactions = require('./transaction.models')

const Schema = mongoose.Schema
const participantSchema = new Schema({
  name:{
    type: String,
    required: false
  },
  surname:{
    type: String,
    required: false
  },
  email:{
    type: String,
    required: [true, 'email is required'],
    unique: true
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId, // Each item here is an ObjectId pointing to a Transaction document
    ref: 'Transaction' // This tells Mongoose *which* collection/model to link (the 'Transaction' model)
  }],
},
{
  collection: 'participants',
  timestamps: true
})
module.exports = mongoose.model('Participant', participantSchema)