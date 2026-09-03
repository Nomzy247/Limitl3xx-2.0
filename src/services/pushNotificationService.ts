// Web Push Notification & Real-Time Alert Service for PoolMining.cloud
import { toast } from 'sonner';

export interface PushAlertPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  type?: 'mining_payout' | 'gift_card_approved' | 'deposit' | 'withdrawal' | 'security' | 'system';
}

const NOTIFICATION_SOUND_ENABLED_KEY = 'poolmining_sound_alerts_enabled';
const PUSH_ALERTS_ENABLED_KEY = 'poolmining_push_alerts_enabled';

// Play high-fidelity crystal notification chime
export function playNotificationChime(pitch: 'high' | 'mid' | 'payout' = 'payout') {
  try {
    const isSoundEnabled = localStorage.getItem(NOTIFICATION_SOUND_ENABLED_KEY) !== 'false';
    if (!isSoundEnabled) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (pitch === 'payout') {
      // Harmonic 3-note ascending triumph chime (C6 -> E6 -> G6)
      const notes = [1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else {
      // Dual-tone chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Ignore audio autoplay policy restrictions
  }
}

// Check if browser supports Web Notifications
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isPushNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Check if user has enabled in-app push settings
export function isPushAlertsEnabled(): boolean {
  return localStorage.getItem(PUSH_ALERTS_ENABLED_KEY) !== 'false';
}

// Set push alerts enabled/disabled
export function setPushAlertsEnabled(enabled: boolean): void {
  localStorage.setItem(PUSH_ALERTS_ENABLED_KEY, enabled ? 'true' : 'false');
}

// Check sound alerts enabled
export function isSoundAlertsEnabled(): boolean {
  return localStorage.getItem(NOTIFICATION_SOUND_ENABLED_KEY) !== 'false';
}

// Set sound alerts enabled/disabled
export function setSoundAlertsEnabled(enabled: boolean): void {
  localStorage.setItem(NOTIFICATION_SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

// Request Notification Permission from Browser
export async function requestPushPermission(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    toast.error('Web push notifications are not supported by this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushAlertsEnabled(true);
      playNotificationChime('payout');
      toast.success('Push notifications enabled! You will receive real-time payout & gift card trade alerts.');
      return true;
    } else if (permission === 'denied') {
      toast.error('Notification permission was blocked in browser settings.');
      return false;
    }
    return false;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

// Send a push alert (Native Browser Notification + In-App Toast + Audio)
export function triggerPushAlert(payload: PushAlertPayload): void {
  const { title, body, icon = '/favicon.ico', tag, url, type = 'system' } = payload;

  // 1. Play audible chime
  playNotificationChime(type === 'mining_payout' || type === 'gift_card_approved' ? 'payout' : 'mid');

  // 2. Show rich In-App Toast
  if (type === 'mining_payout') {
    toast.success(title, {
      description: body,
      duration: 6000
    });
  } else if (type === 'gift_card_approved') {
    toast.success(title, {
      description: body,
      duration: 6000
    });
  } else {
    toast.info(title, {
      description: body,
      duration: 5000
    });
  }

  // 3. Trigger Browser Web Push Notification (Desktop & Mobile PWA)
  if (isPushNotificationSupported() && Notification.permission === 'granted' && isPushAlertsEnabled()) {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: tag || `poolmining-${Date.now()}`,
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        if (url) {
          window.location.href = url;
        }
        notification.close();
      };
    } catch (e) {
      console.warn('Native push notification error:', e);
    }
  }
}

// Specialized Trigger: Cloud Mining Payout Credited
export function notifyMinedPayout(amount: number, currency: string = 'USD', planName?: string) {
  const formattedAmount = currency === 'USD' || !currency 
    ? `$${amount.toFixed(2)} USD` 
    : `${amount} ${currency}`;

  triggerPushAlert({
    title: '⛏️ Cloud Mining Payout Credited!',
    body: `Your daily yield of ${formattedAmount} ${planName ? `(${planName})` : ''} has been deposited to your balance.`,
    type: 'mining_payout',
    url: '/dashboard'
  });
}

// Specialized Trigger: Gift Card Trade Approved
export function notifyGiftCardApproved(amount: number, brandName: string = 'Gift Card', currency: string = 'USD') {
  const formattedAmount = currency === 'USD' || !currency 
    ? `$${amount.toFixed(2)} USD` 
    : `${currency} ${amount}`;

  triggerPushAlert({
    title: '🎁 Gift Card Trade Approved!',
    body: `Your ${brandName} deposit of ${formattedAmount} has been verified and credited to your wallet balance.`,
    type: 'gift_card_approved',
    url: '/dashboard'
  });
}
