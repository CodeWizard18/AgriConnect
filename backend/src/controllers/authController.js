import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOTP } from '../utils/emailService.js';

export async function signup(req, res) {
  try {
    const { name, email, password, role, phone, address, pincode, city, state, adminKey } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    // ✅ Secure admin signup with secret key
    if (role === 'admin') {
      if (!adminKey || adminKey !== process.env.ADMIN_SIGNUP_KEY) {
        return res.status(403).json({ message: 'Unauthorized admin signup' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      name,
      email,
      passwordHash,
      role,
      phone,
      address,
      pincode,
      city,
      state,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail the signup if email fails, but log it
    }

    res.json({
      message: 'Account created successfully. Please check your email for OTP verification.',
      userId: user._id,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account blocked. Contact administrator for assistance.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, pincode: user.pincode, city: user.city, state: user.state }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    try {
      await sendOTP(email, otp);
      res.json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
