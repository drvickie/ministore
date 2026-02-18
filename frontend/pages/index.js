import { useEffect, useState } from "react";

export default function Home({ cart, setCart }) {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });
  }, []);
  const addToCart = (product) => {
    const existingItem = cart.find(
      (item) => item.id === product.id
    );

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Ministore Products
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow p-4"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full object-cover rounded mb-4"
            />


            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {product.description}
            </p>

            <p className="text-blue-600 font-bold mt-3">
              ${product.price}
            </p>
            <button
              onClick={() => addToCart(product)}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
