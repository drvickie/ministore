import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on first load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Component
      {...pageProps}
      cart={cart}
      setCart={setCart}
    />
  );
}
