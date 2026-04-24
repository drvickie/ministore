# 🛒 Ministore — Full Stack E-Commerce App

Ministore is a full-stack e-commerce web application built from scratch using modern technologies. It simulates a simplified version of a real-world online shopping platform with authentication, cart management, payments, and order tracking.

---

# 🚀 FEATURES

## 🧑‍💻 Frontend (Next.js)

* Product listing (12 static household items)
* Search functionality
* Add to cart / remove / update quantity
* Real-time price calculation (subtotal, VAT, total)
* Responsive UI with Tailwind CSS
* Login & Register pages
* Persistent user session (via cookies)
* Protected checkout flow

---

## 🧠 Backend (Node.js + Express)

* REST API architecture
* User authentication (JWT + cookies)
* Password hashing with bcrypt
* Protected routes (auth middleware)
* Stripe payment integration
* Order creation and storage
* Secure webhook handling

---

## 💳 Payments (Stripe)

* Stripe Checkout integration
* VAT included as line item
* Webhook verification (prevents fake payments)
* Order status updates (pending → paid)

---

## 🗄️ Database (PostgreSQL + Prisma)

* User model
* Order model
* OrderItem model
* Relationships:

  * User → Orders
  * Order → OrderItems

---

# 🏗️ PROJECT STRUCTURE

```
ministore/
│
├── frontend/               # Next.js frontend
│   ├── pages/
│   ├── components/
│   ├── styles/
│
├── backend/               # Express backend
│   ├── data/
│   ├── middleware/
│   ├── prisma/
│   ├── lib/
│   └── index.js
│
└── README.md
```

---

# ⚙️ INSTALLATION GUIDE

## 1️⃣ Clone the project

```bash
git clone <your-repo-url>
cd ministore
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

### Create `.env`

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_XXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXX
CLIENT_URL=http://localhost:3000
```

---

## 3️⃣ Prisma Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 4️⃣ Start Backend

```bash
node index.js
```

---

## 5️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

# 🎨 TAILWIND CSS SETUP

If not already installed:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Update `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

# 🛍️ PRODUCT DATA

Products are stored locally in:

```bash
backend/data/products.js
```

Includes:

* 12 household products
* Images served from `/public/images`

---

# 🔐 AUTHENTICATION FLOW

## Register

* User submits name, email, password
* Password is hashed
* User saved to database

## Login

* Credentials validated
* JWT token generated
* Token stored in HTTP-only cookie

## Session

* `/me` endpoint verifies user
* Frontend updates user state

## Logout

* Cookie cleared
* User state reset

---

# 🛒 CART SYSTEM

* Stored in frontend state
* Each product includes:

  * id
  * name
  * price
  * quantity

### Features:

* Increase/decrease quantity
* Remove item
* Real-time total updates

---

# 💰 PRICING LOGIC

* Subtotal = sum(price × quantity)
* VAT = 7.5%
* Total = subtotal + VAT

---

# 💳 STRIPE PAYMENT FLOW

1. User clicks checkout
2. Frontend sends cart to backend
3. Backend:

   * Creates Order (status: pending)
   * Creates Stripe session
   * Saves session ID
4. User completes payment
5. Stripe webhook triggers
6. Backend updates order → `paid`

---

# 🔔 WEBHOOK SETUP (LOCAL)

```bash
stripe listen --forward-to localhost:5001/webhook
```

Add to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_XXXX
```

---

# 🔐 SECURITY MEASURES

* JWT authentication
* HTTP-only cookies
* Password hashing (bcrypt)
* Protected checkout route
* Stripe webhook signature verification
* CORS restricted to frontend

---

# 🚀 DEPLOYMENT NOTES

## Frontend (Vercel)

* Deploy `frontend/`
* Add environment variables

## Backend (Render / Railway / VPS)

* Deploy `backend/`
* Use production database

---

## 🔒 Production Changes

```js
secure: true
sameSite: "none"
```

---

# 🧪 TESTING

### Stripe Test Card

```
4242 4242 4242 4242
```

---

# 📦 FUTURE IMPROVEMENTS

* Order history page
* Admin dashboard
* Email receipts
* Inventory management
* Product categories
* Reviews & ratings

---

# 🧠 LEARNING OUTCOMES

This project demonstrates:

* Full-stack architecture
* Authentication systems
* Payment integration
* Database design
* API security
* Real-world e-commerce logic

---

# 📄 LICENSE

MIT License

---

# 🙌 AUTHOR

Built as a startup-level full-stack project to simulate a real-world e-commerce system.

---
