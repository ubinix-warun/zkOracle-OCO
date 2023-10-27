import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// @ts-ignore

export function GET(request: NextRequest) {
    const searchParams = new URLSearchParams(request.nextUrl.search);
    return NextResponse.json(
      {},
      { status: 200 }
    );
  }