import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(error: string, status: number = 500) {
  return NextResponse.json({ success: false, error }, { status });
}
