export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">
          Payment Successful 🎉
        </h1>
        <p className="mb-4">
          Thank you for shopping with Ministore.
        </p>
        <a
          href="/"
          className="text-blue-600 font-semibold hover:underline"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}
