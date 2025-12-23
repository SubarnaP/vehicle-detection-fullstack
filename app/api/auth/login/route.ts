import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Mock login for development - accepts any credentials
  return NextResponse.json({
    message: "Login successful",
    user: {
      id: "dev-user",
      username: body.username || "admin",
    },
    token: "dev-token-bypass"
  });
}
