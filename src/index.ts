import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';

// Routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import salesTeamRoutes from './routes/salesTeam';
import meetingRoutes from './routes/meetings';
import usersRoutes from './routes/users';
import subscriptionsRoutes from './routes/subscriptions';
import transactionsRoutes from './routes/transactions';
import kycRoutes from './routes/kyc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/sales-team', salesTeamRoutes);
app.use('/api/admin/meetings', meetingRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/subscriptions', subscriptionsRoutes);
app.use('/api/admin/transactions', transactionsRoutes);
app.use('/api/admin/kyc', kycRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

app.listen(PORT, () => {
  console.log(`Admin backend server running on port ${PORT}`);
});
