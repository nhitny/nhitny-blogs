import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement logic to get likes by postId
  return Response.json({ message: "Get likes by postId" });
}

export async function POST(request: NextRequest) {
  // TODO: Implement logic to add a like
  return Response.json({ message: "Add like" });
}
