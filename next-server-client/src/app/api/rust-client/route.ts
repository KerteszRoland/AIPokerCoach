import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/getSession";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/api/auth/signin", request.url));
    }
    const accessToken = session.accessToken;
    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(
      new URL(`ai-poker-coach://callback?token=${accessToken}`)
    );
  } catch (error) {
    console.error("Error sending access token to Rust client", error);
    return NextResponse.json(
      { error: "Failed to send access token to Rust client" },
      { status: 500 }
    );
  }
}
