import mongoose from "mongoose"

const Schema = mongoose.Schema
const userSchema = new Schema({
  username:{
    type: String,
    required: [true, 'username is required'],
    unique:true
  },
  name:{
    type: String,
    required: false
  },
  roles:{
    type: [String],
    default: ['user']
  },
  email:{
    type: String,
    required: false,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: [true, 'password is required'],
  }
},
{
  collection: 'users',
  timestamps: true
})

export default module.exports = mongoose.model('User', userSchema)