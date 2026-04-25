# Courseware — Course Management System

A full-stack online learning platform where students can browse and enroll in courses, instructors can create and manage content, and progress is tracked end-to-end.

---

## Team Members

| Name | Student ID | GitHub | Email |
|---|---|---|---|
| Mohamad Karim Mehaydli | 202400046 | Klol120 | mohamadkarim.mehaydli@lau.edu |
| Jad Al Hassan | 202400472 | jadalhassan | jad.alhassan@lau.edu |
| Ahmad Hajj Khalil | 202208592 | ahmadkhalil | ahmad.hajjkhalil@lau.edu |
| Sami Bou Khaled | 202303124 | simenzzz/sami1268 | sami.boukhaled01@lau.edu |

---

## Assigned Topic

**Course Management System** for online learning.

### Primary Data Entities

1. **User** — student/instructor profile, authentication state, saved/enrolled/completed courses
2. **Course** — title, category, level, instructor, rating, modules, lessons
3. **Module** — grouped set of lessons within a course
4. **Lesson** — individual learning unit with duration and preview/video URL
5. **Learning Progress** — lesson completion map and per-course completion percentage
6. **Certificate** — completion-based records shown in the certificates view
7. **Support Ticket** — support request payload submitted from the support page

---

## Deployed Application

| Service | URL |
|---|---|
| Frontend (GitHub Pages) | https://khaliya-3a-allah.github.io/course-management-system/ |
| Backend API (Render) | https://course-management-system-1hwz.onrender.com/api/v1 |
| API Health Check | https://course-management-system-1hwz.onrender.com/api/v1/health |
| GitHub Repository | https://github.com/Khaliya-3a-Allah/course-management-system |

> **Note:** The backend runs on Render's free tier and may take ~30 seconds to wake up after a period of inactivity. A cold-start banner is shown in the UI during this time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcrypt, TOTP (2FA via speakeasy) |
| Security | Helmet, express-rate-limit, CORS |
| Deployment | GitHub Pages (frontend), Render (backend), MongoDB Atlas (database) |

---

## Local Development Setup

### Prerequisites

