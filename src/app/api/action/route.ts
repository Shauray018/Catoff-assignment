import { createActionHeaders, ActionGetResponse } from "@solana/actions";

const headers = createActionHeaders({
  chainId: "mainnet",
  actionVersion: "2.2.1",
});

export const GET = async () => {
  const payload: ActionGetResponse = {
    title: "Clash Royale Duel",
    icon: "https://play-lh.googleusercontent.com/rIh0eHI4fg1MJphEhIFeLZS_rxZVRSL9-LuHmR5_-BsLqmH6-S2J7fPhR4t0fPRz4Q=w240-h480-rw",
    description:
      "Challenge a friend to a Clash Royale duel with crypto stakes! Winner takes all.",
    label: "Create Duel",
    links: {
      actions: [
        {
          type: "linked",
          label: "Create Duel",
          href: "/api/clash-duel?playerTag={playerTag}&playerName={playerName}&wagerAmount={wagerAmount}&token={token}",
          parameters: [
            {
              type: "text",
              name: "playerTag",
              label: "Your Clash Royale Player Tag (e.g., #2YCVJ0C9G)",
              required: true,
            },
            {
              type: "text",
              name: "playerName",
              label: "Your Clash Royale Username",
              required: true,
            },
            {
              type: "number",
              name: "wagerAmount",
              label: "Wager Amount",
              required: true,
            },
            {
              type: "select",
              name: "token",
              label: "Select Token",
              required: true,
              options: [
                { label: "SOL", value: "SOL" },
                { label: "USDC", value: "USDC" },
                { label: "BONK", value: "BONK" },
              ],
            },
          ],
        },
      ],
    },
  };

  return Response.json(payload, { headers });
};
