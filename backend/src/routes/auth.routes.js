import { Router } from "express";
import crypto from "crypto";
import validator from "validator";
import User from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const user = new User({ name: name.trim(), email });
    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user: user.toSafeObject(), token });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const token = signToken(user);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user: user.toSafeObject(), token });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// --- Password reset (email delivery not wired up — link is logged to the
// server console. Plug in a real email provider, e.g. Resend or SendGrid,
// by sending `resetUrl` in that provider's API call instead of console.log.) ---

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way whether or not the account exists,
    // so this endpoint can't be used to discover registered emails.
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
        user.email
      )}`;

      const message = `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`;
      const htmlMessage = `<p>You requested a password reset.</p><p>Please click this link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`;

      await sendEmail({
        email: user.email,
        subject: "SEAM Store - Password Reset",
        message,
        htmlMessage,
      });

      console.log(`\n[password reset] Link for ${user.email}:\n${resetUrl}\n`);
    }

    res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "That reset link is invalid or has expired" });
    }

    await user.setPassword(newPassword);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ ok: true, message: "Password updated. You can now sign in." });
  } catch (err) {
    next(err);
  }
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const valid = await req.user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await req.user.setPassword(newPassword);
    await req.user.save();

    res.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
