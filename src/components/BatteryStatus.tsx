import React from 'react';
import SmartBatteryEnergyHub from './SmartBatteryEnergyHub';

interface BatteryStatusProps {
  className?: string;
  showDetails?: boolean;
  hasActiveMining?: boolean;
  variant?: 'pill' | 'compact' | 'card' | 'floating';
}

export default function BatteryStatus({ 
  className = '', 
  showDetails = true,
  hasActiveMining = false,
  variant = 'pill'
}: BatteryStatusProps) {
  return (
    <SmartBatteryEnergyHub
      className={className}
      showDetails={showDetails}
      hasActiveMining={hasActiveMining}
      variant={variant}
    />
  );
}

