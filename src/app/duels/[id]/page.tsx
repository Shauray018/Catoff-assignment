"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Interface matching database schema
interface DuelData {
  duel: {
    id: string;
    created_at: string;
    status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
    creator_tag: string;
    creator_name: string;
    creator_trophies: number;
    opponent_tag?: string;
    opponent_name?: string;
    opponent_trophies?: number;
    wager_amount: string;
    wager_token: string;
    accepted_at?: string;
    completed_at?: string;
    winner_tag?: string;
    battle_time?: string;
    creator_crowns?: number;
    opponent_crowns?: number;
  };
}

export default function DuelDetails() {
  const params = useParams();
  const duelId = params.id as string;

  const [duel, setDuel] = useState<DuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDuel = async () => {
      try {
        const response = await fetch(`/api/clash-duels/${duelId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);
        setDuel(data);
        console.log(duel);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch duel");
      } finally {
        setLoading(false);
      }
    };

    fetchDuel();
  }, [duelId]);

  console.log(duel);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!duel) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 px-4 py-3 rounded-lg">
          Duel not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-gray-800/50 rounded-lg shadow-lg border border-gray-700 p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Duel Details</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
              duel.duel.status
            )}`}
          >
            {duel.duel.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Creator Info */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <h2 className="font-semibold text-lg mb-2 text-gray-100">
              Creator
            </h2>
            <div className="space-y-1">
              <p className="text-gray-200">{duel.duel.creator_name}</p>
              <p className="text-gray-400">Tag: {duel.duel.creator_tag}</p>
              <p className="text-gray-400">{duel.duel.creator_trophies} 🏆</p>
              {duel.duel.creator_crowns !== null && (
                <p className="text-gray-400">
                  Crowns: {duel.duel.creator_crowns} 👑
                </p>
              )}
            </div>
          </div>

          {/* Opponent Info */}
          {duel.duel.opponent_tag && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h2 className="font-semibold text-lg mb-2 text-gray-100">
                Opponent
              </h2>
              <div className="space-y-1">
                <p className="text-gray-200">{duel.duel.opponent_name}</p>
                <p className="text-gray-400">Tag: {duel.duel.opponent_tag}</p>
                <p className="text-gray-400">
                  {duel.duel.opponent_trophies} 🏆
                </p>
                {duel.duel.opponent_crowns !== null && (
                  <p className="text-gray-400">
                    Crowns: {duel.duel.opponent_crowns} 👑
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wager Info */}
        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <h2 className="font-semibold text-lg mb-2 text-purple-200">Wager</h2>
          <p className="text-purple-300 font-medium">
            {duel.duel.wager_amount} {duel.duel.wager_token}
          </p>
        </div>

        {/* Battle Results */}
        {duel.duel.status === "COMPLETED" && duel.duel.winner_tag && (
          <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <h2 className="font-semibold text-lg mb-2 text-emerald-200">
              Battle Results
            </h2>
            <div className="space-y-1">
              <p className="text-emerald-300">
                Winner:{" "}
                {duel.duel.winner_tag === duel.duel.creator_tag
                  ? duel.duel.creator_name
                  : duel.duel.opponent_name}
              </p>
              {duel.duel.battle_time && (
                <p className="text-emerald-400/80">
                  Battle Time:{" "}
                  {new Date(duel.duel.battle_time).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 space-y-1 text-sm text-gray-500">
          <p>Created: {new Date(duel.duel.created_at).toLocaleString()}</p>
          {duel.duel.accepted_at && (
            <p>Accepted: {new Date(duel.duel.accepted_at).toLocaleString()}</p>
          )}
          {duel.duel.completed_at && (
            <p>
              Completed: {new Date(duel.duel.completed_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          {duel.duel.status === "PENDING" && (
            <Link
              href={`/duels/${duel.duel.id}/join`}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Join Duel
            </Link>
          )}
          <Link
            href="/duels"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Duels
          </Link>
        </div>
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
