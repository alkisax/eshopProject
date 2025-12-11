// backend\src\login\models\users.models.ts
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'username is required'],
      unique: true,
    },
    name: {
      type: String,
      required: false,
    },
    roles: {
      type: [String],
      default: ['user'],
    },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    hashedPassword: {
      type: String,
      required: [true, 'password is required'],
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Commodity',
        required: false,
      },
    ],
    // ΝΕΑ ΠΕΔΙΑ ΓΙΑ ORDER HISTORY
    // ref reminder → Μέσα στο orderHistory αποθηκεύεις ΜΟΝΟ τα ObjectId των Transaction. ΑΛΛΑ αν ποτέ ζητήσω populate, να πας στο μοντέλο ‘Transaction’ και να μου φέρεις ολόκληρο το αντικείμενο.
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        required: false,
      },
    ],
    purchasedProducts: [
      {
        uuid: {
          type: String,
        },
        count: {
          type: Number,
          default: 0
        },
      },
    ],
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

export default module.exports = mongoose.model('User', userSchema);
