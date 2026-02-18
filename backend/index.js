const express = require("express");
const cors = require("cors");
const products = require("./data/products");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Ministore backend is running");
});
app.get("/products", (req, res) => {
  res.status(200).json(products);
});


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
