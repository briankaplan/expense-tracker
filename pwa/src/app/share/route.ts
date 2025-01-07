import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const receipt = formData.get('receipt') as File;
    const title = formData.get('title');
    const text = formData.get('text');
    const url = formData.get('url');

    if (!receipt) {
      return NextResponse.json(
        { error: 'No receipt file provided' },
        { status: 400 }
      );
    }

    // Create form data for the main app
    const mainAppFormData = new FormData();
    mainAppFormData.append('receipt', receipt);
    mainAppFormData.append(
      'metadata',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        source: 'share',
        title,
        text,
        url,
      })
    );

    // Upload to main app
    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/receipts/upload`,
      {
        method: 'POST',
        body: mainAppFormData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload receipt');
    }

    const { receipt: uploadedReceipt } = await uploadResponse.json();

    // Redirect to receipt view
    return NextResponse.redirect(
      `${request.nextUrl.origin}/receipts/${uploadedReceipt.id}`
    );
  } catch (error) {
    console.error('Error processing shared receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    );
  }
} 