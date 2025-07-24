import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
