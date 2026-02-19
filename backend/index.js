require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const products = require("./data/products");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Ministore backend is running");
});
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

app.post("/create-checkout-session", async (req, res) => {
  const { cart, vatAmount } = req.body;

  try {
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

    // VAT as a separate line item
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment failed" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
