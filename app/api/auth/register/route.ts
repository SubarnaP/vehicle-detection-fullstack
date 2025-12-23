import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Mock login for development - accepts any credentials
  return NextResponse.json({
    message: "User created successfully",
    user: {
      id: `dev-user-${Date.now()}`,
      username: body.username,
    },
  }, { status: 201 });
}
