/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Server health check
 *   - name: Auth
 *     description: Authentication — register, login, logout, password management, email verification, 2FA
 *   - name: Users
 *     description: User CRUD (admin)
 *   - name: Courses
 *     description: Course catalogue — search, CRUD
 *   - name: Modules
 *     description: Course modules (sections)
 *   - name: Lessons
 *     description: Lesson content within modules
 *   - name: Reviews
 *     description: Course reviews and ratings
 *   - name: Enrollments
 *     description: Student course enrollments
 *   - name: Purchases
 *     description: Course purchase records
 *   - name: Progress
 *     description: Lesson completion progress tracking
 *   - name: Dashboard
 *     description: Personalised stats for the current user
 *   - name: Certificates
 *     description: Course completion certificates — issue, verify, revoke
 *   - name: Support Tickets
 *     description: Customer support tickets and messaging
 *   - name: Community
 *     description: Discussion threads, comments, upvotes and moderation
 *   - name: AI
 *     description: AI-powered course suggestions and quiz generation
 *   - name: Assessments
 *     description: Lesson quiz attempt submission and history
 *   - name: Admin
 *     description: Admin-only — overview, user/course management, reports, audit logs
 */

// ─── Shared component schemas ────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Unauthorized
 *
 *     Success:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7a8b9c0d1
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         role:
 *           type: string
 *           enum: [student, instructor, admin]
 *           example: student
 *         isEmailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: Introduction to JavaScript
 *         description:
 *           type: string
 *         instructorId:
 *           type: string
 *         category:
 *           type: string
 *           example: Programming
 *         price:
 *           type: number
 *           example: 49.99
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Module:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         courseId:
 *           type: string
 *         title:
 *           type: string
 *           example: Getting Started
 *         order:
 *           type: integer
 *           example: 1
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         moduleId:
 *           type: string
 *         title:
 *           type: string
 *           example: Variables and Types
 *         content:
 *           type: string
 *         type:
 *           type: string
 *           enum: [video, text, quiz]
 *         order:
 *           type: integer
 *
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         courseId:
 *           type: string
 *         userId:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, completed, dropped]
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *
 *     Purchase:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, refunded]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Progress:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         lessonId:
 *           type: string
 *         completed:
 *           type: boolean
 *         completedAt:
 *           type: string
 *           format: date-time
 *
 *     Certificate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         certificateId:
 *           type: string
 *           example: CERT-2024-ABC123
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         revoked:
 *           type: boolean
 *
 *     SupportTicket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         subject:
 *           type: string
 *         message:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, in_progress, resolved]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Thread:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         upvotes:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         threadId:
 *           type: string
 *         userId:
 *           type: string
 *         content:
 *           type: string
 *         upvotes:
 *           type: integer
 *         isAccepted:
 *           type: boolean
 */

// ─── Health ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Server and database health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                     state:
 *                       type: integer
 *                     host:
 *                       type: string
 *                     name:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: Account created — verification email sent
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful — returns token and user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: 2FA required — use POST /auth/2fa/verify with the challenge token
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Invalidate the current session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email address with the code sent on registration
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired code
 */

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Re-send the email verification code
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification code sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/password/forgot:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password-reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (if account exists)
 */

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using the emailed token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /auth/password/change/request:
 *   post:
 *     tags: [Auth]
 *     summary: Request an email code to confirm a password change
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Confirmation code sent to registered email
 */

/**
 * @swagger
 * /auth/password/change:
 *   post:
 *     tags: [Auth]
 *     summary: Change password using the confirmation code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, newPassword]
 *             properties:
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid or expired code
 */

// ─── 2FA ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     tags: [Auth]
 *     summary: Generate a TOTP secret and QR code to set up 2FA
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TOTP secret and otpauth URL returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                 otpauthUrl:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *                   description: Base64 QR code image
 */

