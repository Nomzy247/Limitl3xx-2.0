import React, { useEffect, useRef } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryLow, 
  BatteryMedium, 
  BatteryWarning, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useBattery } from '../hooks/useBattery';

interface BatteryStatusProps {
  className?: string;
  showDetails?: boolean;
  hasActiveMining?: boolean;
}

export default function BatteryStatus({ 
  className = '', 
  showDetails = true,
  hasActiveMining = false 
}: BatteryStatusProps) {
  const { isSupported, level, charging } = useBattery();
  const hasNotifiedRef = useRef(false);

  const percentage = Math.round(level * 100);
  const isCritical = percentage <= 10 && !charging;
  const isLow = percentage <= 20 && !charging;
  const isMedium = percentage > 20 && percentage <= 50;

  // Trigger subtle toast notification when battery drops below 20% during active mining
  useEffect(() => {
    if (!isSupported) return;

    if (isLow && hasActiveMining && !charging) {
      if (!hasNotifiedRef.current) {
        toast.warning(`Battery at ${percentage}% during active mining`, {
          description: 'Cloud mining runs remotely in our data center. Your hashrate and payouts continue safely even if your device powers off.',
          duration: 5000,
          id: 'low-battery-mining-toast'
        });
        hasNotifiedRef.current = true;
      }
    } else if (charging || percentage > 20) {
      // Reset toast trigger when user plugs in or battery level recovers
      hasNotifiedRef.current = false;
    }
  }, [isSupported, isLow, hasActiveMining, charging, percentage]);

  // If Battery API is not supported by the client browser/device, render nothing gracefully
  if (!isSupported) {
    return null;
  }

  // Determine styling, colors, and badge appearance based on charging and percentage
  let statusColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';
  let statusLabel = 'Optimal';

  if (charging) {
    statusColor = 'text-[#00f0ff]';
    badgeBg = 'bg-[#00f0ff]/10 border-[#00f0ff]/30';
    dotColor = 'bg-[#00f0ff]';
    statusLabel = 'Charging';
  } else if (isCritical) {
    statusColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/15 border-rose-500/40 animate-pulse';
    dotColor = 'bg-rose-500';
    statusLabel = 'Critical Battery';
  } else if (isLow) {
    statusColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/40';
    dotColor = 'bg-amber-400';
    statusLabel = 'Low Power';
  } else if (isMedium) {
    statusColor = 'text-amber-200';
    badgeBg = 'bg-amber-500/5 border-border/60';
    dotColor = 'bg-amber-300';
    statusLabel = 'Normal';
  }

  // Pick appropriate icon representation
  const renderBatteryIcon = () => {
    if (charging) {
      return <BatteryCharging className="w-4 h-4 text-[#00f0ff] animate-pulse" />;
    }
    if (isCritical) {
      return <BatteryWarning className="w-4 h-4 text-rose-400 animate-bounce" />;
    }
    if (isLow) {
      return <BatteryLow className="w-4 h-4 text-amber-400" />;
    }
    if (isMedium) {
      return <BatteryMedium className="w-4 h-4 text-amber-200" />;
    }
    return <Battery className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div
      id="dashboard-battery-status"
      title={`Device Battery: ${percentage}% (${charging ? 'Charging' : isLow ? 'Low Power Warning' : 'Discharging'})`}
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all shadow-sm select-none ${badgeBg} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {renderBatteryIcon()}
        {charging && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
        )}
      </div>

      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
        <span className={`${statusColor} tracking-tight`}>
          {percentage}%
        </span>

        {charging ? (
          <span className="flex items-center text-[10px] uppercase font-bold text-[#00f0ff] tracking-wider px-1.5 py-0.2 rounded bg-[#00f0ff]/10">
            <Zap size={10} className="mr-0.5 inline fill-[#00f0ff]" /> AC
          </span>
        ) : isLow ? (
          <span className="flex items-center text-[10px] uppercase font-bold text-amber-400 tracking-wider px-1 py-0.2 rounded bg-amber-400/10">
            <AlertTriangle size={10} className="mr-0.5 inline" /> Save
          </span>
        ) : null}
      </div>

      {showDetails && (
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] border-l border-border/40 pl-2">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className="text-secondary font-medium text-[10px] uppercase tracking-wide">
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
}
