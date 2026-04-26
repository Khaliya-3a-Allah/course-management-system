# Courseware - Course Management System

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

1. **User** - student/instructor profile, authentication state, saved/enrolled/completed courses
2. **Course** - title, category, level, instructor, rating, modules, lessons
3. **Module** - grouped set of lessons within a course
4. **Lesson** - individual learning unit with duration and preview/video URL
5. **Learning Progress** - lesson completion map and per-course completion percentage
6. **Purchase** - checkout record with payment method, discount, and final amount
7. **Certificate** - completion-based records shown in the certificates view
8. **Support Ticket** - support request payload submitted from the support page
9. **Community Thread / Comment** - course-specific Q&A discussions, answers, upvotes, and moderation state
10. **Assessment Attempt** - quiz submissions, scoring, attempt limits, and anti-cheat metadata

---

## Feature Overview

- **Course discovery** - browse the catalog, filter by category/level, view sale pricing, and open detailed course pages.
- **Enrollment and checkout** - enroll in free courses or buy paid courses with card/PayPal-style flows, promo codes, referral discounts, and printable receipts.
- **Instructor course builder** - create and edit courses, modules, lessons, and embedded lesson quizzes.
- **Learning progress** - track completed lessons, course completion percentages, dashboard statistics, and completed courses.
- **Assessments** - take timed multiple-choice lesson quizzes with pass thresholds, attempt limits, scoring feedback, and saved attempts.
- **Certificates** - issue course completion certificates, download/share them, and verify certificates publicly by certificate ID/QR link.
- **Community Q&A** - authenticated learners can create course threads, answer questions, upvote useful posts, and accept best answers.
- **Moderation tools** - instructors/admins can review pending community threads and comments.
- **Admin control center** - admins can manage users, courses, reports, risk flags, soft deletes, restores, approvals, and audit logs.
- **Course AI assistant** - floating AI chat recommends next courses using learner progress and the available course catalog.
- **Authentication security** - email verification, JWT sessions, bcrypt password hashing, optional authenticator-app 2FA, and rate limits.
- **Support tickets** - submit support requests from the support page and store them through the backend API.

---

## Deployed Application

| Service | URL |
|---|---|
| Frontend (GitHub Pages) | https://khaliya-3a-allah.github.io/course-management-system/ |
| Backend API (Render) | https://course-management-system-1hwz.onrender.com/api/v1 |
| API Health Check | https://course-management-system-1hwz.onrender.com/api/v1/health |
| GitHub Repository | https://github.com/Khaliya-3a-Allah/course-management-system |

> **Note:** The backend runs on Render's free tier and may take about 30 seconds to wake up after a period of inactivity. A cold-start banner is shown in the UI during this time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Auth | JWT, bcrypt, TOTP (2FA via speakeasy), email verification (Nodemailer + Gmail) |
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

**Backend** - copy `.env.example` to `.env` and fill in your values:

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
| `JWT_CHALLENGE_EXPIRES_IN` | 2FA challenge token lifetime | `5m` |
| `API_PREFIX` | API route prefix | `/api/v1` |
| `TOTP_ISSUER` | Label shown in authenticator apps | `Courseware` |
| `GMAIL_USER` | Gmail address used to send verification emails | `your-app@gmail.com` |
| `GMAIL_PASS` | Gmail app password used by Nodemailer | `your-16-char-app-password` |
| `ENABLE_REQUEST_LOGS` | Toggle Morgan request logging | `true` |

**Frontend** - copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Set `VITE_API_URL=http://localhost:5000/api/v1` for local development.

> **Note:** Email verification is part of the auth flow. To test registration and login locally, configure `GMAIL_USER` and `GMAIL_PASS` so the backend can send verification codes.

### 4. Start both servers

```bash
# Terminal 1 - Express backend
npm run dev:server

# Terminal 2 - Vite frontend
npm run dev:client
```

Open `http://localhost:5173` in your browser.

### Available Scripts

```bash
npm run build        # Production frontend build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint checks
npm run test:e2e     # Run Playwright end-to-end tests (when e2e specs are present)
npm run deploy       # Build and push frontend to GitHub Pages
```

---

## Deployment Guide

### Backend - Render

