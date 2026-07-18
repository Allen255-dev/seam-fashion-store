import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "outerwear",
        "tops",
        "bottoms",
        "dresses",
        "knitwear",
        "footwear",
        "accessories",
      ],
    },
    gender: {
      type: String,
      enum: ["womens", "mens", "unisex"],
      default: "unisex",
    },
    priceCents: { type: Number, required: true, min: 0 },
    compareAtPriceCents: { type: Number, min: 0 },
    currency: { type: String, default: "usd" },
    images: [{ type: String, required: true }],
    variants: { type: [variantSchema], default: [] },
    materials: [{ type: String }],
    tags: [{ type: String, index: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", description: "text", tags: "text" });

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
