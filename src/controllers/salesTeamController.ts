import { Response } from 'express';
import SalesTeamUser from '../models/SalesTeamUser';
import AdminUser from '../models/AdminUser';
import User from '../models/User';
import Subscription from '../models/Subscription';
import SalesReferralCode from '../models/SalesReferralCode';
import SalesReferralSignup from '../models/SalesReferralSignup';
import { generateReferralCode } from '../utils/generateReferralCode';
import { AuthRequest } from '../middleware/auth';
import emailService from '../services/emailService';

export const createSalesTeamUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password required' });
    }

    const existingSales = await SalesTeamUser.findOne({ email: email.toLowerCase() });
    if (existingSales) {
      return res.status(400).json({ message: 'Email already exists in sales team' });
    }
    const existingAdmin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists as admin user' });
    }

    const referralCode = generateReferralCode(email);

    const newSalesUser = new SalesTeamUser({
      name,
      email: email.toLowerCase(),
      password,
      createdBy: req.user?.id,
      referralCode,
    });
    await newSalesUser.save();

    await SalesReferralCode.create({
      referralCode,
      salesTeamUserId: newSalesUser._id,
    });

    const newAdminUser = new AdminUser({
      name,
      email: email.toLowerCase(),
      password,
      role: 'sales_team',
      status: 'active',
      permissions: ['referral_dashboard'],
    });
    await newAdminUser.save();

    // Send welcome email
    try {
      await emailService.sendSalesTeamInvite(email, name, referralCode);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(201).json({
      message: 'Sales team user created successfully',
      user: {
        id: newSalesUser._id,
        name: newSalesUser.name,
        email: newSalesUser.email,
        referralCode: newSalesUser.referralCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sales team user', error });
  }
};

export const getSalesTeamUsers = async (req: AuthRequest, res: Response) => {
  try {
    const createdBy = req.user?.id;
    const query = createdBy ? { createdBy } : {};
    const users = await SalesTeamUser.find(query)
      .select('-password')
      .populate('downlines', '-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sales team users', error });
  }
};

export const updateSalesTeamUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, status } = req.body;

    const user = await SalesTeamUser.findByIdAndUpdate(
      id,
      { name, email, status },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sales team user', error });
  }
};

export const deleteSalesTeamUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await SalesTeamUser.findByIdAndDelete(id);
    res.json({ message: 'Sales team user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sales team user', error });
  }
};

export const getSalesTeamDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const adminEmail = req.user?.email;
    if (!adminEmail) return res.status(401).json({ message: 'Unauthorized' });

    const salesUser = await SalesTeamUser.findOne({ email: adminEmail.toLowerCase() })
      .populate('downlines', 'name email onboardedUsers totalSubscriptions status');

    if (!salesUser) {
      return res.status(404).json({ message: 'Sales agent profile not found' });
    }

    const referralCode = salesUser.referralCode;
    const signups = await SalesReferralSignup.find({ referralCode }).select('userId').lean();
    const ids = signups.map((s: any) => s.userId);

    const onboardedUsers = ids.length;
    const activeSubs = await Subscription.find({ user_id: { $in: ids }, status: 'ACTIVE' }).lean();
    const totalSubscriptions = activeSubs.length;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startOfLastMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1);

    const monthlyNew = await Subscription.countDocuments({
      user_id: { $in: ids },
      status: 'ACTIVE',
      createdAt: { $gte: startOfMonth },
    });
    const lastMonthNew = await Subscription.countDocuments({
      user_id: { $in: ids },
      status: 'ACTIVE',
      createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
    });

    const referredUsers = ids.length > 0 ? await User.find({ _id: { $in: ids } })
      .select('firstName lastName email')
      .limit(5)
      .lean() : [];
    const subCounts = await Subscription.aggregate([
      { $match: { user_id: { $in: ids }, status: 'ACTIVE' } },
      { $group: { _id: '$user_id', count: { $sum: 1 } } },
    ]);
    const subCountMap = new Map(subCounts.map((s: any) => [s._id.toString(), s.count]));
    const downlinesList = referredUsers.map((u: any) => ({
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      onboardedUsers: 1,
      totalSubscriptions: subCountMap.get(u._id.toString()) ?? 0,
      status: 'active',
    }));

    res.json({
      onboardedUsers,
      totalSubscriptions,
      monthlyNewSubscriptions: monthlyNew,
      lastMonthNewSubscriptions: lastMonthNew,
      referralCode: salesUser.referralCode,
      downlines: downlinesList,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales team dashboard', error });
  }
};
