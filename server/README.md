# Spentee Server API

Backend API server for the Spentee expense tracking application.

## 🚀 Features

- User authentication with email OTP verification
- User registration and profile management
- Expense tracking and management
- Income tracking
- Budget management
- EMI (Equated Monthly Installment) tracking
- UPI payment tracking
- Savings tracking
- Comprehensive financial summaries
- Profile picture uploads

## 📋 Quick Start

**👉 See [SETUP.md](./SETUP.md) for complete setup instructions.**

### Quick Installation

```bash
# Install dependencies
npm install

# Create .env file (see SETUP.md for required variables)
# Then start server
npm run dev
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide (environment variables, email configuration, deployment)
- **[API Endpoints](#-api-endpoints)** - Available API endpoints below

## 📡 API Endpoints

### Authentication
- `POST /api/auth/init` - Initialize admin user
- `POST /api/auth/register` - Register new user (requires email verification)
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login (username or email)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income
- `GET /api/income` - Get all income entries
- `POST /api/income` - Create income entry
- `GET /api/income/:id` - Get income by ID
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget by ID
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### EMIs
- `GET /api/emis` - Get all EMIs
- `POST /api/emis` - Create EMI
- `GET /api/emis/:id` - Get EMI by ID
- `PUT /api/emis/:id` - Update EMI
- `DELETE /api/emis/:id` - Delete EMI
- `POST /api/emis/:id/pay` - Mark EMI as paid
- `POST /api/emis/:id/unpay` - Unmark EMI payment

### UPI Payments
- `GET /api/upi` - Get all UPI payments
- `POST /api/upi` - Create UPI payment
- `GET /api/upi/:id` - Get UPI payment by ID
- `PUT /api/upi/:id` - Update UPI payment
- `DELETE /api/upi/:id` - Delete UPI payment

### Financial Summary
- `GET /api/financial/summary` - Get comprehensive financial summary

### Upload
- `POST /api/upload/profile-picture` - Upload profile picture (base64)

### Health Check
- `GET /api/health` - Server health check

## 🔐 Authentication

The API uses session-based authentication. For React Native clients, include the session ID in the `x-session-id` header:

```
x-session-id: <your-session-id>
```

For web clients, sessions are managed via cookies automatically.

**See [SETUP.md](./SETUP.md) for authentication setup details.**

## 📦 Project Structure

```
server/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── Procfile              # For Heroku deployment
├── models/               # Mongoose models
│   ├── User.js
│   ├── Expense.js
│   ├── Income.js
│   ├── Budget.js
│   ├── EMI.js
│   └── UPIPayment.js
├── routes/               # API routes
│   ├── auth.js
│   ├── expenses.js
│   ├── income.js
│   ├── budgets.js
│   ├── emis.js
│   ├── upi.js
│   └── financial.js
└── middleware/           # Custom middleware
    └── auth.js
```

## 🚀 Deployment

**👉 See [SETUP.md](./SETUP.md) for detailed deployment instructions to Render.com**

### Quick Deploy Checklist:

1. ✅ Push code to GitHub
2. ✅ Set up MongoDB Atlas cluster
3. ✅ Configure SendGrid for email (see SETUP.md)
4. ✅ Set environment variables in Render dashboard
5. ✅ Deploy to Render.com
6. ✅ Update mobile app with production API URL

## 🧪 Testing

Test the health endpoint:
```bash
curl https://your-server-url.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Spentee API is running"
}
```

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
