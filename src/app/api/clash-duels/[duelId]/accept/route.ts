import { NextRequest } from "next/server";
import { validatePlayer } from "@/utils/clash-royale";
import { acceptDuel, getDuel } from "@/utils/duel-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { duelId: string } }
) {
  const { duelId } = params;

  try {
    // Parse request body
    const data = await request.json();
    const playerTag = data?.playerTag;

    console.log("Accepting duel:", { duelId, playerTag }); // Debug log

    if (!playerTag) {
      return Response.json(
        { error: "Player tag is required" },
        { status: 400 }
      );
    }

    // Check if duel exists
    const duel = await getDuel(duelId);
    console.log("Duel found:", duel); // Debug log

    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    if (duel.status !== "PENDING") {
      return Response.json(
        { error: "Duel is no longer available" },
        { status: 400 }
      );
    }

    // Validate player
    const playerData = await validatePlayer(playerTag);
    console.log("Player validated:", playerTag); // Debug log

    if (!playerData) {
      return Response.json(
        { error: "Invalid Clash Royale player tag" },
        { status: 400 }
      );
    }

    console.log(
      "kill me now" + playerData.tag,
      playerData.name,
      playerData.trophies
    );
    // Accept duel
    const updatedDuel = await acceptDuel(duelId, {
      tag: playerData.tag,
      name: playerData.name,
      trophies: playerData.trophies,
    });
    console.log("Duel accepted:", updatedDuel); // Debug log

    return Response.json({ success: true, duel: updatedDuel });
  } catch (error) {
    console.error("Error accepting duel:", error); // Detailed error log
    return Response.json(
      { error: "Failed to accept duel", details: error.message },
      { status: 500 }
    );
  }
}
