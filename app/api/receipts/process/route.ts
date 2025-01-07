import { NextResponse } from 'next/server';
import { mindee } from 'mindee';

const mindeeClient = new mindee.Client({ apiKey: process.env.NEXT_PUBLIC_MINDEE_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const inputSource = await mindeeClient.docFromBuffer(buffer);
    
    const apiResponse = await mindeeClient.parse(
      mindee.product.ReceiptV5,
      inputSource
    );

    const prediction = apiResponse.document.inference.prediction;
    
    return NextResponse.json({
      merchant: prediction.supplierName?.value,
      date: prediction.date?.value,
      total: prediction.totalAmount?.value,
      subtotal: prediction.totalNet?.value,
      tax: prediction.totalTax?.value,
      lineItems: prediction.lineItems?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
      })),
      paymentMethod: prediction.paymentMethod?.value,
      currency: prediction.currency?.value,
      receiptNumber: prediction.receiptNumber?.value,
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
} 