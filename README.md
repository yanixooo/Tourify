# 🌟 Tourify

> **A modern tour booking and management API built with ES6 modules and cutting-edge technology**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1.0-blue.svg)](https://expressjs.com)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.18.0-red.svg)](https://mongoosejs.com)
[![ES6 Modules](https://img.shields.io/badge/ES6%20Modules-✅-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

## ✨ Features

🎯 **Modern Architecture**

- Built with ES6 modules for better maintainability
- Express 5.1.0 for enhanced performance
- Mongoose 8.18.0 with modern MongoDB integration

🚀 **Tour Management**

- Create, read, update, and delete tours
- Rich tour data model with ratings, pricing, and dates
- Image management for tour covers and galleries

📊 **Data Operations**

- Bulk data import/export functionality
- Sample tour data included
- Database seeding and cleanup scripts

🛠️ **Developer Experience**

- Modern ESLint configuration with flat config
- Prettier code formatting
- Hot reload with Nodemon
- VS Code optimized with jsconfig.json

## 🏗️ Project Structure

```
tourify/
├── 📁 controllers/          # Request handlers
│   ├── tourController.js    # Tour CRUD operations
│   └── userController.js    # User management
├── 📁 models/              # Database schemas
│   └── tourModel.js        # Tour data model
├── 📁 routes/              # API routes
│   ├── tourRoutes.js       # Tour endpoints
│   └── userRoutes.js       # User endpoints
├── 📁 dev-data/            # Development data
│   └── data/
│       ├── import-dev-data.js  # Data management script
│       └── tours.json          # Sample tour data
├── 📁 public/              # Static assets
│   ├── css/
│   └── img/
├── 📄 app.js               # Express app configuration
├── 📄 server.js            # Server entry point
└── 📄 package.json         # Dependencies & scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git for version control

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

3. **Environment setup** Create a `config.env` file in the root directory:

   ```env
   DATABASE=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/tourify
   DATABASE_PASSWORD=your_database_password
   PORT=3001
   NODE_ENV=development
   ```

4. **Import sample data** (optional)

   ```bash
   cd dev-data/data
   node import-dev-data.js --import
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Tours

- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get a specific tour
- `POST /api/v1/tours` - Create a new tour
- `PATCH /api/v1/tours/:id` - Update a tour
- `DELETE /api/v1/tours/:id` - Delete a tour

### Users

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PATCH /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Example API Response

```json
{
  "status": "success",
  "results": 9,
  "data": {
    "tours": [
      {
        "_id": "5c88fa8cf4afda39709c2955",
        "name": "The Forest Hiker",
        "duration": 5,
        "maxGroupSize": 25,
        "difficulty": "easy",
        "ratingsAverage": 4.7,
        "ratingsQuantity": 37,
        "price": 397,
        "summary": "Breathtaking hike through the Canadian Banff National Park",
        "description": "Ut enim ad minim veniam, quis nostrud exercitation...",
        "imageCover": "tour-1-cover.jpg",
        "images": ["tour-1-1.jpg", "tour-1-2.jpg", "tour-1-3.jpg"],
        "startDates": ["2021-04-25", "2021-07-20", "2021-10-05"]
      }
    ]
  }
}
```

## 🛠️ Development Scripts

```bash
# Development server with hot reload
npm start

# Production server
npm run start:prod

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

## 📊 Data Management

### Import Sample Data

```bash
cd dev-data/data
node import-dev-data.js --import
```

### Delete All Data

```bash
cd dev-data/data
node import-dev-data.js --delete
```

## 🧪 Technology Stack

| Technology      | Version | Purpose                |
| --------------- | ------- | ---------------------- |
| **Node.js**     | 18+     | JavaScript runtime     |
| **Express.js**  | 5.1.0   | Web framework          |
| **MongoDB**     | Latest  | NoSQL database         |
| **Mongoose**    | 8.18.0  | ODM for MongoDB        |
| **ES6 Modules** | Native  | Modern module system   |
| **ESLint**      | 8.57.1  | Code linting           |
| **Prettier**    | 3.6.2   | Code formatting        |
| **Nodemon**     | Latest  | Development hot reload |
| **Morgan**      | 1.10.1  | HTTP request logger    |
| **Dotenv**      | 17.2.1  | Environment variables  |

## 🏛️ Architecture Highlights

### ES6 Modules

This project uses modern ES6 import/export syntax:

```javascript
// Instead of: const express = require('express')
import express from 'express';

// Instead of: module.exports = router
export default router;
```

### Modern Mongoose

Clean database connections without deprecated options:

```javascript
// Modern approach
mongoose.connect(DB);

// vs Old approach with deprecated options
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  // ... other deprecated options
});
```

### Express 5.0

Taking advantage of the latest Express.js features and performance improvements.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

This project follows:

- **ESLint** configuration for consistent code quality
- **Prettier** for automated code formatting
- **ES6 modules** for modern JavaScript
- **Async/await** for asynchronous operations

## 📱 VS Code Setup

The project includes `jsconfig.json` for enhanced VS Code support:

- Better IntelliSense
- Auto-imports
- Path resolution
- Error detection

## 🔒 Environment Variables

Required environment variables:

- `DATABASE` - MongoDB connection string
- `DATABASE_PASSWORD` - MongoDB password
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 🗂️ Data Model

### Tour Schema

```javascript
{
  name: String (required, unique),
  duration: Number (required),
  maxGroupSize: Number (required),
  difficulty: String (required),
  ratingsAverage: Number (default: 4.5),
  ratingsQuantity: Number (default: 0),
  price: Number (required),
  priceDiscount: Number,
  summary: String (required),
  description: String,
  imageCover: String (required),
  images: [String],
  createdAt: Date (default: now),
  startDates: [Date]
}
```

## 📜 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Lounes Zengal**

- GitHub: [@yanixooo](https://github.com/yanixooo)

## 🙏 Acknowledgments

- Built with modern JavaScript ES6 modules
- Powered by Express.js and MongoDB
- Inspired by modern web development best practices

---

⭐ **Star this repo if you found it helpful!**

_Happy coding!_ 🚀
