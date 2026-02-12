# VALYGO Admin Backend

Backend API for the VALYGO Admin Dashboard with support for admin management, sales team, meetings, and analytics.

## Features

- **Admin Authentication**: Secure login and JWT-based authentication
- **Dashboard Analytics**: Real-time statistics and metrics
- **Sales Team Management**: Create and manage sales team users with referral tracking
- **Meetings Management**: Schedule and manage team meetings
- **Referral System**: Track downlines up to 5 levels deep
- **Role-Based Access Control**: Different permission levels for different roles

## Tech Stack

- **Node.js & Express**: Server framework
- **TypeScript**: Type-safe development
- **MongoDB**: Database
- **JWT**: Authentication
- **Bcrypt**: Password hashing

## Installation

### Prerequisites

- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
PORT=3002
NODE_ENV=development
# Use the same MongoDB as your main app to see real users, transactions, subscriptions:
MONGODB_URI=mongodb://localhost:27017/valygo-admin
# For real dashboard data (users, transactions, subscriptions), set MONGODB_URI to your main app DB, e.g.:
# MONGODB_URI=mongodb://localhost:27017/valygo
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
MAIN_API_URL=http://localhost:3001/api
```

4. Start development server:
```bash
npm run dev
```

The server will run on `http://localhost:3002`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get admin profile

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/chart-data` - Get chart data

### Sales Team
- `POST /api/sales-team` - Create sales team user
- `GET /api/sales-team` - Get all sales team users
- `PUT /api/sales-team/:id` - Update sales team user
- `DELETE /api/sales-team/:id` - Delete sales team user
- `GET /api/sales-team/dashboard` - Get sales team dashboard

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings` - Get all meetings
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

## Database Models

### AdminUser
- name: String
- email: String (unique)
- password: String (hashed)
- role: 'super_admin' | 'admin' | 'manager' | 'support' | 'analyst' | 'sales_team'
- status: 'active' | 'inactive'
- permissions: String[]
- lastLogin: Date

### SalesTeamUser
- name: String
- email: String (unique)
- password: String (hashed)
- referralCode: String (unique)
- onboardedUsers: Number
- totalSubscriptions: Number
- monthlyNewSubscriptions: Number
- lastMonthNewSubscriptions: Number
- downlines: ObjectId[] (up to 5 levels)
- createdBy: ObjectId (AdminUser)

### Meeting
- title: String
- description: String
- startTime: Date
- endTime: Date
- attendees: ObjectId[] (AdminUser)
- createdBy: ObjectId (AdminUser)
- meetingLink: String
- status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Role-Based Access Control

- **super_admin**: Full access to all features
- **admin**: Can manage users, plans, and sales team
- **manager**: Can view users and plans
- **support**: Limited access to user information
- **analyst**: Can view analytics
- **sales_team**: Can access sales dashboard and referral data

## Error Handling

All errors return a JSON response with:
```json
{
  "message": "Error description",
  "error": {}
}
```

## Development

### Build
```bash
npm run build
```

### Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Integration with Main Backend

The admin backend connects to the main VALYGO backend to fetch:
- User statistics
- Subscription data
- Transaction information
- Blockchain data
- VYO token information

Configure the `MAIN_API_URL` environment variable to point to your main backend.

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- Role-based access control on all endpoints
- CORS enabled for frontend communication
- Helmet.js for security headers

## Support

For issues or questions, contact the VALYGO team.

## License

© 2024 VALYGO. All rights reserved.
# adminValygobackend
