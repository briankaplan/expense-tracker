import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Dropbox } from 'dropbox';

const DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET;

export async function POST(request: Request) {
  try {
    // Get the user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's Dropbox credentials from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('dropbox_refresh_token')
      .eq('id', session.user.id)
      .single();

    if (!profile?.dropbox_refresh_token) {
      return new NextResponse('Dropbox account not connected', { status: 400 });
    }

    // Initialize Dropbox client
    const dbx = new Dropbox({
      clientId: DROPBOX_APP_KEY,
      clientSecret: DROPBOX_APP_SECRET,
      refreshToken: profile.dropbox_refresh_token,
    });

    // Get all receipts from the last backup
    const { data: lastBackup } = await supabase
      .from('backup_logs')
      .select('last_backup_date')
      .eq('user_id', session.user.id)
      .single();

    const { data: receipts } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', session.user.id)
      .gt('uploaded_at', lastBackup?.last_backup_date || '1970-01-01')
      .order('uploaded_at', { ascending: true });

    if (!receipts?.length) {
      return NextResponse.json({ message: 'No new receipts to backup' });
    }

    // Create backup folder structure
    const backupPath = `/Receipts/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
    
    try {
      await dbx.filesCreateFolderV2({
        path: backupPath,
        autorename: false,
      });
    } catch (error: any) {
      // Ignore folder exists error
      if (error?.status !== 409) {
        throw error;
      }
    }

    // Backup each receipt
    const results = [];
    for (const receipt of receipts) {
      // Download receipt from Supabase Storage
      const { data: fileData } = await supabase.storage
        .from('receipts')
        .download(receipt.filename);

      if (fileData) {
        // Upload to Dropbox
        const uploadResult = await dbx.filesUpload({
          path: `${backupPath}/${receipt.filename}`,
          contents: fileData,
          mode: { '.tag': 'overwrite' },
        });

        results.push({
          receipt_id: receipt.id,
          dropbox_path: uploadResult.result.path_display,
          status: 'success',
        });
      }
    }

    // Update backup log
    await supabase
      .from('backup_logs')
      .upsert({
        user_id: session.user.id,
        last_backup_date: new Date().toISOString(),
        total_files: results.length,
      });

    return NextResponse.json({
      message: 'Backup completed successfully',
      results,
    });
  } catch (error) {
    console.error('Failed to backup to Dropbox:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 