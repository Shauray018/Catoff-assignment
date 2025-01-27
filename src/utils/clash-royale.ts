import { supabase } from "./supabase";

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
          Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
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
          Authorization: `Bearer ${process.env.CLASH_ROYALE_API_KEY}`,
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

// Add this new function to monitor battle status
export async function monitorBattle(
  duelId: string,
  player1Tag: string,
  player2Tag: string,
  acceptedAt: string,
  maxWaitTime: number = 30 * 60 * 1000 // 30 minutes in milliseconds
): Promise<void> {
  const startTime = new Date(acceptedAt);
  const endTime = new Date(startTime.getTime() + maxWaitTime);

  console.log(`Starting battle monitor for duel ${duelId}`);
  console.log(`Players: ${player1Tag} vs ${player2Tag}`);
  console.log(
    `Time window: ${startTime.toISOString()} to ${endTime.toISOString()}`
  );

  const checkInterval = setInterval(async () => {
    try {
      // Check if current time exceeds wait time
      if (new Date() > endTime) {
        console.log(`Duel ${duelId} timed out - no battle found`);
        await cancelTimedOutDuel(duelId);
        clearInterval(checkInterval);
        return;
      }

      // Check for battle result
      const battleResult = await checkBattleResult(
        player1Tag,
        player2Tag,
        acceptedAt
      );

      if (battleResult) {
        console.log(`Battle found for duel ${duelId}:`, battleResult);
        await updateDuelWithBattleResult(duelId, battleResult);
        clearInterval(checkInterval);
      } else {
        console.log(`No battle found yet for duel ${duelId}`);
      }
    } catch (error) {
      console.error(`Error monitoring battle for duel ${duelId}:`, error);
    }
  }, 60000); // Check every minute

  // Store interval ID for cleanup
  activeBattleMonitors.set(duelId, checkInterval);
}

// Keep track of active monitors
const activeBattleMonitors = new Map<string, NodeJS.Timer>();

// Helper function to cancel timed out duel
async function cancelTimedOutDuel(duelId: string) {
  try {
    const { error } = await supabase
      .from("duels")
      .update({
        status: "CANCELLED",
        completed_at: new Date().toISOString(),
      })
      .eq("id", duelId)
      .eq("status", "ACCEPTED");

    if (error) throw error;
    console.log(`Duel ${duelId} cancelled due to timeout`);
  } catch (error) {
    console.error(`Failed to cancel duel ${duelId}:`, error);
  }
}

// Helper function to update duel with battle result
async function updateDuelWithBattleResult(
  duelId: string,
  battle: BattleResult
) {
  try {
    const { error } = await supabase
      .from("duels")
      .update({
        status: "COMPLETED",
        winner_tag: battle.winner,
        creator_crowns: battle.player1Crowns,
        opponent_crowns: battle.player2Crowns,
        battle_time: battle.battleTime,
        completed_at: new Date().toISOString(),
      })
      .eq("id", duelId)
      .eq("status", "ACCEPTED");

    if (error) throw error;
    console.log(`Duel ${duelId} completed with winner ${battle.winner}`);
  } catch (error) {
    console.error(`Failed to update duel ${duelId} with battle result:`, error);
  }
}

// Add cleanup function
export function stopBattleMonitor(duelId: string) {
  const interval = activeBattleMonitors.get(duelId);
  if (interval) {
    //@ts-ignore
    clearInterval(interval);
    activeBattleMonitors.delete(duelId);
    console.log(`Battle monitor stopped for duel ${duelId}`);
  }
}