/**
 * @swagger
 * /auth/2fa/enable:
 *   post:
 *     tags: [Auth]
 *     summary: Enable 2FA by confirming with a valid TOTP code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 */

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Second step of login — supply TOTP code with the challenge token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [challengeToken, totpToken]
 *             properties:
 *               challengeToken:
 *                 type: string
 *                 description: Short-lived JWT returned by POST /auth/login when 2FA is required
 *               totpToken:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Authentication complete — full JWT returned
 *       401:
 *         description: Invalid TOTP code or challenge token
 */

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     tags: [Auth]
 *     summary: Disable 2FA for the current account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled
 */

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Users]
 *     summary: Create a user (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     tags: [Users]
 *     summary: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Updated user
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */

// ─── Courses ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /courses/search:
 *   get:
 *     tags: [Courses]
 *     summary: Full-text course search with filters
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Matching courses
 */

/**
 * @swagger
 * /courses/search/facets:
 *   get:
 *     tags: [Courses]
 *     summary: Available filter facets (categories, price ranges)
 *     security: []
 *     responses:
 *       200:
 *         description: Facet options for the search UI
 */

/**
 * @swagger
 * /courses/search/analytics:
 *   get:
 *     tags: [Courses]
 *     summary: Search query analytics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated search term statistics
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: List all published courses
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated course list
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course (instructor / admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Course created
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get a course by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *   put:
 *     tags: [Courses]
 *     summary: Update a course (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Updated course
 *       403:
 *         description: Not the course owner
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a course (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 */

// ─── Modules ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /modules:
 *   get:
 *     tags: [Modules]
 *     summary: List all modules (optionally filter by courseId)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Module list
 *   post:
 *     tags: [Modules]
 *     summary: Create a module
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title, order]
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module created
 */

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     tags: [Modules]
 *     summary: Get a module by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *   put:
 *     tags: [Modules]
 *     summary: Update a module (creator or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Updated module
 *   delete:
 *     tags: [Modules]
 *     summary: Delete a module (creator or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module deleted
 */

// ─── Lessons ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /lessons:
 *   get:
 *     tags: [Lessons]
 *     summary: List all lessons (filter by moduleId)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lesson list
 *   post:
 *     tags: [Lessons]
 *     summary: Create a lesson
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moduleId, title, type, order]
 *             properties:
 *               moduleId:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, text, quiz]
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Lesson created
 */

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     tags: [Lessons]
 *     summary: Get a lesson by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *   put:
 *     tags: [Lessons]
 *     summary: Update a lesson (creator or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       200:
 *         description: Updated lesson
 *   delete:
 *     tags: [Lessons]
 *     summary: Delete a lesson (creator or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted
 */

// ─── Reviews ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews (filter by courseId)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Review list
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, rating]
 *             properties:
 *               courseId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted
 */

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get a review by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *   put:
 *     tags: [Reviews]
 *     summary: Update a review (author only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated review
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (author or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */

// ─── Enrollments ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: List enrollments for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Enrollment list
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll in a course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrolled successfully
 */

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get an enrollment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *   put:
 *     tags: [Enrollments]
 *     summary: Update enrollment status (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, dropped]
 *     responses:
 *       200:
 *         description: Updated enrollment
 *   delete:
 *     tags: [Enrollments]
 *     summary: Unenroll (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment removed
 */

// ─── Purchases ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags: [Purchases]
 *     summary: List purchases for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Purchase list
 *   post:
 *     tags: [Purchases]
 *     summary: Create a purchase record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Purchase created
 */

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Get a purchase by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Purchase'
 *   put:
 *     tags: [Purchases]
 *     summary: Update a purchase (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, refunded]
 *     responses:
 *       200:
 *         description: Updated purchase
 *   delete:
 *     tags: [Purchases]
 *     summary: Delete a purchase record (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase deleted
 */

// ─── Progress ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /progress:
 *   get:
 *     tags: [Progress]
 *     summary: List progress records for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Progress records
 *   post:
 *     tags: [Progress]
 *     summary: Mark a lesson as completed
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId]
 *             properties:
 *               lessonId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Progress recorded
 */

/**
 * @swagger
 * /progress/{id}:
 *   get:
 *     tags: [Progress]
 *     summary: Get a progress record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Progress'
 *   put:
 *     tags: [Progress]
 *     summary: Update a progress record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Progress'
 *     responses:
 *       200:
 *         description: Updated progress
 *   delete:
 *     tags: [Progress]
 *     summary: Delete a progress record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progress record deleted
 */

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /dashboard/me:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get personalised dashboard stats for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data (enrollments, progress, certificates, etc.)
 */

// ─── Certificates ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /certificates/verify/{certificateId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Publicly verify a certificate by its ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *         example: CERT-2024-ABC123
 *     responses:
 *       200:
 *         description: Certificate is valid
 *       404:
 *         description: Certificate not found or revoked
 */

/**
 * @swagger
 * /certificates/qr/{certificateId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get the QR code image for a certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code PNG or data URL
 */

/**
 * @swagger
 * /certificates/logs/{certificateId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get issuance and revocation audit logs (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log entries
 */

/**
 * @swagger
 * /certificates/share/linkedin/{certificateId}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get a LinkedIn share URL for a certificate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: LinkedIn share link
 */

/**
 * @swagger
 * /certificates:
 *   get:
 *     tags: [Certificates]
 *     summary: List certificates for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate list
 *   post:
 *     tags: [Certificates]
 *     summary: Issue a certificate upon course completion
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Certificate issued
 */

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     tags: [Certificates]
 *     summary: Get a certificate by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *   put:
 *     tags: [Certificates]
 *     summary: Update a certificate (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificate'
 *     responses:
 *       200:
 *         description: Updated certificate
 *   delete:
 *     tags: [Certificates]
 *     summary: Delete a certificate (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate deleted
 */

/**
 * @swagger
 * /certificates/{certificateId}/revoke:
 *   post:
 *     tags: [Certificates]
 *     summary: Revoke a certificate (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificate revoked
 */

// ─── Support Tickets ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /support-tickets:
 *   get:
 *     tags: [Support Tickets]
 *     summary: List support tickets
 *     security: []
 *     responses:
 *       200:
 *         description: Ticket list
 *   post:
 *     tags: [Support Tickets]
 *     summary: Submit a new support ticket (public)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, message]
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Ticket submitted
 */

/**
 * @swagger
 * /support-tickets/{id}:
 *   get:
 *     tags: [Support Tickets]
 *     summary: Get a support ticket by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *   put:
 *     tags: [Support Tickets]
 *     summary: Update a ticket (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicket'
 *     responses:
 *       200:
 *         description: Updated ticket
 *   delete:
 *     tags: [Support Tickets]
 *     summary: Delete a ticket (owner or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted
 */

/**
 * @swagger
 * /support-tickets/{id}/messages:
 *   get:
 *     tags: [Support Tickets]
 *     summary: List messages on a support ticket
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message list
 *   post:
 *     tags: [Support Tickets]
 *     summary: Add a message to a support ticket
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added
 */

// ─── Community ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /community/threads:
 *   get:
 *     tags: [Community]
 *     summary: List discussion threads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thread list
 *   post:
 *     tags: [Community]
 *     summary: Create a new thread
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thread created
 */

/**
 * @swagger
 * /community/threads/{threadId}:
 *   get:
 *     tags: [Community]
 *     summary: Get a thread with its comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thread with comments
 */

/**
 * @swagger
 * /community/threads/{threadId}/comments:
 *   post:
 *     tags: [Community]
 *     summary: Add a comment to a thread
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */

/**
 * @swagger
 * /community/threads/{threadId}/upvote:
 *   post:
 *     tags: [Community]
 *     summary: Toggle upvote on a thread
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvote toggled
 */

/**
 * @swagger
 * /community/comments/{commentId}/upvote:
 *   post:
 *     tags: [Community]
 *     summary: Toggle upvote on a comment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upvote toggled
 */

/**
 * @swagger
 * /community/comments/{commentId}/accept:
 *   post:
 *     tags: [Community]
 *     summary: Mark a comment as the accepted answer
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Answer accepted
 */

/**
 * @swagger
 * /community/moderation/queue:
 *   get:
 *     tags: [Community]
 *     summary: Get the moderation queue (admin or instructor)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flagged threads and comments pending review
 *       403:
 *         description: Requires admin or instructor role
 */

/**
 * @swagger
 * /community/moderation/threads/{threadId}:
 *   post:
 *     tags: [Community]
 *     summary: Moderate a thread — approve, reject, or flag (admin or instructor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, flag]
 *     responses:
 *       200:
 *         description: Moderation action applied
 */

/**
 * @swagger
 * /community/moderation/comments/{commentId}:
 *   post:
 *     tags: [Community]
 *     summary: Moderate a comment (admin or instructor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, flag]
 *     responses:
 *       200:
 *         description: Moderation action applied
 */

// ─── AI ───────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /ai/course-suggestions:
 *   post:
 *     tags: [AI]
 *     summary: Get AI-generated course suggestions based on a topic or goal
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: I want to learn machine learning from scratch
 *     responses:
 *       200:
 *         description: Suggested courses and learning path
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /ai/generate-quiz:
 *   post:
 *     tags: [AI]
 *     summary: Generate a quiz for a lesson using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId]
 *             properties:
 *               lessonId:
 *                 type: string
 *               questionCount:
 *                 type: integer
 *                 default: 5
 *     responses:
 *       200:
 *         description: Generated quiz questions
 *       429:
 *         description: Rate limit exceeded
 */

// ─── Assessments ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /assessments/lessons/{lessonId}/attempts:
 *   get:
 *     tags: [Assessments]
 *     summary: List quiz attempts for a lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt history for this lesson
 *   post:
 *     tags: [Assessments]
 *     summary: Submit a quiz attempt for a lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attempt recorded — returns score and feedback
 */

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /admin/reports:
 *   post:
 *     tags: [Admin]
 *     summary: Submit an abuse report (any authenticated user)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetId, targetType, reason]
 *             properties:
 *               targetId:
 *                 type: string
 *               targetType:
 *                 type: string
 *                 enum: [thread, comment, course, user]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 *   get:
 *     tags: [Admin]
 *     summary: List all abuse reports (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report list
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Platform overview stats — users, courses, revenue, tickets (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview metrics
 *       403:
 *         description: Admin role required
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users with admin details (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: User list with admin info
 */

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     tags: [Admin]
 *     summary: List all courses with admin details (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Course list with admin info
 */

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List platform audit logs (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Audit log entries
 */

/**
 * @swagger
 * /admin/support-tickets:
 *   get:
 *     tags: [Admin]
 *     summary: List all support tickets (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All support tickets
 */

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Change a user's role (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: Role updated
 */

/**
 * @swagger
 * /admin/users/{userId}/soft-delete:
 *   post:
 *     tags: [Admin]
 *     summary: Soft-delete a user account (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User soft-deleted
 */

/**
 * @swagger
 * /admin/users/{userId}/restore:
 *   post:
 *     tags: [Admin]
 *     summary: Restore a soft-deleted user account (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored
 */

/**
 * @swagger
 * /admin/courses/{courseId}/approve:
 *   post:
 *     tags: [Admin]
 *     summary: Approve a course for publication (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course approved
 */

/**
 * @swagger
 * /admin/courses/{courseId}/reject:
 *   post:
 *     tags: [Admin]
 *     summary: Reject a course submission (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course rejected
 */

/**
 * @swagger
 * /admin/courses/{courseId}/soft-delete:
 *   post:
 *     tags: [Admin]
 *     summary: Soft-delete a course (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course soft-deleted
 */

/**
 * @swagger
 * /admin/courses/{courseId}/restore:
 *   post:
 *     tags: [Admin]
 *     summary: Restore a soft-deleted course (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course restored
 */

/**
 * @swagger
 * /admin/reports/{reportId}:
 *   patch:
 *     tags: [Admin]
 *     summary: Resolve an abuse report (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution]
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [dismissed, actioned]
 *     responses:
 *       200:
 *         description: Report resolved
 */

/**
 * @swagger
 * /admin/support-tickets/{ticketId}/reply:
 *   post:
 *     tags: [Admin]
 *     summary: Reply to a support ticket (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply sent
 */

/**
 * @swagger
 * /admin/support-tickets/{ticketId}/messages:
 *   post:
 *     tags: [Admin]
 *     summary: Add a chat message to a support ticket (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message added
 */

/**
 * @swagger
 * /admin/support-tickets/{ticketId}/resolve:
 *   post:
 *     tags: [Admin]
 *     summary: Mark a support ticket as resolved (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket resolved
 */
