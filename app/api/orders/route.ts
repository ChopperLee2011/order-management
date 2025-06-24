import { addOrder } from '@/lib/orderService';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    if (type !== 'NORMAL' && type !== 'VIP') {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }
    const newOrder = addOrder(type);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: `Invalid request body: ${error}` }, { status: 400 });
  }
} 