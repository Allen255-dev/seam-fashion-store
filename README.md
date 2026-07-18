# SEAM — Fashion E-Commerce Store

A full-stack clothing storefront: React (Vite + Tailwind) frontend, Node/Express + MongoDB
backend, Stripe Checkout for payments. Built to be deployed, not just demoed.

## What's included

- Product catalog with search, autocomplete suggestions, category filters, sorting, pagination
- Size/color variants with per-variant stock tracking, multi-image gallery per product
- Email/password auth (JWT, httpOnly cookie + bearer token), password reset flow, change-password page
- Guest checkout (no account required) alongside full account checkout
- Cart (persisted in the browser) → Stripe Checkout → order creation
- Promo/discount codes at checkout (admin-managed)
- Stripe webhook that marks orders paid and decrements stock
- Order history for customers, guest orders tracked by email
- Product reviews (star rating + comment)
- Wishlist / saved items
- Admin dashboard: order status management, product creation with image upload from device, promo code management
- Dark mode toggle (persisted preference)
- Mobile navigation menu
- Subtle 3D depth touches — tilt-on-hover product cards, layered hero image, floating accent panels
- Custom 404 page

## What's NOT included (by design)

- Live hosting — you deploy this yourself
- Real Stripe keys — you provide your own (test mode to start)
- **Real email delivery** — password reset links and order confirmations currently print
  to the backend console instead of sending an email. Wire in a provider (Resend, SendGrid,
  Postmark, etc.) in `backend/src/routes/auth.routes.js` (`forgot-password` route) and
  `backend/src/routes/checkout.routes.js` (`stripeWebhookHandler`) where you see the
  `console.log(...)` calls marked with a comment.

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either local (`mongod`) or free-tier [MongoDB Atlas](https://www.mongodb.com/atlas)
- A [Stripe](https://dashboard.stripe.com/register) account (test mode is free, no card needed)

## 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:
- `MONGODB_URI` — your connection string
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `STRIPE_SECRET_KEY` — from https://dashboard.stripe.com/test/apikeys
- `STRIPE_WEBHOOK_SECRET` — see step 4 below
- `CLIENT_URL` — where the frontend runs (`http://localhost:5173` locally)

Seed sample products + an admin account:

```bash
npm run seed
```

This creates 8 sample products and an admin login: `admin@seam.test` / `ChangeMe123!`
(change this password immediately in any real deployment — sign in and use the
"Account settings" link in the mobile menu, or the `/account` page).

Uploaded product images are saved to `backend/uploads/` and served at `/uploads/...`.
That folder is created automatically the first time an image is uploaded.

Start the API:

```bash
npm run dev
```

Runs on `http://localhost:4000`.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend.

## 4. Stripe webhook (required for orders to mark as paid)

Payments won't mark an order "paid" without the webhook — Stripe calls your backend
after a successful checkout.

**Local development**, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:4000/api/checkout/webhook
```

It prints a `whsec_...` value — put that in your backend `.env` as `STRIPE_WEBHOOK_SECRET`.

**In production**, add a webhook endpoint in the Stripe Dashboard pointing to
`https://your-api-domain.com/api/checkout/webhook`, subscribed to the
`checkout.session.completed` event, and use the signing secret it gives you.

## 5. Test a purchase

Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.

## 6. Deployment notes

- **Backend**: works well on Render, Railway, or Fly.io. Set the same env vars there.
- **Frontend**: `npm run build` produces static files in `frontend/dist` — deploy to
  Vercel, Netlify, or Cloudflare Pages. Point it at your live API (update the Vite
  proxy or add a full API base URL for production).
- **Database**: MongoDB Atlas free tier is enough to start.
- Set `NODE_ENV=production` on the backend once deployed — this enables secure cookies
  and quieter logging.
- Go live in Stripe (swap `sk_test_...` for `sk_live_...`) only after you've tested the
  full flow in test mode.

## Project structure

```
backend/
  src/
    config/db.js          Mongo connection
    models/                User, Product, Order schemas
    routes/                auth, products, orders, checkout (Stripe)
    middleware/             JWT auth, admin guard, error handler
    scripts/seed.js         sample data
    server.js                entry point
frontend/
  src/
    pages/                  Home, Shop, ProductDetail, Cart, Checkout, Orders, Admin, Login/Register
    components/             Navbar, Footer, ProductCard, ProtectedRoute
    context/                Auth + Cart state
    api/client.js           fetch wrapper
```
