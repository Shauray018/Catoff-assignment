export interface Duel {
  id: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  creator: {
    tag: string;
    name: string;
    trophies: number;
  };
  opponent?: {
    tag: string;
    name: string;
    trophies: number;
  };
  wager: {
    amount: string;
    token: string;
  };
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  winner?: string;
  battleResult?: {
    battleTime: string;
    creatorCrowns: number;
    opponentCrowns: number;
  };
}
