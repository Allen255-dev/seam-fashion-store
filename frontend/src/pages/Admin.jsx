import { useEffect, useState } from "react";
import { api } from "../api/client";
import { formatPrice } from "../utils/format";

const STATUS_OPTIONS = ["pending_payment", "paid", "fulfilled", "cancelled", "refunded"];

function OrdersTab() {
  const [orders, setOrders] = useState(null);

  function load() {
    api.get("/orders/admin/all").then((data) => setOrders(data.orders));
  }

  useEffect(load, []);

  async function updateStatus(id, status) {
    await api.patch(`/orders/admin/${id}/status`, { status });
    load();
  }

  if (!orders) return <p className="text-ink/50">Loading…</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="border border-ink/10 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-ink/40">#{order._id.slice(-8)}</p>
            <p className="text-sm">
              {order.user ? `${order.user.name} — ${order.user.email}` : `Guest — ${order.guestEmail}`}
            </p>
            <p className="font-mono text-sm mt-1">{formatPrice(order.totalCents)}</p>
          </div>
          <select
            value={order.status}
            onChange={(e) => updateStatus(order._id, e.target.value)}
            className="border border-ink/20 bg-transparent px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
      {orders.length === 0 && <p className="text-ink/50">No orders yet.</p>}
    </div>
  );
}

const emptyProduct = {
  name: "",
  brand: "",
  description: "",
  category: "tops",
  gender: "unisex",
  priceCents: "",
  variantsRaw: "S,Black,SKU-001,10",
};

function ProductsTab() {
  const [products, setProducts] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    api.get("/products?limit=60").then((data) => setProducts(data.items));
  }

  useEffect(load, []);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  }

  async function uploadImages() {
    const token = localStorage.getItem("seam_token");
    const body = new FormData();
    imageFiles.forEach((file) => body.append("images", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Image upload failed");
    return data.urls;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");

    if (imageFiles.length === 0) {
      setError("Add at least one product photo");
      return;
    }

    setUploading(true);
    try {
      const imageUrls = await uploadImages();

      const variants = form.variantsRaw.split(";").map((line) => {
        const [size, color, sku, stock] = line.split(",").map((s) => s.trim());
        return { size, color, sku, stock: Number(stock) || 0 };
      });

      await api.post("/products", {
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        brand: form.brand,
        description: form.description,
        category: form.category,
        gender: form.gender,
        priceCents: Math.round(Number(form.priceCents) * 100),
        images: imageUrls,
        variants,
      });
      setForm(emptyProduct);
      setImageFiles([]);
      setPreviewUrls([]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeactivate(id) {
    await api.del(`/products/${id}`);
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="font-display text-xl mb-4">Add product</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="border border-ink/20 bg-transparent px-3 py-2 text-sm"
            >
              {["outerwear", "tops", "bottoms", "dresses", "knitwear", "footwear", "accessories"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="border border-ink/20 bg-transparent px-3 py-2 text-sm"
            >
              <option value="unisex">unisex</option>
              <option value="womens">womens</option>
              <option value="mens">mens</option>
            </select>
          </div>
          <input
            required
            type="number"
            step="0.01"
            placeholder="Price (USD)"
            value={form.priceCents}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm"
          />
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest mb-2 text-ink/50">
              Product photos
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileSelect}
              className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase file:tracking-widest"
            />
            {previewUrls.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previewUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-16 h-20 object-cover border border-ink/10"
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <textarea
              required
              value={form.variantsRaw}
              onChange={(e) => setForm((f) => ({ ...f, variantsRaw: e.target.value }))}
              className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm font-mono"
              rows={2}
            />
            <p className="text-xs text-ink/40 mt-1">
              One variant per line (separate lines with ;): size,color,sku,stock
            </p>
          </div>
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button
            disabled={uploading}
            className="w-full bg-ink text-paper py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Create product"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-xl mb-4">Catalog</h3>
        {!products ? (
          <p className="text-ink/50">Loading…</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p._id} className="flex items-center justify-between border border-ink/10 p-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-ink/50">{formatPrice(p.priceCents)} · {p.totalStock ?? 0} in stock</p>
                </div>
                <button
                  onClick={() => handleDeactivate(p._id)}
                  className="font-mono text-xs uppercase tracking-widest text-oxblood"
                >
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function load() {
    api.get("/coupons").then((data) => setCoupons(data.coupons));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/coupons", { code, type, value: Number(value) });
      setCode("");
      setValue("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(coupon) {
    await api.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="font-display text-xl mb-4">Create promo code</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            required
            placeholder="Code, e.g. WELCOME10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border border-ink/20 bg-transparent px-3 py-2 text-sm font-mono uppercase"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-ink/20 bg-transparent px-3 py-2 text-sm"
            >
              <option value="percent">Percent off</option>
              <option value="flat">Flat amount off (USD)</option>
            </select>
            <input
              required
              type="number"
              step="0.01"
              placeholder={type === "percent" ? "e.g. 10 for 10%" : "e.g. 15 for $15"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-ink/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button className="w-full bg-ink text-paper py-3 font-mono text-xs uppercase tracking-widest hover:bg-oxblood transition-colors">
            Create code
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-display text-xl mb-4">Active codes</h3>
        {!coupons ? (
          <p className="text-ink/50">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="text-ink/50">No promo codes yet.</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((c) => (
              <div key={c._id} className="flex items-center justify-between border border-ink/10 p-3">
                <div>
                  <p className="font-mono text-sm">{c.code}</p>
                  <p className="text-xs text-ink/50">
                    {c.type === "percent" ? `${c.value}% off` : `$${(c.value / 100).toFixed(2)} off`}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(c)}
                  className={`font-mono text-xs uppercase tracking-widest ${
                    c.isActive ? "text-sage" : "text-ink/40"
                  }`}
                >
                  {c.isActive ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Admin</h1>
      <div className="flex gap-2 mb-10 font-mono text-xs uppercase tracking-widest">
        {["orders", "products", "coupons"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 border ${tab === t ? "bg-ink text-paper border-ink" : "border-ink/20"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "orders" && <OrdersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "coupons" && <CouponsTab />}
    </div>
  );
}
