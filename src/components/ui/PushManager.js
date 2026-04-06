'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && VAPID_PUBLIC_KEY) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
    
    if (subscription) {
      // Sync with DB just in case
      saveSubscription(subscription);
    }
  }

  async function subscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      await saveSubscription(subscription);
      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  async function saveSubscription(subscription) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First check if the table exists to avoid 404/400 errors in console
    const { error: checkError } = await supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).limit(1);
    if (checkError && (checkError.code === '42P01' || checkError.status === 404)) {
      console.warn('[PushManager] push_subscriptions table NOT found. Skipping save.');
      return;
    }

    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: subscription.toJSON()
    }, { onConflict: 'user_id' });
  }

  if (!isSupported) return null;

  return null;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
