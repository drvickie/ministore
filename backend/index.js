require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const products = require("./data/products");
const prisma = require("./lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const authMiddleware = require("./middleware/auth");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Secure CORS (only allow your frontend)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  "/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());

/* =========================
   AUTH ROUTES
========================= */

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

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
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

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
      secure: false, // ⚠️ change to true in production (HTTPS)
      sameSite: "lax",
    });

    res.json({ message: "Login successful" });
  } catch (error) {
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

    try {
      // ✅ Calculate totals (never trust frontend)
      const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const total = subtotal + vatAmount;

      // ✅ Create order in DB
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

      // ✅ Create Stripe line items
      const lineItems = cart.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // VAT line
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "VAT (7.5%)",
          },
          unit_amount: Math.round(vatAmount * 100),
        },
        quantity: 1,
      });

      // ✅ Create Stripe session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
      });

      // ✅ Save Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          stripeSessionId: session.id,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Payment failed" });
    }
  }
);

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

  // ✅ Handle successful payment
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

      console.log("✅ Order marked as PAID");
    } catch (error) {
      console.error("DB update error:", error);
    }
  }

  res.json({ received: true });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true in production
  });

  res.json({ message: "Logged out" });
});

/* =========================
   SERVER
========================= */

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
