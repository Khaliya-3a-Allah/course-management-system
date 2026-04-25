import bcrypt from "bcrypt";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signSessionToken } from "../utils/tokens.js";
import { sendVerificationEmail } from "../utils/mailer.js";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendCode(req, res) {
  const { email } = req.body || {};
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: String(email).toLowerCase() })
    .select("+verificationCode +verificationCodeExpires");

  if (!user) throw new ApiError(404, "No account found with that email");
  if (user.verified) throw new ApiError(400, "This account is already verified");

  // Prevent spamming — only resend if last code is older than 1 minute
  if (user.verificationCodeExpires) {
    const remaining = user.verificationCodeExpires - Date.now();
    const cooldown = 14 * 60 * 1000; // 1 minute into the 15-min window
    if (remaining > cooldown) {
      throw new ApiError(429, "Please wait before requesting a new code");
    }
  }

  const code = generateCode();
  const hashed = await bcrypt.hash(code, 10);

  await User.findByIdAndUpdate(user._id, {
    verificationCode: hashed,
    verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
  });

  await sendVerificationEmail(user.email, code);

  res.status(200).json({ success: true, message: "Verification code sent" });
}

export async function verifyCode(req, res) {
  const { email, code } = req.body || {};
  if (!email || !code) throw new ApiError(400, "Email and code are required");

  const user = await User.findOne({ email: String(email).toLowerCase() })
    .select("+verificationCode +verificationCodeExpires +password");

  if (!user) throw new ApiError(404, "No account found with that email");
  if (user.verified) throw new ApiError(400, "This account is already verified");

  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new ApiError(400, "No verification code found. Please request a new one");
  }

  if (new Date() > user.verificationCodeExpires) {
    throw new ApiError(400, "Verification code has expired. Please request a new one");
  }

  const isMatch = await bcrypt.compare(String(code).trim(), user.verificationCode);
  if (!isMatch) throw new ApiError(400, "Invalid verification code");

  await User.findByIdAndUpdate(user._id, {
    verified: true,
    verificationCode: "",
    verificationCodeExpires: null,
  });

  const freshUser = await User.findById(user._id).lean({ virtuals: true });
  const { password: _pw, twoFactorSecret: _2fa, verificationCode: _vc, ...safeUser } = freshUser;
  void _pw; void _2fa; void _vc;

  const token = signSessionToken(String(user._id));

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    token,
    data: { ...safeUser, id: String(user._id) },
  });
}
