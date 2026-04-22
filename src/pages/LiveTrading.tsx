import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { toast } from 'sonner';

// Lazy load the TradingView iframe block to improve initial paint performance
const TradingViewWidget = lazy(() => Promise.resolve({
  default: ({ symbol }: { symbol: string }) => (
    <iframe 
      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=BINANCE%3A${symbol}&interval=15&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=transparent&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC`}
      width="100%" 
      height="100%" 
      frameBorder="0" 
      allowTransparency={true} 
      scrolling="no" 
      allowFullScreen
    ></iframe>
  )
}));

export default function LiveTrading() {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');

  // Real-time WSS State
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0.00');
  const [priceChange, setPriceChange] = useState<number>(0);
  const [openOrders, setOpenOrders] = useState<any[]>([]);

  useEffect(() => {
    // Connect to Binance Public WebSocket for real-time order book
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth10@100ms`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.b && data.a) {
        setBids(data.b.slice(0, 8)); // Top 8 bids
        setAsks(data.a.slice(0, 8)); // Top 8 asks
      }
    };

    // Connect to ticker for real-time price
    const wsTicker = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    wsTicker.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.c) {
        const newPrice = parseFloat(data.c);
        setCurrentPrice(newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setPriceChange(parseFloat(data.P));
      }
    };

    return () => {
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
        <div className="flex items-center gap-2 text-xs">
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
              <div key={`ask-${i}`} className="flex justify-between text-xs relative group cursor-pointer" onClick={() => (document.getElementById('trade-price') as HTMLInputElement).value = parseFloat(ask[0]).toFixed(2)}>
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
              <div key={`bid-${i}`} className="flex justify-between text-xs relative group cursor-pointer" onClick={() => (document.getElementById('trade-price') as HTMLInputElement).value = parseFloat(bid[0]).toFixed(2)}>
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
            <button className={orderType === 'limit' ? 'text-primary' : ''} onClick={() => setOrderType('limit')}>Limit</button>
            <button className={orderType === 'market' ? 'text-primary' : ''} onClick={() => setOrderType('market')}>Market</button>
            <button className={orderType === 'stop' ? 'text-primary' : ''} onClick={() => setOrderType('stop')}>Stop-Limit</button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="bg-surface border border-border rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-secondary pl-2">Price</span>
              <input 
                type="number" 
                className="bg-transparent text-right text-sm outline-none text-primary w-24 font-mono" 
                defaultValue="64500.00" 
                disabled={orderType === 'market'}
                id="trade-price"
              />
              <span className="text-xs text-secondary pr-2">USDT</span>
            </div>
            
            <div className="bg-surface border border-border rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-secondary pl-2">Amount</span>
              <input 
                type="number" 
                className="bg-transparent text-right text-sm outline-none text-primary w-24 font-mono" 
                placeholder="0.00" 
                id="trade-amount"
              />
              <span className="text-xs text-secondary pr-2">BTC</span>
            </div>

            <div className="pt-4 mt-4 border-t border-border/30">
              <button 
                onClick={async () => {
                  try {
                    const priceInput = document.getElementById('trade-price') as HTMLInputElement;
                    const amountInput = document.getElementById('trade-amount') as HTMLInputElement;
                    
                    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
                      toast.error('Please enter a valid amount');
                      return;
                    }

                    const res = await fetch('/api/binance/trade', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        symbol,
                        side: side.toUpperCase(),
                        type: orderType.toUpperCase(),
                        quantity: amountInput.value,
                        price: orderType === 'market' ? null : priceInput.value
                      })
                    });
                    const data = await res.json();
                    
                    if (data.status === 'FILLED') {
                      toast.success(`${side.toUpperCase()} ${amountInput.value} ${symbol} successful`);
                      amountInput.value = '';
                      setOpenOrders(prev => [data, ...prev]);
                    } else {
                      toast.error(data.error || 'Trade failed');
                    }
                  } catch (e) {
                     toast.error('Connection to broker failed');
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
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
            <button className="text-primary border-b-2 border-[#0052ff] pb-2 -mb-[2px]">Open Orders ({openOrders.length})</button>
            <button className="text-secondary hover:text-primary transition-colors">Trade History</button>
            <button className="text-secondary hover:text-primary transition-colors">Funds</button>
          </div>
          
          {openOrders.length === 0 ? (
            <div className="w-full text-center py-8 text-secondary text-sm">
              <Activity className="mx-auto mb-2 opacity-50" size={24} />
              No open orders.
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
                    <td className="py-3 text-secondary">{new Date(order.transactTime).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold">{order.symbol}</td>
                    <td className="py-3">{order.type}</td>
                    <td className={`py-3 font-semibold ${order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{order.side}</td>
                    <td className="py-3">{order.price !== 'Market' ? `$${parseFloat(order.price).toLocaleString()}` : 'Market'}</td>
                    <td className="py-3">{order.executedQty}</td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase px-2 py-1 bg-emerald-500/10 rounded">{order.status}</span>
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
