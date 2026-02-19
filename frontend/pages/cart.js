export default function Cart({ cart, setCart }) {
  const VAT_RATE = 0.075;

  const increaseQuantity = (item) => {
    const updatedCart = cart.map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    setCart(updatedCart);
  };

  const decreaseQuantity = (item) => {
    if (item.quantity === 1) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    } else {
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      setCart(updatedCart);
    }
  };

  // Subtotal (before VAT)
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // VAT amount
  const vatAmount = subtotal * VAT_RATE;

  // Final total
  const total = subtotal + vatAmount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-xl font-semibold">
          Your cart is empty
        </h1>
      </div>
    );
  }
  const handleCheckout = async () => {
    const response = await fetch(
      "http://localhost:5001/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          vatAmount,
        }),
      }
    );

    const data = await response.json();
    window.location.href = data.url;
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Your Cart
      </h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">
                  {item.name}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  ${item.price} × {item.quantity}
                </p>

                <p className="text-blue-600 font-bold mt-2">
                  Product Total: $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseQuantity(item)}
                  className="px-3 py-1 bg-gray-300 rounded text-lg"
                >
                  −
                </button>

                <span className="font-semibold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => increaseQuantity(item)}
                  className="px-3 py-1 bg-gray-300 rounded text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="mt-6 bg-white p-4 rounded shadow space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">
            VAT (7.5%)
          </span>
          <span>${vatAmount.toFixed(2)}</span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded text-lg hover:bg-green-700"
      >
        Proceed to Checkout
      </button>

    </div>
  );
}
