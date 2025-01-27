"use client";

import { useState } from "react";

export default function CreateDuel() {
  const [playerTag, setPlayerTag] = useState("");
  const [wagerAmount, setWagerAmount] = useState("");
  const [token, setToken] = useState("SOL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/clash-duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerTag, wagerAmount, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create duel");
      }

      // Redirect to duel page
      window.location.href = `/duels/${data.duelId}`;
    } catch (err) {
      //@ts-ignore
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-black">Create a Duel</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">
            Player Tag
            <input
              type="text"
              value={playerTag}
              onChange={(e) => setPlayerTag(e.target.value)}
              placeholder="#2YCVJ0C9G"
              className="w-full p-2 border rounded mt-1"
              required
              pattern="^#?[0-9A-Z]{8,}$"
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Wager Amount
            <input
              type="number"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block mb-2">
            Token
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
              <option value="BONK">BONK</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white rounded ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Create Duel"}
        </button>
      </form>
    </div>
  );
}
