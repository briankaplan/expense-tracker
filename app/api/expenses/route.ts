import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { dateRange } = body;

    // TODO: Replace with actual database query
    const expenses = await db.expense.findMany({
      where: {
        userId: session.user.id,
        ...(dateRange && {
          date: {
            gte: dateRange[0],
            lte: dateRange[1]
          }
        })
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('[EXPENSES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    const expense = await db.expense.update({
      where: { id, userId: session.user.id },
      data
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('[EXPENSES_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 