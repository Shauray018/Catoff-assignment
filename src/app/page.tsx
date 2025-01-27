"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-4xl font-bold mb-8">Clash Royale Duels</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/duels/create"
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
        >
          Create New Duel
        </Link>

        <Link
          href="/duels"
          className="p-6 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
        >
          View All Duels
        </Link>
      </div>
    </div>
  );
}
