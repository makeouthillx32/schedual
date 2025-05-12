// app/api/conversations/route.ts
// NOTE: Old functionality disabled – this endpoint now does nothing.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "This endpoint is currently disabled." }, { status: 200 });
}