import {
  createActionHeaders,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";

const headers = {
  ...createActionHeaders({
    chainId: "mainnet",
    actionVersion: "2.2.1",
  }),
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export const GET = async () => {
  const payload: ActionGetResponse = {
    title: "Clash Royale Duel",
    icon: "https://yt3.googleusercontent.com/as7lQ8BrpbZ1b2sf5IrCwHix5l3Vel5VyQ4No_zWp8Sei1SansUl_uRLMtJhmrPqB7KIlMv4svM=s900-c-k-c0x00ffffff-no-rj",
    description:
      "Challenge a friend to a Clash Royale duel with crypto stakes! Winner takes all.",
    label: "Create Duel",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Create Duel",
          href: "/api/clash-duels",
          parameters: [
            {
              type: "text",
              name: "playerTag",
              label: "Your Clash Royale Player Tag (e.g., #2YCVJ0C9G)",
              required: true,
              pattern: "^#?[0-9A-Z]{8,}$",
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

export const POST = async (request: Request) => {
  const body: ActionPostRequest = await request.json();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/clash-duels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body.data),
      }
    );

    const duelData = await response.json();

    if (!response.ok) {
      throw new Error(duelData.error || "Failed to create duel");
    }

    const payload: ActionPostResponse = {
      type: "external-link",
      message: "Duel created successfully!",
      externalLink: duelData.opponentJoinLink,
    };

    return Response.json(payload, { headers });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Failed to create duel" },
      { status: 500, headers }
    );
  }
};

export const OPTIONS = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
