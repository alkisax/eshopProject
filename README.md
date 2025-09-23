# 🛒 E-Shop Prototype (Portfolio Project)

A full-stack e-commerce prototype built as a **portfolio project** and a **future base for client work**.  
This application demonstrates **modern web dev best practices**, **secure authentication**, **third-party integrations**, and **AI-powered search**.

---

## ✨ Features

### 🔐 Authentication
- Custom login with JWT + bcrypt
- Google OAuth login
- GitHub OAuth login
- Appwrite login integration
- Role-based access control (`guest`, `user`, `admin`)

### 🏠 Front Page
- Carousel with last items & announcements  
- Rich text, images, and embeds (via Editor.js)  
- Legal footer with links

### 🛍 Store
- Browse commodities by categories
- Text search
- Item detail page:
  - Multiple images
  - Ratings & comments (with moderation)
  - Related/similar items (semantic search)

### 🛒 Cart & Checkout
- Add to cart with live counter
- Shipping info form with validation
- Stripe checkout:
  - Credit/debit cards
  - Google Pay support

### ⚙️ Admin Panel
- CRUD on users (with role management)
- Auto-send email when orders are processed
- Category CRUD
- News/announcements CRUD
- Upload images & files (local + Appwrite storage)
- Commodity vectorization for semantic search
- Analytics panel with Looker Studio iframe
- Google Maps iframe

### 📊 Analytics
- GDPR-compliant Google Analytics integration:
  - Page views
  - Item views
  - List views
  - Add-to-cart events
- Admin dashboard shows Looker Studio analytics iframe

### 🤖 AI & Moderation
- ChatGPT wrapper for **profanity moderation** on comments
- **Semantic search** using OpenAI embeddings + cosine similarity

---

## 🔐 Security Measures
- **Helmet** with strict CSP (customized for Stripe, GA, Appwrite)
- **CORS allow-list** (only trusted origins)
- **JWT authentication** with expiration & refresh flow
- **HttpOnly cookie migration planned** (currently tokens in localStorage)
- **Zod validation** for all input DTOs
- **bcrypt** password hashing (never plain stored)
- **Rate limiting** (global + login brute force prevention)
- **Winston logger** 
- **Size restrictions** on file uploads
- **DOMPurify** for sanitizing Editor.js content (XSS protection)
- **Role-based protected routes** (frontend + backend middleware)
- **CSRF-safe Stripe integration** (price IDs only from Stripe dashboard)

---

## 🛠 Tech Stack

### Backend
- Node.js + TypeScript
- Express.js REST API
- MongoDB + Mongoose
- Swagger (OpenAPI docs)
- Zod validation
- Winston logger
- Helmet, CORS, express-rate-limit
- Multer for uploads
- Nodemailer
- Stripe payments
- Appwrite storage & auth

### Frontend
- React 19 + TypeScript
- React Router DOM
- React Context API (auth, cart, consent, moderation)
- Material-UI (MUI v7)
- Editor.js (with plugins: header, list, quote, image, embed, attaches, checklist)
- Axios
- DOMPurify
- React-slick carousel
- Google Analytics (GA4)
- Stripe.js

### DevOps & Testing
- Jest (backend unit/integration tests)
- Cypress (frontend E2E tests)
- GitHub Actions (CI/CD pipeline: lint, test, build, deploy)
- ESLint + TypeScript ESLint
- Render deployment (backend & frontend)

---

## 🚀 Deployment
This project is deployed on **Render**:  
🔗 [Live Demo](https://eshopproject-ggmn.onrender.com)  

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB (local or Atlas)
- Stripe account (test mode)
- Appwrite instance (or cloud)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # configure Mongo URI, JWT secret, Stripe keys, etc.
npm run dev            # start in dev mode
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # configure API_URL, GA_MEASUREMENT_ID, Appwrite config
npm run dev            # start Vite dev server
```

### Run Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend E2E tests
cd frontend
npx cypress open
```

---

## 📦 Packages
See `package.json` for full dependencies.

---

📌 *This project demonstrates the ability to build a modern, secure, and extensible e-commerce system from scratch — full-stack, with third-party integrations, testing, and CI/CD.*
