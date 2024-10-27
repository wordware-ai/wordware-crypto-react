import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { inputs, version } = body;

  // Here you would typically process the input and generate a response
  // For now, we'll just echo back the received data
  const response = {
    inputs,
    version,
    message: "This is a mock response from the Wordware API",
  };

  return NextResponse.json(response);
}
