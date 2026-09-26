# NetAlgoVis

A full-stack network algorithm visualizer for learning, comparing, and replaying graph and routing behavior in real time.

The application combines a React frontend with an Express backend to let users create custom topologies, run graph and networking algorithms, compare results, and share saved runs.

---

## Current Status

This project is actively implemented as a working application with:

- user authentication and registration flow
- OTP-based email verification
- JWT access/refresh token support
- Google OAuth login
- protected dashboard and workspace pages
- topology creation, editing, deletion, and public/private sharing
- algorithm execution and replay history
- side-by-side algorithm comparison
- run sharing via public replay links
- production-ready Express static serving for the built frontend

---

## Features

### Authentication and user management

- Email/password sign up and login
- OTP verification before creating a user account
- JWT-based session management with secure cookies
- Google Sign-In flow through Passport.js
- Current user and refresh-token handling

### Topology workspace

- Create, edit, and delete network topologies
- Weighted directed and undirected edges
- Save topology metadata and node/edge layouts
- Mark topologies as public or private
- Browse public topologies from the Explore page

### Algorithm execution and replay

- BFS
- DFS
- Dijkstra
- Bellman-Ford
- Prim's MST
- Kruskal's MST
- Distance Vector Routing
- Link State Routing

Algorithms run against user-defined topologies and produce execution data that can be replayed visually.

### Comparison and sharing

- Run two algorithms side by side in Race mode
- Compare convergence step counts and behavior
- Save run history per user
- Replay a saved run
- Generate shareable links for runs and topologies

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, Vite, React Router, Zustand, React Flow |
| UI | Tailwind CSS, Lucide React |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Cache / sessions | Redis |
| Auth | JWT, Passport, Google OAuth, bcrypt |
| Email | Nodemailer + Gmail SMTP |
| Build/Dev | Vite, Nodemon, ESLint |

---

## Repository Structure

```text
NetAlgoVis/
├── client/                    # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/                    # Express backend
│   ├── src/
│   ├── app.js
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── Readme.md
└── package.json (if present in root)
```

---

## Supported Routes

### Frontend routes

- `/` — landing page
- `/users/login` — login
- `/users/register` — register
- `/dashboard` — user dashboard
- `/topology/new` — create topology
- `/topology/:id` — edit topology
- `/run` and `/run/:id` — run or replay algorithm
- `/race` — compare algorithms
- `/history` — saved runs
- `/explore` — public topologies
- `/share/:shareToken` — shared resource replay
- `/auth/google/callback` — Google auth callback

### Backend API

```text
/api/v1/users
  - POST /register
  - POST /login
  - POST /logout
  - POST /refresh-token
  - GET /current-user
  - POST /send-otp
  - POST /verify-otp

/api/v1/topologies
  - POST /
  - GET /
  - GET /public
  - GET /:id
  - PATCH /:id
  - DELETE /:id

/api/v1/algorithms
  - algorithm execution endpoints

/api/v1/run
  - run execution and retrieval endpoints

/api/v1/share
  - share and revoke resource links

/auth
  - GET /google
  - GET /google/callback/server
```

---

## Redis and OTP Verification

This project uses Redis to store temporary OTP data and verification state during registration.

### Redis requirement

The server initializes a shared Redis client in [server/src/db/redis.js](server/src/db/redis.js) using:

```env
REDIS_URL=redis://localhost:6379
```

Redis is required for:

- generating a 6-digit OTP
- storing the OTP with a 5-minute TTL
- enforcing resend cooldowns
- limiting repeated wrong attempts
- storing a short-lived email verification flag after successful OTP validation

If Redis is not running, OTP-based registration will fail because the app depends on the Redis client to validate email sign-up.

### OTP flow

The OTP workflow is implemented in [server/src/utils/otp.js](server/src/utils/otp.js) and used by the auth controller:

1. User requests an OTP via `/api/v1/users/send-otp`
2. A 6-digit code is generated and stored in Redis
3. The code is sent to the user email through SMTP
4. User submits the OTP via `/api/v1/users/verify-otp`
5. Server checks the Redis-stored code
6. On success, a temporary verified flag is set for that email
7. Registration is allowed only if that flag is present

### OTP behavior

- OTP lifetime: 5 minutes
- resend cooldown: 45 seconds
- max wrong attempts: 5
- lockout duration after too many failures: 10 minutes
- verified-email flag lifetime before registration: 15 minutes

### Environment Setup

Create a `.env` file inside the `server` folder with variables like the following:

```env
PORT=8000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URI=http://localhost:5173
NODE_ENV=development

MONGODB_URI=mongodb+srv://...your-connection-string...
REDIS_URL=redis://localhost:6379

ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URI=http://localhost:8000/auth/google/callback/server

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="NetAlgoVis <your-email@gmail.com>"
VITE_GOOGLE_AUTH=/auth/google
VITE_API_URL=/api/v1
```

> Make sure the Google OAuth callback URL matches the backend route configured in the server.

---

## Local Development

### 1) Install frontend dependencies

```bash
cd client
npm install
```

### 2) Install backend dependencies

```bash
cd server
npm install
```

### 3) Start the backend

```bash
cd server
npm run dev
```

### 4) Start the frontend

```bash
cd client
npm run dev
```

The frontend typically runs on port `5173` and the backend on `8000` unless changed in the environment.

---

## Production Build

The backend includes a production static fallback that serves the built frontend from `client/dist` when available.

```bash
cd server
npm run build
```

This command runs the frontend build and prepares the app for deployment.

---

## Notes

- The project is designed around a clear separation between algorithm logic and UI playback.
- The backend handles persistence, auth, routes, and execution orchestration.
- The frontend focuses on interactive topology editing, playback, comparison, and visualization.
- Shared runs and public topologies are intended for read-only replay and exploration.

---

## Project Goals

NetAlgoVis is intended to help users:

- understand how graph algorithms evolve step by step
- compare routing and shortest-path strategies visually
- analyze network behavior under topology changes
- share results with classmates or collaborators
- learn network concepts through visual interaction

---

