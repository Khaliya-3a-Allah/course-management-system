import bcrypt from "bcrypt";
import User from "../models/User.js";
import { create, findById } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { signSessionToken, signChallengeToken } from "../utils/tokens.js";

export async function register(req, res) {
  const { name, email, password, role = "student" } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email, and password are required");
  }

  // Check for duplicate email before hashing (fast short-circuit)
  const existing = await User.findOne({
    email: String(email).toLowerCase(),
  });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  // Hash the password with bcrypt (cost factor 12 is a good balance for production)
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await create("users", {
    name,
    email: String(email).toLowerCase(),
    password: hashedPassword,
    role,
    phone: "",
    bio: "",
  });

  const token = signSessionToken(user.id);

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    token,
    data: user, // password is excluded by store.create (select: false + re-fetch)
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  // Use +password to override the select:false on the password field
  const user = await User.findOne({
    email: String(email).toLowerCase(),
  })
    .select("+password")
    .lean({ virtuals: true });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Strip the password before sending back to the client
  const { password: _pw, twoFactorSecret: _2fa, ...safeUser } = user;
  void _pw;
  void _2fa;

  // Step 1 of a 2FA login: issue a short-lived challenge token only.
  // The client exchanges this for a real session token at /auth/2fa/verify.
  if (user.twoFactorEnabled) {
    const challengeToken = signChallengeToken(user.id);
    res.status(200).json({
      success: true,
      twoFactorRequired: true,
      message: "Two-factor verification required.",
      challengeToken,
    });
    return;
  }

  const token = signSessionToken(user.id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: safeUser,
  });
}

export async function me(req, res) {
  // req.user is set by authenticateRequest middleware in auth.routes.js
  const user = await findById("users", req.user.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json({ success: true, data: user });
}

export async function logout(req, res) {
  // JWT is stateless — the client discards the token on logout.
  // If you add a token blocklist or refresh token table later, invalidate here.
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}
