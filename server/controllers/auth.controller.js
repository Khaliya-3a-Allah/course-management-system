import { create, list } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";

export function register(req, res) {
  const { name, email, password, role = "student" } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email, and password are required");
  }

  const existing = list("users").find(
    (user) => user.email.toLowerCase() === String(email).toLowerCase()
  );

  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = create("users", {
    name,
    email: String(email).toLowerCase(),
    password,
    role,
    phone: "",
    bio: "",
    createdCourseIds: [],
    enrolledCourseIds: [],
    purchasedCourseIds: [],
    savedCourseIds: [],
    completedCourseIds: [],
    reviews: {},
  });

  const { password: _password, ...safeUser } = user;

  // Member 2 integration point: replace with JWT issue + secure cookie.
  res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: safeUser,
  });
}

export function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = list("users").find(
    (item) => item.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user || user.password !== password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { password: _password, ...safeUser } = user;

  // Member 2 integration point: return JWT access + refresh tokens.
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: safeUser,
  });
}

export function me(req, res) {
  // Member 2 integration point: derive user from JWT middleware (req.user).
  const fallbackUser = list("users")[0] || null;
  if (!fallbackUser) {
    throw new ApiError(404, "No users found");
  }

  const { password: _password, ...safeUser } = fallbackUser;
  res.status(200).json({ success: true, data: safeUser });
}

export function logout(req, res) {
  // Member 2 integration point: clear cookie / invalidate refresh token.
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}
