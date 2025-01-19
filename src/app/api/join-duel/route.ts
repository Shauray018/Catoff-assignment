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

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const duelId = searchParams.get("duelId");

  const payload: ActionGetResponse = {
    title: "Join Clash Royale Duel",
    icon: "https://yt3.googleusercontent.com/as7lQ8BrpbZ1b2sf5IrCwHix5l3Vel5VyQ4No_zWp8Sei1SansUl_uRLMtJhmrPqB7KIlMv4svM=s900-c-k-c0x00ffffff-no-rj",
    description:
      "Join a Clash Royale duel with crypto stakes! Winner takes all.",
    label: "Join Duel",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Join Duel",
          href: `/api/clash-duels/${duelId}/accept`,
          parameters: [
            {
              type: "text",
              name: "playerTag",
              label: "Your Clash Royale Player Tag (e.g., #2YCVJ0C9G)",
              required: true,
              pattern: "^#?[0-9A-Z]{8,}$",
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
    const { searchParams } = new URL(request.url);
    const duelId = searchParams.get("duelId");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/clash-duels/${duelId}/accept`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body.data),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to join duel");
    }

    const payload: ActionPostResponse = {
      type: "external-link",
      message: "Successfully joined duel! Get ready for battle!",
      externalLink: `https://play.clashroyale.com`,
    };

    return Response.json(payload, { headers });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Failed to join duel" },
      { status: 500, headers }
    );
  }
};

export const OPTIONS = async () => {
  return new Response(null, { headers });
};
