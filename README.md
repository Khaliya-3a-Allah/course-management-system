# Courseware Course Management System

Frontend application for browsing courses, enrolling as a student, creating courses as an instructor, tracking learning progress, and generating certificates.

## Team Members

| Name | Student ID | GitHub | Email |

| Mohamad Karim Mehaydli | 202400046 | Klol120 | mohamadkarim.mehaydli@lau.edu |

| Jad Al Hassan | 202400472 | jadalhassan | jad.alhassan@lau.edu |

| Ahmad Hajj Khalil | 202208592 | TODO | ahmad.hajjkhalil@lau.edu |

| Sami Bou Khaled | 202303124 | TODO | sami.boukhaled01@lau.edu |

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

1. Home or Courses listing
<img width="1919" height="907" alt="Screenshot 2026-03-24 225806" src="https://github.com/user-attachments/assets/ec32f4b8-ad17-46c0-85f7-766af356c444" />
<img width="1918" height="909" alt="Screenshot 2026-03-24 230300" src="https://github.com/user-attachments/assets/1acd32b2-026c-4b00-9a5e-0e4de02fff1e" />
2. Course details and module navigation
<img width="1919" height="907" alt="Screenshot 2026-03-24 230357" src="https://github.com/user-attachments/assets/97276eca-b4d9-40a8-85bd-e75e111ccbfb" />
<img width="1917" height="916" alt="Screenshot 2026-03-24 230440" src="https://github.com/user-attachments/assets/cf71ea01-56a6-4e5a-bdf8-9aa528fde7f9" />
<img width="1353" height="429" alt="Screenshot 2026-03-24 230503" src="https://github.com/user-attachments/assets/fb4f404b-9ead-42b0-a1f1-21fc88518492" />

3. Dashboard progress tracking
<img width="1904" height="424" alt="Screenshot 2026-03-24 230611" src="https://github.com/user-attachments/assets/84f50099-997a-4f53-b656-655af1286012" />
<img width="1327" height="629" alt="Screenshot 2026-03-24 230647" src="https://github.com/user-attachments/assets/08ed32e0-a2ca-4a19-9965-dcc91996bde1" />
<img width="712" height="658" alt="image" src="https://github.com/user-attachments/assets/3b0d3f12-6dc5-4229-9367-a96feb5e18d4" />

4. Certificate page
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/a0cfbce7-d1ea-444e-9652-43421478c994" />
<img width="1299" height="913" alt="image" src="https://github.com/user-attachments/assets/2f563368-dc78-4d7a-a8a1-6cde1fb5276e" />

5. Instructor course creation/edit flow
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/93affdd1-69d4-478e-9ee6-d783d01ba4f3" />
<img width="739" height="597" alt="image" src="https://github.com/user-attachments/assets/12dd28ae-99b9-4a22-8865-74d57366337b" />

6. Support page ticket submission
<img width="1736" height="736" alt="image" src="https://github.com/user-attachments/assets/bd97b97a-4c02-48df-bfd5-7bf2a21cb79f" />


## Team Contributions

| Team Member | Primary Contributions | Page/View 1 | Page/View 2 |
| Mohamad Karim Mehaydli | Main overview | Home Page | Courses Page | Certificates Page | Support Page |
| Jad Al Hassan | Built the base | Module Detials Page | Course Details Page |
| Ahmad Khalil | Enhanced Dashboard and Forms | Dashboard Page | Course Form Page |
| Sami Bou Khaled | Provided Verification | Login Page | Register Page |

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
