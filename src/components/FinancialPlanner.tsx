import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Target, DollarSign, AlertTriangle, 
  ChevronRight, ArrowRight, PieChart as PieChartIcon, 
  BarChart2, RefreshCw, Info
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { fluidSpring } from './SystemManager';

interface FinancialPlanResult {
  year: number;
  balance: number;
  invested: number;
  interest: number;
}

const COLORS = ['#0052ff', '#00f0ff', '#ff0055', '#fbbf24'];

export default function FinancialPlanner() {
  const [goalName, setGoalName] = useState('Dream Portfolio');
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [years, setYears] = useState(10);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  
  const riskReturns = {
    low: 0.05,    // 5% annual
    medium: 0.12, // 12% annual
    high: 0.25    // 25% annual
  };

  const calculatePlan = useMemo(() => {
    const data: FinancialPlanResult[] = [];
    const annualRate = riskReturns[riskTolerance];
    const monthlyRate = annualRate / 12;
    
    let currentBalance = initialInvestment;
    let totalInvested = initialInvestment;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        for (let month = 1; month <= 12; month++) {
          currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
          totalInvested += monthlyContribution;
        }
      }
      
      data.push({
        year,
        balance: Math.round(currentBalance),
        invested: Math.round(totalInvested),
        interest: Math.round(currentBalance - totalInvested)
      });
    }
    return data;
  }, [initialInvestment, monthlyContribution, years, riskTolerance]);

  const finalResult = calculatePlan[calculatePlan.length - 1];
  
  const pieData = [
    { name: 'Invested', value: finalResult.invested },
    { name: 'Projected Earnings', value: finalResult.interest }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-border/30 pb-4">
        <div className="p-2 bg-[#0052ff]/10 rounded-lg">
          <TrendingUp className="text-[#0052ff]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Financial Strategy Planner</h2>
          <p className="text-xs text-secondary">Simulate your portfolio growth with AI-driven projections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Financial Goal</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input 
                  type="text" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-background border border-border py-3 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all font-medium"
                  placeholder="e.g. Retirement, House Fund"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Initial Amount ($)</label>
                <input 
                  type="number" 
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full bg-background border border-border py-3 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Monthly ($)</label>
                <input 
                  type="number" 
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-background border border-border py-3 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Time Horizon</label>
                <span className="text-xs font-bold text-primary">{years} Years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-subtle rounded-lg appearance-none cursor-pointer accent-[#0052ff]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-3">Risk Tolerance</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setRiskTolerance(level)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border ${
                      riskTolerance === level 
                        ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-lg shadow-[#0052ff]/20' 
                        : 'bg-background text-secondary border-border hover:border-muted'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-400">Projected Outcome</h3>
              <Info size={14} className="text-emerald-400/50" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-black tracking-tighter text-emerald-400">
                ${finalResult.balance.toLocaleString()}
              </p>
              <p className="text-xs text-secondary">
                Estimated total after {years} years.
              </p>
            </div>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="flex flex-col gap-6">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calculatePlan} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0052ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `Yr ${val}`}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface/95 border border-border p-3 rounded-xl shadow-2xl backdrop-blur-md">
                          <p className="text-[10px] text-secondary uppercase font-bold mb-1">Year {payload[0].payload.year}</p>
                          <p className="text-lg font-bold text-[#0052ff]">${payload[0].value?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#0052ff" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border/50">
              <p className="text-[10px] text-secondary uppercase font-bold mb-1">Total Contribution</p>
              <p className="text-xl font-bold text-primary">${finalResult.invested.toLocaleString()}</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border/50">
              <p className="text-[10px] text-secondary uppercase font-bold mb-1">Projected Earnings</p>
              <p className="text-xl font-bold text-[#00f0ff]">${finalResult.interest.toLocaleString()}</p>
            </div>
          </div>
          
          <button 
            className="w-full py-4 bg-primary text-background font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            Apply Plan to Portfolio <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
