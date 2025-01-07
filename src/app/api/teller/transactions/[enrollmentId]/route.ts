import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const TELLER_API_URL = process.env.TELLER_API_URL || 'https://api.teller.io';
const TELLER_SIGNING_SECRET = process.env.TELLER_SIGNING_SECRET;

export async function GET(
  request: Request,
  { params }: { params: { enrollmentId: string } }
) {
  try {
    // Get the user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch transactions from Teller
    const response = await fetch(
      `${TELLER_API_URL}/accounts/${params.enrollmentId}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${TELLER_SIGNING_SECRET}`,
          'Teller-Version': '2022-01-01',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Teller API error: ${response.statusText}`);
    }

    const transactions = await response.json();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 