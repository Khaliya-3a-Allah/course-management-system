/* global process */
/**
 * Full API integration test — hits every endpoint and verifies DB round-trips.
 * Run:  node --test server/test/api.test.js
 * Requires the .env file to be present at the project root (MONGODB_URI, JWT_SECRET).
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env from project root before importing anything that reads env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Import server app and models AFTER env is loaded
const { default: app } = await import("../app.js");
const { default: mongoose } = await import("mongoose");
const { default: User } = await import("../models/User.js");
const { default: Course } = await import("../models/Course.js");
const { default: Module } = await import("../models/Module.js");
const { default: Lesson } = await import("../models/Lesson.js");
const { default: Enrollment } = await import("../models/Enrollment.js");
const { default: Purchase } = await import("../models/Purchase.js");
const { default: Progress } = await import("../models/Progress.js");
const { default: Review } = await import("../models/Review.js");
const { default: Certificate } = await import("../models/Certificate.js");
const { default: SupportTicket } = await import("../models/SupportTicket.js");
const { default: Thread } = await import("../models/Thread.js");
const { default: Comment } = await import("../models/Comment.js");

// ─── helpers ─────────────────────────────────────────────────────────────────

const TEST_EMAIL_SUFFIX = "@_test_.courseware.dev";
let BASE_URL;

async function api(method, urlPath, { token, body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data };
}

const GET  = (p, opts)     => api("GET",    p, opts ?? {});
const POST = (p, b, opts)  => api("POST",   p, { body: b, ...(opts ?? {}) });
const PUT  = (p, b, opts)  => api("PUT",    p, { body: b, ...(opts ?? {}) });
const DEL  = (p, opts)     => api("DELETE", p, opts ?? {});

function ok(res, expectedStatus = 200) {
  assert.equal(
    res.status,
    expectedStatus,
    `Expected ${expectedStatus}, got ${res.status}. Body: ${JSON.stringify(res.data)}`
  );
  assert.equal(res.data?.success, true, `success flag missing. Body: ${JSON.stringify(res.data)}`);
}

// ─── shared state (filled in during tests) ───────────────────────────────────
let server;
let studentToken, instructorToken;
let studentId, instructorId;
let courseId, moduleId, lessonId;
let enrollmentId, purchaseId, progressId, reviewId, certId, ticketId;
let threadId, commentId;

// ─── lifecycle ───────────────────────────────────────────────────────────────

before(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set — add it to .env");
  }
  await mongoose.connect(process.env.MONGODB_URI);

  server = createServer(app);
  await new Promise((resolve, reject) => {
    server.listen(0, (err) => (err ? reject(err) : resolve()));
  });
  const { port } = server.address();
  BASE_URL = `http://localhost:${port}/api/v1`;
  console.log(`\n  Server started on port ${port}`);
  console.log(`  MongoDB: ${mongoose.connection.host}\n`);
});

after(async () => {
  console.log("\n  Cleaning up test data…");
  const emailRx = new RegExp(TEST_EMAIL_SUFFIX.replace(".", "\\.") + "$");
  const testUsers = await User.find({ email: emailRx }).lean();
  const testUserIds = testUsers.map((u) => u._id);

  await Promise.all([
    User.deleteMany({ email: emailRx }),
    Course.deleteMany({ instructorId: { $in: testUserIds } }),
    Thread.deleteMany({ createdBy: { $in: testUserIds } }),
    Comment.deleteMany({ createdBy: { $in: testUserIds } }),
    Certificate.deleteMany({ userId: { $in: testUserIds } }),
    Enrollment.deleteMany({ userId: { $in: testUserIds } }),
    Purchase.deleteMany({ userId: { $in: testUserIds } }),
    Progress.deleteMany({ userId: { $in: testUserIds } }),
    Review.deleteMany({ userId: { $in: testUserIds } }),
    SupportTicket.deleteMany({ createdBy: { $in: testUserIds } }),
  ]);
  if (moduleId) await Module.deleteMany({ _id: moduleId });
  if (lessonId) await Lesson.deleteMany({ _id: lessonId });

  server.close();
  await mongoose.disconnect();
  console.log("  Done.\n");
});

// ─── tests ───────────────────────────────────────────────────────────────────

describe("Health", () => {
  it("GET /health → 200", async () => {
    const res = await GET("/health");
    ok(res);
  });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

describe("Auth", () => {
  it("seeds test users directly in DB (bypass email sending)", async () => {
    // Insert pre-verified users directly so email SMTP is never called
    const bcrypt = (await import("bcrypt")).default;
    const hash = await bcrypt.hash("TestPass123!", 10);

    await User.deleteMany({ email: { $regex: TEST_EMAIL_SUFFIX.replace(".", "\\.") } });

    const [student, instructor] = await User.insertMany([
      {
        name: "Test Student",
        email: `student${TEST_EMAIL_SUFFIX}`,
        password: hash,
        role: "student",
        verified: true,
      },
      {
        name: "Test Instructor",
        email: `instructor${TEST_EMAIL_SUFFIX}`,
        password: hash,
        role: "instructor",
        verified: true,
      },
    ]);

    // Verify they're in the DB
    assert.ok(student._id, "student not saved");
    assert.ok(instructor._id, "instructor not saved");
  });

  it("POST /auth/register duplicate → 409", async () => {
    const res = await POST("/auth/register", {
      name: "Dup",
      email: `student${TEST_EMAIL_SUFFIX}`,
      password: "TestPass123!",
    });
    assert.equal(res.status, 409);
  });

  it("POST /auth/login as student → 200 + token", async () => {
    const res = await POST("/auth/login", {
      email: `student${TEST_EMAIL_SUFFIX}`,
      password: "TestPass123!",
    });
    ok(res);
    assert.ok(res.data.token, "no token returned");
    studentToken = res.data.token;
    studentId = res.data.data?.id;
    assert.ok(studentId, "no user id returned");
  });

  it("POST /auth/login wrong password → 401", async () => {
    const res = await POST("/auth/login", {
      email: `student${TEST_EMAIL_SUFFIX}`,
      password: "wrongpassword",
    });
    assert.equal(res.status, 401);
  });

  it("POST /auth/login as instructor → 200 + token", async () => {
    const res = await POST("/auth/login", {
      email: `instructor${TEST_EMAIL_SUFFIX}`,
      password: "TestPass123!",
    });
    ok(res);
    instructorToken = res.data.token;
    instructorId = res.data.data?.id;
    assert.ok(instructorToken, "no instructor token");
  });

  it("GET /auth/me → 200 returns current user", async () => {
    const res = await GET("/auth/me", { token: studentToken });
    ok(res);
    assert.equal(res.data.data.email, `student${TEST_EMAIL_SUFFIX}`);
  });

  it("GET /auth/me without token → 401", async () => {
    const res = await GET("/auth/me");
    assert.equal(res.status, 401);
  });
});

// ─── USERS ───────────────────────────────────────────────────────────────────

describe("Users", () => {
  it("GET /users → 200 list", async () => {
    const res = await GET("/users");
    ok(res);
    assert.ok(Array.isArray(res.data.data), "data should be an array");
  });

  it("GET /users/:id → 200", async () => {
    const res = await GET(`/users/${studentId}`);
    ok(res);
    assert.equal(res.data.data.id, studentId);
  });

  it("GET /users/invalid-id → 400 or 404", async () => {
    const res = await GET("/users/not-a-valid-id");
    assert.ok(res.status >= 400);
  });

  it("PUT /users/:id → 200 updates profile", async () => {
    const res = await PUT(
      `/users/${studentId}`,
      { bio: "Test bio from api test" },
      { token: studentToken }
    );
    ok(res);
  });
});

// ─── COURSES ─────────────────────────────────────────────────────────────────

describe("Courses", () => {
  it("GET /courses → 200 public list", async () => {
    const res = await GET("/courses");
    ok(res);
    assert.ok(Array.isArray(res.data.data));
  });

  it("POST /courses without auth → 401", async () => {
    const res = await POST("/courses", { title: "No auth" });
    assert.equal(res.status, 401);
  });

  it("POST /courses → 201 creates course", async () => {
    const res = await POST(
      "/courses",
      {
        title: "API Test Course",
        description: "Created by integration test",
        price: 0,
        category: "Testing",
        instructorId,
      },
      { token: instructorToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    courseId = res.data.data?.id;
    assert.ok(courseId, "no courseId returned");
  });

  it("GET /courses/:id → 200", async () => {
    const res = await GET(`/courses/${courseId}`);
    ok(res);
    assert.equal(res.data.data.id, courseId);
  });

  it("PUT /courses/:id → 200 updates course", async () => {
    const res = await PUT(
      `/courses/${courseId}`,
      { title: "API Test Course (updated)" },
      { token: instructorToken }
    );
    ok(res);
    assert.equal(res.data.data.title, "API Test Course (updated)");
  });
});

// ─── MODULES ─────────────────────────────────────────────────────────────────

describe("Modules", () => {
  it("POST /modules → 201", async () => {
    const res = await POST(
      "/modules",
      { title: "Test Module", courseId, order: 1 },
      { token: instructorToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    moduleId = res.data.data?.id;
    assert.ok(moduleId);
  });

  it("GET /modules → 200", async () => {
    const res = await GET("/modules");
    ok(res);
  });

  it("GET /modules/:id → 200", async () => {
    const res = await GET(`/modules/${moduleId}`);
    ok(res);
  });

  it("PUT /modules/:id → 200", async () => {
    const res = await PUT(
      `/modules/${moduleId}`,
      { title: "Test Module (updated)" },
      { token: instructorToken }
    );
    ok(res);
  });
});

// ─── LESSONS ─────────────────────────────────────────────────────────────────

describe("Lessons", () => {
  it("POST /lessons → 201", async () => {
    const res = await POST(
      "/lessons",
      {
        title: "Test Lesson",
        moduleId,
        courseId,
        content: "Hello from test",
        order: 1,
      },
      { token: instructorToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    lessonId = res.data.data?.id;
    assert.ok(lessonId);
  });

  it("GET /lessons → 200", async () => {
    const res = await GET("/lessons");
    ok(res);
  });

  it("GET /lessons/:id → 200", async () => {
    const res = await GET(`/lessons/${lessonId}`);
    ok(res);
  });

  it("PUT /lessons/:id → 200", async () => {
    const res = await PUT(
      `/lessons/${lessonId}`,
      { title: "Test Lesson (updated)" },
      { token: instructorToken }
    );
    ok(res);
  });
});

// ─── ENROLLMENTS ─────────────────────────────────────────────────────────────

describe("Enrollments", () => {
  it("POST /enrollments → 201", async () => {
    const res = await POST(
      "/enrollments",
      { userId: studentId, courseId },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    enrollmentId = res.data.data?.id;
    assert.ok(enrollmentId);
  });

  it("GET /enrollments → 200 (authenticated)", async () => {
    const res = await GET("/enrollments", { token: studentToken });
    ok(res);
  });

  it("GET /enrollments without auth → 401", async () => {
    const res = await GET("/enrollments");
    assert.equal(res.status, 401);
  });

  it("GET /enrollments/:id → 200", async () => {
    const res = await GET(`/enrollments/${enrollmentId}`, { token: studentToken });
    ok(res);
  });
});

// ─── PURCHASES ───────────────────────────────────────────────────────────────

describe("Purchases", () => {
  it("POST /purchases → 201", async () => {
    const res = await POST(
      "/purchases",
      { userId: studentId, courseId, amount: 0 },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    purchaseId = res.data.data?.id;
    assert.ok(purchaseId);
  });

  it("GET /purchases → 200 (authenticated)", async () => {
    const res = await GET("/purchases", { token: studentToken });
    ok(res);
  });

  it("GET /purchases/:id → 200", async () => {
    const res = await GET(`/purchases/${purchaseId}`, { token: studentToken });
    ok(res);
  });
});

// ─── PROGRESS ────────────────────────────────────────────────────────────────

describe("Progress", () => {
  it("POST /progress → 201", async () => {
    const res = await POST(
      "/progress",
      { userId: studentId, courseId, lessonId, completed: true },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    progressId = res.data.data?.id;
    assert.ok(progressId);
  });

  it("GET /progress → 200 (authenticated)", async () => {
    const res = await GET("/progress", { token: studentToken });
    ok(res);
  });

  it("GET /progress/:id → 200", async () => {
    const res = await GET(`/progress/${progressId}`, { token: studentToken });
    ok(res);
  });
});

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

describe("Dashboard", () => {
  it("GET /dashboard/me → 200 personalized analytics", async () => {
    const res = await GET("/dashboard/me", { token: studentToken });
    ok(res);

    const dashboard = res.data.data;
    assert.ok(dashboard.summary, "dashboard summary missing");
    assert.equal(typeof dashboard.summary.currentStreakDays, "number");
    assert.ok(Array.isArray(dashboard.continueWatching), "continueWatching should be an array");
    assert.ok(Array.isArray(dashboard.deadlineReminders), "deadlineReminders should be an array");
    assert.ok(Array.isArray(dashboard.completionForecast), "completionForecast should be an array");
    assert.ok(Array.isArray(dashboard.recommendations), "recommendations should be an array");
    assert.ok(
      dashboard.continueWatching.some(
        (item) => String(item.course?.id || item.course?._id || "") === String(courseId)
      ),
      "dashboard should include the enrolled course"
    );
  });
});

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

describe("Reviews", () => {
  it("GET /reviews → 200 (public)", async () => {
    const res = await GET("/reviews");
    ok(res);
  });

  it("POST /reviews → 201", async () => {
    const res = await POST(
      "/reviews",
      { userId: studentId, courseId, rating: 5, comment: "Great test course!" },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    reviewId = res.data.data?.id;
    assert.ok(reviewId);
  });

  it("GET /reviews/:id → 200", async () => {
    const res = await GET(`/reviews/${reviewId}`);
    ok(res);
  });

  it("PUT /reviews/:id → 200", async () => {
    const res = await PUT(
      `/reviews/${reviewId}`,
      { comment: "Updated review comment" },
      { token: studentToken }
    );
    ok(res);
  });
});

// ─── SUPPORT TICKETS ─────────────────────────────────────────────────────────

describe("Support Tickets", () => {
  it("POST /support-tickets → 201", async () => {
    const res = await POST(
      "/support-tickets",
      {
        title: "Test ticket",
        description: "This is a test support ticket from the integration test",
        createdBy: studentId,
      },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    ticketId = res.data.data?.id;
    assert.ok(ticketId);
  });

  it("GET /support-tickets → 200", async () => {
    const res = await GET("/support-tickets");
    ok(res);
  });

  it("GET /support-tickets/:id → 200", async () => {
    const res = await GET(`/support-tickets/${ticketId}`);
    ok(res);
  });
});

// ─── COMMUNITY ───────────────────────────────────────────────────────────────

describe("Community — threads", () => {
  it("GET /community/threads without auth → 401", async () => {
    const res = await GET("/community/threads");
    assert.equal(res.status, 401);
  });

  it("GET /community/threads → 200", async () => {
    const res = await GET("/community/threads", { token: studentToken });
    ok(res);
    assert.ok(Array.isArray(res.data.data));
  });

  it("POST /community/threads → 201 creates thread", async () => {
    const res = await POST(
      "/community/threads",
      {
        courseId,
        title: "Test Question from API test",
        body: "This is a test thread body for integration testing.",
      },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    threadId = res.data.data?.id || res.data.data?._id;
    assert.ok(threadId, "no threadId returned");
  });

  it("GET /community/threads?courseId filters correctly", async () => {
    const res = await GET(`/community/threads?courseId=${courseId}`, { token: studentToken });
    ok(res);
    assert.ok(res.data.data.length >= 1);
  });

  it("GET /community/threads/:id → 200", async () => {
    const res = await GET(`/community/threads/${threadId}`, { token: studentToken });
    ok(res);
    assert.ok(res.data.data.thread);
    assert.ok(Array.isArray(res.data.data.comments));
  });

  it("POST /community/threads/:id/upvote → 200 toggles upvote", async () => {
    const res = await POST(
      `/community/threads/${threadId}/upvote`,
      {},
      { token: studentToken }
    );
    ok(res);
    assert.equal(typeof res.data.data.upvoted, "boolean");
  });
});

describe("Community — comments", () => {
  it("POST /community/threads/:id/comments → 201", async () => {
    const res = await POST(
      `/community/threads/${threadId}/comments`,
      { body: "This is a test answer from integration test." },
      { token: instructorToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    commentId = res.data.data?.id || res.data.data?._id;
    assert.ok(commentId);
  });

  it("POST /community/comments/:id/upvote → 200", async () => {
    const res = await POST(
      `/community/comments/${commentId}/upvote`,
      {},
      { token: studentToken }
    );
    ok(res);
  });

  it("POST /community/comments/:id/accept → 200 (thread owner)", async () => {
    const res = await POST(
      `/community/comments/${commentId}/accept`,
      {},
      { token: studentToken }
    );
    ok(res);
  });
});

describe("Community — moderation (instructor)", () => {
  it("GET /community/moderation/queue → 200", async () => {
    const res = await GET("/community/moderation/queue", { token: instructorToken });
    ok(res);
    assert.ok(Array.isArray(res.data.data.threads));
    assert.ok(Array.isArray(res.data.data.comments));
  });

  it("GET /community/moderation/queue without instructor role → 403", async () => {
    const res = await GET("/community/moderation/queue", { token: studentToken });
    assert.equal(res.status, 403);
  });
});

// ─── CERTIFICATES ────────────────────────────────────────────────────────────

describe("Certificates", () => {
  it("GET /certificates → 200 (authenticated)", async () => {
    const res = await GET("/certificates", { token: studentToken });
    ok(res);
  });

  it("POST /certificates → 201 creates signed certificate", async () => {
    const res = await POST(
      "/certificates",
      { userId: studentId, courseId },
      { token: studentToken }
    );
    assert.equal(res.status, 201, JSON.stringify(res.data));
    const cert = res.data.data;
    assert.ok(cert, "no certificate data returned");
    certId = cert.signedCertificateId;
    assert.ok(certId, "no signedCertificateId returned");
    assert.ok(cert.verificationToken, "no verificationToken returned");
  });

  it("GET /certificates/verify/:certId → 200 public verification", async () => {
    const res = await GET(`/certificates/verify/${certId}`);
    ok(res);
    assert.equal(res.data.valid, true);
    assert.ok(res.data.certificate.recipientName);
    assert.ok(res.data.certificate.courseName);
  });

  it("GET /certificates/qr/:certId → 200", async () => {
    const res = await GET(`/certificates/qr/${certId}`, { token: studentToken });
    ok(res);
    assert.ok(res.data.qrCode.verificationUrl);
  });

  it("GET /certificates/share/linkedin/:certId → 200", async () => {
    const res = await GET(`/certificates/share/linkedin/${certId}`, { token: studentToken });
    ok(res);
    assert.ok(res.data.shareLink);
  });

  it("GET /certificates/verify/bad-id → 404", async () => {
    const res = await GET("/certificates/verify/CERT-DOESNOTEXIST-00000000");
    assert.equal(res.status, 404);
  });
});

// ─── CLEANUP — delete created resources ──────────────────────────────────────

describe("Cleanup — delete created resources", () => {
  it("DELETE /reviews/:id → 200", async () => {
    if (!reviewId) return;
    const res = await DEL(`/reviews/${reviewId}`, { token: studentToken });
    ok(res);
  });

  it("DELETE /progress/:id → 200", async () => {
    if (!progressId) return;
    const res = await DEL(`/progress/${progressId}`, { token: studentToken });
    ok(res);
  });

  it("DELETE /purchases/:id → 200", async () => {
    if (!purchaseId) return;
    const res = await DEL(`/purchases/${purchaseId}`, { token: studentToken });
    ok(res);
  });

  it("DELETE /enrollments/:id → 200", async () => {
    if (!enrollmentId) return;
    const res = await DEL(`/enrollments/${enrollmentId}`, { token: studentToken });
    ok(res);
  });

  it("DELETE /courses/:id → 200", async () => {
    if (!courseId) return;
    const res = await DEL(`/courses/${courseId}`, { token: instructorToken });
    ok(res);
  });
});