- Node.js 20 LTS
- npm 9+
- A MongoDB Atlas cluster (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/Khaliya-3a-Allah/course-management-system.git
cd course-management-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

**Backend** — copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Local value |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/courseware` |
| `JWT_SECRET` | Long random secret (keep private) | any long random string |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `API_PREFIX` | API route prefix | `/api/v1` |
| `TOTP_ISSUER` | Label shown in authenticator apps | `Coursewave` |
| `ENABLE_REQUEST_LOGS` | Toggle Morgan request logging | `true` |

**Frontend** — copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Set `VITE_API_URL=http://localhost:5000/api/v1` for local development.

### 4. Start both servers

```bash
# Terminal 1 — Express backend
npm run dev:server

# Terminal 2 — Vite frontend
npm run dev:client
```

Open `http://localhost:5173` in your browser.

### Available Scripts

```bash
npm run build        # Production frontend build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint checks
npm run test:e2e     # Run Playwright end-to-end tests
npm run deploy       # Build and push frontend to GitHub Pages
```

---

## Deployment Guide

### Backend — Render

1. Push your code to GitHub (ensure `render.yaml` is committed).
2. On [render.com](https://render.com), create a **New Web Service** and connect your GitHub repo. Render auto-detects `render.yaml`.
3. In the Render dashboard **Environment** tab, set all required secrets:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a long random string (e.g. output of `openssl rand -hex 32`)
4. All other variables (`NODE_ENV`, `CLIENT_ORIGIN`, etc.) are set via `render.yaml` automatically.
5. Deploy. First deploy takes ~3–5 minutes. Test with the `/api/v1/health` endpoint.

### Frontend — GitHub Pages

The production API URL is baked in via `.env.production`. Run:

```bash
npm run deploy
```

This builds the app pointing at the Render backend and pushes `dist/` to the `gh-pages` branch.

---

## API Documentation

**Base URL:** `https://course-management-system-1hwz.onrender.com/api/v1`

All protected endpoints require the header:
```
Authorization: Bearer <token>
```

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
```
Errors return:
```json
{ "success": false, "message": "Description of the error" }
```

---

### Health

#### `GET /health`
No auth required.

**Response `200`**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-04-23T10:00:00.000Z"
}
```

---

### Auth

#### `POST /auth/register`
No auth required. Rate-limited per IP.

**Request body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "student"
}
```
`role` is optional — accepts `"student"` or `"instructor"`, defaults to `"student"`.

**Response `201`**
```json
{
  "success": true,
  "message": "Registered successfully",
  "token": "<jwt>",
  "data": {
    "id": "664a...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "twoFactorEnabled": false,
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

#### `POST /auth/login`
No auth required. Rate-limited per email.

**Request body**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response `200` (2FA disabled)**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "data": { "id": "664a...", "name": "Jane Doe", "role": "student", "..." }
}
```

**Response `200` (2FA enabled)**
```json
{
  "success": true,
  "twoFactorRequired": true,
  "message": "Two-factor verification required.",
  "challengeToken": "<short-lived jwt>"
}
```
Exchange `challengeToken` at `POST /auth/2fa/challenge`.

---

#### `GET /auth/me`
**Auth required.**

**Response `200`**
```json
{
  "success": true,
  "data": { "id": "664a...", "name": "Jane Doe", "email": "jane@example.com", "role": "student" }
}
```

---

#### `POST /auth/logout`
**Auth required.**

**Response `200`**
```json
{ "success": true, "message": "Logout successful" }
```

---

#### `POST /auth/2fa/setup`
**Auth required.** Generates a TOTP secret and returns a QR code URI to scan with an authenticator app.

**Response `200`**
```json
{
  "success": true,
  "data": { "otpauthUrl": "otpauth://totp/Coursewave:jane@example.com?secret=BASE32&issuer=Coursewave" }
}
```

---

#### `POST /auth/2fa/enable`
**Auth required.** Confirms 2FA enrollment with a TOTP code from the authenticator app.

**Request body**
```json
{ "code": "123456" }
```

**Response `200`**
```json
{ "success": true, "message": "Two-factor authentication enabled." }
```

---

#### `POST /auth/2fa/disable`
**Auth required.** Disables 2FA after verifying password and TOTP code.

**Request body**
```json
{ "password": "securepassword123", "code": "123456" }
```

**Response `200`**
```json
{ "success": true, "message": "Two-factor authentication disabled." }
```

---

#### `POST /auth/2fa/verify`
No auth required. Second step of 2FA login — exchanges a `challengeToken` + TOTP code for a full session token.

**Request body**
```json
{ "code": "123456" }
```
Send `challengeToken` as the `Authorization: Bearer <challengeToken>` header.

**Response `200`**
```json
{
  "success": true,
  "token": "<full session jwt>",
  "data": { "id": "664a...", "name": "Jane Doe" }
}
```

---

### Courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/courses` | — | List all courses |
| `GET` | `/courses/:id` | — | Get a single course |
| `POST` | `/courses` | Required | Create a course |
| `PUT` | `/courses/:id` | Owner only | Update a course |
| `DELETE` | `/courses/:id` | Owner only | Delete a course |

#### `POST /courses` — Request body
```json
{
  "title": "Intro to React",
  "description": "Learn React from scratch.",
  "instructor": "Jane Doe",
  "price": 49.99,
  "category": "Web Development",
  "level": "Beginner",
  "thumbnail": "https://...",
  "tags": ["react", "javascript"],
  "language": "English",
  "duration": "10h",
  "isPublished": true
}
```

**Response `201`**
```json
{
  "success": true,
  "data": { "id": "665b...", "title": "Intro to React", "instructorId": "664a...", "..." }
}
```

---

### Modules

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/modules` | — | List all modules |
| `GET` | `/modules/:id` | — | Get a single module |
| `POST` | `/modules` | Required | Create a module |
| `PUT` | `/modules/:id` | Owner only | Update a module |
| `DELETE` | `/modules/:id` | Owner only | Delete a module |

#### `POST /modules` — Request body
```json
{
  "title": "Getting Started",
  "courseId": "665b...",
  "order": 1,
  "description": "Introduction module"
}
```

---

### Lessons

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/lessons` | — | List all lessons |
| `GET` | `/lessons/:id` | — | Get a single lesson |
| `POST` | `/lessons` | Required | Create a lesson |
| `PUT` | `/lessons/:id` | Owner only | Update a lesson |
| `DELETE` | `/lessons/:id` | Owner only | Delete a lesson |

#### `POST /lessons` — Request body
```json
{
  "title": "What is React?",
  "moduleId": "666c...",
  "courseId": "665b...",
  "duration": "8m",
  "videoUrl": "https://...",
  "isPreview": true,
  "order": 1
}
```

---

### Enrollments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/enrollments` | Required | List current user's enrollments |
| `GET` | `/enrollments/:id` | Required | Get a single enrollment |
| `POST` | `/enrollments` | Required | Enroll in a course |
| `DELETE` | `/enrollments/:id` | Owner only | Unenroll |

#### `POST /enrollments` — Request body
```json
{
  "courseId": "665b..."
}
```

**Response `201`**
```json
{
  "success": true,
  "data": { "id": "667d...", "userId": "664a...", "courseId": "665b...", "enrolledAt": "2026-04-23T10:00:00.000Z" }
}
```

---

### Progress

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/progress` | Required | Get progress records for current user |
| `GET` | `/progress/:id` | Required | Get a single progress record |
| `POST` | `/progress` | Required | Create/update lesson progress |
| `PUT` | `/progress/:id` | Owner only | Update progress |

#### `POST /progress` — Request body
```json
{
  "courseId": "665b...",
  "lessonId": "668e...",
  "completed": true
}
```

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/reviews` | — | List all reviews |
| `GET` | `/reviews/:id` | — | Get a single review |
| `POST` | `/reviews` | Required | Submit a review |
| `PUT` | `/reviews/:id` | Owner only | Edit a review |
| `DELETE` | `/reviews/:id` | Owner only | Delete a review |

#### `POST /reviews` — Request body
```json
{
  "courseId": "665b...",
  "rating": 5,
  "comment": "Excellent course!"
}
```

---

### Certificates

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/certificates` | Required | List current user's certificates |
| `GET` | `/certificates/:id` | Required | Get a certificate |
| `POST` | `/certificates` | Required | Issue a certificate on course completion |

#### `POST /certificates` — Request body
```json
{
  "courseId": "665b...",
  "courseTitle": "Intro to React",
  "completedAt": "2026-04-23T10:00:00.000Z"
}
```

---

### Support Tickets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/support-tickets` | Required | List user's tickets |
| `POST` | `/support-tickets` | Required | Submit a support ticket |

#### `POST /support-tickets` — Request body
```json
{
  "subject": "Cannot access module",
  "message": "Module 3 shows a blank page after I enrolled.",
  "category": "Technical"
}
```

---

## Feature Showcase

### 1. Home / Courses listing

<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/56a3500c-4f50-4b40-be21-6e826339a36a" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/37524afd-9c46-4ba0-bd50-268d1cd0bb77" />

### 2. Course details and module navigation

<img width="1910" height="912" alt="image" src="https://github.com/user-attachments/assets/ad5847fd-608a-4695-b269-46f2be8befd6" />
<img width="1915" height="908" alt="image" src="https://github.com/user-attachments/assets/9fbf1df8-5d03-4c83-8db5-466b3777a4dc" />
<img width="984" height="478" alt="image" src="https://github.com/user-attachments/assets/51f5d70f-6c90-4798-8182-d8d39f22c54c" />
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/c2f40e52-89b7-4744-8e22-612c77cc5ff2" />
<img width="1353" height="429" alt="Screenshot 2026-03-24 230503" src="https://github.com/user-attachments/assets/fb4f404b-9ead-42b0-a1f1-21fc88518492" />

### 3. Dashboard progress tracking

<img width="1915" height="858" alt="image" src="https://github.com/user-attachments/assets/e61a3fa5-2e27-4077-bda0-cde806af8631" />
<img width="1919" height="660" alt="image" src="https://github.com/user-attachments/assets/f638457a-3d51-4cc2-a819-4da61acbf968" />
<img width="1347" height="723" alt="image" src="https://github.com/user-attachments/assets/cee75e9d-fb6d-413b-97a4-832a3a945c5f" />
<img width="543" height="901" alt="image" src="https://github.com/user-attachments/assets/8d79369d-0c97-4f09-9158-3336ccda34e7" />


### 4. Certificate page

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/a0cfbce7-d1ea-444e-9652-43421478c994" />
<img width="1299" height="913" alt="image" src="https://github.com/user-attachments/assets/2f563368-dc78-4d7a-a8a1-6cde1fb5276e" />

### 5. Instructor course creation / edit flow

<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/191a2a39-1b27-45cd-b3cf-4ee61dde236e" />
<img width="1915" height="910" alt="image" src="https://github.com/user-attachments/assets/3ce69a68-8382-40d0-b712-f39ea59d28af" />
<img width="1320" height="605" alt="image" src="https://github.com/user-attachments/assets/8eeb3fcf-fed5-48d9-b2ec-b0154e79c73d" />


### 6. Support page ticket submission

<img width="1736" height="736" alt="image" src="https://github.com/user-attachments/assets/bd97b97a-4c02-48df-bfd5-7bf2a21cb79f" />

### 7. Login / Sign up / Sign out

<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/cb04fdfc-ae29-42a1-901f-ba6e9a3b3176" />
<img width="1913" height="910" alt="image" src="https://github.com/user-attachments/assets/271fc131-a75a-4955-adf1-acf7c6484fe1" />
<img width="608" height="642" alt="image" src="https://github.com/user-attachments/assets/cc0865ba-8d3b-4f65-94c2-cbb8f942e142" />
<img width="360" height="318" alt="image" src="https://github.com/user-attachments/assets/b0a7ee84-bf17-41ab-8fbf-32faff9c9785" />


---

## Technical Challenges

### 1. Two-Factor Authentication flow across stateless JWT
Implementing 2FA with stateless JWTs required a two-token approach: after a correct password check, the server issues a short-lived *challenge token* (5 min expiry) instead of a full session token. The client then submits that challenge token alongside the TOTP code to receive a real session token. This avoided server-side session state while still preventing a compromised password alone from granting access.

### 2. Render cold starts affecting UX
The free Render tier spins down the server after 15 minutes of inactivity, causing the first request to take ~30 seconds. To avoid a broken-looking UI, a `ColdStartBanner` component detects the initial connection delay and shows a friendly loading message to the user rather than a timeout error.

### 3. CORS between GitHub Pages and Render
GitHub Pages serves the frontend from `https://khaliya-3a-allah.github.io` while the backend runs on a different domain. The Express CORS configuration reads the allowed origin from the `CLIENT_ORIGIN` environment variable, which is set to the exact GitHub Pages origin on Render. An incorrect origin (e.g. including the sub-path `/course-management-system`) would silently block all API calls; the fix was to set the origin to just the scheme+host.

### 4. Vite base path and GitHub Pages routing
React Router uses client-side routing, but GitHub Pages serves a static file and does not handle unknown paths. Setting `base: '/course-management-system/'` in `vite.config.js` aligned the asset paths, and a custom `404.html` redirect technique was used to send all page-not-found requests back to `index.html` so React Router can take over.

### 5. Ownership authorization without a separate permissions table
Rather than a dedicated permissions system, each resource model stores a `createdBy` / `instructorId` field. A reusable `authorizeOwner` middleware reads the relevant field name per resource and compares it to `req.user.id`, returning `403` on mismatch. This kept the codebase simple while still enforcing that users can only mutate their own records.

---

## Security Features

- **JWT authentication** — stateless tokens, 7-day expiry, excluded from all API responses
- **Two-Factor Authentication (TOTP)** — optional 2FA via authenticator apps (Google Authenticator, Authy)
- **Rate limiting** — per-IP on registration, per-email on login to prevent brute force
- **Helmet** — sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** — restricted to the deployed frontend origin in production
- **bcrypt** — passwords hashed with cost factor 12, never stored or returned in plaintext
- **Ownership checks** — server-side enforcement: users can only modify their own resources

---

## Team Contributions

### Phase 1 — Frontend

| Team Member | Contributions |
|---|---|
| Mohamad Karim Mehaydli | Home Page, Courses Page, Certificates Page, Support Page |
| Jad Al Hassan | Module Details Page, Course Details Page |
| Ahmad Hajj Khalil | Dashboard Page, Course Form Page |
| Sami Bou Khaled | Login Page, Register Page |

### Phase 2 — Backend & Integration

| Team Member | Role | Contributions |
|---|---|---|
| Mohamad Karim Mehaydli | Backend & API Lead | Express server setup, middleware stack, folder structure, environment config, REST API routes, controllers (CRUD), API response structure |
| Jad Al Hassan | Database & Authentication Lead | MongoDB/Mongoose schema design, database connection, bcrypt password hashing, JWT generation & verification middleware, ownership authorization |
| Sami Bou Khaled | Frontend Integration Lead | Replaced mock data with real API calls, wired forms/pages to backend endpoints, login/signup flows, loading/error/empty states, DataContext |
| Ahmad Hajj Khalil | Deployment, QA & Documentation Lead | Backend deployment (Render), frontend deployment (GitHub Pages), CORS & env var config, final testing (CRUD, auth, ownership), README, submission package |
