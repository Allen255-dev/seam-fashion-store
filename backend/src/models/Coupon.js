import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true, min: 0 }, // percent: 0-100, flat: cents
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

couponSchema.methods.computeDiscountCents = function (subtotalCents) {
  if (this.type === "percent") {
    return Math.round((subtotalCents * this.value) / 100);
  }
  return Math.min(this.value, subtotalCents);
};

export default mongoose.model("Coupon", couponSchema);
