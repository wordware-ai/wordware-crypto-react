import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WORDWARE_API_KEY = process.env.WORDWARE_API_KEY;
  const WORDWARE_APP_ID = "3db7ccbe-a884-4894-9540-c17a2fb43509";

  if (!WORDWARE_API_KEY) {
    return NextResponse.json(
      { error: "WORDWARE_API_KEY is not set" },
      { status: 500 }
    );
  }

  const { inputs } = await req.json();

  const response = await fetch(
    `https://app.wordware.ai/api/released-app/${WORDWARE_APP_ID}/run`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WORDWARE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs, version: "^3.4" }),
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Wordware API" },
      { status: response.status }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
