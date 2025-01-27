"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Update interface to match exact database structure
interface Duel {
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
}

export default function Duels() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDuels = async () => {
      try {
        const response = await fetch("/api/clash-duels");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setDuels(data); // Direct array of duels
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch duels");
      } finally {
        setLoading(false);
      }
    };

    fetchDuels();
  }, []);

  // ... rest of the component ...

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="grid gap-4">
        {duels.map((duel) => (
          <div
            key={duel.id}
            className="p-4 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-100">
                  {duel.creator_name} ({duel.creator_trophies} 🏆)
                </h2>
                <p className="text-sm text-gray-400">
                  Wager: {duel.wager_amount} {duel.wager_token}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${getStatusColor(
                    duel.status
                  )}`}
                >
                  {duel.status}
                </span>
                {duel.status === "PENDING" && (
                  <Link
                    href={`/duels/${duel.id}/join`}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Join
                  </Link>
                )}
              </div>
            </div>
            {duel.opponent_tag && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-300">
                  Opponent: {duel.opponent_name} ({duel.opponent_trophies} 🏆)
                </p>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Created: {new Date(duel.created_at).toLocaleString()}
            </div>
          </div>
        ))}

        {duels.length === 0 && !loading && (
          <div className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-gray-400">
              No active duels found. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/20 text-amber-300 border border-amber-500/50";
    case "ACCEPTED":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50";
    case "COMPLETED":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/50";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-300 border border-gray-500/50";
  }
}
