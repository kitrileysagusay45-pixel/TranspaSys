import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

let webpushConfigured = false;

function getWebPush() {
  if (webpushConfigured) return webpush;
  
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
      vapidSubject,
      publicVapidKey,
      privateVapidKey
    );
    webpushConfigured = true;
  }
  return webpush;
}

export async function sendPushNotification({ title, body, icon = '/icons/icon-192x192.png', url = '/' }) {
  const supabase = await createClient();
  
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription');

  if (error) {
    console.error('[Push Error] Failed to fetch subscriptions:', error);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('[Push Skip] No active subscriptions found.');
    return;
  }

  const payload = JSON.stringify({
    title,
    body,
    icon,
    data: { url }
  });

  console.log(`[Push Start] Sending to ${subscriptions.length} devices...`);

  const wp = getWebPush();

  const results = await Promise.allSettled(
    subscriptions.map((s) => 
      wp.sendNotification(s.subscription, payload)
        .catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            // Subscription expired or no longer valid, should delete from DB
            return { delete: s.subscription.endpoint };
          }
          throw err;
        })
    )
  );

  // Cleanup dead subscriptions
  const toDelete = results
    .filter(r => r.status === 'fulfilled' && r.value?.delete)
    .map(r => r.value.delete);

  if (toDelete.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .filter('subscription->>endpoint', 'in', `(${toDelete.map(e => `"${e}"`).join(',')})`);
  }

  const successCount = results.filter(r => r.status === 'fulfilled' && !r.value?.delete).length;
  console.log(`[Push Success] delivered to ${successCount} devices, cleaned up ${toDelete.length} dead links.`);
}
