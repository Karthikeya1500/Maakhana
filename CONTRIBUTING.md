# Contributing to Maakhana

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- Cloudinary account
- Firebase project (for Google Auth)

### Setup
1. Clone the repo
2. Copy `backend/.env.example` to `backend/.env` and fill in values
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Seed the database:
   ```bash
   cd backend && node seed.js
   ```
5. Start development servers:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd frontend && npm run dev
   ```

## Code Style
- Use ES6 modules (import/export)
- Functional components with hooks in React
- Async/await for all async operations
- Meaningful variable and function names

## Commit Messages
- Use lowercase, present tense
- Keep messages short and descriptive
- Examples: "add cart page", "fix auth bug", "update seed data"
