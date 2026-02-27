import { useEffect, useState } from "react";
import "../styles/globals.css";
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([]);


  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <>
      <Header cart={cart} />
      <Component {...pageProps} cart={cart} setCart={setCart} />
    </>
  );
}
