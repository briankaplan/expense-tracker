import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const GMAIL_CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
};

export async function POST(request: Request) {
  try {
    // Get the user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's Google credentials from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', session.user.id)
      .single();

    if (!profile?.google_refresh_token) {
      return new NextResponse('Google account not connected', { status: 400 });
    }

    // Set up OAuth2 client
    const oauth2Client = new OAuth2Client(
      GMAIL_CREDENTIALS.client_id,
      GMAIL_CREDENTIALS.client_secret,
      GMAIL_CREDENTIALS.redirect_uri
    );

    oauth2Client.setCredentials({
      refresh_token: profile.google_refresh_token,
    });

    // Create Gmail client
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for emails with receipts
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(receipt OR invoice OR order) has:attachment newer_than:30d',
    });

    const messages = response.data.messages || [];
    const receipts = [];

    // Process each email
    for (const message of messages) {
      const email = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
      });

      // Get attachments
      const attachmentParts = email.data.payload?.parts?.filter(
        part => part.filename && part.body?.attachmentId
      );

      if (attachmentParts) {
        for (const part of attachmentParts) {
          const attachment = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId: message.id!,
            id: part.body!.attachmentId!,
          });

          if (attachment.data.data) {
            // Convert from base64
            const buffer = Buffer.from(attachment.data.data, 'base64');

            // Process with Mindee (you would typically call your Mindee API endpoint here)
            const mindeeResponse = await fetch('/api/mindee/process', {
              method: 'POST',
              body: buffer,
            });

            if (mindeeResponse.ok) {
              const result = await mindeeResponse.json();
              receipts.push({
                emailId: message.id,
                filename: part.filename,
                data: result,
              });
            }
          }
        }
      }
    }

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Failed to sync Gmail receipts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 