import { NextResponse } from 'next/server';
import { executeCommand } from '@/lib/services/nexus';

export async function POST(request: Request) {
  try {
    const { command } = await request.json();
    const result = await executeCommand(command);
    return NextResponse.json(result);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to execute command'
    }, { status: 500 });
  }
} 