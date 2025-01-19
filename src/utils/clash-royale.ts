interface ClashRoyalePlayer {
  tag: string;
  name: string;
  trophies: number;
  wins: number;
  losses: number;
}

interface BattleResult {
  winner: string;
  battleTime: string;
  player1Crowns: number;
  player2Crowns: number;
}

interface BattleLogEntry {
  type: string;
  battleTime: string;
  team: [
    {
      tag: string;
      name: string;
      crowns: number;
    }
  ];
  opponent: [
    {
      tag: string;
      name: string;
      crowns: number;
    }
  ];
}

// Helper function to properly encode player tags
function encodePlayerTag(tag: string): string {
  // Ensure tag starts with # and encode it
  const formattedTag = tag.startsWith("#") ? tag : `#${tag}`;
  return formattedTag.replace("#", "%23");
}

export async function validatePlayer(
  tag: string
): Promise<ClashRoyalePlayer | null> {
  try {
    const encodedTag = encodePlayerTag(tag);
    const response = await fetch(
      `https://api.clashroyale.com/v1/players/${encodedTag}`,
      {
        headers: {
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjA2OGUyMjA1LWU4MGEtNDYzNi04OWQ2LTVjYjhlNDY2Mzg5NCIsImlhdCI6MTczNzI3NzE4OCwic3ViIjoiZGV2ZWxvcGVyLzY1ZDUwZjU2LTg4MDAtY2FhOS0wMzA2LWU1NjVkNTAxYTc4MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI2NC4yOS4xNy42NSIsIjExNy4yMTAuMTc2LjIxMiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.qVRZamn329xVsoQY3QNIV7Xkf8C1wYV7DyqEIjokabhZyvkfeiZ0JULFzJiXXfSx8CzApfPly_vc5V4ILuwGBg`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Player validation failed:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error validating player:", error);
    return null;
  }
}

export async function getBattleLog(
  playerTag: string
): Promise<BattleLogEntry[]> {
  try {
    const encodedTag = encodePlayerTag(playerTag);
    const response = await fetch(
      `https://api.clashroyale.com/v1/players/${encodedTag}/battlelog`,
      {
        headers: {
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjA2OGUyMjA1LWU4MGEtNDYzNi04OWQ2LTVjYjhlNDY2Mzg5NCIsImlhdCI6MTczNzI3NzE4OCwic3ViIjoiZGV2ZWxvcGVyLzY1ZDUwZjU2LTg4MDAtY2FhOS0wMzA2LWU1NjVkNTAxYTc4MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI2NC4yOS4xNy42NSIsIjExNy4yMTAuMTc2LjIxMiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.qVRZamn329xVsoQY3QNIV7Xkf8C1wYV7DyqEIjokabhZyvkfeiZ0JULFzJiXXfSx8CzApfPly_vc5V4ILuwGBg`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Battle log fetch failed:", await response.text());
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching battle log:", error);
    return [];
  }
}

export async function checkBattleResult(
  player1Tag: string,
  player2Tag: string,
  startTime: string
): Promise<BattleResult | null> {
  try {
    // Get battle logs for both players
    const [player1Battles, player2Battles] = await Promise.all([
      getBattleLog(player1Tag),
      getBattleLog(player2Tag),
    ]);

    // Convert startTime to Date object for comparison
    const duelStartTime = new Date(startTime);

    // Look for matching battle in player1's battle log
    for (const battle of player1Battles) {
      const battleTime = new Date(battle.battleTime);
      const opponent = battle.opponent[0];

      // Check if this battle happened after duel start and involves both players
      if (
        battleTime > duelStartTime &&
        (opponent.tag === player2Tag || battle.team[0].tag === player2Tag)
      ) {
        const player1 = battle.team[0];
        const player2 = battle.opponent[0];

        return {
          winner: player1.crowns > player2.crowns ? player1.tag : player2.tag,
          battleTime: battle.battleTime,
          player1Crowns: player1.crowns,
          player2Crowns: player2.crowns,
        };
      }
    }

    // If not found in player1's log, check player2's log
    for (const battle of player2Battles) {
      const battleTime = new Date(battle.battleTime);
      const opponent = battle.opponent[0];

      // Check if this battle happened after duel start and involves both players
      if (
        battleTime > duelStartTime &&
        (opponent.tag === player1Tag || battle.team[0].tag === player1Tag)
      ) {
        const player2 = battle.team[0];
        const player1 = battle.opponent[0];

        return {
          winner: player1.crowns > player2.crowns ? player1.tag : player2.tag,
          battleTime: battle.battleTime,
          player1Crowns: player1.crowns,
          player2Crowns: player2.crowns,
        };
      }
    }

    // No matching battle found
    return null;
  } catch (error) {
    console.error("Error checking battle result:", error);
    return null;
  }
}

// Helper function to format player tags
export function formatPlayerTag(tag: string): string {
  return tag.startsWith("#") ? tag : `#${tag}`;
}
