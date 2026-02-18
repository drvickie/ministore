import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });
  }, []);

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
            <div className="h-40 bg-gray-200 mb-4 flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                Image Placeholder
              </span>
            </div>

            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {product.description}
            </p>

            <p className="text-blue-600 font-bold mt-3">
              ${product.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
