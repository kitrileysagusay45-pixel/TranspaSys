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

    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: subscription.toJSON()
    }, { onConflict: 'user_id' });
  }

  if (!isSupported) return null;

  return (
    <div className="push-banner" style={{
      background: 'rgba(99, 102, 241, 0.1)',
      padding: '12px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      border: '1px solid rgba(99, 102, 241, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <i className="bi bi-bell-fill" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stay Updated!</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isSubscribed ? 'You are receiving notifications for new events.' : 'Get notified about new events and announcements.'}
          </div>
        </div>
      </div>
      {!isSubscribed && (
        <button onClick={subscribe} className="btn btn-sm btn-primary">
          Enable Notifications
        </button>
      )}
    </div>
  );
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
