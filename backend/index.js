require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const products = require("./data/products");
const prisma = require("./lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middleware/auth");


const app = express();

/* =========================
   ENV VALIDATION
========================= */
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}
if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL is missing");
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   MIDDLEWARE
========================= */

app.use(helmet());

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
// ✅ Secure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ✅ Rate limiting (protect auth routes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/login", authLimiter);
app.use("/register", authLimiter);

// ✅ Stripe webhook MUST be raw
app.use("/webhook", express.raw({ type: "application/json" }));

app.use(cookieParser());
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* =========================
   AUTH ROUTES
========================= */

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.json({
      message: "User created",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

/* =========================
   PRODUCTS
========================= */

app.get("/", (req, res) => {
  res.status(200).send("Ministore backend is running");
});

app.get("/products", (req, res) => {
  res.status(200).json(products);
});

/* =========================
   STRIPE + ORDERS
========================= */

app.post(
  "/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    const { cart, vatAmount } = req.body;

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).json({ error: "Invalid cart" });
    }

    try {
      // ✅ NEVER trust frontend prices
      const subtotal = cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return sum;
        return sum + product.price * item.quantity;
      }, 0);

      const total = subtotal + vatAmount;

      
      const order = await prisma.order.create({
        data: {
          userId: req.userId,
          subtotal,
          vat: vatAmount,
          total,
          items: {
            create: cart.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      const lineItems = cart.map((item) => {
        const product = products.find((p) => p.id === item.id);

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        };
      });

      // VAT line
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "VAT",
          },
          unit_amount: Math.round(vatAmount * 100),
        },
        quantity: 1,
      });


      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
      });


      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripeSessionId: session.id,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Payment failed" });
    }
  }
);

/* =========================
   STRIPE WEBHOOK
========================= */

app.post("/webhook", async (req, res) => {

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.sendStatus(400);
  }


  if (event.type === "checkout.session.completed") {

    const session = event.data.object;

    try {
      await prisma.order.updateMany({
        where: {
          stripeSessionId: session.id,
        },
        data: {
          status: "paid",
        },
      });

    } catch (error) {
      console.error("DB update error:", error);
    }
  }

  res.json({ received: true });
});

/* =========================
   LOGOUT
========================= */

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.status(200).json({ message: "Logged out" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Something broke!");
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
