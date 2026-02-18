export default function Cart({ cart, setCart }) {
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl">Your cart is empty</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">
                ${item.price} × {item.quantity}
              </p>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <p className="text-lg font-bold">
          Total: ${total}
        </p>
      </div>
    </div>
  );
}
