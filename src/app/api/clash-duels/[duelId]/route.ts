import { NextRequest } from "next/server";
import { getDuel } from "@/utils/duel-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { duelId: string } }
) {
  const { duelId } = params;

  try {
    const duel = await getDuel(duelId);
    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    return Response.json({ duel });
  } catch (error) {
    console.error("Error fetching duel:", error);
    return Response.json({ error: "Failed to fetch duel" }, { status: 500 });
  }
}
