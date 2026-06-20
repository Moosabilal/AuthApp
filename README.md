# AuthApp — MERN TypeScript Authentication System

A production-grade, full-stack authentication system built with the **MERN stack and TypeScript**, following **Clean Architecture**, **SOLID principles**, and the **Repository Pattern**. Features an immersive **3D UI** powered by React Three Fiber and Framer Motion.

![CI](https://github.com/Moosabilal/AuthApp/actions/workflows/ci.yml/badge.svg)

---

## ✨ Features

- **Secure Authentication** — JWT access tokens (15 min) + HTTP-only refresh cookies (7 days)
- **Token Rotation** — Automatic refresh token rotation on every use
- **Session Revocation** — Logout invalidates the refresh token server-side
- **Rate Limiting** — Brute-force protection on all auth endpoints
- **Clean Architecture** — Repository Pattern, Dependency Inversion, single-responsibility layers
- **Zod Validation** — All request bodies validated before reaching the service layer
- **Immersive 3D UI** — Reactive particle constellation background with floating frosted-glass forms
- **Axios Interceptors** — Automatic silent token refresh on 401 responses

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB (Atlas) via Mongoose |
| Auth | bcrypt, jsonwebtoken |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router DOM v6 |
| HTTP | Axios (with interceptors) |
| 3D | React Three Fiber, @react-three/drei, Three.js |
| Animation | Framer Motion |

---

## 📁 Project Structure

```
AuthApp/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── backend/
│   ├── src/
│   │   ├── config/             # DB, env, cors, helmet
│   │   ├── interfaces/         # TypeScript interfaces & types
│   │   ├── models/             # Mongoose schemas
│   │   ├── repositories/       # Data Access Layer
│   │   ├── services/           # Business Logic Layer
│   │   ├── controllers/        # Presentation Layer
│   │   ├── routes/             # Express route definitions
│   │   ├── middlewares/        # Guards, error handler, validation
│   │   └── utils/              # Custom errors, JWT helpers, catchAsync
│   └── server.ts               # App entry point + graceful shutdown
├── frontend/
│   └── src/
│       ├── api/                # Axios instance & interceptors
│       ├── components/         # Reusable UI + 3D scene components
│       ├── context/            # Auth context (React Context + useReducer)
│       ├── pages/              # Login, Signup, Dashboard
│       └── routes/             # Protected route wrapper
├── .gitignore
├── package.json                # Root monorepo scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Moosabilal/AuthApp.git
cd AuthApp
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your values
```

### 3. Install all dependencies
```bash
npm run install:all
```

### 4. Start development servers
```bash
# Start both backend and frontend concurrently
npm run dev

# Or individually:
npm run dev:backend
npm run dev:frontend
```

The backend runs on `http://localhost:5000` and frontend on `http://localhost:5173`.

---

## 🔐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns access token + sets refresh cookie |
| `POST` | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| `POST` | `/api/auth/logout` | Cookie | Revoke session and clear cookie |
| `GET` | `/api/auth/me` | Bearer | Get authenticated user profile |

---

## 🔄 CI/CD

GitHub Actions runs on every push to `main` and on all Pull Requests:
- **Type-check:** `tsc --noEmit` on backend and frontend
- **Build:** Production build for both packages
- Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 📄 License

MIT
