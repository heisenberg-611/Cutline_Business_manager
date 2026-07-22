import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let payload: any;
    
    // If you added RESEND_WEBHOOK_SECRET to your .env, we'll verify it securely
    if (process.env.RESEND_WEBHOOK_SECRET) {
      const headerPayload = await headers();
      const svix_id = headerPayload.get('svix-id');
      const svix_timestamp = headerPayload.get('svix-timestamp');
      const svix_signature = headerPayload.get('svix-signature');
      
      if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ success: false, message: 'Missing Svix headers' }, { status: 400 });
      }

      const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
      
      try {
        payload = wh.verify(rawBody, {
          'svix-id': svix_id,
          'svix-timestamp': svix_timestamp,
          'svix-signature': svix_signature,
        });
      } catch (err) {
        console.error('Error verifying Resend webhook:', err);
        return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 400 });
      }
    } else {
      // Fallback if secret isn't set yet
      payload = JSON.parse(rawBody);
    }

    // Verify it's an email.received event
    if (payload.type !== 'email.received') {
      return NextResponse.json({ success: true, message: 'Ignored non-receive event' });
    }

    const { to } = payload.data;

    // Handle both array and string formats for 'to' field securely
    const toArray = Array.isArray(to) ? to : [to];
    const toAddressStr = toArray.join(', ').toLowerCase();
    
    // Get the destination email from environment variables, fallback to a catch-all
    let forwardTo = process.env.PERSONAL_FORWARD_EMAIL;

    if (toAddressStr.includes('sales@')) {
      forwardTo = process.env.SALES_FORWARD_EMAIL || process.env.PERSONAL_FORWARD_EMAIL;
    } else if (toAddressStr.includes('support@')) {
      forwardTo = process.env.SUPPORT_FORWARD_EMAIL || process.env.PERSONAL_FORWARD_EMAIL;
    }
    
    if (!forwardTo) {
      console.warn('Inbound webhook received but PERSONAL_FORWARD_EMAIL is not set in environment.');
      return NextResponse.json({ success: false, message: 'Forwarding email not configured' }, { status: 500 });
    }

    // Forward the email using Resend's built-in forwarding method
    // This correctly fetches the original email (including HTML/text/attachments) 
    // and forwards it to the destination.
    const { error } = await resend.emails.receiving.forward({
      emailId: payload.data.email_id,
      to: forwardTo,
      from: 'contact@cutlin.tech', // Must be your verified sending domain
    });

    if (error) {
      console.error('Failed to forward email:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing inbound webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
