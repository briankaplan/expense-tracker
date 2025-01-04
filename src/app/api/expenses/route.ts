import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

async function updateDocument(collection: string, id: string, data: any) {
  const result = await db.collection(collection).doc(id).update(data);
  return result;
}

async function deleteDocument(collection: string, id: string) {
  const result = await db.collection(collection).doc(id).delete();
  return result;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const expenses = await db.collection('expenses')
      .where('userId', '==', session.user.id)
      .get();

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{ ...data, userId: user.id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    await updateDocument('expenses', id, updateData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    await deleteDocument('expenses', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 