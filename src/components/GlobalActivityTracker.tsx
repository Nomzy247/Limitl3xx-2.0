import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { trackClientActivity } from '../services/activityTracker';

export default function GlobalActivityTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const lastPathRef = useRef<string>('');

  // 1. Track route changes & page visits
  useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      lastPathRef.current = location.pathname;

      let pageTitle = location.pathname;
      if (location.pathname === '/') pageTitle = 'Homepage';
      else if (location.pathname.startsWith('/dashboard')) pageTitle = 'Mining Dashboard';
      else if (location.pathname.startsWith('/deposit')) pageTitle = 'Deposit Center';
      else if (location.pathname.startsWith('/withdraw')) pageTitle = 'Withdrawal Center';
      else if (location.pathname.startsWith('/buy-hashpower')) pageTitle = 'Hashpower Market';
      else if (location.pathname.startsWith('/pool-mining')) pageTitle = 'Pool Mining Area';
      else if (location.pathname.startsWith('/cloud-mining')) pageTitle = 'Cloud Mining Area';
      else if (location.pathname.startsWith('/live-trading')) pageTitle = 'Live Trading Terminal';
      else if (location.pathname.startsWith('/crypto-trading')) pageTitle = 'Spot Trading';
      else if (location.pathname.startsWith('/support')) pageTitle = 'Live Support Chat';
      else if (location.pathname.startsWith('/wallet')) pageTitle = 'Multi-Coin Wallet';
      else if (location.pathname.startsWith('/transactions')) pageTitle = 'Transaction Ledger';
      else if (location.pathname.startsWith('/referrals')) pageTitle = 'Referral Program';
      else if (location.pathname.startsWith('/settings')) pageTitle = 'Account Settings';
      else if (location.pathname.startsWith('/login')) pageTitle = 'Client Login Page';
      else if (location.pathname.startsWith('/signup')) pageTitle = 'Client Signup Page';
      else if (location.pathname.startsWith('/locations')) pageTitle = 'Datacenter Locations';

      trackClientActivity({
        action: `Navigated to ${pageTitle} (${location.pathname})`,
        path: location.pathname,
        category: 'navigation',
        user: user ? { uid: user.uid, email: user.email, name: user.name, role: user.role } : null
      });
    }
  }, [location.pathname, user]);

  // 2. Global intelligent click tracker
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive element
      const interactiveEl = target.closest('button, a, input[type="button"], input[type="submit"], [role="button"], [data-track]');
      if (!interactiveEl) return;

      // Ignore internal pagination or micro-carousels if needed, but capture meaningful actions
      let text = (interactiveEl.textContent || '').trim().replace(/\s+/g, ' ');
      const ariaLabel = interactiveEl.getAttribute('aria-label') || interactiveEl.getAttribute('title');
      const href = interactiveEl.getAttribute('href');

      if (!text && ariaLabel) text = ariaLabel;
      if (!text && href) text = `Link: ${href}`;
      if (!text) text = interactiveEl.className?.includes('icon') ? 'Icon Button' : 'Interactive Element';

      // Truncate long texts
      if (text.length > 50) text = text.slice(0, 47) + '...';

      // Determine category
      let category: 'click' | 'deposit' | 'withdraw' | 'trade' | 'mining' | 'support' = 'click';
      const textLower = text.toLowerCase();
      if (textLower.includes('deposit') || textLower.includes('pay') || textLower.includes('gift card')) {
        category = 'deposit';
      } else if (textLower.includes('withdraw') || textLower.includes('payout')) {
        category = 'withdraw';
      } else if (textLower.includes('trade') || textLower.includes('buy') || textLower.includes('sell')) {
        category = 'trade';
      } else if (textLower.includes('hash') || textLower.includes('miner') || textLower.includes('pool') || textLower.includes('start')) {
        category = 'mining';
      } else if (textLower.includes('support') || textLower.includes('help') || textLower.includes('chat') || textLower.includes('send')) {
        category = 'support';
      }

      trackClientActivity({
        action: `Clicked: "${text}" on ${location.pathname}`,
        path: location.pathname,
        category: category,
        user: user ? { uid: user.uid, email: user.email, name: user.name, role: user.role } : null,
        metadata: {
          element: interactiveEl.tagName.toLowerCase(),
          href: href || undefined
        }
      });
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [location.pathname, user]);

  return null;
}
