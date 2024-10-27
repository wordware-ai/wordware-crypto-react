import { NextRequest, NextResponse } from "next/server";

const WORDWARE_API_URL = 'https://app.wordware.ai/api/released-app/3db7ccbe-a884-4894-9540-c17a2fb43509/run';
const WORDWARE_API_KEY = process.env.WORDWARE_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params;

    if (!WORDWARE_API_KEY) {
      console.error('WORDWARE_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key is not set' },
        { status: 500 }
      );
    }

    const response = await fetch(`${WORDWARE_API_URL}/${runId}`, {
      headers: {
        'Authorization': `Bearer ${WORDWARE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Wordware API error:", errorText);
      return NextResponse.json(
        {
          error: `Wordware API responded with status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
