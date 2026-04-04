import { useState } from "react";
import { useRouter } from "next/router";

export default function Header({ cart, user, setUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    router.push(`/?search=${searchTerm}`);
    setSearchTerm("");
  };

  const handleLogout = async () => {
  await fetch("http://localhost:5001/logout", {
    method: "POST",
    credentials: "include",
  });

  setUser(null); // ✅ Clear user instantly
  router.push("/"); // ✅ Redirect cleanly
};

  return (
    <div className="bg-white shadow px-6 py-4 flex items-center justify-between">
      
      {/* LEFT: Logo */}
      <h1
        onClick={() => router.push("/")}
        className="text-2xl font-bold text-blue-600 cursor-pointer"
      >
        Ministore
      </h1>

      {/* CENTER: Search */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 w-1/3"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* RIGHT: Cart + Auth */}
      <div className="flex items-center gap-4">
        <a
          href="/cart"
          className="text-blue-600 font-semibold hover:underline"
        >
          Cart ({cart.length})
        </a>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="text-red-600 text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <a
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Login
            </a>
            <a
              href="/register"
              className="text-blue-600 hover:underline"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
