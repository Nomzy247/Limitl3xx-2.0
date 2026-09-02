import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';

interface RouteMeta {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
}

const routeMetadataMap: Record<string, RouteMeta> = {
  '/': {
    title: 'PoolMining - Institutional Next-Gen Cloud & Pool Mining Platform',
    description: 'Mine Bitcoin and Ethereum with high-efficiency enterprise ASICs, zero hardware maintenance, and daily instant automated payouts on PoolMining.',
    keywords: 'Bitcoin mining, cloud mining, hashpower, crypto pool mining, ASIC hardware, BTC miner',
  },
  '/login': {
    title: 'Sign In | PoolMining',
    description: 'Log in to your PoolMining account to monitor active hashrates, view daily earnings, and manage your wallet.',
  },
  '/signup': {
    title: 'Create Account | PoolMining',
    description: 'Join PoolMining to start mining Bitcoin instantly with automated cloud contracts and institutional mining pools.',
  },
  '/dashboard': {
    title: 'Mining Dashboard | PoolMining',
    description: 'Real-time telemetry, active hashpower distribution, live payout trackers, and hardware diagnostics.',
  },
  '/hub': {
    title: 'Mobile Mining Hub | PoolMining',
    description: 'Quick mobile hub for managing cloud hashpower, daily yields, and instantaneous crypto asset balances.',
  },
  '/pool-mining': {
    title: 'High-Yield Pool Mining | PoolMining',
    description: 'Connect to global institutional mining pools with dynamic difficulty switching and maximum stratum profitability.',
  },
  '/cloud-mining': {
    title: 'Cloud Mining Contracts | PoolMining',
    description: 'Rent enterprise-grade hashing power with guaranteed uptimes, daily settlement, and flexible contract durations.',
  },
  '/buy-hashpower': {
    title: 'Buy Hashpower & Mining Hardware | PoolMining',
    description: 'Scale your mining operations by purchasing dedicated Terahash packages with transparent ROI forecasting.',
  },
  '/live-trading': {
    title: 'Live Crypto Trading & Order Book | PoolMining',
    description: 'Execute instant spot trades with real-time Binance market depth, interactive charts, and zero execution latency.',
  },
  '/crypto-trading': {
    title: 'Crypto Markets & Swaps | PoolMining',
    description: 'Trade top cryptocurrencies and manage automated trading portfolios securely.',
  },
  '/wallet': {
    title: 'Crypto Wallet & Asset Management | PoolMining',
    description: 'Multi-chain non-custodial crypto wallet supporting instant BTC, ETH, and USDT deposits and withdrawals.',
  },
  '/assets': {
    title: 'Asset Allocation & Wealth Portfolio | PoolMining',
    description: 'Visual overview of your portfolio allocation, mining yields, and historical asset growth trajectory.',
  },
  '/deposit': {
    title: 'Deposit Funds | PoolMining',
    description: 'Add BTC, ETH, or USDT to your balance to purchase hashpower or expand your mining contracts.',
  },
  '/withdraw': {
    title: 'Withdraw Earnings | PoolMining',
    description: 'Fast, secure on-chain withdrawals for your accumulated mining payouts and portfolio profits.',
  },
  '/transactions': {
    title: 'Transaction History | PoolMining',
    description: 'Audit logs for all deposits, withdrawals, contract purchases, and daily reward distributions.',
  },
  '/referrals': {
    title: 'Affiliate & Referral Program | PoolMining',
    description: 'Earn generous recurring commissions and tier bonuses by inviting miners to the PoolMining ecosystem.',
  },
  '/marketplace': {
    title: 'Mining Hardware & Rig Marketplace | PoolMining',
    description: 'Browse, buy, and sell ASIC mining equipment and secondary market cloud contracts.',
  },
  '/locations': {
    title: 'Global Data Centers & Mining Facilities | PoolMining',
    description: 'Explore our eco-friendly, hydro-powered mining data centers across North America, Iceland, and Scandinavia.',
  },
  '/services': {
    title: 'Enterprise Mining Services | PoolMining',
    description: 'Institutional hosting, firmware optimization, custody solutions, and private pool deployment.',
  },
  '/about': {
    title: 'About PoolMining | Enterprise Crypto Infrastructure',
    description: 'Learn about our mission to democratize clean, high-performance cryptocurrency mining infrastructure worldwide.',
  },
  '/contact': {
    title: 'Contact Support & Enterprise Inquiries | PoolMining',
    description: 'Get in touch with our 24/7 technical team for support, institutional partnerships, and hosting inquiries.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | PoolMining',
    description: 'Find answers about mining payouts, hardware maintenance, security standards, and payment options.',
  },
  '/support': {
    title: 'Help Desk & Support Center | PoolMining',
    description: 'Access guides, submit support tickets, and chat with our mining specialist engineering team.',
  },
  '/profile': {
    title: 'Account Profile & Security | PoolMining',
    description: 'Manage two-factor authentication, API credentials, and personal account security preferences.',
  },
  '/settings': {
    title: 'User Preferences & Settings | PoolMining',
    description: 'Customize notifications, display currency, language preferences, and power-saving settings.',
  },
  '/integration/e-payment': {
    title: 'E-Payment Terminal & POS Integration | PoolMining',
    description: 'Accept instant cryptocurrency and fiat e-payments directly into your mining settlement balance.',
  },
};

const defaultMeta: RouteMeta = {
  title: 'PoolMining - Institutional Next-Gen Cloud & Pool Mining Platform',
  description: 'Enterprise-grade Bitcoin & Ethereum cloud and pool mining platform with automated daily yields and instant withdrawals.',
  keywords: 'Bitcoin mining, cloud mining, hashpower, crypto pool mining, ASIC hardware, BTC miner',
  ogType: 'website',
};

export default function RouteMetaHandler() {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const refParam = searchParams.get('ref') || searchParams.get('code');
      if (refParam) {
        const cleanCode = refParam.trim().toUpperCase();
        localStorage.setItem('poolmining_referral_code', cleanCode);
        sessionStorage.setItem('poolmining_referral_code', cleanCode);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, [location.search]);

  const currentMeta = routeMetadataMap[pathname] || defaultMeta;
  const canonicalUrl = `https://poolmining.cloud${pathname === '/' ? '' : pathname}`;
  const ogImage = 'https://poolmining.cloud/logo.png';

  return (
    <Helmet>
      {/* Basic Primary Meta Tags */}
      <title>{currentMeta.title}</title>
      <meta name="title" content={currentMeta.title} />
      <meta name="description" content={currentMeta.description} />
      {currentMeta.keywords && <meta name="keywords" content={currentMeta.keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook / Discord / LinkedIn */}
      <meta property="og:type" content={currentMeta.ogType || 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={currentMeta.title} />
      <meta property="og:description" content={currentMeta.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="PoolMining Cloud" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={currentMeta.title} />
      <meta name="twitter:description" content={currentMeta.description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
