import { NextRequest } from "next/server";
import { validatePlayer } from "@/utils/clash-royale";
import { acceptDuel, getDuel } from "@/utils/duel-service";

// Updated route handler with proper typing
export async function POST(request: NextRequest, params: any) {
  const { duelId } = params;
  const searchParams = request.nextUrl.searchParams;
  const playerTag = searchParams.get("playerTag");

  if (!playerTag) {
    return Response.json({ error: "Player tag is required" }, { status: 400 });
  }

  try {
    const duel = await getDuel(duelId);
    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    if (duel.status !== "PENDING") {
      return Response.json(
        { error: "Duel is no longer available" },
        { status: 400 }
      );
    }

    const playerData = await validatePlayer(playerTag);
    if (!playerData) {
      return Response.json(
        { error: "Invalid Clash Royale player tag" },
        { status: 400 }
      );
    }

    const updatedDuel = await acceptDuel(duelId, {
      tag: playerData.tag,
      name: playerData.name,
      trophies: playerData.trophies,
    });

    return Response.json({ success: true, duel: updatedDuel });
  } catch (error) {
    console.error("Error accepting duel:", error);
    return Response.json({ error: "Failed to accept duel" }, { status: 500 });
  }
}
