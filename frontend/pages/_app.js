import { useEffect, useState } from "react";
import "../styles/globals.css";
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Load cart
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🔥 Check logged-in user
  useEffect(() => {
    fetch("http://localhost:5001/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, []);

  return (
    <>
      <Header cart={cart} user={user} setUser={setUser} />
      <Component
        {...pageProps}
        cart={cart}
        setCart={setCart}
        user={user}
        setUser={setUser}
      />
    </>
  );
}
