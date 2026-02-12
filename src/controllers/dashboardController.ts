import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Transaction from '../models/Transaction';
import Kyc from '../models/Kyc';
import KYB from '../models/KYB';

export const getOverviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const [userStats, transactionStats, subscriptionStats] = await Promise.all([
      (async () => {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({
      status: { $nin: ['suspended', 'inactive'] },
    });
        const suspendedUsers = await User.countDocuments({ status: 'suspended' });
        const individualUsers = await User.countDocuments({ type: { $in: ['individual', 'Individual', 'Simple'] } });
        const businessUsers = await User.countDocuments({ type: { $in: ['business', 'Business'] } });
        const kycPending = await Kyc.countDocuments({ status: 'pending' }).catch(() => 0);
        const kycApproved = await User.countDocuments({ 'kyc.kycStatus': true }).catch(() => 0);
        return {
          totalUsers,
          activeUsers,
          suspendedUsers,
          individualUsers,
          businessUsers,
          kycPending,
          kycApproved,
        };
      })(),
      (async () => {
        const totalTransactions = await Transaction.countDocuments();
        const completed = await Transaction.countDocuments({ status: 'completed' });
        const pending = await Transaction.countDocuments({ status: 'pending' });
        const failed = await Transaction.countDocuments({ status: 'failed' });
        const volAgg = await Transaction.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const feeAgg = await Transaction.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$fee' } } },
        ]);
        return {
          totalTransactions,
          completedTransactions: completed,
          pendingTransactions: pending,
          failedTransactions: failed,
          totalVolume: volAgg[0]?.total || 0,
          totalFees: feeAgg[0]?.total || 0,
        };
      })(),
      (async () => {
        const active = await Subscription.countDocuments({ status: 'ACTIVE' });
        const pastDue = await Subscription.countDocuments({ status: 'PAST_DUE' });
        const suspended = await Subscription.countDocuments({ status: 'SUSPENDED' });
        const canceled = await Subscription.countDocuments({ status: 'CANCELED' });
        const mrrAgg = await Subscription.aggregate([
          { $match: { status: 'ACTIVE' } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$amounts.monthly_fee_usd', 0] } } } },
        ]);
        return {
          active,
          pastDue,
          suspended,
          canceled,
          total: active + pastDue + suspended + canceled,
          totalMRR: mrrAgg[0]?.total || 0,
        };
      })(),
    ]);
    res.json({
      success: true,
      data: {
        userStats,
        transactionStats,
        subscriptionStats,
      },
    });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overview stats', error });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch real data from database
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      status: { $nin: ['suspended', 'inactive'] },
    });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Transaction stats
    const totalTransactions = await Transaction.countDocuments();
    const transactionData = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$amount' }
        }
      }
    ]);
    const totalVolume = transactionData[0]?.totalVolume || 0;

    // Subscription stats
    const activeSubscriptions = await Subscription.countDocuments({ status: 'ACTIVE' });
    const pastDueSubscriptions = await Subscription.countDocuments({ status: 'PAST_DUE' });

    const revenueData = await Subscription.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: { $ifNull: ['$amounts.monthly_fee_usd', 0] } }
        }
      }
    ]);
    const monthlyRevenue = revenueData[0]?.monthlyRevenue || 0;

    // KYC/KYB stats
    const kycPending = await Kyc.countDocuments({ status: 'pending' });
    const kybPending = await KYB.countDocuments({ status: 'pending' });

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id amount status transactionType createdAt user')
      .populate('user', 'firstName lastName displayName email');

    const topUsersAgg = await Transaction.aggregate([
      { $match: { user: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } }
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalTransactions,
      totalVolume: parseFloat(Number(totalVolume).toFixed(2)),
      monthlyRevenue: parseFloat(Number(monthlyRevenue).toFixed(2)),
      kycPending,
      kybPending,
      suspendedUsers,
      pastDueSubscriptions,
      activeSubscriptions,
      recentTransactions: recentTransactions.map((t: any) => ({
        _id: t._id,
        amount: t.amount,
        status: t.status,
        type: t.transactionType,
        createdAt: t.createdAt,
        userName: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.displayName : '—'
      })),
      topUsers: topUsersAgg.map((u: any) => ({
        userId: u._id,
        totalAmount: u.totalAmount,
        transactionCount: u.transactionCount,
        userName: u.userInfo?.[0] ? `${u.userInfo[0].firstName || ''} ${u.userInfo[0].lastName || ''}`.trim() || u.userInfo[0].displayName : 'Unknown'
      }))
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error });
  }
};

export const getChartData = async (req: AuthRequest, res: Response) => {
  try {
    // User growth data (last 6 months)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Subscription trend (last 6 months)
    const subscriptionTrend = await Subscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          subscriptions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Revenue data (last 6 months)
    const revenueData = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const chartData = {
      userGrowth: userGrowth.map(item => ({
        month: monthNames[item._id.month - 1],
        users: item.users
      })),
      subscriptionTrend: subscriptionTrend.map(item => ({
        month: monthNames[item._id.month - 1],
        subscriptions: item.subscriptions
      })),
      revenueData: revenueData.map(item => ({
        month: monthNames[item._id.month - 1],
        revenue: parseFloat(item.revenue.toFixed(2))
      }))
    };

    res.json(chartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Failed to fetch chart data', error });
  }
};

export const getUsersStats = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('_id name email status createdAt')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users stats error:', error);
    res.status(500).json({ message: 'Failed to fetch users stats', error });
  }
};

export const getSubscriptionStats = async (req: AuthRequest, res: Response) => {
  try {
    const subscriptionStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    res.json(subscriptionStats);
  } catch (error) {
    console.error('Subscription stats error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription stats', error });
  }
};

export const getTransactionStats = async (req: AuthRequest, res: Response) => {
  try {
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json(transactionStats);
  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction stats', error });
  }
};
