import { Response } from 'express';
import mongoose from 'mongoose';
import AdminUser from '../models/AdminUser';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateToken(user._id.toString(), user.email, user.role);

    res.json({
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email?.trim?.()?.toLowerCase?.();
    if (!userId && !userEmail) return res.status(401).json({ message: 'Unauthorized' });
    // Prefer email lookup first (stable after re-seed); fallback to id
    let user = userEmail
      ? await AdminUser.findOne({ email: userEmail }).select('-password').lean()
      : null;
    if (!user && userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await AdminUser.findById(userId).select('-password').lean();
    }
    if (!user) return res.status(404).json({ message: 'Admin not found' });
    res.json({
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userEmail = req.user?.email?.trim?.()?.toLowerCase?.();
    // Prefer email lookup first (stable after re-seed)
    let admin = userEmail
      ? await AdminUser.findOne({ email: userEmail })
      : null;
    if (!admin && req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      admin = await AdminUser.findById(req.user.id);
    }
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (name !== undefined && String(name).trim()) admin.name = String(name).trim();
    if (email !== undefined && String(email).trim()) {
      const existing = await AdminUser.findOne({ email: String(email).trim().toLowerCase(), _id: { $ne: admin._id } });
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      admin.email = String(email).trim().toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required to set new password' });
      const valid = await admin.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
      admin.password = newPassword;
    }

    await admin.save();
    const user = await AdminUser.findById(admin._id).select('-password');
    res.json({ data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error });
  }
};
