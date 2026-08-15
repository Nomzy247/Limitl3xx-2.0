import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Cpu, 
  Wallet, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare,
  Zap,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';
import DiscordIcon from '../components/DiscordIcon';
import { toast } from 'sonner';
import { Link } from 'react-router';

interface FAQItem {
  id: string;
  category: 'general' | 'mining' | 'payouts' | 'security' | 'referrals';
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_CATEGORIES = [
  { id: 'all', name: 'All Questions', icon: HelpCircle },
  { id: 'general', name: 'Getting Started', icon: Sparkles },
  { id: 'mining', name: 'Pool & Cloud Mining', icon: Cpu },
  { id: 'payouts', name: 'Deposits & Payouts', icon: Wallet },
  { id: 'security', name: 'Security & Custody', icon: ShieldCheck },
  { id: 'referrals', name: 'Referrals & VIP', icon: Users },
] as const;

const FAQ_DATA: FAQItem[] = [
  // General
  {
    id: 'gen-1',
    category: 'general',
    question: 'What is PoolMining.cloud and how does it work?',
    answer: 'PoolMining.cloud is an enterprise-grade cloud mining and staking ecosystem. We operate state-of-the-art data centers in renewable energy hubs (Iceland, Norway, Canada). Users purchase computational hashpower contracts and receive daily automated crypto payouts directly into their secure platform wallets without maintaining physical hardware.',
    highlights: ['Zero hardware maintenance', '100% green energy powered', 'Automated daily distributions']
  },
  {
    id: 'gen-2',
    category: 'general',
    question: 'Who can open an account and what are the verification requirements?',
    answer: 'Anyone aged 18 or older globally can create a free PoolMining account. Basic account tier allows deposits, mining, and trading up to $10,000 monthly. Higher tiers unlock unrestricted liquidity after completing standard instant ID verification (KYC Tier 2).',
    highlights: ['Instant signup with email', 'Tiered verification for higher volume', 'Global access in 180+ countries']
  },
  {
    id: 'gen-3',
    category: 'general',
    question: 'Do I need technical knowledge or mining equipment?',
    answer: 'No technical expertise or physical ASIC rigs are required. Our proprietary algorithms handle rig configuration, pool switching for maximum profitability, firmware optimizations, and cooling management 24/7.',
    highlights: ['Fully automated setup', 'AI dynamic pool switching', 'Mobile & web dashboard monitoring']
  },

  // Mining
  {
    id: 'min-1',
    category: 'mining',
    question: 'What is the difference between Cloud Mining and Pool Mining?',
    answer: 'Pool Mining pools your hashing resources with thousands of global nodes to consistently solve blocks and share steady rewards. Cloud Mining lets you rent dedicated ASIC hashpower clusters (e.g., Antminer S21, Whatsminer M60) with fixed TH/s or GH/s output over 6 to 24-month contract terms.',
    highlights: ['Flexible contract durations (6, 12, 24 mo)', 'Predictable daily yields', 'Multi-algorithm support (SHA-256, Scrypt, Ethash)']
  },
  {
    id: 'min-2',
    category: 'mining',
    question: 'What algorithms and cryptocurrencies can I mine?',
    answer: 'We support top high-yield networks including Bitcoin (SHA-256), Litecoin & Dogecoin (Scrypt), Kaspa (kHeavyHash), Ethereum Classic (Etchash), and Dash (X11). You can allocate your purchased hashpower across multiple coins simultaneously.',
    highlights: ['Bitcoin (BTC)', 'Litecoin (LTC) + Doge', 'Kaspa (KAS)', 'Ethereum Classic (ETC)']
  },
  {
    id: 'min-3',
    category: 'mining',
    question: 'What is the guaranteed uptime and maintenance fee policy?',
    answer: 'We guarantee a 99.98% hardware uptime backed by a service level agreement (SLA). The low daily maintenance fee (covering high-voltage electricity and facility cooling) is transparently deducted directly from gross mining rewards before net yield distribution.',
    highlights: ['99.98% SLA Uptime Guarantee', 'Transparent daily deduction', 'Auto-compensation if hardware fails']
  },

  // Payouts & Wallets
  {
    id: 'pay-1',
    category: 'payouts',
    question: 'How often are mining rewards paid out?',
    answer: 'Mining yields are calculated every 24 hours UTC and credited directly to your PoolMining wallet balance automatically. You can monitor each payout in real time via the Transaction History module.',
    highlights: ['Daily automatic settlements', 'Real-time ledger audit', 'Compound reinvestment options']
  },
  {
    id: 'pay-2',
    category: 'payouts',
    question: 'What are the minimum deposit and withdrawal limits?',
    answer: 'Minimum deposit is $20 equivalent in supported cryptocurrencies (BTC, ETH, USDT, USDC, LTC, TRX, BNB). Minimum withdrawal is 0.0005 BTC (or $25 in stablecoins). There are zero withdrawal fees beyond standard native blockchain network gas costs.',
    highlights: ['Low minimum payout ($25 eq.)', 'Instant on-chain settlement', 'Multi-chain support (TRC-20, ERC-20, BEP-20)']
  },
  {
    id: 'pay-3',
    category: 'payouts',
    question: 'How long do withdrawals take to process?',
    answer: 'Automated withdrawals for verified accounts under $25,000 are broadcasted to the blockchain within 5 to 15 minutes. Larger institutional withdrawals undergo an automated multi-signature security review and complete within 1-2 hours.',
    highlights: ['Instant automated processing', 'Multi-sig verification for large sums', 'Direct to external cold wallet']
  },

  // Security
  {
    id: 'sec-1',
    category: 'security',
    question: 'How are client funds and wallets secured?',
    answer: 'Over 95% of all digital assets are held in geographically distributed, air-gapped cold storage vaults protected by institutional custodians (Fireblocks & Ledger Vault). We enforce 2FA (TOTP authenticator), email withdrawal confirmations, and biometric device whitelisting.',
    highlights: ['Air-gapped cold storage (95%+)', 'Hardware security modules', 'Optional 2FA & IP whitelisting']
  },
  {
    id: 'sec-2',
    category: 'security',
    question: 'Are mining contracts and deposits insured?',
    answer: 'Yes. Our physical mining data centers are fully insured against environmental disruptions, electrical faults, and hardware damage through Lloyds of London underwriting partners. Client yields are protected by our $25M Reserve Guarantee Fund.',
    highlights: ['$25M Reserve Guarantee Fund', 'Physical facility property insurance', 'Regular third-party security audits']
  },

  // Referrals
  {
    id: 'ref-1',
    category: 'referrals',
    question: 'How does the affiliate referral program work?',
    answer: 'Every registered user receives a unique referral link. When friends or clients register using your link and purchase hashpower contracts, you earn instant commission ranging from 5% to 15% across 3 referral tiers, paid directly in crypto.',
    highlights: ['Up to 15% tiered commission', '3-Level multi-tier payout', 'Instant credit upon contract purchase']
  },
  {
    id: 'ref-2',
    category: 'referrals',
    question: 'Are there VIP incentives for large volume miners?',
    answer: 'Yes! High-volume miners and institutional clients who allocate over 500 TH/s or 50,000 USDT qualify for custom reduced maintenance rates, a dedicated account manager, priority hardware batch allocations, and private Discord VIP masterminds.',
    highlights: ['Custom hashpower pricing', 'Dedicated account executive', 'Exclusive VIP Discord channel access']
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'gen-1': true,
    'min-1': true,
  });
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const discordInviteLink = 'https://discord.gg/poolmining';

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(discordInviteLink);
    setCopiedDiscord(true);
    toast.success('Discord invite link copied to clipboard!');
    setTimeout(() => setCopiedDiscord(false), 2500);
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredFAQs.forEach(item => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
    toast.info('Expanded all FAQ items');
  };

