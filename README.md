# �� Spendee - Personal Finance Management App

A comprehensive expense tracking and financial management application with web dashboard and mobile app support.

![Spendee](https://img.shields.io/badge/Spendee-Finance%20App-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![React](https://img.shields.io/badge/React-18-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.72-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Building Mobile App](#-building-mobile-app)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)

## ✨ Features

### Core Features
- 📊 **Comprehensive Dashboard** - Visual overview with multiple charts and statistics
- 💸 **Expense Tracking** - Track and categorize expenses
- 💰 **Income Management** - Record and monitor income sources
- 🎯 **Budget Management** - Set budgets and track spending
- 💳 **EMI Tracking** - Manage loans and monthly installments
- 📱 **UPI Payment Tracking** - Track UPI transactions
- 📈 **Advanced Analytics** - Multiple chart types (Pie, Bar, Area, Stacked)
- 🌓 **Dark Theme** - Beautiful dark UI across all platforms
- 📱 **Mobile App** - Full-featured React Native app

### Dashboard Features
- **Available Balance** - Real-time balance after all expenses
- **Monthly Statistics** - Income, expenses, EMIs, UPI payments
- **Expense Breakdown by Category** - Pie chart visualization
- **Monthly Overview** - Bar chart showing income vs expenses
- **Savings Trend** - Area chart tracking savings over time
- **Spending Breakdown** - Stacked bar chart (Expenses, EMI, UPI, Down Payments)

## 📁 Project Structure

```
Spendee/
├── server/                 # Backend API (Node.js/Express)
│   ├── index.js           # Main server file
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── package.json
│
├── client/                # Web Dashboard (React)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React Context providers
│   │   └── App.js
│   └── package.json
│
├── mobile/                # Mobile App (React Native/Expo)
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── context/       # Context providers
│   │   └── config/        # Configuration
│   ├── app.json           # Expo configuration
│   └── package.json
│
└── README.md              # This file
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB Atlas** account (or local MongoDB)
- **Git**
- **For Mobile App:**
  - **Android Studio** (for Android builds)
  - **Xcode** (for iOS builds - macOS only)
  - **Expo CLI** (optional, for development)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aka-aadi/Spendee.git
cd Spendee
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Configure Server Environment

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

**Get MongoDB Connection String:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/spendee?retryWrites=true&w=majority`

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Install Web Dashboard Dependencies

```bash
cd ../client
npm install
```

### 5. Install Mobile App Dependencies

```bash
cd ../mobile
npm install
```

## 🏃 Running the Application

### Start the Server

```bash
cd server
npm run dev      # Development mode (with auto-reload)
# or
npm start        # Production mode
```

Server will run on `http://localhost:5000`

### Start Web Dashboard

```bash
cd client
npm start
```

Web dashboard will open at `http://localhost:3000`

### Start Mobile App (Development)

```bash
cd mobile
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone

## 📱 Building Mobile App

### Build Android APK

#### Option 1: Using Android Studio (Recommended)

1. **Generate Android Project:**
   ```bash
   cd mobile
   npx expo prebuild --platform android --clean
   ```

2. **Open in Android Studio:**
   - Open Android Studio
   - Select "Open an Existing Project"
   - Navigate to `mobile/android` folder
   - Wait for Gradle sync to complete

3. **Build APK:**
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait for build to complete
   - APK will be at: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

#### Option 2: Using Command Line

```bash
cd mobile/android
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Build iOS App (macOS only)

```bash
cd mobile
npx expo prebuild --platform ios --clean
```

Open `mobile/ios/Spendee.xcworkspace` in Xcode and build.

### Build Signed APK for Production

1. **Generate Keystore:**
   ```bash
   cd mobile/android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore spendee-release-key.keystore -alias spendee-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing:**
   Edit `mobile/android/app/build.gradle`:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('spendee-release-key.keystore')
               storePassword 'YOUR_STORE_PASSWORD'
               keyAlias 'spendee-key-alias'
               keyPassword 'YOUR_KEY_PASSWORD'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               ...
           }
       }
   }
   ```

3. **Build:**
   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```

## 🌐 Deployment

### Deploy Server (Backend API)

#### Option 1: Render.com (Recommended - Free Tier)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo: `aka-aadi/Spendee`
5. Configure:
   - **Name:** spendee-api
   - **Environment:** Node
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `PORT` - Will be set automatically
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)

**Your server URL:** `https://your-app-name.onrender.com`

#### Option 2: Railway.app

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select repository
5. Set Root Directory to `server`
6. Add environment variables
7. Deploy!

#### Option 3: Fly.io

1. Install Fly CLI:
   ```powershell
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Login and deploy:
   ```bash
   cd server
   fly auth login
   fly launch
   fly secrets set MONGODB_URI="your-connection-string"
   fly secrets set JWT_SECRET="your-secret"
   ```

### Deploy Web Dashboard (Frontend)

#### Option 1: Netlify (Recommended)

1. **Build the project:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag and drop the `client/build` folder, OR
   - Connect GitHub repo and configure:
     - **Base directory:** `client`
     - **Build command:** `npm install && npm run build`
     - **Publish directory:** `client/build`

3. **Add Environment Variable:**
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-server-url.onrender.com/api`

**Your web dashboard URL:** `https://your-app-name.netlify.app`

#### Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd client
   vercel
   ```

3. Add environment variable:
   - Go to Vercel dashboard
   - Project settings → Environment Variables
   - Add: `REACT_APP_API_URL`

#### Option 3: GitHub Pages

```bash
cd client
npm install --save-dev gh-pages

# Add to package.json:
# "homepage": "https://yourusername.github.io/Spendee",
# "scripts": {
#   "predeploy": "npm run build",
#   "deploy": "gh-pages -d build"
# }

npm run deploy
```

### Update Mobile App with Production URL

After deploying the server, update the mobile app:

Edit `mobile/src/config/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api'  // Development (emulator)
  : 'https://your-server-url.onrender.com/api'; // Production
```

Rebuild the APK after updating.

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://spendee-qkf8.onrender.com/api`

### Authentication

Most endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication
- `POST /api/auth/init` - Initialize admin user
- `POST /api/auth/login` - User login

#### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Income
- `GET /api/income` - Get all income entries
- `POST /api/income` - Create income entry
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Delete income

#### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

#### EMIs
- `GET /api/emis` - Get all EMIs
- `POST /api/emis` - Create EMI
- `PUT /api/emis/:id` - Update EMI
- `DELETE /api/emis/:id` - Delete EMI
- `POST /api/emis/:id/pay` - Mark EMI as paid
- `POST /api/emis/:id/unpay` - Unmark EMI payment

#### UPI Payments
- `GET /api/upi` - Get all UPI payments
- `POST /api/upi` - Create UPI payment
- `PUT /api/upi/:id` - Update UPI payment
- `DELETE /api/upi/:id` - Delete UPI payment

#### Financial Summary
- `GET /api/financial/summary` - Get comprehensive financial summary

#### Health Check
- `GET /api/health` - Server health check

## ⚙️ Configuration

### Server Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |

### Web Dashboard Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://spendee-qkf8.onrender.com/api` |

Create `client/.env` for local development:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Mobile App Configuration

Edit `mobile/src/config/api.js`:
```javascript
// Production API URL
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api'  // Android Emulator
  : 'https://spendee-qkf8.onrender.com/api'; // Production
```

## 🛠️ Development

### Server Development

```bash
cd server
npm run dev  # Auto-reload on changes
```

### Web Dashboard Development

```bash
cd client
npm start  # Opens http://localhost:3000
```

### Mobile App Development

```bash
cd mobile
npm start  # Expo DevTools
```

Press:
- `a` - Open Android emulator
- `i` - Open iOS simulator
- Scan QR code for physical device

## 📦 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### Web Dashboard
- **React** - UI framework
- **React Router** - Routing
- **ApexCharts** - Chart library
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Mobile App
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **React Native Chart Kit** - Charts
- **AsyncStorage** - Local storage

## 🔒 Security Notes

1. **Never commit `.env` files** - Use environment variables in hosting platforms
2. **Use strong JWT_SECRET** - Generate with crypto.randomBytes
3. **MongoDB Atlas:** Whitelist only necessary IPs in production
4. **HTTPS:** All recommended platforms provide free SSL certificates

## 🆘 Troubleshooting

### Server won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check server logs

### Web dashboard can't connect
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on server
- Ensure server is running

### Mobile app network errors
- **Emulator:** Use `http://10.0.2.2:5000/api` (Android) or `http://localhost:5000/api` (iOS)
- **Production:** Update API URL in `mobile/src/config/api.js`
- Check device/emulator internet connection

### Build errors (Mobile)
- Clean build: `cd mobile/android && ./gradlew clean`
- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on [GitHub](https://github.com/aka-aadi/Spendee/issues).

---

**Made with ❤️ by [aka-aadi](https://github.com/aka-aadi)**