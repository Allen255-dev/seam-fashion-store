import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json({ items: user.wishlist });
  } catch (err) {
    next(err);
  }
});

router.post("/:productId", requireAuth, async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { wishlist: req.params.productId } }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:productId", requireAuth, async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
