import bcrypt from "bcrypt";
import User from "../models/User.js";
import { create, findById } from "../data/store.js";
import { ApiError } from "../utils/ApiError.js";
import { signSessionToken, signChallengeToken } from "../utils/tokens.js";
import { sendPasswordCodeEmail, sendVerificationEmail } from "../utils/mailer.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validatePasswordValue(password) {
  if (String(password || "").length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (new TextEncoder().encode(String(password)).length > 72) {
    throw new ApiError(400, "Password cannot exceed 72 bytes");
  }
}

async function sendPasswordCode(user, fieldPrefix, purpose) {
  const code = generateCode();
  const hashedCode = await bcrypt.hash(code, 10);
  await User.findByIdAndUpdate(user._id, {
    [`${fieldPrefix}Code`]: hashedCode,
    [`${fieldPrefix}CodeExpires`]: new Date(Date.now() + 15 * 60 * 1000),
  });
  await sendPasswordCodeEmail(user.email, code, purpose);
}

async function verifyPasswordCode(user, code, fieldPrefix) {
  const codeField = `${fieldPrefix}Code`;
  const expiresField = `${fieldPrefix}CodeExpires`;

  if (!user[codeField] || !user[expiresField]) {
    throw new ApiError(400, "No verification code found. Please request a new one.");
  }

  if (new Date() > user[expiresField]) {
    throw new ApiError(400, "Verification code has expired. Please request a new one.");
  }

  const isMatch = await bcrypt.compare(String(code || "").trim(), user[codeField]);
  if (!isMatch) {
    throw new ApiError(400, "Invalid verification code");
  }
}

export async function register(req, res) {
  const { name, email, password, role = "student" } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, "name, email, and password are required");
  }

  if (!EMAIL_REGEX.test(String(email))) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (new TextEncoder().encode(String(password)).length > 72) {
    throw new ApiError(400, "Password cannot exceed 72 bytes");
  }

  // Check for duplicate email before hashing (fast short-circuit)
  const existing = await User.findOne({
    email: String(email).toLowerCase(),
  });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const SELF_ASSIGNABLE_ROLES = ["student", "instructor"];
  const safeRole = SELF_ASSIGNABLE_ROLES.includes(role) ? role : "student";

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hashedCode = await bcrypt.hash(code, 10);

  await create("users", {
    name,
    email: String(email).toLowerCase(),
    password,
    role: safeRole,
    phone: "",
    bio: "",
    verified: false,
    verificationCode: hashedCode,
    verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
  });

  await sendVerificationEmail(String(email).toLowerCase(), code);

  res.status(201).json({
    success: true,
    emailVerificationRequired: true,
    message: "Account created. Please check your email for a verification code.",
    email: String(email).toLowerCase(),
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  if (!EMAIL_REGEX.test(String(email))) {
    throw new ApiError(401, "Invalid email or password");
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
  if (user.isDeleted) {
    throw new ApiError(403, "This account has been disabled by an administrator.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.verified === false) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashedCode = await bcrypt.hash(code, 10);
    await User.findByIdAndUpdate(user._id, {
      verificationCode: hashedCode,
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
    });
    await sendVerificationEmail(user.email, code);
    res.status(200).json({
      success: true,
      emailVerificationRequired: true,
      message: "Please verify your email before logging in. A new code has been sent.",
      email: user.email,
    });
    return;
  }

  // Strip the password before sending back to the client
  const { password: _pw, twoFactorSecret: _2fa, ...safeUser } = user;
  void _pw;
  void _2fa;

  // Step 1 of a 2FA login: issue a short-lived challenge token only.
  // The client exchanges this for a real session token at /auth/2fa/verify.
  if (user.twoFactorEnabled) {
    const challengeToken = signChallengeToken(String(user._id));
    res.status(200).json({
      success: true,
      twoFactorRequired: true,
      message: "Two-factor verification required.",
      challengeToken,
    });
    return;
  }

  const token = signSessionToken(String(user._id));

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: { ...safeUser, id: String(user._id) },
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

export async function requestPasswordReset(req, res) {
  const { email } = req.body || {};
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: String(email).toLowerCase() });

  // Keep the response neutral so this endpoint does not reveal accounts.
  if (user) {
    await sendPasswordCode(user, "passwordReset", "reset");
  }

  res.status(200).json({
    success: true,
    message: "If an account exists for that email, a reset code has been sent.",
  });
}

export async function resetPassword(req, res) {
  const { email, code, password } = req.body || {};
  if (!email || !code || !password) {
    throw new ApiError(400, "Email, code, and new password are required");
  }
  validatePasswordValue(password);

  const user = await User.findOne({ email: String(email).toLowerCase() })
    .select("+passwordResetCode +passwordResetCodeExpires +password");
  if (!user) throw new ApiError(400, "Invalid reset request");

  await verifyPasswordCode(user, code, "passwordReset");

  user.password = password;
  user.verified = true;
  user.passwordResetCode = "";
  user.passwordResetCodeExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
}

export async function requestPasswordChange(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  await sendPasswordCode(user, "passwordChange", "change");

  res.status(200).json({
    success: true,
    message: "Password change verification code sent.",
  });
}

export async function changePassword(req, res) {
  const { code, password } = req.body || {};
  if (!code || !password) {
    throw new ApiError(400, "Verification code and new password are required");
  }
  validatePasswordValue(password);

  const user = await User.findById(req.user.id)
    .select("+passwordChangeCode +passwordChangeCodeExpires +password");
  if (!user) throw new ApiError(404, "User not found");

  await verifyPasswordCode(user, code, "passwordChange");

  user.password = password;
  user.passwordChangeCode = "";
  user.passwordChangeCodeExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
}
