import { setBotCount } from '@/lib/orderService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { count } = await request.json();
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 0) {
      return NextResponse.json({ error: 'Invalid count' }, { status: 400 });
    }
    const bots = setBotCount(count);
    return NextResponse.json({ bots });
  } catch (error) {
    return NextResponse.json({ error: `Invalid request body: ${error}` }, { status: 400 });
  }
} 