import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import SmartBatteryEnergyHub from '../components/SmartBatteryEnergyHub';
import { toast } from 'sonner';

// Lazy load the TradingView iframe block to improve initial paint performance
const TradingViewWidget = lazy(() => Promise.resolve({
  default: ({ symbol }: { symbol: string }) => (
    <iframe 
      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=BINANCE%3A${symbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=transparent&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC`}
      width="100%" 
      height="100%" 
      frameBorder="0" 
      scrolling="no" 
      allowFullScreen
    ></iframe>
  )
}));

export default function LiveTrading() {
  const { user, userData } = useAuth();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('64500.00');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'open' | 'history' | 'funds'>('open');

  // Real-time WSS State
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0.00');
  const [priceChange, setPriceChange] = useState<number>(0);
  const [openOrders, setOpenOrders] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    // Connect to Binance Public WebSocket for real-time order book
    const sym = (symbol || 'BTCUSDT').toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com/ws/${sym}@depth10@100ms`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.b && data.a) {
        setBids(data.b.slice(0, 8)); // Top 8 bids
        setAsks(data.a.slice(0, 8)); // Top 8 asks
      }
    };
    
    ws.onerror = () => {
      console.warn('Order book WebSocket error occurred.');
    };

    // Connect to ticker for real-time price
    const wsTicker = new WebSocket(`wss://stream.binance.com/ws/${sym}@ticker`);
    wsTicker.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.c) {
        const newPrice = parseFloat(data.c);
        setCurrentPrice(newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setPriceChange(parseFloat(data.P));
      }
    };
    
    wsTicker.onerror = () => {
      console.warn('Ticker WebSocket error occurred.');
    };

    return () => {
      isMounted = false;
      ws.onerror = null;
      ws.onmessage = null;
      wsTicker.onerror = null;
      wsTicker.onmessage = null;
      ws.close();
      wsTicker.close();
    };
  }, [symbol]);

  // Modular panels for Binance Pro style interface
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-primary p-2 md:p-4 flex flex-col">
      {/* Top Bar / Market Selector */}
      <header className="flex justify-between items-center bg-card p-3 rounded-xl border border-border/30 mb-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tighter cursor-pointer hover:text-[#0052ff] transition-colors">{symbol}</h1>
          <div className="text-xs">
            <p className="text-secondary">24h Change</p>
            <p className="text-emerald-400 font-medium">+2.45%</p>
          </div>
          <div className="text-xs hidden sm:block">
            <p className="text-secondary">24h High</p>
            <p className="text-primary font-medium">65,234.00</p>
          </div>
          <div className="text-xs hidden sm:block">
            <p className="text-secondary">24h Low</p>
            <p className="text-primary font-medium">63,100.00</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <SmartBatteryEnergyHub variant="pill" showDetails={false} />
          <button className="bg-subtle hover:bg-subtle-hover px-3 py-1.5 rounded-lg border border-border transition-colors">
            Cross 3x
          </button>
        </div>
      </header>

      {/* 12-Column Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 auto-rows-min md:auto-rows-fr">
        {/* Chart Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fluidSpring}
          className="col-span-12 xl:col-span-8 bg-card rounded-xl border border-border/30 overflow-hidden shadow-md flex flex-col h-[500px] xl:h-auto"
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-background/50 animate-pulse">
              <Activity className="text-secondary opacity-50" size={32} />
            </div>
          }>
            <TradingViewWidget symbol={symbol} />
          </Suspense>
        </motion.div>

        {/* Order Book / Trade Feed - Side Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.1 }}
          className="col-span-12 md:col-span-6 xl:col-span-2 bg-card rounded-xl border border-border/30 p-4 shadow-md flex flex-col min-h-[400px] xl:h-auto"
        >
          <div className="flex justify-between items-center mb-4 text-xs font-semibold border-b border-border/50 pb-2">
            <span>Price (USDT)</span>
            <span>Amount (BTC)</span>
          </div>
          {/* Asks (Sell) */}
          <div className="flex-1 flex flex-col-reverse justify-end gap-1 overflow-hidden">
            {asks.slice(0,8).map((ask, i) => (
              <div key={`ask-${i}`} className="flex justify-between text-xs relative group cursor-pointer" onClick={() => setPrice(parseFloat(ask[0]).toFixed(2))}>
                <div className="absolute inset-0 bg-red-500/10 right-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ width: `${Math.min(100, parseFloat(ask[1]) * 50)}%` }} />
                <span className="text-red-400 font-mono z-10">{parseFloat(ask[0]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-secondary font-mono z-10">{parseFloat(ask[1]).toFixed(4)}</span>
              </div>
            ))}
          </div>
          {/* Current Price */}
          <div className={`py-2 my-2 flex items-center justify-center border-y border-border/30 text-lg font-bold ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentPrice} {priceChange >= 0 ? <ArrowUpRight size={18} className="ml-1" /> : <ArrowDownRight size={18} className="ml-1" />}
          </div>
          {/* Bids (Buy) */}
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {bids.slice(0,8).map((bid, i) => (
              <div key={`bid-${i}`} className="flex justify-between text-xs relative group cursor-pointer" onClick={() => setPrice(parseFloat(bid[0]).toFixed(2))}>
                <div className="absolute inset-0 bg-emerald-500/10 left-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ width: `${Math.min(100, parseFloat(bid[1]) * 50)}%` }} />
                <span className="text-emerald-400 font-mono z-10">{parseFloat(bid[0]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-secondary font-mono z-10">{parseFloat(bid[1]).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.2 }}
          className="col-span-12 md:col-span-6 xl:col-span-2 bg-card rounded-xl border border-border/30 p-4 shadow-md flex flex-col min-h-[400px] xl:h-auto"
        >
          <div className="flex bg-surface rounded-lg p-1 mb-4 text-xs font-semibold">
            <button 
              className={`flex-1 py-1.5 rounded-md transition-colors ${side === 'buy' ? 'bg-emerald-500 text-white' : 'text-secondary hover:text-primary'}`}
              onClick={() => setSide('buy')}
            >
              Buy
            </button>
            <button 
              className={`flex-1 py-1.5 rounded-md transition-colors ${side === 'sell' ? 'bg-red-500 text-white' : 'text-secondary hover:text-primary'}`}
              onClick={() => setSide('sell')}
            >
              Sell
            </button>
          </div>

          <div className="flex gap-4 text-xs font-medium text-secondary mb-4 border-b border-border/50 pb-2">
            <button className={`pb-1 ${orderType === 'limit' ? 'text-primary font-bold border-b border-[#0052ff]' : 'hover:text-primary'}`} onClick={() => setOrderType('limit')}>Limit</button>
            <button className={`pb-1 ${orderType === 'market' ? 'text-primary font-bold border-b border-[#0052ff]' : 'hover:text-primary'}`} onClick={() => setOrderType('market')}>Market</button>
            <button className={`pb-1 ${orderType === 'stop' ? 'text-primary font-bold border-b border-[#0052ff]' : 'hover:text-primary'}`} onClick={() => setOrderType('stop')}>Stop-Limit</button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-surface border border-border rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-secondary pl-2">Price</span>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-transparent text-right text-sm outline-none text-primary w-28 font-mono disabled:opacity-50" 
                disabled={orderType === 'market'}
              />
              <span className="text-xs text-secondary pr-2">USDT</span>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-secondary pl-2">Amount</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-right text-sm outline-none text-primary w-28 font-mono" 
                placeholder="0.00" 
              />
              <span className="text-xs text-secondary pr-2">BTC</span>
            </div>

            <div className="pt-4 mt-4 border-t border-border/30">
              <button 
                disabled={isSubmitting}
                onClick={async () => {
                  try {
                    const parsedAmount = parseFloat(amount);
                    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
                      toast.error('Please enter a valid amount');
                      return;
                    }

                    setIsSubmitting(true);
                    const res = await fetch('/api/binance/trade', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        symbol,
                        side: side.toUpperCase(),
                        type: orderType.toUpperCase(),
                        quantity: amount,
                        price: orderType === 'market' ? null : price
                      })
                    });
                    const data = await res.json();
                    
                    if (data.status === 'FILLED' || data.orderId) {
                      toast.success(`${side.toUpperCase()} ${amount} ${symbol} successful`);
                      setAmount('');
                      setOpenOrders(prev => [data, ...prev]);
                    } else {
                      toast.error(data.error || 'Trade failed');
                    }
                  } catch (e) {
                     toast.error('Connection to broker failed');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${
                  side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : (side === 'buy' ? 'Buy BTC' : 'Sell BTC')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Positions Panel (Bottom) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.3 }}
          className="col-span-12 bg-card rounded-xl border border-border/30 p-4 shadow-md overflow-x-auto"
        >
          <div className="flex gap-6 border-b border-border/50 pb-2 mb-4 text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('open')}
              className={`pb-2 -mb-[2px] transition-colors ${activeTab === 'open' ? 'text-primary border-b-2 border-[#0052ff]' : 'text-secondary hover:text-primary'}`}
            >
              Open Orders ({openOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-2 -mb-[2px] transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-[#0052ff]' : 'text-secondary hover:text-primary'}`}
            >
              Trade History
            </button>
            <button 
              onClick={() => setActiveTab('funds')}
              className={`pb-2 -mb-[2px] transition-colors ${activeTab === 'funds' ? 'text-primary border-b-2 border-[#0052ff]' : 'text-secondary hover:text-primary'}`}
            >
              Available Funds
            </button>
          </div>
          
          {activeTab === 'funds' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-3">
              <div className="p-3 bg-surface rounded-xl border border-border/30">
                <span className="text-xs text-secondary">Total Balance</span>
                <p className="text-base font-bold text-primary">${(userData?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border/30">
                <span className="text-xs text-secondary">BTC Available</span>
                <p className="text-base font-bold text-primary">{(userData?.balances?.BTC || 0).toFixed(6)} BTC</p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border/30">
                <span className="text-xs text-secondary">USDT Available</span>
                <p className="text-base font-bold text-primary">${(userData?.balances?.USDT || 0).toFixed(2)} USDT</p>
              </div>
            </div>
          ) : activeTab === 'history' || openOrders.length === 0 ? (
            <div className="w-full text-center py-8 text-secondary text-sm">
              <Activity className="mx-auto mb-2 opacity-50" size={24} />
              {activeTab === 'history' ? 'No recent filled trades on this account.' : 'No open orders.'}
            </div>
          ) : (
            <table className="w-full text-left text-sm mt-4">
              <thead>
                <tr className="text-secondary border-b border-border/50">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Symbol</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Side</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-border/20 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="py-3 text-secondary">{new Date(order.transactTime || Date.now()).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold">{order.symbol}</td>
                    <td className="py-3">{order.type}</td>
                    <td className={`py-3 font-semibold ${order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{order.side}</td>
                    <td className="py-3">{order.price && order.price !== 'Market' ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}</td>
                    <td className="py-3">{order.executedQty || order.quantity || amount}</td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase px-2 py-1 bg-emerald-500/10 rounded">{order.status || 'FILLED'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
