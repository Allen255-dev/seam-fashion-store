import { Router } from "express";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/products?search=&category=&gender=&minPrice=&maxPrice=&sort=&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const {
      search,
      category,
      gender,
      brand,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 24,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (minPrice || maxPrice) {
      filter.priceCents = {};
      if (minPrice) filter.priceCents.$gte = Number(minPrice) * 100;
      if (maxPrice) filter.priceCents.$lte = Number(maxPrice) * 100;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { priceCents: 1 },
      price_desc: { priceCents: -1 },
      rating: { rating: -1 },
    };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10)));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/suggestions", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ items: [] });

    const items = await Product.find(
      { isActive: true, $text: { $search: q } },
      { name: 1, slug: 1, brand: 1, images: 1, priceCents: 1 }
    ).limit(6);

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.get("/featured", async (req, res, next) => {
  try {
    const items = await Product.find({ isActive: true, isFeatured: true }).limit(8);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/related", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    }).limit(4);

    res.json({ items: related });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/reviews", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
});

router.post("/:slug/reviews", requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" });
    }

    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) {
      return res.status(409).json({ error: "You've already reviewed this product" });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });

    const allReviews = await Review.find({ product: product._id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = allReviews.length;
    await product.save();

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
});

// --- Admin CRUD ---

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
