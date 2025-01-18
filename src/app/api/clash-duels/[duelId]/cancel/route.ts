import { NextRequest } from "next/server";
import { cancelDuel, getDuel } from "@/utils/duel-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { duelId: string } }
) {
  const { duelId } = params;

  try {
    const duel = await getDuel(duelId);
    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    if (!["PENDING", "ACCEPTED"].includes(duel.status)) {
      return Response.json(
        { error: "Duel cannot be cancelled" },
        { status: 400 }
      );
    }

    const cancelledDuel = await cancelDuel(duelId);
    return Response.json({ success: true, duel: cancelledDuel });
  } catch (error) {
    console.error("Error cancelling duel:", error);
    return Response.json({ error: "Failed to cancel duel" }, { status: 500 });
  }
}
