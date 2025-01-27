import { NextRequest } from "next/server";
import { validatePlayer } from "@/utils/clash-royale";
import { createDuel, getDuels, getPlayerDuels } from "@/utils/duel-service";
import { getDuelById } from "@/utils/duel-service";

export async function GET(request: NextRequest) {
  try {
    const duel = await getDuels();

    if (!duel) {
      return Response.json({ error: "Duel not found" }, { status: 404 });
    }

    return Response.json(duel);
  } catch (error) {
    console.error("Error fetching duel:", error);
    return Response.json({ error: "Failed to fetch duel" }, { status: 500 });
  }
}

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { playerTag, wagerAmount, token } = body;

  if (!playerTag || !wagerAmount || !token) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400, headers }
    );
  }

  const playerData = await validatePlayer(playerTag);
  if (!playerData) {
    return Response.json(
      { error: "Invalid Clash Royale player tag" },
      { status: 400, headers }
    );
  }

  try {
    const duel = await createDuel({
      creator: {
        tag: playerData.tag,
        name: playerData.name,
        trophies: playerData.trophies,
      },
      wager: {
        amount: wagerAmount,
        token: token,
      },
    });

    const blinkUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/join-duel?duelId=${duel.id}`;

    return Response.json(
      {
        success: true,
        duelId: duel.id,
        opponentJoinLink: blinkUrl,
        duelData: {
          creator: {
            tag: playerData.tag,
            name: playerData.name,
            trophies: playerData.trophies,
          },
          wager: {
            amount: wagerAmount,
            token: token,
          },
          createdAt: duel.created_at,
          status: duel.status,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error("Error creating duel:", error);
    return Response.json(
      { error: "Failed to create duel" },
      { status: 500, headers }
    );
  }
}

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const playerTag = searchParams.get("playerTag");

//   if (!playerTag) {
//     return Response.json(
//       { error: "Player tag is required" },
//       { status: 400, headers }
//     );
//   }

//   try {
//     const duels = await getPlayerDuels(playerTag);
//     return Response.json({ duels }, { headers });
//   } catch (error) {
//     console.error("Error fetching duels:", error);
//     return Response.json(
//       { error: "Failed to fetch duels" },
//       { status: 500, headers }
//     );
//   }
// }

export async function OPTIONS() {
  return new Response(null, { headers });
}
