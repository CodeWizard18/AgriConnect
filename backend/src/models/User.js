import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'customer', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  phone: String,
  address: String,
  pincode: String,
  city: String,
  state: String,
  // OTP verification fields
  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
