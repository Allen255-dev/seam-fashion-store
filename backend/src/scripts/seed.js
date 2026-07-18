import "dotenv/config";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

const products = [
  /* ─── Outerwear ──────────────────────────────────────────────────────── */
  {
    name: "Wool Overcoat",
    slug: "wool-overcoat",
    brand: "Norrland",
    description:
      "A tailored double-breasted overcoat cut from heavyweight Italian wool. Notched lapels, welt pockets, full silk lining. Built for cold-weather layering without the bulk.",
    category: "outerwear",
    gender: "unisex",
    priceCents: 42000,
    compareAtPriceCents: 52000,
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80"
    ],
    variants: [
      { size: "S",  color: "Charcoal", sku: "NOR-WOC-S-CHR",  stock: 8  },
      { size: "M",  color: "Charcoal", sku: "NOR-WOC-M-CHR",  stock: 12 },
      { size: "L",  color: "Charcoal", sku: "NOR-WOC-L-CHR",  stock: 6  },
      { size: "M",  color: "Camel",    sku: "NOR-WOC-M-CML",  stock: 5  },
    ],
    materials: ["90% wool", "10% nylon"],
    tags: ["coat", "winter", "tailored"],
    isFeatured: true,
    rating: 4.7,
    reviewCount: 132,
  },
  {
    name: "Waxed Cotton Field Jacket",
    slug: "waxed-cotton-field-jacket",
    brand: "Norrland",
    description:
      "A four-pocket field jacket in re-waxed British cotton canvas. Water-repellent, wind-resistant, and breaks in beautifully with wear. Corduroy collar, brass press-studs.",
    category: "outerwear",
    gender: "unisex",
    priceCents: 36500,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
      "https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80"
    ],
    variants: [
      { size: "S", color: "Dark Olive",   sku: "NOR-WCF-S-OLV",  stock: 7  },
      { size: "M", color: "Dark Olive",   sku: "NOR-WCF-M-OLV",  stock: 14 },
      { size: "L", color: "Dark Olive",   sku: "NOR-WCF-L-OLV",  stock: 9  },
      { size: "M", color: "Tan",          sku: "NOR-WCF-M-TAN",  stock: 6  },
    ],
    materials: ["100% waxed cotton canvas", "corduroy trim"],
    tags: ["jacket", "outerwear", "waxed", "workwear"],
    isFeatured: true,
    rating: 4.8,
    reviewCount: 74,
  },

  /* ─── Knitwear ───────────────────────────────────────────────────────── */
  {
    name: "Merino Crewneck Sweater",
    slug: "merino-crewneck-sweater",
    brand: "Norrland",
    description:
      "Fine-gauge merino wool crewneck with a clean, uncluttered silhouette. Breathable enough for layering, warm enough alone. Ribbed cuffs and hem for structure.",
    category: "knitwear",
    gender: "unisex",
    priceCents: 12800,
    images: [
      "https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=800&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"
    ],
    variants: [
      { size: "S", color: "Oatmeal", sku: "NOR-MCS-S-OAT", stock: 15 },
      { size: "M", color: "Oatmeal", sku: "NOR-MCS-M-OAT", stock: 20 },
      { size: "L", color: "Oatmeal", sku: "NOR-MCS-L-OAT", stock: 10 },
      { size: "M", color: "Forest",  sku: "NOR-MCS-M-FOR", stock: 9  },
    ],
    materials: ["100% merino wool"],
    tags: ["sweater", "knitwear", "layering"],
    isFeatured: true,
    rating: 4.6,
    reviewCount: 88,
  },
  {
    name: "Chunky Rib Turtleneck",
    slug: "chunky-rib-turtleneck",
    brand: "Norrland",
    description:
      "Heavy-gauge pure lambswool turtleneck knitted in a bold 2×2 rib. The neck folds once for a clean roll, twice for full coverage. Relaxed fit, mid-thigh length.",
    category: "knitwear",
    gender: "unisex",
    priceCents: 16500,
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80",
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Ecru",      sku: "NOR-CRT-XS-ECR", stock: 6  },
      { size: "S",  color: "Ecru",      sku: "NOR-CRT-S-ECR",  stock: 12 },
      { size: "M",  color: "Ecru",      sku: "NOR-CRT-M-ECR",  stock: 10 },
      { size: "M",  color: "Charcoal",  sku: "NOR-CRT-M-CHR",  stock: 8  },
      { size: "L",  color: "Charcoal",  sku: "NOR-CRT-L-CHR",  stock: 5  },
    ],
    materials: ["100% lambswool"],
    tags: ["sweater", "turtleneck", "winter"],
    isFeatured: false,
    rating: 4.9,
    reviewCount: 56,
  },

  /* ─── Bottoms ────────────────────────────────────────────────────────── */
  {
    name: "Selvedge Straight Jeans",
    slug: "selvedge-straight-jeans",
    brand: "Kiln & Co.",
    description:
      "Rigid selvedge denim in a clean straight-leg cut that softens and fades with wear. Made on vintage shuttle looms in Kojima. Single-stitch details, tonal red ID.",
    category: "bottoms",
    gender: "mens",
    priceCents: 18500,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
      "https://images.unsplash.com/photo-1542272604-780829cb72a4?w=800&q=80"
    ],
    variants: [
      { size: "30", color: "Indigo", sku: "KLN-SSJ-30-IND", stock: 10 },
      { size: "32", color: "Indigo", sku: "KLN-SSJ-32-IND", stock: 18 },
      { size: "34", color: "Indigo", sku: "KLN-SSJ-34-IND", stock: 14 },
      { size: "36", color: "Indigo", sku: "KLN-SSJ-36-IND", stock: 7  },
    ],
    materials: ["100% cotton selvedge denim"],
    tags: ["denim", "jeans", "raw denim"],
    isFeatured: true,
    rating: 4.8,
    reviewCount: 210,
  },
  {
    name: "Pleated Wide-Leg Trousers",
    slug: "pleated-wide-leg-trousers",
    brand: "Aveline",
    description:
      "High-rise wide-leg trousers with a double front pleat and fluid drape. Side pockets, concealed zip, flat back waistband. Cut from a viscose-linen blend that resists creasing.",
    category: "bottoms",
    gender: "womens",
    priceCents: 15500,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Black", sku: "AVL-PWT-XS-BLK", stock: 9  },
      { size: "S",  color: "Black", sku: "AVL-PWT-S-BLK",  stock: 14 },
      { size: "M",  color: "Black", sku: "AVL-PWT-M-BLK",  stock: 11 },
      { size: "S",  color: "Ivory", sku: "AVL-PWT-S-IVY",  stock: 7  },
    ],
    materials: ["78% viscose", "22% linen"],
    tags: ["trousers", "tailored", "workwear"],
    rating: 4.6,
    reviewCount: 47,
  },

  /* ─── Tops / Dresses ─────────────────────────────────────────────────── */
  {
    name: "Silk Slip Dress",
    slug: "silk-slip-dress",
    brand: "Aveline",
    description:
      "Bias-cut slip dress that falls close to the body and moves with it. Finished with a hand-rolled hem, adjustable straps, and a small side split at the hem.",
    category: "dresses",
    gender: "womens",
    priceCents: 24500,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?w=800&q=80"
    ],
    variants: [
      { size: "XS", color: "Champagne", sku: "AVL-SSD-XS-CHM", stock: 6  },
      { size: "S",  color: "Champagne", sku: "AVL-SSD-S-CHM",  stock: 11 },
      { size: "M",  color: "Champagne", sku: "AVL-SSD-M-CHM",  stock: 9  },
      { size: "S",  color: "Black",     sku: "AVL-SSD-S-BLK",  stock: 13 },
    ],
    materials: ["100% mulberry silk"],
    tags: ["dress", "silk", "eveningwear"],
    isFeatured: true,
    rating: 4.9,
    reviewCount: 64,
  },
  {
    name: "Poplin Shirt",
    slug: "poplin-shirt",
    brand: "Kiln & Co.",
    description:
      "A crisp cotton poplin shirt with a slightly relaxed collar and a box pleat at the back yoke. Single-button cuff. Works equally well tucked, half-tucked, or left out.",
    category: "tops",
    gender: "mens",
    priceCents: 9800,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=800&q=80"
    ],
    variants: [
      { size: "S", color: "White",    sku: "KLN-PPS-S-WHT", stock: 20 },
      { size: "M", color: "White",    sku: "KLN-PPS-M-WHT", stock: 25 },
      { size: "L", color: "White",    sku: "KLN-PPS-L-WHT", stock: 16 },
      { size: "M", color: "Sky Blue", sku: "KLN-PPS-M-SKY", stock: 12 },
    ],
    materials: ["100% cotton poplin"],
    tags: ["shirt", "office", "casual"],
    rating: 4.4,
    reviewCount: 56,
  },

  /* ─── Footwear ───────────────────────────────────────────────────────── */
  {
    name: "Suede Chelsea Boots",
    slug: "suede-chelsea-boots",
    brand: "Fenwright",
    description:
      "Elastic-sided Chelsea boots in soft suede upper with a leather sole and stacked heel. Goodyear welted — resole them when the time comes. Develops a beautiful patina.",
    category: "footwear",
    gender: "unisex",
    priceCents: 32000,
    images: [
      "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80"
    ],
    variants: [
      { size: "8",  color: "Taupe", sku: "FEN-SCB-8-TPE",  stock: 7  },
      { size: "9",  color: "Taupe", sku: "FEN-SCB-9-TPE",  stock: 10 },
      { size: "10", color: "Taupe", sku: "FEN-SCB-10-TPE", stock: 8  },
      { size: "9",  color: "Black", sku: "FEN-SCB-9-BLK",  stock: 6  },
    ],
    materials: ["suede upper", "leather sole"],
    tags: ["boots", "footwear", "suede"],
    rating: 4.5,
    reviewCount: 41,
  },
  {
    name: "Derby Leather Shoes",
    slug: "derby-leather-shoes",
    brand: "Fenwright",
    description:
      "Open-laced Derby shoes in full-grain calf leather. Brogue detailing on the toe cap, leather lining, and a leather-and-rubber half-sole. Blake-stitched for a clean profile.",
    category: "footwear",
    gender: "mens",
    priceCents: 28500,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80"
    ],
    variants: [
      { size: "8",  color: "Tan",   sku: "FEN-DLS-8-TAN",  stock: 5  },
      { size: "9",  color: "Tan",   sku: "FEN-DLS-9-TAN",  stock: 8  },
      { size: "10", color: "Tan",   sku: "FEN-DLS-10-TAN", stock: 6  },
      { size: "9",  color: "Black", sku: "FEN-DLS-9-BLK",  stock: 9  },
    ],
    materials: ["full-grain calf leather", "leather lining", "leather-rubber sole"],
    tags: ["shoes", "leather", "formal", "derby"],
    isFeatured: false,
    rating: 4.7,
    reviewCount: 38,
  },

  /* ─── Accessories ────────────────────────────────────────────────────── */
  {
    name: "Cashmere Scarf",
    slug: "cashmere-scarf",
    brand: "Norrland",
    description:
      "An oversized cashmere scarf, brushed for extra softness, finished with a hand-fringed edge. 200 cm long — enough to wrap twice. Made in Inner Mongolia.",
    category: "accessories",
    gender: "unisex",
    priceCents: 8900,
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
      "https://images.unsplash.com/photo-1605336043831-29cf97c369fb?w=800&q=80"
    ],
    variants: [
      { size: "OS", color: "Camel",    sku: "NOR-CSC-OS-CML", stock: 30 },
      { size: "OS", color: "Charcoal", sku: "NOR-CSC-OS-CHR", stock: 25 },
    ],
    materials: ["100% cashmere"],
    tags: ["scarf", "accessory", "winter"],
    rating: 4.7,
    reviewCount: 29,
  },
  {
    name: "Leather Card Holder",
    slug: "leather-card-holder",
    brand: "Kiln & Co.",
    description:
      "A slim vegetable-tanned leather card holder with three card slots and a central note pocket. Develops a rich patina — no two age the same way. Branded single-pin stitch.",
    category: "accessories",
    gender: "unisex",
    priceCents: 4500,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
      "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=800&q=80"
    ],
    variants: [
      { size: "OS", color: "Natural Tan", sku: "KLN-LCH-OS-TAN", stock: 40 },
      { size: "OS", color: "Dark Brown",  sku: "KLN-LCH-OS-DBR", stock: 35 },
      { size: "OS", color: "Black",       sku: "KLN-LCH-OS-BLK", stock: 28 },
    ],
    materials: ["100% vegetable-tanned cowhide"],
    tags: ["wallet", "leather", "accessory", "gift"],
    isFeatured: false,
    rating: 4.8,
    reviewCount: 112,
  },
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`[seed] inserted ${products.length} products`);

  const adminEmail = "admin@seam.test";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({ name: "Store Admin", email: adminEmail, role: "admin" });
    await admin.setPassword("ChangeMe123!");
    await admin.save();
    console.log(`[seed] created admin user: ${adminEmail} / ChangeMe123!`);
  }

  await mongoose.disconnect();
  console.log("[seed] done");
}

seed().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
