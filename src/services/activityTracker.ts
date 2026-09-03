import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface GeoLocationData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  flag: string;
  org?: string;
  latitude?: number;
  longitude?: number;
}

let cachedGeo: GeoLocationData | null = null;
let isFetchingGeo = false;
const lastLoggedActions = new Map<string, number>();

// Convert 2-letter country code to flag emoji
export function getFlagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Get device & browser metadata
export function getDeviceDetails() {
  if (typeof window === 'undefined') {
    return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }

  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  const isMobile = /mobile|android|iphone|ipad/i.test(ua) || (window.innerWidth <= 768);
  const device = isMobile ? 'Mobile Device' : 'Desktop PC';

  return { device, browser, os, screen: `${window.innerWidth}x${window.innerHeight}` };
}

// Fetch Geo Location with multi-tier fallback
export async function getClientLocation(): Promise<GeoLocationData> {
  if (cachedGeo) return cachedGeo;

  // Check sessionStorage
  try {
    const stored = sessionStorage.getItem('pm_client_geo');
    if (stored) {
      cachedGeo = JSON.parse(stored);
      return cachedGeo!;
    }
  } catch (e) {}

  if (isFetchingGeo) {
    // Wait slightly if already in flight
    await new Promise(r => setTimeout(r, 400));
    if (cachedGeo) return cachedGeo;
  }

  isFetchingGeo = true;

  try {
    // Primary Provider: ipwho.is (CORS friendly, fast, detailed)
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        cachedGeo = {
          ip: data.ip || 'Unknown IP',
          city: data.city || 'Unknown City',
          region: data.region || '',
          country: data.country || 'Global',
          country_code: data.country_code || 'UN',
          flag: data.country_code ? getFlagEmoji(data.country_code) : (data.flag?.emoji || '🌐'),
          org: data.connection?.isp || data.connection?.org || '',
          latitude: data.latitude,
          longitude: data.longitude
        };
        sessionStorage.setItem('pm_client_geo', JSON.stringify(cachedGeo));
        return cachedGeo;
      }
    }
  } catch (err) {
    // Fallback 1: ipapi.co
    try {
      const res2 = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
      if (res2.ok) {
        const data2 = await res2.json();
        cachedGeo = {
          ip: data2.ip || 'Unknown IP',
          city: data2.city || 'Unknown City',
          region: data2.region || '',
          country: data2.country_name || data2.country || 'Global',
          country_code: data2.country_code || 'UN',
          flag: getFlagEmoji(data2.country_code),
          org: data2.org || ''
        };
        sessionStorage.setItem('pm_client_geo', JSON.stringify(cachedGeo));
        return cachedGeo;
      }
    } catch (e2) {}
  } finally {
    isFetchingGeo = false;
  }

  // Fallback 3: Locale-derived fallback
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  cachedGeo = {
    ip: 'Live Client',
    city: timeZone.split('/')[1]?.replace(/_/g, ' ') || 'International',
    region: timeZone.split('/')[0] || '',
    country: 'International Visitor',
    country_code: 'UN',
    flag: '🌐',
    org: 'Direct Web Client'
  };
  return cachedGeo;
}

export interface ActivityPayload {
  action: string;
  path?: string;
  category?: 'click' | 'navigation' | 'deposit' | 'withdraw' | 'trade' | 'mining' | 'auth' | 'support';
  user?: {
    uid?: string;
    email?: string;
    name?: string;
    role?: string;
  } | null;
  metadata?: Record<string, any>;
}

// Main method to log live activity and notify Admin
export async function trackClientActivity(payload: ActivityPayload) {
  // Prevent logging from admin accounts doing admin maintenance
  if (payload.user?.role === 'admin' || payload.user?.email === 'why.wd.ww.do@gmail.com') {
    return;
  }

  const path = payload.path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const actionKey = `${payload.action}_${path}`;
  const now = Date.now();

  // Debounce: don't log duplicate identical clicks within 2.5 seconds
  const lastTime = lastLoggedActions.get(actionKey);
  if (lastTime && now - lastTime < 2500) {
    return;
  }
  lastLoggedActions.set(actionKey, now);

  try {
    const geo = await getClientLocation();
    const dev = getDeviceDetails();

    const docData = {
      action: payload.action,
      category: payload.category || 'click',
      path: path,
      user_id: payload.user?.uid || 'guest',
      user_email: payload.user?.email || 'Guest Client',
      user_name: payload.user?.name || (payload.user?.email ? payload.user.email.split('@')[0] : 'Visitor'),
      is_authenticated: Boolean(payload.user?.uid),
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      country_code: geo.country_code,
      flag: geo.flag,
      org: geo.org || '',
      device: dev.device,
      browser: dev.browser,
      os: dev.os,
      screen: dev.screen,
      metadata: payload.metadata || {},
      timestamp: serverTimestamp(),
      created_at_ms: now
    };

    await addDoc(collection(db, 'live_activity'), docData);
  } catch (err) {
    // Non-blocking telemetry
    console.debug('[Telemetry] Live activity logged locally:', payload.action);
  }
}
