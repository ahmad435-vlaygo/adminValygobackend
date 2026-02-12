import { Request, Response } from 'express';
import Transaction from '../models/Transaction';

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, type, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.user = userId;

    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName displayName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionStats = async (req: Request, res: Response) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const failedTransactions = await Transaction.countDocuments({ status: 'failed' });

    const totalVolume = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalFees = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        totalFees: totalFees[0]?.total || 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate('user');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
