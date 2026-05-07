import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Sliders, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, onSnapshot, setDoc, addDoc, collection, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { fluidSpring } from '../components/SystemManager';
import { useNavigate } from 'react-router';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [costings, setCostings] = useState({ pool: 150, cloud: 100, crypto: 200 });
  const [globalProfitMargin, setGlobalProfitMargin] = useState(15);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const settingsDoc = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAiEnabled(data.ai_enabled ?? true);
        setCostings(data.costings ?? { pool: 150, cloud: 100, crypto: 200 });
        setGlobalProfitMargin(data.global_profit_margin ?? 15);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ai_enabled: aiEnabled,
        costings: costings,
        global_profit_margin: globalProfitMargin,
        updated_at: serverTimestamp()
      }, { merge: true });
      toast.success('Global settings updated successfully!');
      await addDoc(collection(db, 'logs'), {
        type: 'admin',
        action: `Updated global settings: AI=${aiEnabled}, Margin=${globalProfitMargin}%`,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-8">Global Settings</h1>
      
      <div className="bg-surface border border-border rounded-3xl p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0052ff]/10 rounded-xl"><Bot className="text-[#0052ff]" size={24} /></div>
          <div>
            <h3 className="text-xl font-bold">AI & Profit Management</h3>
            <p className="text-sm text-secondary">Control client profits and AI automation</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <h4 className="font-semibold text-primary">AI Auto-Management</h4>
            <p className="text-xs text-secondary mt-1">AI takes over client profit distribution when admin is offline.</p>
          </div>
          <button onClick={() => setAiEnabled(!aiEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-[#0052ff]' : 'bg-muted'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div>
          <label htmlFor="globalProfitMargin" className="block text-sm font-medium text-secondary mb-2">Global Client Profit Margin (%)</label>
          <div className="flex items-center gap-4">
            <input type="range" min="1" max="100" value={globalProfitMargin} onChange={(e) => setGlobalProfitMargin(Number(e.target.value))} className="flex-1 accent-[#0052ff]" />
            <div className="relative">
              <input 
                id="globalProfitMargin"
                type="number" 
                min="0" 
                step="0.1"
                value={globalProfitMargin} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setGlobalProfitMargin(val);
                  } else if (e.target.value === '') {
                    setGlobalProfitMargin(0); // Allow clearing temporarily
                  }
                }} 
                className="w-24 bg-background border border-border rounded-xl pl-3 pr-6 py-2 text-primary text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#0052ff]" 
              />
              <span className="absolute right-2 top-2.5 text-secondary text-sm pointer-events-none">%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><Sliders className="text-emerald-500" size={24} /></div>
          <div>
            <h3 className="text-xl font-bold">Section Costings</h3>
            <p className="text-sm text-secondary">Set base prices for mining sections</p>
          </div>
        </div>

        <div className="space-y-4">
          {['pool', 'cloud', 'crypto'].map((key) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary capitalize">{key} Mining Base Cost ($)</label>
              <input type="number" value={costings[key as keyof typeof costings]} onChange={(e) => setCostings({...costings, [key]: Number(e.target.value)})} className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]" />
            </div>
          ))}
        </div>

        <button onClick={handleSaveSettings} className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2">
          <Save size={18} /> Save All Changes
        </button>
      </div>
    </div>
  );
}
