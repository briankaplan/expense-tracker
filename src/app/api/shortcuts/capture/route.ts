import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (!file) {
      return new NextResponse('No receipt image provided', { status: 400 });
    }

    // Upload to Supabase Storage
    const filename = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filename);

    // Process with Mindee
    const mindeeResponse = await fetch('/api/mindee/process', {
      method: 'POST',
      body: formData,
    });

    if (!mindeeResponse.ok) {
      throw new Error('Failed to process receipt with Mindee');
    }

    const ocrResult = await mindeeResponse.json();

    // Create receipt record
    const { data: receipt, error: receiptError } = await supabase
      .from('receipts')
      .insert([{
        user_id: session.user.id,
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type,
        status: 'pending',
        metadata: {
          ...metadata,
          location: {
            latitude: metadata.latitude,
            longitude: metadata.longitude,
          },
          calendar_event: metadata.calendar_event,
          people: metadata.people,
          ocr: {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
          },
          merchant: ocrResult.merchant,
          amount: ocrResult.amount,
          date: ocrResult.date,
        },
      }])
      .select()
      .single();

    if (receiptError) {
      throw receiptError;
    }

    // Try to match with existing expenses
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'pending')
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    let matchedExpense = null;
    if (expenses && ocrResult.amount) {
      matchedExpense = expenses.find(expense => 
        Math.abs(expense.amount - ocrResult.amount.value) < 0.01 &&
        (!ocrResult.date || 
          Math.abs(new Date(expense.date).getTime() - new Date(ocrResult.date.value).getTime()) < 24 * 60 * 60 * 1000)
      );

      if (matchedExpense) {
        await supabase
          .from('receipts')
          .update({
            expense_id: matchedExpense.id,
            status: 'matched',
          })
          .eq('id', receipt.id);

        await supabase
          .from('expenses')
          .update({
            receipt_id: receipt.id,
            status: 'matched',
          })
          .eq('id', matchedExpense.id);
      }
    }

    return NextResponse.json({
      receipt,
      matched_expense: matchedExpense,
    });
  } catch (error) {
    console.error('Failed to process receipt capture:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 