# Admin Backend - Complete Setup Guide

## Overview

This is a comprehensive admin backend system for managing users, subscriptions, KYC verification, and transactions. It's built with Express.js, TypeScript, and MongoDB.

## Features

- **User Management**: View, filter, and manage all platform users
- **Subscription Management**: Monitor active subscriptions, MRR, and billing status
- **KYC Verification**: Review and approve/reject user KYC submissions
- **Transaction Monitoring**: Track all platform transactions with detailed analytics
- **Admin Audit Logging**: Complete audit trail of all admin actions
- **Role-Based Access Control**: Different permission levels for admin roles

## Database Models

### Core Models
- **AdminUser**: Admin staff with role-based access
- **User**: Platform users (individual and business)
- **Subscription**: User subscription plans and billing
- **Transaction**: All financial transactions
- **Kyc**: Know Your Customer verification data
- **AdminAuditLog**: Audit trail for admin actions

## API Endpoints

### Users
```
GET    /api/users              - Get all users (paginated)
GET    /api/users/stats        - Get user statistics
GET    /api/users/:id          - Get user details
PUT    /api/users/:id/status   - Update user status
```

### Subscriptions
```
GET    /api/subscriptions      - Get all subscriptions (paginated)
GET    /api/subscriptions/stats - Get subscription statistics
PUT    /api/subscriptions/:id/status - Update subscription status
```

### Transactions
```
GET    /api/transactions       - Get all transactions (paginated)
GET    /api/transactions/stats - Get transaction statistics
GET    /api/transactions/:id   - Get transaction details
```

### KYC
```
GET    /api/kyc                - Get all KYC requests (paginated)
GET    /api/kyc/stats          - Get KYC statistics
GET    /api/kyc/:id            - Get KYC details
PUT    /api/kyc/:id/approve    - Approve KYC
PUT    /api/kyc/:id/reject     - Reject KYC
```

## Installation

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Steps

1. **Install Dependencies**
```bash
cd admin-backend
npm install
```

2. **Environment Setup**
Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/admin-db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

3. **Database Setup**
```bash
# Run seed script to create initial admin user
npm run seed
```

4. **Start Server**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Admin Roles

- **super_admin**: Full access to all features
- **admin**: Full access except user deletion
- **manager**: Can manage users and subscriptions
- **support**: Can view data and respond to support tickets
- **analyst**: Read-only access to analytics
- **sales_team**: Can manage sales-related data

## Authentication

All endpoints require JWT authentication. Include token in header:
```
Authorization: Bearer <token>
```

## Data Filtering & Pagination

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `type`: Filter by type
- `search`: Search by email/name

### Example
```
GET /api/users?page=1&limit=25&status=active&search=john
```

## Real Data Integration

The backend is designed to work with real data from the main valygo-pay-backend database. Models are structured to match the production database schema.

### Data Sync
To sync data from production:
1. Ensure MongoDB connection points to production database
2. Run migrations if needed
3. Data will be automatically available through API endpoints

## Monitoring & Logging

- All admin actions are logged in `AdminAuditLog` collection
- Transaction monitoring provides real-time insights
- Subscription analytics track MRR and churn

## Error Handling

All endpoints return standardized responses:

### Success
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

## Performance Optimization

- Database indexes on frequently queried fields
- Pagination to handle large datasets
- Aggregation pipelines for analytics
- Caching for statistics

## Security

- JWT-based authentication
- Role-based access control
- Input validation on all endpoints
- Audit logging for compliance
- Password hashing with bcrypt

## Troubleshooting

### Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Ensure network connectivity

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Ensure token is in Authorization header

### Data Not Showing
- Verify database has data
- Check pagination parameters
- Review filter criteria

## Development

### Project Structure
```
admin-backend/
├── src/
│   ├── models/          # Database models
│   ├── controllers/     # Route handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── config/          # Configuration
│   └── index.ts         # Entry point
├── .env                 # Environment variables
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

### Adding New Features

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add routes to main `index.ts`
5. Update API documentation

## Support

For issues or questions, contact the development team.
