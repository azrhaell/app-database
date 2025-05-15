import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder");
  if (!folder) return NextResponse.json([], { status: 400 });

  const dir = path.join(process.cwd(), "public", folder);

  if (!fs.existsSync(dir)) return NextResponse.json([], { status: 200 });

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql") || f.endsWith(".zip"));
  return NextResponse.json(files);
}
