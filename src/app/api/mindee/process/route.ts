import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { mindee } from '@mindee/mindee-api';

const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });

export async function POST(request: Request) {
  try {
    // Get the user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Convert File to Buffer for Mindee
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process with Mindee
    const apiResponse = await mindeeClient.parse(
      mindee.product.ReceiptV5,
      buffer,
      { filename: file.name }
    );

    const prediction = apiResponse.document;

    // Extract relevant information
    const result = {
      merchant: {
        name: prediction.merchant?.value || '',
        confidence: prediction.merchant?.confidence || 0,
      },
      date: {
        value: prediction.date?.value?.toISOString() || '',
        confidence: prediction.date?.confidence || 0,
      },
      amount: {
        value: prediction.totalAmount?.value || 0,
        confidence: prediction.totalAmount?.confidence || 0,
      },
      category: prediction.category?.value || '',
      lineItems: prediction.lineItems?.map(item => ({
        description: item.description?.value || '',
        amount: item.totalAmount?.value || 0,
        quantity: item.quantity?.value || 1,
      })) || [],
      taxes: prediction.taxes?.map(tax => ({
        base: tax.baseAmount?.value || 0,
        rate: tax.rate?.value || 0,
        amount: tax.amount?.value || 0,
      })) || [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to process receipt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 