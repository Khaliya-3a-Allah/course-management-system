# Courseware Course Management System

Frontend application for browsing courses, enrolling as a student, creating courses as an instructor, tracking learning progress, and generating certificates.

## Team Members

| Name | Student ID | GitHub | Email |
| Mohamad Karim Mehaydli | 202400046 | Klol120 | mohamadkarim.mehaydli@lau.edu |
| TODO: Member 1 | TODO | TODO | TODO |
| TODO: Member 2 | TODO | TODO | TODO |
| TODO: Member 3 | TODO | TODO | TODO |

## Assigned Topic

Course Management System for online learning.

### Primary Data Entities

The app primarily models these entities:

1. User: student/instructor profile, authentication state, saved/enrolled/completed courses.
2. Course: title, category, level, instructor, rating, modules, lessons.
3. Module: grouped set of lessons within a course.
4. Lesson: individual learning unit with duration and preview/video URL.
5. Learning Progress: lesson completion map and per-course completion percentage.
6. Certificate: completion-based records shown in the certificates view.
7. Support Ticket (simulated): support request payload submitted from the support page.

## Deployed Application

- Live URL: https://khaliya-3a-allah.github.io/course-management-system/

## Frontend Setup (Local)

### Prerequisites

1. Node.js 18+ (Node.js 20 LTS recommended)
2. npm 9+

### Steps

1. Clone the repository:

```bash
git clone https://github.com/Khaliya-3a-Allah/course-management-system.git
cd course-management-system
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Open the local URL shown in terminal (typically `http://localhost:5173`).

### Additional Scripts

```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint checks
npm run test:e2e   # Run Playwright end-to-end tests
npm run deploy     # Build and deploy dist/ via gh-pages
```

## Feature Showcase (Screenshots / GIF)

Add screenshots or a GIF to highlight key flows.

Suggested captures:

1. Home or Courses listing
2. Course details and module navigation
3. Dashboard progress tracking
4. Certificate page
5. Instructor course creation/edit flow
6. Support page ticket submission

Example markdown (replace with your real files/links):

```md
![Courses Page](./screenshots/courses-page.png)
![Dashboard](./screenshots/dashboard.png)
![App Demo](./screenshots/demo.gif)
```

## Team Contributions

| Team Member | Primary Contributions | Page/View 1 | Page/View 2 |
| Mohamad Karim Mehaydli | Main overview | Home Page | Courses Page |
| TODO: Member 1 | TODO | TODO | TODO |
| TODO: Member 2 | TODO | TODO | TODO |
| TODO: Member 3 | TODO | TODO | TODO |

### Available Pages/Views in This Project

Use these names consistently when filling the table above:

1. Home
2. Courses
3. Course Details
4. Module Details
5. Dashboard
6. Certificates
7. Login
8. Register
9. Support
10. Course Form (Create/Edit)

## Mock Data and Interaction Simulation

This project currently uses in-memory mock data to simulate real backend behavior.

### Source Files

1. `src/data/mockCourses.js`
2. `src/data/mockUsers.js`

### How It Works

1. On app startup, `AppContext` loads `mockCourses` and `mockUsers` into React state.
2. User actions (enroll, save, complete, review, create/update/delete course) update local state only.
3. Authentication state is simulated by selecting a mock user and persisting a safe user object in `localStorage`.
4. Progress and completion states are computed/stored client-side (lesson completion map and completed course IDs).
5. Support submission is currently simulated on the frontend (toast feedback) without a backend ticket API.

### Why This Approach

1. Enables rapid UI development and testing without a server.
2. Makes flows deterministic for demos and grading.
3. Keeps the codebase focused on frontend architecture and UX.

## Notes

This is a frontend-focused project built with React and Vite. Data persistence and API calls are intentionally mocked for simulation and demonstration.
