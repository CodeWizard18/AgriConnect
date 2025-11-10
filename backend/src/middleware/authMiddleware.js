import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = auth.split(' ')[1];

  try {
    // ✅ Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Load full user (including role)
    const user = await User.findById(payload.id).select('role status email name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Check block status
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account blocked. Contact administrator.' });
    }

    // ✅ Attach user info to request
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
