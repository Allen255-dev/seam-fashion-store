import { Router } from "express";
import Order from "../models/Order.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!order.user.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not your order" });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// --- Admin ---

router.get("/admin/all", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.patch("/admin/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

export default router;