1. Push your code to GitHub (ensure `render.yaml` is committed).
2. On [render.com](https://render.com), create a **New Web Service** and connect your GitHub repo. Render auto-detects `render.yaml`.
3. In the Render dashboard **Environment** tab, set all required secrets:
   - `MONGODB_URI` - your MongoDB Atlas connection string
   - `JWT_SECRET` - a long random string (for example, the output of `openssl rand -hex 32`)
   - `GMAIL_USER` - Gmail address used for account verification emails
   - `GMAIL_PASS` - Gmail app password for that inbox
4. All other variables (`NODE_ENV`, `CLIENT_ORIGIN`, etc.) are set via `render.yaml` automatically.
5. Deploy. First deploy takes about 3-5 minutes. Test with the `/api/v1/health` endpoint.

### Frontend - GitHub Pages

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

`role` is optional - accepts `"student"` or `"instructor"`, defaults to `"student"`.

**Response `201`**
```json
{
  "success": true,
  "emailVerificationRequired": true,
  "message": "Account created. Please check your email for a verification code.",
  "email": "jane@example.com"
}
```

Registering creates the account in an unverified state. The user must submit the code at `POST /auth/verify-email` before receiving a full session token.

---

#### `POST /auth/verify-email`
No auth required. Verifies the emailed 6-digit code and returns a full session token.

**Request body**
```json
{
  "email": "jane@example.com",
  "code": "123456"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "<jwt>",
  "data": {
    "id": "664a...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "verified": true
  }
}
```

---

#### `POST /auth/resend-verification`
No auth required. Sends a fresh verification code to an unverified account. Rate-limited.

**Request body**
```json
{
  "email": "jane@example.com"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Verification code sent"
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

**Response `200` (email verified, 2FA disabled)**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "data": { "id": "664a...", "name": "Jane Doe", "role": "student", "..." }
}
```

**Response `200` (email not verified yet)**
```json
{
  "success": true,
  "emailVerificationRequired": true,
  "message": "Please verify your email before logging in. A new code has been sent.",
  "email": "jane@example.com"
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

Exchange `challengeToken` at `POST /auth/2fa/verify`.

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
  "data": {
    "otpauthUrl": "otpauth://totp/Courseware:jane@example.com?secret=BASE32&issuer=Courseware",
    "secret": "BASE32"
  }
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
No auth required. Second step of 2FA login - exchanges a `challengeToken` plus TOTP code for a full session token.

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
| `GET` | `/courses` | - | List all courses |
| `GET` | `/courses/:id` | - | Get a single course |
| `POST` | `/courses` | Required | Create a course |
| `PUT` | `/courses/:id` | Owner only | Update a course |
| `DELETE` | `/courses/:id` | Owner only | Delete a course |

#### `POST /courses` - Request body
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
| `GET` | `/modules` | - | List all modules |
| `GET` | `/modules/:id` | - | Get a single module |
| `POST` | `/modules` | Required | Create a module |
| `PUT` | `/modules/:id` | Owner only | Update a module |
| `DELETE` | `/modules/:id` | Owner only | Delete a module |

#### `POST /modules` - Request body
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
| `GET` | `/lessons` | - | List all lessons |
| `GET` | `/lessons/:id` | - | Get a single lesson |
| `POST` | `/lessons` | Required | Create a lesson |
| `PUT` | `/lessons/:id` | Owner only | Update a lesson |
| `DELETE` | `/lessons/:id` | Owner only | Delete a lesson |

#### `POST /lessons` - Request body
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

#### `POST /enrollments` - Request body
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

#### `POST /progress` - Request body
```json
{
  "courseId": "665b...",
  "lessonId": "668e...",
  "completed": true
}
```

---

### Purchases

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/purchases` | Required | List current user's purchases |
| `GET` | `/purchases/:id` | Required | Get a single purchase |
| `POST` | `/purchases` | Required | Create a paid course purchase |
| `PUT` | `/purchases/:id` | Owner only | Update a purchase |
| `DELETE` | `/purchases/:id` | Owner only | Delete a purchase |

#### `POST /purchases` - Request body
```json
{
  "courseId": "665b...",
  "paymentMethod": "card",
  "transactionId": "CW-1714040404040",
  "cardLast4": "4242",
  "discount": 9.99,
  "promoCode": "SPRING15",
  "referralCode": "FRIEND10"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "id": "66aa...",
    "userId": "664a...",
    "courseId": "665b...",
    "amount": 49.99,
    "discount": 9.99,
    "finalAmount": 40,
    "status": "paid",
    "paymentMethod": "card"
  }
}
```

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/reviews` | - | List all reviews |
| `GET` | `/reviews/:id` | - | Get a single review |
| `POST` | `/reviews` | Required | Submit a review |
| `PUT` | `/reviews/:id` | Owner only | Edit a review |
| `DELETE` | `/reviews/:id` | Owner only | Delete a review |

#### `POST /reviews` - Request body
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

#### `POST /certificates` - Request body
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

#### `POST /support-tickets` - Request body
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

Browse the course catalog, inspect featured content, and filter courses before opening a detail page.

<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/56a3500c-4f50-4b40-be21-6e826339a36a" />
<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/37524afd-9c46-4ba0-bd50-268d1cd0bb77" />

### 2. Course details and module navigation

Course pages show pricing, enrollment state, modules, lessons, and learner progress through the curriculum.

<img width="1910" height="912" alt="image" src="https://github.com/user-attachments/assets/ad5847fd-608a-4695-b269-46f2be8befd6" />
<img width="1919" height="912" alt="image" src="https://github.com/user-attachments/assets/c2f40e52-89b7-4744-8e22-612c77cc5ff2" />
<img width="1353" height="429" alt="Screenshot 2026-03-24 230503" src="https://github.com/user-attachments/assets/fb4f404b-9ead-42b0-a1f1-21fc88518492" />

### 3. Dashboard progress tracking

The dashboard summarizes active courses, completion progress, profile information, and learner achievements.

<img width="1915" height="858" alt="image" src="https://github.com/user-attachments/assets/e61a3fa5-2e27-4077-bda0-cde806af8631" />
<img width="1919" height="660" alt="image" src="https://github.com/user-attachments/assets/f638457a-3d51-4cc2-a819-4da61acbf968" />
<img width="1347" height="723" alt="image" src="https://github.com/user-attachments/assets/cee75e9d-fb6d-413b-97a4-832a3a945c5f" />
<img width="543" height="901" alt="image" src="https://github.com/user-attachments/assets/8d79369d-0c97-4f09-9158-3336ccda34e7" />


### 4. Certificate page

Completed courses generate certificates that learners can view, print, and share.

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/a0cfbce7-d1ea-444e-9652-43421478c994" />
<img width="1299" height="913" alt="image" src="https://github.com/user-attachments/assets/2f563368-dc78-4d7a-a8a1-6cde1fb5276e" />

### 5. Instructor course creation / edit flow

Instructors can create courses, update course metadata, and build module/lesson curriculum content.

<img width="1917" height="917" alt="image" src="https://github.com/user-attachments/assets/191a2a39-1b27-45cd-b3cf-4ee61dde236e" />
<img width="1915" height="910" alt="image" src="https://github.com/user-attachments/assets/3ce69a68-8382-40d0-b712-f39ea59d28af" />
<img width="1320" height="605" alt="image" src="https://github.com/user-attachments/assets/8eeb3fcf-fed5-48d9-b2ec-b0154e79c73d" />


### 6. Support page ticket submission

Users can submit support tickets through a backend-backed support form.

<img width="1736" height="736" alt="image" src="https://github.com/user-attachments/assets/bd97b97a-4c02-48df-bfd5-7bf2a21cb79f" />

### 7. Login / Sign up / Sign out

Authentication includes registration, login, email verification, protected routes, sign out, and optional authenticator-app 2FA.

<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/cb04fdfc-ae29-42a1-901f-ba6e9a3b3176" />
<img width="1913" height="910" alt="image" src="https://github.com/user-attachments/assets/271fc131-a75a-4955-adf1-acf7c6484fe1" />
<img width="608" height="642" alt="image" src="https://github.com/user-attachments/assets/cc0865ba-8d3b-4f65-94c2-cbb8f942e142" />
<img width="360" height="318" alt="image" src="https://github.com/user-attachments/assets/b0a7ee84-bf17-41ab-8fbf-32faff9c9785" />

### 8. Checkout, discounts, and receipts

Paid courses support card or PayPal-style checkout, promo/referral discounts, sale pricing, validation, purchase records, and printable receipts.

<img width="1915" height="908" alt="image" src="https://github.com/user-attachments/assets/9fbf1df8-5d03-4c83-8db5-466b3777a4dc" />

<img width="984" height="478" alt="image" src="https://github.com/user-attachments/assets/51f5d70f-6c90-4798-8182-d8d39f22c54c" />

### 9. Lesson quizzes and assessment attempts

Lessons can include timed multiple-choice quizzes with pass scores, attempt limits, automatic grading, answer review, and anti-cheat metadata.

<img width="1403" height="486" alt="image" src="https://github.com/user-attachments/assets/87f68776-795c-4fa2-b624-d8104af0436d" />

<img width="1349" height="659" alt="image" src="https://github.com/user-attachments/assets/94b22267-6b00-4a68-9d65-fc660f8a6d60" />

<img width="1414" height="404" alt="image" src="https://github.com/user-attachments/assets/963459c6-b839-4e68-bb3e-72faddbb5e0f" />


### 10. Community Q&A and moderation

Authenticated users can ask course questions, answer threads, upvote helpful posts, accept answers, and instructors/admins can moderate pending content.

<img width="1883" height="868" alt="image" src="https://github.com/user-attachments/assets/fe2c924e-0a07-4b81-b795-929f0df55aa3" />


### 11. Course AI assistant

The floating Course AI chat recommends courses from the catalog using the learner's enrolled, saved, and completed courses.

<img width="802" height="878" alt="image" src="https://github.com/user-attachments/assets/de9878b4-e261-43ee-a623-082117475805" />


### 12. Public certificate verification

Certificates can be verified from a public `/verify/:certId` route with certificate details, QR code verification, print action, and LinkedIn sharing.

<img width="1308" height="874" alt="image" src="https://github.com/user-attachments/assets/53e1a752-ca46-4f94-adfc-c4d249255ad5" />

### 13. Admin control center

Admins can review platform metrics, manage users/courses, approve or reject content, handle abuse reports, see risk flags, soft-delete or restore records, and audit administrative actions.

<!-- Add admin screenshots here: overview metrics, users/courses table, reports queue, and audit log. -->


---

## Technical Challenges

### 1. Two-Factor Authentication flow across stateless JWT
Implementing 2FA with stateless JWTs required a two-token approach: after a correct password check, the server issues a short-lived *challenge token* (5 minute expiry) instead of a full session token. The client then submits that challenge token alongside the TOTP code to receive a real session token. This avoided server-side session state while still preventing a compromised password alone from granting access.

### 2. Render cold starts affecting UX
The free Render tier spins down the server after 15 minutes of inactivity, causing the first request to take about 30 seconds. To avoid a broken-looking UI, a `ColdStartBanner` component detects the initial connection delay and shows a friendly loading message to the user rather than a timeout error.

### 3. CORS between GitHub Pages and Render
GitHub Pages serves the frontend from `https://khaliya-3a-allah.github.io` while the backend runs on a different domain. The Express CORS configuration reads the allowed origin from the `CLIENT_ORIGIN` environment variable, which is set to the exact GitHub Pages origin on Render. An incorrect origin, such as including the sub-path `/course-management-system`, would silently block all API calls; the fix was to set the origin to just the scheme and host.

### 4. Vite base path and GitHub Pages routing
GitHub Pages serves the app under `/course-management-system/`, so Vite needed `base: '/course-management-system/'` in production. The frontend also uses `HashRouter`, which avoids server-side rewrite issues on GitHub Pages while still supporting direct navigation to app routes.

### 5. Ownership authorization without a separate permissions table
Rather than a dedicated permissions system, each resource model stores a `createdBy` or `instructorId` field. A reusable `authorizeOwner` middleware reads the relevant field name per resource and compares it to `req.user.id`, returning `403` on mismatch. This kept the codebase simple while still enforcing that users can only mutate their own records.

---

## Security Features

- **JWT authentication** - stateless tokens, 7-day expiry, excluded from all API responses
- **Email verification** - 6-digit code workflow for new accounts and unverified logins
- **Two-Factor Authentication (TOTP)** - optional 2FA via authenticator apps (Google Authenticator, Authy)
- **Rate limiting** - per-IP on registration, per-email on login to prevent brute force
- **Helmet** - sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- **CORS** - restricted to the deployed frontend origin in production
- **bcrypt** - passwords hashed with cost factor 12, never stored or returned in plaintext
- **Ownership checks** - server-side enforcement: users can only modify their own resources

---

## Team Contributions

### Phase 1 - Frontend

| Team Member | Contributions |
|---|---|
| Mohamad Karim Mehaydli | Home Page, Courses Page, Certificates Page, Support Page |
| Jad Al Hassan | Module Details Page, Course Details Page |
| Ahmad Hajj Khalil | Dashboard Page, Course Form Page |
| Sami Bou Khaled | Login Page, Register Page |

### Phase 2 - Backend & Integration

| Team Member | Role | Contributions |
|---|---|---|
| Mohamad Karim Mehaydli | Backend & API Lead | Express server setup, middleware stack, folder structure, environment config, REST API routes, controllers (CRUD), API response structure |
| Jad Al Hassan | Database & Authentication Lead | MongoDB/Mongoose schema design, database connection, bcrypt password hashing, JWT generation & verification middleware, ownership authorization |
| Sami Bou Khaled | Frontend Integration Lead | Replaced mock data with real API calls, wired forms/pages to backend endpoints, login/signup flows, loading/error/empty states, DataContext |
| Ahmad Hajj Khalil | Deployment, QA & Documentation Lead | Backend deployment (Render), frontend deployment (GitHub Pages), CORS and env var config, final testing (CRUD, auth, ownership), README, submission package |
