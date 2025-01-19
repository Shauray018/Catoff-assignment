import { NextRequest } from "next/server";

interface ClashRoyalePlayer {
  tag: string;
  name: string;
  trophies: number;
  wins: number;
  losses: number;
}

async function validatePlayer(tag: string): Promise<ClashRoyalePlayer | null> {
  // Format tag to ensure it has #
  const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;

  try {
    const response = await fetch(
      `https://api.clashroyale.com/v1/players/${encodeURIComponent(
        formattedTag
      )}`,
      {
        headers: {
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjA2OGUyMjA1LWU4MGEtNDYzNi04OWQ2LTVjYjhlNDY2Mzg5NCIsImlhdCI6MTczNzI3NzE4OCwic3ViIjoiZGV2ZWxvcGVyLzY1ZDUwZjU2LTg4MDAtY2FhOS0wMzA2LWU1NjVkNTAxYTc4MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI2NC4yOS4xNy42NSIsIjExNy4yMTAuMTc2LjIxMiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.qVRZamn329xVsoQY3QNIV7Xkf8C1wYV7DyqEIjokabhZyvkfeiZ0JULFzJiXXfSx8CzApfPly_vc5V4ILuwGBg`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating player:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get parameters from the URL
  const playerTag = searchParams.get("playerTag");
  const playerName = searchParams.get("playerName");
  const wagerAmount = searchParams.get("wagerAmount");
  const token = searchParams.get("token");

  // Validate required parameters
  if (!playerTag || !playerName || !wagerAmount || !token) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Validate player tag with Clash Royale API
  const playerData = await validatePlayer(playerTag);
  if (!playerData) {
    return Response.json(
      { error: "Invalid Clash Royale player tag" },
      { status: 400 }
    );
  }

  // Verify that provided name matches API data
  if (playerData.name.toLowerCase() !== playerName.toLowerCase()) {
    return Response.json(
      { error: "Player name doesn't match the provided tag" },
      { status: 400 }
    );
  }

  // Create a unique duel ID
  const duelId = `CR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create the response with the duel link
  const response = {
    success: true,
    duelId,
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
      // You might want to store this in a database
      createdAt: new Date().toISOString(),
      status: "PENDING",
      // Generate opponent join link
      opponentJoinLink: `${process.env.NEXT_PUBLIC_BASE_URL}/clash-duel/${duelId}/join`,
    },
    // Return a new Blink for the opponent to join
    opponentBlink: {
      title: "Join Clash Royale Duel",
      icon: "https://play-lh.googleusercontent.com/rIh0eHI4fg1MJphEhIFeLZS_rxZVRSL9-LuHmR5_-BsLqmH6-S2J7fPhR4t0fPRz4Q=w240-h480-rw",
      description: `${playerData.name} has challenged you to a Clash Royale duel for ${wagerAmount} ${token}!`,
      label: "Accept Challenge",
      links: {
        actions: [
          {
            label: "Accept Duel",
            href: `/api/clash-duel/${duelId}/accept?playerTag={playerTag}&playerName={playerName}`,
            parameters: [
              {
                type: "text",
                name: "playerTag",
                label: "Your Clash Royale Player Tag",
                required: true,
              },
              {
                type: "text",
                name: "playerName",
                label: "Your Clash Royale Username",
                required: true,
              },
            ],
          },
        ],
      },
    },
  };

  return Response.json(response);
}
