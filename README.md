# Maakhana Food — HomeCook Connect Platform

**Maakhana Food** is a full-stack application that connects customers with home chefs state-wise across India. Discover authentic, homemade food from various states (Punjab, Tamil Nadu, West Bengal, etc.), prepared by verified local cooks!

---

## Table of Contents
- [Overview](#overview)
- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Architecture & Diagrams](#architecture--diagrams)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Future Enhancements](#future-enhancements)

---

## Overview
The platform provides a decentralized marketplace for home chefs to showcase their native cuisines. Customers can browse food specific to Indian states, manage their cart, and place orders directly to the home chefs.

It provides customized dashboards for **Customers**, **HomeChefs**, and **Admins**.

---

## Problem & Solution
**The Problem**: Lack of visibility for home chefs, fragmented regional food discovery, and a missing trust layer for authentic home-cooked meals.
**Our Solution**: A **state-centric food marketplace** with admin verification, layered backend architecture with robust object-oriented patterns, and secure JWT-based RBAC.

---

## Key Features
### State-Based Discovery
- Food is heavily categorized by individual Indian states.
- Rich discovery interfaces, state pages, and advanced search filters.

### HomeChef Empowered
- Chef registration with dedicated admin-approved native state specialties.
- Dashboard for food operations (CRUD) and live order tracking.

### Customer Experience
- Browse authenticate state menus, scalable cart system, and order lifecycle management.
- Post-delivery rating and review mechanics.

### Security & Admin
- Fully stateless JWT auth with Role-Based Access Control (RBAC).
- Admin panel for comprehensive monitoring, approvals, and metrics.

---

## User Roles
| Role          | Capabilities                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Customer**  | Browse by state, add to cart, order tracking, review chefs.                  |
| **HomeChef**  | Register (requires approval), list food items, oversee incoming orders.      |
| **Admin**     | Top-level oversight, approve/reject chefs, oversee users, and orders.        |

---

## Tech Stack
- **Frontend**: React.js with TypeScript, Vite, TailwindCSS / Material UI, Axios, React Router Dom
- **Backend**: Node.js with TypeScript, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JSON Web Tokens (JWT)
- **Architecture**: Strict Object-Oriented Programming (OOP) & Layered Architecture (Controller > Service > Repository)

---

## Architecture & Diagrams
This project heavily emphasizes clean structure and OOP principles. Please refer to our detailed design documents:
- [System Idea & Details](./idea.md)
- [Class Diagram](./classDiagram.md)
- [ER Diagram](./ErDiagram.md)
- [Use Case Diagram](./useCaseDiagram.md)
- [Sequence Diagram](./sequenceDiagram.md)

---

## Project Structure
```text
Maakhana/
├── backend/               # Node.js Express server
│   ├── config/            # Database & environment configurations
│   ├── controllers/       # Route request OOP handlers
│   ├── middlewares/       # Auth and validation middlewares
│   ├── models/            # Mongoose schemas
│   ├── repositories/      # OOP Data access layer
│   ├── routes/            # API routing definitions
│   ├── services/          # OOP Business logic layer
│   ├── utils/             # Helper functions and utilities
│   └── index.ts           # Server entry point
├── frontend/              # React Vite application
│   ├── public/            # Static assets
│   ├── src/               # React components, pages, and logic
│   └── vite.config.ts     # Vite configuration
└── *.md                   # Documentation and Diagrams
```

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas cluster)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Maakhana
```

### 2. Setup Backend Server
```bash
cd backend
npm install
# Set up .env variables (PORT, MONGO_URI, JWT_SECRET, etc.)
npx ts-node index.ts
```

### 3. Setup Frontend Application
```bash
cd ../frontend
npm install
# Set up .env variables if necessary (e.g., VITE_API_BASE_URL)
npm run dev
```

---

## Future Enhancements
- Real Payment Gateway Integration (Razorpay/Stripe)
- Real-time GPS-based delivery tracking
- In-app messaging/chat system
- Mobile application natively on iOS and Android
- AI-based local food recommendations
