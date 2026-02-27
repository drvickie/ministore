import { useRouter } from "next/router";

export default function Home({ cart, setCart }) {
  const router = useRouter();
  const { search } = router.query;

  const products = [
    {
      id: 1,
      name: "Laptop",
      price: 1000,
      image: "/images/laptop.jpg",
    },
    {
      id: 2,
      name: "Headphones",
      price: 200,
      image: "/images/headphones.jpg",
    },
    {
      id: 3,
      name: "Keyboard",
      price: 150,
      image: "/images/keyboard.jpg",
    },
  ];

  const getQuantity = (id) => {
    const item = cart.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

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

  const increaseQuantity = (product) => {
    addToCart(product);
  };

  const decreaseQuantity = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (!existingItem) return;

    if (existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.id !== product.id));
    } else {
      const updatedCart = cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      setCart(updatedCart);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products
          .filter((product) =>
            search
              ? product.name
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : true
          )
          .map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-40 w-full object-cover rounded"
              />

              <h2 className="text-lg font-semibold mt-3">
                {product.name}
              </h2>

              {/* Price + Quantity Controls (same line) */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-blue-600 font-bold">
                  ${product.price}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQuantity(product)}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    −
                  </button>

                  <span className="font-semibold">
                    {getQuantity(product.id)}
                  </span>

                  <button
                    onClick={() => increaseQuantity(product)}
                    className="px-3 py-1 bg-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button (Underneath) */}
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
