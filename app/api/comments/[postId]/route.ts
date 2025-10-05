import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: Implement logic to get comments by postId
  return Response.json({ message: "Get comments by postId" });
}

export async function POST(request: NextRequest) {
  // TODO: Implement logic to add a comment
  return Response.json({ message: "Add comment" });
}
