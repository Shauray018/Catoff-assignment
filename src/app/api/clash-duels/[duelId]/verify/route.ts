import { NextRequest } from "next/server";
import { getDuel, updateDuelResult } from "@/utils/duel-service";
import { checkBattleResult } from "@/utils/clash-royale";

export async function POST(request: NextRequest, params: any) {
  const { duelId } = params;

  try {
    const duel = await getDuel(duelId);
    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    if (duel.status !== "ACCEPTED") {
      return Response.json(
        { error: "Duel is not in progress" },
        { status: 400 }
      );
    }

    const result = await checkBattleResult(
      duel.creator_tag,
      duel.opponent_tag!,
      duel.accepted_at!
    );

    if (!result) {
      return Response.json({ error: "Battle not found yet" }, { status: 404 });
    }

    const updatedDuel = await updateDuelResult(duelId, {
      winner_tag: result.winner,
      battle_time: result.battleTime,
      creator_crowns: result.player1Crowns,
      opponent_crowns: result.player2Crowns,
    });

    return Response.json({ success: true, duel: updatedDuel });
  } catch (error) {
    console.error("Error verifying battle:", error);
    return Response.json({ error: "Failed to verify battle" }, { status: 500 });
  }
}
