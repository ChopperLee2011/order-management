import { getSystemState } from '@/lib/orderService';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET() {
  const state = getSystemState();
  return NextResponse.json(state);
} 