import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Add this for debugging
    console.log("API Keys:", {
      openai: process.env.NEXT_PUBLIC_WORDWARE_API_KEY ? "Set" : "Not Set",
      anthropic: process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? "Set" : "Not Set",
    });

    // Your existing code...
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
