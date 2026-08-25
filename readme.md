# WealthFlow — Smart Personal Finance & Expense Tracker

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**WealthFlow** is a modern full-stack MERN web application built to help users manage their personal finances. It provides live tracking of total net worth, cash flow analysis, category-based budgeting, active savings goals, and recurring bill notifications—all backed by secure JWT authentication and persistent MongoDB storage.

---

## Key Features

* **Secure Authentication**: User sign-up and log-in with hashed passwords (`bcryptjs`) and stateless JSON Web Tokens (`JWT`).
* **Financial Overview Dashboard**: Real-time aggregation of Net Worth, Monthly Income, Monthly Expenses, Lifetime Savings, and Savings Rate percentage.
* **Interactive Data Visualization**:
  * Monthly Cash Flow Comparison Bar Chart powered by `recharts`.
  * Category-wise Expense Breakdown Pie Chart.
* **Transaction Logging**: Record `INCOME`, `EXPENSE`, and `TRANSFER` operations with instant categorization, real-time search, and category filtering.
* **Savings & Wealth Goals**: Interactive target tracking with deposit and withdrawal capabilities that update overall balances dynamically.
* **Smart Budget Controls**: Category spending limits with visual indicators and alert thresholds when spending exceeds targets.
* **Subscription & Bill Tracker**: Log upcoming subscriptions and toggle payment status with auto-logging of settled expenses.

---

## Tech Stack

### Frontend
* **Core**: React.js (Vite)
* **Styling & UI**: Custom CSS3 Layouts, `lucide-react` icons
* **Data Visualization**: `recharts`

### Backend
* **Runtime & Framework**: Node.js, Express.js (MVC Pattern)
* **Security & Auth**: `jsonwebtoken`, `bcryptjs`, `cors`
* **Configuration**: `dotenv`

### Database
* **Database Engine**: MongoDB Atlas (Cloud)
* **Object Data Modeling**: Mongoose ORM

---

##  Project Structure

```text
expense-tracker-dashboard/
├── Backend/
│   ├── config/             # MongoDB database connection logic
│   ├── controllers/        # Express route handler business logic
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── subscriptionController.js
│   │   └── transactionController.js
│   ├── middlewares/        # JWT Authentication protection middleware
│   ├── models/             # Mongoose Schemas (User, Transaction, Goal, Budget, Subscription)
│   ├── routes/             # API Endpoint Routing
│   ├── .env                # Local environment secrets (Git ignored)
│   └── server.js           # Express application entry point
└── Frontend/
    ├── src/
    │   ├── App.jsx         # Main Dashboard React component
    │   └── main.jsx        # React DOM render entry
    ├── package.json
    └── vite.config.js