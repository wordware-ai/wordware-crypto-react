import { NextRequest, NextResponse } from "next/server";
import { WordwareClient } from "wordware";

const WORDWARE_API_KEY = process.env.WORDWARE_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params;

    if (!WORDWARE_API_KEY) {
      console.error("WORDWARE_API_KEY is not set");
      return NextResponse.json(
        { error: "API key is not set" },
        { status: 500 }
      );
    }

    const client = new WordwareClient({ apiKey: WORDWARE_API_KEY });
    const runResult = await client.runs.run({ runId });

    // Log the run result
    console.log("Wordware get-run result:", runResult);

    return NextResponse.json(runResult);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
