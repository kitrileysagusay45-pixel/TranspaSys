'use server';

import { notifyAllResidents as notifyAll } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/push';

export async function notifyResidentsAction(subject, body, url = '/') {
  const supabase = await createClient();
  
  // Send emails
  await notifyAll({ supabase, subject, body });
  
  // Send push notifications
  await sendPushNotification({ title: subject, body, url });
}
