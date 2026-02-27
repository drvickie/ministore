import { useState } from "react";
import { useRouter } from "next/router";


export default function Header({ cart }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    router.push(`/?search=${searchTerm}`);
    setSearchTerm("");
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      {/* Logo */}
      <h1
        onClick={() => router.push("/")}
        className="text-2xl font-bold text-blue-600 cursor-pointer"
      >
        Ministore
      </h1>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Search
        </button>
      </form>

      {/* View Cart */}
      <a
        href="/cart"
        className="text-blue-600 font-semibold hover:underline"
      >
        View Cart ({cart.length})
      </a>
    </div>
  );
}
