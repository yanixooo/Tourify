# 🌍 Tourify

> **A full-stack tour booking platform with Stripe payments, interactive maps, and modern
> glassmorphic UI**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet.svg)](https://stripe.com)
[![Mapbox](https://img.shields.io/badge/Mapbox-GL-orange.svg)](https://www.mapbox.com)
[![Tests](https://img.shields.io/badge/Tests-18%20passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

## ✨ Features

### 🎨 **Modern UI/UX**

- Glassmorphic design with iOS-inspired aesthetics
- Responsive layout for all devices
- Interactive tour cards with smooth animations
- Dark/Light theme support

### 🔐 **Authentication & Security**

- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting (100 requests/hour per IP)
- Data sanitization against NoSQL injection & XSS
- Secure HTTP headers with Helmet
- CORS configuration

### 💳 **Stripe Payments**

- Secure checkout sessions
- Real-time payment processing
- Webhook integration for payment confirmation
- Booking history for users

### 🗺️ **Interactive Maps**

- Mapbox GL integration
- Tour route visualization
- Location markers with popups

### 📧 **Email Services**

- Password reset functionality
- Email notifications via Nodemailer
- Mailtrap support for development

### 📸 **Image Upload**

- User profile photo upload
- Tour image management (cover + gallery)
- Image processing with Sharp (resize, optimize)

## 🏗️ Tech Stack

| Category             | Technology                         |
| -------------------- | ---------------------------------- |
| **Language**         | TypeScript 5.8                     |
| **Backend**          | Node.js, Express 5.1               |
| **Database**         | MongoDB Atlas, Mongoose 8.18       |
| **Authentication**   | JWT, bcryptjs                      |
| **Payments**         | Stripe                             |
| **Maps**             | Mapbox GL JS                       |
| **Email**            | Nodemailer                         |
| **Image Processing** | Multer, Sharp                      |
| **Security**         | Helmet, HPP, CORS, Rate Limiting   |
| **Testing**          | Vitest                             |
| **Linting**          | ESLint with TypeScript             |
| **Views**            | Pug Templates                      |
| **Styling**          | Custom CSS with Glassmorphism      |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Stripe account (for payments)
- Mapbox account (for maps)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yanixooo/Tourify.git
   cd Tourify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example config.env
   ```

   Edit `config.env` with your credentials:

   ```env
   NODE_ENV=development
   PORT=3000

   DATABASE=mongodb+srv://user:<PASSWORD>@cluster.mongodb.net/tourify
   DATABASE_PASSWORD=your_password

   JWT_SECRET=your-ultra-secure-secret-key
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90

   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=587
   EMAIL_USERNAME=your_mailtrap_username
   EMAIL_PASSWORD=your_mailtrap_password
   EMAIL_FROM=noreply@tourify.com

   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

4. **Import sample data**

   ```bash
   cd dev-data/data
   node import-dev-data.js --import
   ```

5. **Start the server**

   ```bash
   npm run dev    # Development
   npm start      # Production
   ```

   Visit `http://localhost:3000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| POST   | `/api/v1/users/signup`               | Register new user      |
| POST   | `/api/v1/users/login`                | Login user             |
| GET    | `/api/v1/users/logout`               | Logout user            |
| POST   | `/api/v1/users/forgotPassword`       | Request password reset |
| PATCH  | `/api/v1/users/resetPassword/:token` | Reset password         |

### Tours

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/tours`             | Get all tours          |
| GET    | `/api/v1/tours/:id`         | Get single tour        |
| POST   | `/api/v1/tours`             | Create tour (admin)    |
| PATCH  | `/api/v1/tours/:id`         | Update tour (admin)    |
| DELETE | `/api/v1/tours/:id`         | Delete tour (admin)    |
| GET    | `/api/v1/tours/top-5-cheap` | Top 5 affordable tours |
| GET    | `/api/v1/tours/tour-stats`  | Tour statistics        |

### Bookings

| Method | Endpoint                                    | Description         |
| ------ | ------------------------------------------- | ------------------- |
| GET    | `/api/v1/bookings/checkout-session/:tourId` | Get Stripe checkout |
| GET    | `/api/v1/bookings/my-bookings`              | Get user's bookings |

### Users

| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| GET    | `/api/v1/users/me`               | Get current user    |
| PATCH  | `/api/v1/users/updateMe`         | Update current user |
| PATCH  | `/api/v1/users/updateMyPassword` | Update password     |
| DELETE | `/api/v1/users/deleteMe`         | Deactivate account  |

### Reviews

| Method | Endpoint                        | Description     |
| ------ | ------------------------------- | --------------- |
| GET    | `/api/v1/reviews`               | Get all reviews |
| POST   | `/api/v1/tours/:tourId/reviews` | Create review   |

## 🌐 Deployment

### Deploy to Render

1. Create a [Render](https://render.com) account
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in the dashboard
6. Deploy!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Deploy to Railway

1. Create a [Railway](https://railway.app) account
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add environment variables
5. Deploy!

### Deploy to Heroku

```bash
heroku create tourify-app
heroku config:set NODE_ENV=production
heroku config:set DATABASE=your_mongodb_uri
# ... set other env vars
git push heroku main
```

### Environment Variables for Production

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `NODE_ENV`              | Set to `production`                 |
| `DATABASE`              | MongoDB connection string           |
| `DATABASE_PASSWORD`     | MongoDB password                    |
| `JWT_SECRET`            | Secure random string (min 32 chars) |
| `JWT_EXPIRES_IN`        | Token expiration (e.g., `90d`)      |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiration in days           |
| `EMAIL_HOST`            | SMTP host                           |
| `EMAIL_PORT`            | SMTP port                           |
| `EMAIL_USERNAME`        | SMTP username                       |
| `EMAIL_PASSWORD`        | SMTP password                       |
| `EMAIL_FROM`            | Sender email address                |
| `STRIPE_SECRET_KEY`     | Stripe secret key                   |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret               |

## 🛠️ Development Scripts

```bash
npm run dev          # Development with hot reload
npm start            # Production server
npm run start:prod   # Production with NODE_ENV=production
npm run build        # Compile TypeScript
npm run typecheck    # Type check without emit
npm run test         # Run tests (watch mode)
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run lint         # Check for linting errors
npm run lint:fix     # Fix linting errors
npm run format       # Format code with Prettier
```

## 📊 Data Management

```bash
# Import sample data
cd dev-data/data
node import-dev-data.js --import

# Delete all data
node import-dev-data.js --delete
```

## 🔐 Security Features

- **Helmet** - Secure HTTP headers
- **Rate Limiting** - 100 requests/hour per IP
- **Data Sanitization** - Against NoSQL injection
- **HPP** - HTTP Parameter Pollution prevention
- **CORS** - Cross-Origin Resource Sharing
- **XSS Protection** - Content Security Policy
- **Secure Cookies** - HTTP-only, Secure flags

## 📁 Project Structure

```
tourify/
├── 📁 controllers/       # Request handlers
├── 📁 models/            # Mongoose schemas
├── 📁 routes/            # API routes
├── 📁 views/             # Pug templates
├── 📁 public/            # Static assets
│   ├── css/
│   ├── img/
│   └── js/
├── 📁 utils/             # Helper functions
├── 📁 dev-data/          # Sample data
├── 📄 app.js             # Express configuration
├── 📄 server.js          # Entry point
├── 📄 render.yaml        # Render deployment config
├── 📄 Procfile           # Heroku deployment
└── 📄 package.json       # Dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Lounes Zengal**

- GitHub: [@yanixooo](https://github.com/yanixooo)

---

⭐ **Star this repo if you found it helpful!**
