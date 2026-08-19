import { NextResponse } from "next/server";

// Clean /resume URL → serves the hosted PDF at /resume.pdf
export function GET(request: Request) {
  const url = new URL("/resume.pdf", request.url);
  return NextResponse.redirect(url, { status: 301 });
}
