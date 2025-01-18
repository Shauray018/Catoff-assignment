import { supabase } from "@/utils/supabase";
import { Duel } from "./duel";

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
    .eq("status", "PENDING") // Ensure duel is still pending
    .select()
    .single();

  if (error) throw error;
  return data;
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
