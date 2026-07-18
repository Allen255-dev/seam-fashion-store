import { Router } from "express";
import Coupon from "../models/Coupon.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { code, type, value, expiresAt } = req.body;
    const coupon = await Coupon.create({ code, type, value, expiresAt });
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json({ coupon });
  } catch (err) {
    next(err);
  }
});

export default router;
