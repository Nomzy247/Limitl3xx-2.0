import { useState, useEffect } from 'react';

export interface BatteryState {
  isSupported: boolean;
  level: number; // 0.0 to 1.0 (e.g. 0.18 = 18%)
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export function useBattery(): BatteryState {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    isSupported: false,
    level: 1,
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
  });

  useEffect(() => {
    let batteryManager: any = null;

    const updateBatteryInfo = (bm: any) => {
      setBatteryState({
        isSupported: true,
        level: typeof bm.level === 'number' ? bm.level : 1,
        charging: typeof bm.charging === 'boolean' ? bm.charging : true,
        chargingTime: bm.chargingTime || 0,
        dischargingTime: bm.dischargingTime || Infinity,
      });
    };

    const handleLevelChange = () => {
      if (batteryManager) updateBatteryInfo(batteryManager);
    };

    const handleChargingChange = () => {
      if (batteryManager) updateBatteryInfo(batteryManager);
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((bm: any) => {
          batteryManager = bm;
          updateBatteryInfo(bm);

          bm.addEventListener('levelchange', handleLevelChange);
          bm.addEventListener('chargingchange', handleChargingChange);
          bm.addEventListener('chargingtimechange', handleChargingChange);
          bm.addEventListener('dischargingtimechange', handleChargingChange);
        })
        .catch((err: any) => {
          console.debug('Battery Status API error or permission denied:', err);
        });
    }

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', handleLevelChange);
        batteryManager.removeEventListener('chargingchange', handleChargingChange);
        batteryManager.removeEventListener('chargingtimechange', handleChargingChange);
        batteryManager.removeEventListener('dischargingtimechange', handleChargingChange);
      }
    };
  }, []);

  return batteryState;
}
