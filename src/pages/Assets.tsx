import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, TrendingUp, DollarSign, Activity, Wallet, PieChart as PieChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AssetsSkeletonLoader } from '../components/SkeletonLoaders';

export default function Assets() {
  const { userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Smooth transition once account and allocation records are resolved
    if (!authLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  const COLORS = ['#0052ff', '#00f0ff', '#8b5cf6', '#10b981'];

  const assetDistribution = [
    { name: 'Current Trades', value: 35 },
    { name: 'Investments', value: 45 },
    { name: 'Retirement Funds', value: 15 },
    { name: 'Emergency Funds', value: 5 },
  ];

  // Static rich layout values
  const totalAssets = (userData?.balance ? userData.balance * 3.5 : 145200.50);
  const currentTradesVal = totalAssets * 0.35;
  const investmentsVal = totalAssets * 0.45;
  const retirementVal = totalAssets * 0.15;
  const emergencyVal = totalAssets * 0.05;

  const performanceData = [
    { name: 'Jan', trades: 4000, investments: 2400 },
    { name: 'Feb', trades: 3000, investments: 1398 },
    { name: 'Mar', trades: 2000, investments: 9800 },
    { name: 'Apr', trades: 2780, investments: 3908 },
    { name: 'May', trades: 1890, investments: 4800 },
    { name: 'Jun', trades: 2390, investments: 3800 },
  ];

  if (authLoading || isLoading) {
    return <AssetsSkeletonLoader />;
  }

  return (
    <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fluidSpring}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Assets: Earnings and profits</h1>
        <p className="text-secondary">Comprehensive breakdown of your total wealth and current allocations. Click a category to view details.</p>
      </motion.div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.1 }}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => navigate('/assets/trades')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Current Trades</h3>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Activity className="text-blue-500" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">${currentTradesVal.toLocaleString()}</div>
          <div className="text-sm text-emerald-500 font-medium">+12.5% this month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.2 }}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm cursor-pointer hover:border-purple-500 transition-colors"
          onClick={() => navigate('/assets/investments')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Long-Term Investments</h3>
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <TrendingUp className="text-purple-500" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">${investmentsVal.toLocaleString()}</div>
          <div className="text-sm text-emerald-500 font-medium">+5.2% this year</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.3 }}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm cursor-pointer hover:border-[#00f0ff] transition-colors"
          onClick={() => navigate('/assets/retirement')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Retirement Funds</h3>
            <div className="p-2 bg-[#00f0ff]/10 rounded-xl">
              <Shield className="text-[#00f0ff]" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">${retirementVal.toLocaleString()}</div>
          <div className="text-sm text-emerald-500 font-medium">+8.1% all time</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.4 }}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-secondary font-medium">Emergency Funds</h3>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Wallet className="text-emerald-500" size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">${emergencyVal.toLocaleString()}</div>
          <div className="text-sm text-emerald-500 font-medium">Fully Funded</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.5 }}
          className="lg:col-span-1 bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <PieChartIcon className="text-primary" size={20} /> Total Allocation
          </h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Allocation']}
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.6 }}
          className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Performance Over Time
          </h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(15 23 42)', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="trades" name="Trades Growth" stackId="a" fill="#0052ff" radius={[0, 0, 4, 4]} />
                <Bar dataKey="investments" name="Investments Growth" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* Detailed Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.7 }}
        className="mt-8 bg-surface border border-border rounded-3xl p-6 shadow-sm overflow-hidden"
      >
        <h2 className="text-xl font-bold mb-6">Detailed Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-3 px-4 font-semibold text-secondary">Category</th>
                <th className="py-3 px-4 font-semibold text-secondary">Asset Path</th>
                <th className="py-3 px-4 font-semibold text-secondary text-right">Balance</th>
                <th className="py-3 px-4 font-semibold text-secondary text-right">ROI (YTD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-subtle transition-colors">
                <td className="py-4 px-4 font-medium flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Current Trades</td>
                <td className="py-4 px-4 text-secondary">Spot & Margin Pools</td>
                <td className="py-4 px-4 text-right font-mono">${currentTradesVal.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-emerald-500">+12.5%</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-subtle transition-colors">
                <td className="py-4 px-4 font-medium flex items-center gap-2"><TrendingUp size={16} className="text-purple-500"/> Investments</td>
                <td className="py-4 px-4 text-secondary">Index Funds, Staked Crypto</td>
                <td className="py-4 px-4 text-right font-mono">${investmentsVal.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-emerald-500">+5.2%</td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-subtle transition-colors">
                <td className="py-4 px-4 font-medium flex items-center gap-2"><Shield size={16} className="text-[#00f0ff]"/> Retirement Funds</td>
                <td className="py-4 px-4 text-secondary">401k Equivalent Mining Output</td>
                <td className="py-4 px-4 text-right font-mono">${retirementVal.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-emerald-500">+8.1%</td>
              </tr>
              <tr className="hover:bg-subtle transition-colors">
                <td className="py-4 px-4 font-medium flex items-center gap-2"><Wallet size={16} className="text-emerald-500"/> Emergency Funds</td>
                <td className="py-4 px-4 text-secondary">Stablecoin Yield Farming</td>
                <td className="py-4 px-4 text-right font-mono">${emergencyVal.toLocaleString()}</td>
                <td className="py-4 px-4 text-right text-secondary">0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
