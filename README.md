# 🌟 Store Rating Management System (Bangalore Edition)

[![Node.js Version](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/Express-v5.3.x-lightgrey.svg)](https://expressjs.com/)
[![React Version](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev/)
[![MySQL Version](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A production-grade, full-stack **Store Rating Management System** architected with clean separation of concerns, enterprise-grade security hardening, and real-time review aggregations. Built specifically with localized Indian entities and Bangalore (Bengaluru) localities.

---

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Database Schema & Constraints](#-database-schema--constraints)
- [Security & Production Hardening](#-security--production-hardening)
- [Quick Start Guide (Local Development)](#-quick-start-guide-local-development)
- [Pre-Seeded Bangalore Test Accounts](#-pre-seeded-bangalore-test-accounts)
- [Production Deployment Strategies](#-production-deployment-strategies)
  - [Option A: Docker & Docker Compose (Recommended)](#option-a-docker--docker-compose-recommended)
  - [Option B: Single-Port Cloud Deployment (Render / Railway)](#option-b-single-port-cloud-deployment-render--railway)
  - [Option C: Production Ubuntu VPS (Nginx + PM2)](#option-c-production-ubuntu-vps-nginx--pm2)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---


## 📂 Project Directory Structure

The project follows a clean, professional separation of concerns organized into **Frontend**, **Backend**, and **Database**:

```text
Store Rating Management System/
│
├── 🎨 frontend/                     # React 19 SPA (Client Application)
│   ├── public/                      # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── assets/                  # Images and logos
│   │   ├── components/              # Reusable UI (Navbar, Sidebar, ThemeToggle, DataTable, Modals, RatingStars)
│   │   ├── context/                 # Context API (AuthContext, ThemeContext)
│   │   ├── layouts/                 # MainLayout shell
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboard, ManageUsers, ManageStores
│   │   │   ├── auth/                # Login (Glassmorphic), Register, ChangePassword, Unauthorized
│   │   │   ├── owner/               # OwnerDashboard, OwnerRatings
│   │   │   └── user/                # UserDashboard, StoreListing
│   │   ├── services/                # Axios API instance with auth interceptors
│   │   ├── App.jsx                  # React Router DOM routes & guards
│   │   ├── index.css                # Global CSS3 design system (Light/Dark mode & Glassmorphic styles)
│   │   └── main.jsx                 # Application entry point
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.js               # Vite build configuration
│
├── ⚙️ backend/                      # Node.js & Express 5.3 RESTful API Server
│   ├── config/                      # Database connection pool & init scripts
│   ├── controllers/                 # Request handlers (auth, admin, store, rating, owner)
│   ├── middleware/                  # JWT authentication, RBAC authorization & error handling
│   ├── models/                      # MySQL data access layer (parameterized SQL queries)
│   ├── routes/                      # Express route definitions
│   ├── validators/                  # express-validator rules for input sanitization
│   ├── app.js                       # Express application configuration & security middleware
│   ├── server.js                    # Server startup with graceful shutdown handling
│   ├── package.json                 # Backend dependencies & scripts
│   ├── test_apis.js                 # 13-test automated unit test suite
│   └── test_integration.js          # 17-test end-to-end integration lifecycle test suite
│
├── 🗄️ database/                     # Dedicated Database Definition & Documentation
│   ├── schema.sql                   # MySQL production schema (tables, constraints, indexes)
│   ├── seed.sql                     # Standalone SQL seed script with Bangalore demo dataset
│   ├── initDb.js                    # Automated database initialization runner
│   └── README.md                    # Database ERD, table documentation & Workbench guide
│
└── README.md                        # Master project documentation
```