  const collapseAll = () => {
    setOpenItems({});
    toast.info('Collapsed all FAQ items');
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.highlights?.some(h => h.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Group filtered FAQs by category when viewing "All"
  const groupedFAQs = useMemo(() => {
    if (activeCategory !== 'all') {
      return [{ category: activeCategory, items: filteredFAQs }];
    }
    const groups: { category: string; name: string; icon: any; items: FAQItem[] }[] = [];
    FAQ_CATEGORIES.forEach(cat => {
      if (cat.id === 'all') return;
      const items = filteredFAQs.filter(item => item.category === cat.id);
      if (items.length > 0) {
        groups.push({
          category: cat.id,
          name: cat.name,
          icon: cat.icon,
          items
        });
      }
    });
    return groups;
  }, [filteredFAQs, activeCategory]);

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 text-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={fluidSpring}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0052ff]/10 border border-[#0052ff]/20 text-[#0052ff] dark:text-[#00f0ff] text-xs font-bold mb-4"
          >
            <Sparkles size={14} />
            <span>Knowledge Base & Help Center</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fluidSpring}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-5 tracking-tight text-primary"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Questions</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.1 }}
            className="text-base sm:text-lg text-secondary leading-relaxed"
          >
            Everything you need to know about cloud hashrate, daily mining distributions, security custody, and joining our global community.
          </motion.p>
        </div>

        {/* Discord Community Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-12 bg-gradient-to-r from-[#5865F2]/20 via-[#0052ff]/15 to-[#00f0ff]/10 border border-[#5865F2]/30 shadow-2xl backdrop-blur-md"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#5865F2]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00f0ff]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Discord Logo Badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-xl shadow-[#5865F2]/30 flex-shrink-0 group hover:scale-105 transition-transform">
                <DiscordIcon size={40} className="text-white drop-shadow-md" />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5865F2] text-white">
                    Official Community
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    14,280+ Miners Online
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary">
                  Join the PoolMining Discord Server
                </h3>
                <p className="text-secondary text-sm mt-1 max-w-xl leading-relaxed">
                  Connect with active cloud miners, get instant block breakthrough announcements, discuss mining strategies, and chat with 24/7 staff engineers.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-center">
              <a
                href={discordInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm shadow-lg shadow-[#5865F2]/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <DiscordIcon size={18} />
                <span>Join Discord Group</span>
                <ExternalLink size={15} className="opacity-80" />
              </a>

              <button
                onClick={handleCopyDiscord}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-surface border border-border hover:border-[#5865F2]/50 text-secondary hover:text-primary font-semibold text-sm transition-all hover:bg-subtle w-full sm:w-auto"
                title="Copy Discord Invite Link"
              >
                {copiedDiscord ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiedDiscord ? 'Link Copied' : 'Copy Invite'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Category Filtering Bar */}
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, keywords (e.g. withdrawal, BTC, fees)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/20 text-sm font-medium transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-primary px-1.5 py-0.5 rounded bg-subtle"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Expand / Collapse All Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={expandAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary text-secondary hover:text-primary transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-primary text-secondary hover:text-primary transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FAQ_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all' 
                ? FAQ_DATA.length 
                : FAQ_DATA.filter(i => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-[#0052ff] text-white shadow-md shadow-blue-500/25'
                      : 'bg-card border border-border text-secondary hover:text-primary hover:bg-subtle'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-secondary'} />
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-subtle text-muted'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFAQs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border/70 my-8">
            <HelpCircle size={40} className="mx-auto text-muted mb-3" />
            <h3 className="text-lg font-bold text-primary mb-1">No matching questions found</h3>
            <p className="text-secondary text-sm max-w-md mx-auto mb-6">
              We couldn't find any results for "{searchQuery}". Try searching with different keywords or browse our categories.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-5 py-2.5 rounded-xl bg-[#0052ff] text-white text-xs font-bold hover:bg-[#0052ff]/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedFAQs.map((group, groupIdx) => {
              const catMeta = FAQ_CATEGORIES.find(c => c.id === group.category);
              const CatIcon = catMeta?.icon || HelpCircle;

              return (
                <div key={groupIdx} className="space-y-4">
                  {/* Category Header (shown when grouping) */}
                  {activeCategory === 'all' && (
                    <div className="flex items-center gap-2.5 px-2 pt-2 border-b border-border/40 pb-2">
                      <div className="p-1.5 rounded-lg bg-[#0052ff]/10 text-[#0052ff] dark:text-[#00f0ff]">
                        <CatIcon size={16} />
                      </div>
                      <h2 className="text-base font-bold text-primary">
                        {catMeta?.name || 'Section'}
                      </h2>
                      <span className="text-xs text-muted font-medium ml-auto">
                        {group.items.length} {group.items.length === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                  )}

                  {/* Accordion Cards */}
                  <div className="space-y-3.5">
                    {group.items.map((faq, itemIdx) => {
                      const isOpen = !!openItems[faq.id];

                      return (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: itemIdx * 0.04 }}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            isOpen
                              ? 'bg-card border-[#0052ff]/40 shadow-lg shadow-blue-500/5 ring-1 ring-[#0052ff]/20'
                              : 'bg-card border-border/70 hover:border-border'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(faq.id)}
                            className="w-full flex items-center justify-between p-5 text-left focus:outline-none gap-4 group"
                            aria-expanded={isOpen}
                          >
                            <span className="text-sm sm:text-base font-bold text-primary group-hover:text-[#0052ff] transition-colors leading-snug">
                              {faq.question}
                            </span>
                            <div className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                              isOpen ? 'bg-[#0052ff]/10 text-[#0052ff] rotate-180' : 'bg-subtle text-secondary group-hover:text-primary'
                            }`}>
                              <ChevronDown size={18} />
                            </div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="p-5 pt-0 text-secondary text-sm leading-relaxed border-t border-border/30 mt-1">
                                  <p className="mb-4 pt-3">{faq.answer}</p>

                                  {faq.highlights && faq.highlights.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {faq.highlights.map((h, hIdx) => (
                                        <span
                                          key={hIdx}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-subtle text-primary border border-border/60"
                                        >
                                          <Zap size={11} className="text-[#0052ff] dark:text-[#00f0ff]" />
                                          {h}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions Footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={fluidSpring}
          className="mt-16 rounded-3xl p-8 bg-card border border-border text-center relative overflow-hidden"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0052ff]/10 text-[#0052ff] dark:text-[#00f0ff] flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-2xl font-bold text-primary">Still have questions?</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Our engineering team and mining specialists are online around the clock to assist you with customized contracts or technical support.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/support"
                className="px-6 py-3 rounded-2xl bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Open Support Ticket
              </Link>
              <a
                href={discordInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition-all hover:scale-105 active:scale-95"
              >
                <DiscordIcon size={16} />
                <span>Join Discord Group</span>
              </a>
              <Link
                to="/contact"
                className="px-6 py-3 rounded-2xl bg-surface border border-border text-secondary hover:text-primary text-xs font-bold hover:bg-subtle transition-colors"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
