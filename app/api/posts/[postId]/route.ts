import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement logic to get post by postId
  return Response.json({ message: "Get post by postId" });
}

export async function POST(request: NextRequest) {
  // TODO: Implement logic to add a post
  return Response.json({ message: "Add post" });
}
