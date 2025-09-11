const mongoose = require('mongoose');

const subPageSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    default: 'main'
  }
}, { timestamps: true });

module.exports = mongoose.model('SubPage', subPageSchema);