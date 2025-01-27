import { supabase } from "@/utils/supabase";
import { Duel } from "./duel";
import { monitorBattle } from "./clash-royale";

export async function createDuel(
  duel: Omit<Duel, "id" | "status" | "createdAt">
) {
  const { data, error } = await supabase
    .from("duels")
    .insert({
      id: `CR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "PENDING",
      creator_tag: duel.creator.tag,
      creator_name: duel.creator.name,
      creator_trophies: duel.creator.trophies,
      wager_amount: duel.wager.amount,
      wager_token: duel.wager.token,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDuel(duelId: string) {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", duelId)
    .single();

  if (error) throw error;
  return data;
}

export async function acceptDuel(
  duelId: string,
  opponent: {
    tag: string;
    name: string;
    trophies: number;
  }
) {
  console.log("Starting acceptDuel with:", { duelId, opponent });

  try {
    // First check if duel exists and is pending
    const { data: existingDuel, error: checkError } = await supabase
      .from("duels")
      .select("*")
      .eq("id", duelId)
      .single();

    if (checkError) {
      console.error("Error checking duel:", checkError);
      throw checkError;
    }

    if (!existingDuel) {
      console.error("Duel not found:", duelId);
      throw new Error("Duel not found");
    }

    if (existingDuel.status !== "PENDING") {
      console.error("Duel is not pending:", existingDuel.status);
      throw new Error("Duel is not available for accepting");
    }

    // Update the duel
    const { data, error } = await supabase
      .from("duels")
      .update({
        status: "ACCEPTED",
        opponent_tag: opponent.tag,
        opponent_name: opponent.name,
        opponent_trophies: opponent.trophies,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", duelId)
      .eq("status", "PENDING") // Double check status hasn't changed
      .select()
      .single();

    if (error) {
      console.error("Error updating duel:", error);
      throw error;
    }

    if (!data) {
      console.error("No data returned after update");
      throw new Error("Failed to update duel");
    }

    console.log("Successfully accepted duel:", data);

    const acceptedAt = new Date().toISOString();
    monitorBattle(duelId, data.creator_tag, opponent.tag, acceptedAt);

    // Return in the same format as getDuel
    return {
      duel: {
        id: data.id,
        created_at: data.created_at,
        status: data.status,
        creator_tag: data.creator_tag,
        creator_name: data.creator_name,
        creator_trophies: data.creator_trophies,
        opponent_tag: data.opponent_tag,
        opponent_name: data.opponent_name,
        opponent_trophies: data.opponent_trophies,
        wager_amount: data.wager_amount,
        wager_token: data.wager_token,
        accepted_at: data.accepted_at,
        completed_at: data.completed_at,
        winner_tag: data.winner_tag,
        battle_time: data.battle_time,
        creator_crowns: data.creator_crowns,
        opponent_crowns: data.opponent_crowns,
      },
    };
  } catch (error) {
    console.error("acceptDuel failed:", error);
    throw error;
  }
}

export async function updateDuelResult(
  duelId: string,
  result: {
    winner_tag: string;
    battle_time: string;
    creator_crowns: number;
    opponent_crowns: number;
  }
) {
  const { data, error } = await supabase
    .from("duels")
    .update({
      status: "COMPLETED",
      winner_tag: result.winner_tag,
      battle_time: result.battle_time,
      creator_crowns: result.creator_crowns,
      opponent_crowns: result.opponent_crowns,
      completed_at: new Date().toISOString(),
    })
    .eq("id", duelId)
    .eq("status", "ACCEPTED") // Ensure duel is accepted
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelDuel(duelId: string) {
  const { data, error } = await supabase
    .from("duels")
    .update({
      status: "CANCELLED",
      completed_at: new Date().toISOString(),
    })
    .eq("id", duelId)
    .in("status", ["PENDING", "ACCEPTED"]) // Only cancel if pending or accepted
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get active duels for a player
export async function getPlayerDuels(playerTag: string) {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .or(`creator_tag.eq.${playerTag},opponent_tag.eq.${playerTag}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDuelById(duelId: string) {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", duelId)
    .single();

  if (error) {
    console.error("Error fetching duel:", error);
    return null;
  }

  // Transform the database row into the expected Duel format
  if (data) {
    return {
      id: data.id,
      creator: {
        tag: data.creator_tag,
        name: data.creator_name,
        trophies: data.creator_trophies,
      },
      opponent: data.opponent_tag
        ? {
            tag: data.opponent_tag,
            name: data.opponent_name,
            trophies: data.opponent_trophies,
          }
        : undefined,
      wager: {
        amount: data.wager_amount,
        token: data.wager_token,
      },
      status: data.status,
      created_at: data.created_at,
      winner: data.winner_tag
        ? {
            tag: data.winner_tag,
            crowns:
              data.winner_tag === data.creator_tag
                ? data.creator_crowns
                : data.opponent_crowns,
          }
        : undefined,
      battle_time: data.battle_time,
    };
  }

  return null;
}

export async function getDuels() {
  const { data, error } = await supabase.from("duels").select("*");

  if (error) throw error;
  return data;
}
