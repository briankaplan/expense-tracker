import { NextResponse } from 'next/server';
import { getNexusStatus } from '@/lib/services/nexus';

export async function GET() {
  try {
    const status = await getNexusStatus();
    return NextResponse.json(status);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get Nexus status'
    }, { status: 500 });
  }
} 