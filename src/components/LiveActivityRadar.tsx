import { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, Activity, Bell, BellOff, Laptop, Smartphone, 
  ExternalLink, Search, Filter, Volume2, VolumeX, Shield, User as UserIcon,
  RefreshCw, Trash2, ArrowUpRight, Radio, Compass, Zap, DollarSign, MessageSquare
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { formatFirebaseDate } from '../utils/date';

export interface LiveActivityItem {
  id: string;
  action: string;
  category: 'click' | 'navigation' | 'deposit' | 'withdraw' | 'trade' | 'mining' | 'auth' | 'support';
  path: string;
  user_id: string;
  user_email: string;
  user_name: string;
  is_authenticated: boolean;
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  flag: string;
  org?: string;
  device: string;
  browser: string;
  os: string;
  screen?: string;
  timestamp: any;
  created_at_ms?: number;
}

// Synthesize pleasant ambient notification sound using Web Audio API
function playAlertChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Note 1 (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2 (B5) with slight delay
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.4);
    }, 90);
  } catch (e) {}
}

export default function LiveActivityRadar() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<LiveActivityItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pm_admin_sound_alert') !== 'false';
  });
  const [toastAlertsEnabled, setToastAlertsEnabled] = useState<boolean>(true);
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [authFilter, setAuthFilter] = useState<'all' | 'users' | 'guests'>('all');
  const [selectedActivity, setSelectedActivity] = useState<LiveActivityItem | null>(null);
  
  const isInitialLoadRef = useRef(true);
  const lastAlertTimestampRef = useRef<number>(Date.now());

  // Toggle sound setting
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('pm_admin_sound_alert', String(next));
    if (next) {
      playAlertChime();
      toast.success('Sound alerts enabled for live visitors & clicks');
    } else {
      toast.info('Sound alerts muted');
    }
  };

  // Real-time Firestore Listener
  useEffect(() => {
    const q = query(
      collection(db, 'live_activity'),
      orderBy('timestamp', 'desc'),
      limit(80)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isLivePaused) return;

      const items: LiveActivityItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as LiveActivityItem);
      });

      setActivities(items);

      // Handle new incoming activity notification
      if (!isInitialLoadRef.current && items.length > 0) {
        const latest = items[0];
        const itemTime = latest.created_at_ms || (latest.timestamp?.seconds ? latest.timestamp.seconds * 1000 : Date.now());
        
        // Only trigger if item arrived in the last 15 seconds and is newer than last alert
        if (Date.now() - itemTime < 15000 && itemTime > lastAlertTimestampRef.current) {
          lastAlertTimestampRef.current = itemTime;
          
          if (soundEnabled) {
            playAlertChime();
          }

          if (toastAlertsEnabled) {
            toast.custom((t) => (
              <div 
                onClick={() => {
                  setSelectedActivity(latest);
                  toast.dismiss(t);
                }}
                className="bg-surface/95 backdrop-blur-md border-2 border-[#0052ff] rounded-2xl p-4 shadow-2xl flex items-start gap-3 cursor-pointer hover:bg-subtle transition-all max-w-md w-full"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center font-bold text-lg shrink-0">
                  {latest.flag || '🌐'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-extrabold text-xs text-primary truncate">
                      {latest.city ? `${latest.city}, ` : ''}{latest.country}
                    </p>
                    <span className="text-[10px] text-[#0052ff] font-bold bg-[#0052ff]/10 px-1.5 py-0.5 rounded">
                      Live Click
                    </span>
                  </div>
                  <p className="text-xs text-secondary truncate mt-0.5 font-medium">{latest.action}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted mt-1">
                    <span className="font-mono">{latest.ip}</span>
                    <span>•</span>
                    <span className="truncate">{latest.user_email || 'Guest'}</span>
                  </div>
                </div>
              </div>
            ), { duration: 4500 });
          }
        }
      }

      isInitialLoadRef.current = false;
    }, (err) => {
      console.warn('LiveActivityRadar stream note:', err?.message);
    });

    return () => unsubscribe();
  }, [isLivePaused, soundEnabled, toastAlertsEnabled]);

  // Aggregate country statistics
  const countryCounts = activities.reduce((acc, item) => {
    const key = item.country || 'Global';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  // Filtered Activities
  const filteredActivities = activities.filter((act) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (act.action || '').toLowerCase().includes(searchLower) ||
      (act.city || '').toLowerCase().includes(searchLower) ||
      (act.country || '').toLowerCase().includes(searchLower) ||
      (act.ip || '').toLowerCase().includes(searchLower) ||
      (act.user_email || '').toLowerCase().includes(searchLower) ||
      (act.path || '').toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;
    if (authFilter === 'users' && !act.is_authenticated) return false;
    if (authFilter === 'guests' && act.is_authenticated) return false;

    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'deposit':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><DollarSign size={10} /> Deposit</span>;
      case 'withdraw':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><ArrowUpRight size={10} /> Withdrawal</span>;
      case 'trade':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Zap size={10} /> Trading</span>;
      case 'mining':
        return <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Zap size={10} /> Mining</span>;
      case 'support':
        return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><MessageSquare size={10} /> Support</span>;
      case 'navigation':
        return <span className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Compass size={10} /> View</span>;
      default:
        return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Activity size={10} /> Click</span>;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center font-extrabold shadow-inner relative">
            <Radio className="animate-pulse" size={24} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-primary tracking-tight">Live Visitor & Activity Geo-Radar</h2>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Stream
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5 font-medium">
              Instant alerts and telemetry whenever any client clicks or browses from any location worldwide.
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Alert Toggle */}
          <button
            onClick={toggleSound}
            title="Toggle Audio Notifications on Visitor Click"
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm' 
                : 'bg-background border-border text-muted hover:text-primary'
            }`}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{soundEnabled ? 'Audio Alerts ON' : 'Muted'}</span>
          </button>

          {/* Toast Alert Toggle */}
          <button
            onClick={() => setToastAlertsEnabled(!toastAlertsEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              toastAlertsEnabled 
                ? 'bg-[#0052ff]/10 border-[#0052ff]/30 text-[#0052ff]' 
                : 'bg-background border-border text-muted hover:text-primary'
            }`}
          >
            {toastAlertsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
            <span>Popups</span>
          </button>

          {/* Pause Stream */}
          <button
            onClick={() => setIsLivePaused(!isLivePaused)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isLivePaused 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                : 'bg-background border-border text-secondary hover:text-primary'
            }`}
          >
            <RefreshCw size={14} className={isLivePaused ? '' : 'animate-spin'} />
            <span>{isLivePaused ? 'Stream Paused' : 'Live'}</span>
          </button>
        </div>
      </div>

      {/* Top Location Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 bg-card border border-border rounded-2xl">
          <p className="text-[11px] font-bold text-muted uppercase">Total Events</p>
          <p className="text-xl font-black text-primary mt-0.5">{activities.length}</p>
        </div>
        {topCountries.map(([country, count]) => (
          <div key={country} className="p-3 bg-card border border-border rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-secondary truncate">{country}</p>
              <p className="text-lg font-black text-primary mt-0.5">{count} <span className="text-[10px] text-muted font-semibold">actions</span></p>
            </div>
            <Globe className="text-[#0052ff] shrink-0 opacity-60" size={18} />
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search by city, country, IP address, user email, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0052ff] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="click">Clicks & Buttons</option>
            <option value="navigation">Page Views</option>
            <option value="deposit">Deposit Clicks</option>
            <option value="withdraw">Withdraw Clicks</option>
            <option value="trade">Trading</option>
            <option value="mining">Mining</option>
            <option value="support">Support</option>
          </select>

          {/* User Type */}
          <select
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value as any)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold text-primary focus:outline-none"
          >
            <option value="all">All Visitors</option>
            <option value="users">Registered Clients Only</option>
            <option value="guests">Guests & Visitors</option>
          </select>
        </div>
      </div>

      {/* Main Activity Table / Feed */}
      <div className="border border-border rounded-2xl overflow-hidden bg-background">
        <div className="max-h-[460px] overflow-y-auto divide-y divide-border/60">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-muted space-y-2">
              <Globe size={40} className="mx-auto opacity-30 text-[#0052ff]" />
              <p className="text-sm font-bold">No visitor activities match current filter.</p>
              <p className="text-xs">Live events will appear automatically when visitors click on the site.</p>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isRecent = act.created_at_ms && (Date.now() - act.created_at_ms < 60000);
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivity(act)}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-card/70 transition-colors cursor-pointer ${
                    isRecent ? 'bg-[#0052ff]/5 border-l-4 border-l-[#0052ff]' : ''
                  }`}
                >
                  {/* Left: Location & User */}
                  <div className="flex items-start gap-3 min-w-0 md:w-5/12">
                    <div className="text-2xl shrink-0 select-none">
                      {act.flag || '🌐'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-primary truncate">
                          {act.city ? `${act.city}, ` : ''}{act.country || 'Global Location'}
                        </span>
                        {isRecent && (
                          <span className="bg-emerald-500/10 text-emerald-500 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse border border-emerald-500/20">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
                        <span className="font-mono text-[11px] font-semibold text-[#0052ff]">{act.ip}</span>
                        {act.org && <span className="text-muted truncate text-[11px]">({act.org})</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted mt-1">
                        <UserIcon size={11} className={act.is_authenticated ? 'text-emerald-500' : 'text-muted'} />
                        <span className={`font-semibold ${act.is_authenticated ? 'text-emerald-500' : 'text-muted'}`}>
                          {act.user_email || 'Guest Visitor'}
                        </span>
                        {act.user_name && act.user_name !== 'Visitor' && (
                          <span className="text-secondary font-bold">({act.user_name})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Action & Category */}
                  <div className="md:w-4/12 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(act.category)}
                      <span className="text-[11px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                        {act.path}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-primary truncate">
                      {act.action}
                    </p>
                  </div>

                  {/* Right: Device & Timestamp */}
                  <div className="md:w-3/12 flex items-center justify-between md:justify-end gap-3 text-right">
                    <div className="text-left md:text-right">
                      <div className="flex items-center md:justify-end gap-1 text-[11px] font-semibold text-secondary">
                        {act.device?.includes('Mobile') ? <Smartphone size={12} /> : <Laptop size={12} />}
                        <span>{act.os} • {act.browser}</span>
                      </div>
                      <p className="text-[10px] text-muted mt-0.5 font-medium">
                        {formatFirebaseDate(act.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>

                    {act.is_authenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/admin/support');
                        }}
                        title="Chat in Live Support"
                        className="p-2 rounded-xl bg-[#0052ff]/10 text-[#0052ff] hover:bg-[#0052ff] hover:text-white transition-colors shrink-0"
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedActivity.flag || '🌐'}</span>
                <div>
                  <h3 className="font-extrabold text-base text-primary">Visitor Telemetry Details</h3>
                  <p className="text-xs text-secondary">{selectedActivity.city}, {selectedActivity.country}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-muted hover:text-primary rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-card border border-border rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Activity / Click:</span>
                  <span className="font-extrabold text-primary text-right">{selectedActivity.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Route Path:</span>
                  <span className="font-mono text-[#0052ff]">{selectedActivity.path}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Category:</span>
                  <div>{getCategoryBadge(selectedActivity.category)}</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Client IP:</span>
                  <span className="font-mono font-bold text-primary">{selectedActivity.ip}</span>
                </div>
                {selectedActivity.org && (
                  <div className="flex justify-between">
                    <span className="text-muted font-bold">ISP / Provider:</span>
                    <span className="font-semibold text-secondary">{selectedActivity.org}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Client Email:</span>
                  <span className="font-bold text-emerald-500">{selectedActivity.user_email || 'Guest Visitor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Client User ID:</span>
                  <span className="font-mono text-[10px] text-secondary">{selectedActivity.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted font-bold">Device & OS:</span>
                  <span className="font-semibold text-primary">{selectedActivity.device} ({selectedActivity.os} / {selectedActivity.browser})</span>
                </div>
                {selectedActivity.screen && (
                  <div className="flex justify-between">
                    <span className="text-muted font-bold">Viewport Size:</span>
                    <span className="font-mono text-muted">{selectedActivity.screen}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {selectedActivity.is_authenticated && (
                <button
                  onClick={() => {
                    setSelectedActivity(null);
                    navigate('/admin/support');
                  }}
                  className="px-4 py-2 bg-[#0052ff] text-white rounded-xl text-xs font-bold hover:bg-[#0052ff]/90 flex items-center gap-1.5"
                >
                  <MessageSquare size={14} /> Open Client Support
                </button>
              )}
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-subtle"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
