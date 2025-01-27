"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface DuelData {
  duel: {
    id: string;
    created_at: string;
    status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
    creator_tag: string;
    creator_name: string;
    creator_trophies: number;
    opponent_tag: string | null;
    opponent_name: string | null;
    opponent_trophies: number | null;
    wager_amount: string;
    wager_token: string;
    accepted_at: string | null;
    completed_at: string | null;
    winner_tag: string | null;
    battle_time: string | null;
    creator_crowns: number | null;
    opponent_crowns: number | null;
  };
}

export default function JoinDuel() {
  const params = useParams();
  const duelId = params.id;

  const [playerTag, setPlayerTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duelData, setDuelData] = useState<DuelData | null>(null);

  useEffect(() => {
    // Fetch duel details
    const fetchDuel = async () => {
      try {
        const response = await fetch(`/api/clash-duels/${duelId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);
        console.log(data.duel.status);
        if (data.duel.status !== "PENDING")
          throw new Error("This duel is no longer available");

        setDuelData(data);
      } catch (err) {
        //@ts-ignore
        setError(err.message);
      }
    };

    fetchDuel();
  }, [duelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/clash-duels/${duelId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerTag }),
      });

      console.log(playerTag);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join duel");
      }

      // Redirect to duel page
      window.location.href = `/duels/${duelId}`;
    } catch (err) {
      //@ts-ignore
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!duelData) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Join Duel</h1>

        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <h2 className="font-semibold mb-2 text-gray-200">Duel Details</h2>
          <div className="space-y-2">
            <p className="text-gray-300">
              Creator: {duelData.duel.creator_name}
            </p>
            <p className="text-gray-400">
              Trophies: {duelData.duel.creator_trophies} 🏆
            </p>
            <p className="text-purple-300">
              Wager: {duelData.duel.wager_amount} {duelData.duel.wager_token}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-gray-200">
              Your Player Tag
              <input
                type="text"
                value={playerTag}
                onChange={(e) => setPlayerTag(e.target.value)}
                placeholder="#2YCVJ0C9G"
                className="w-full p-2 mt-1 bg-gray-900/50 border border-gray-700 rounded 
                          text-gray-100 placeholder-gray-500
                          focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50
                          hover:border-gray-600 transition-colors"
                required
                pattern="^#?[0-9A-Z]{8,}$"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Enter your Clash Royale player tag (e.g., #2YCVJ0C9G)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded text-white transition-colors ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Joining...</span>
              </div>
            ) : (
              "Join Duel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
