'use server';

import { notifyAllResidents as notifyAll } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export async function notifyResidentsAction(subject, body) {
  const supabase = await createClient();
  await notifyAll({ supabase, subject, body });
}
