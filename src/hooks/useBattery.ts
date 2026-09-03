import { useState, useEffect, useCallback } from 'react';

export interface BatteryState {
  isSupported: boolean;
  level: number; // 0.0 to 1.0 (e.g. 0.88 = 88%)
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  isSimulated?: boolean;
  temperatureC?: number;
  batteryHealth?: number; // percentage e.g. 98%
  voltageV?: number;
  chargingSpeed?: 'Turbo AC 65W' | 'Fast USB-C 30W' | 'Standard 15W' | 'Discharging';
}

// Synthesize pleasant electric charging sound via Web Audio API
export function playChargingSurgeSound(isPluggingIn: boolean) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (isPluggingIn) {
      // Ascending electric chime (Charge Connected)
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          } catch (e) {}
        }, idx * 60);
      });
    } else {
      // Soft descending chime (Unplugged)
      const notes = [659.25, 554.37];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
          } catch (e) {}
        }, idx * 70);
      });
    }
  } catch (e) {}
}

export function useBattery(): BatteryState & {
  toggleSimulatedCharging?: () => void;
  setManualLevel?: (level: number) => void;
} {
  const [batteryState, setBatteryState] = useState<BatteryState>(() => {
    // Initial state with sensible defaults so it is NEVER blank or null
    let savedCharging = true;
    let savedLevel = 0.88;
    try {
      const storedCharging = localStorage.getItem('pm_batt_charging');
      const storedLevel = localStorage.getItem('pm_batt_level');
      if (storedCharging !== null) savedCharging = storedCharging === 'true';
      if (storedLevel !== null) savedLevel = parseFloat(storedLevel);
    } catch (e) {}

    return {
      isSupported: true,
      level: isNaN(savedLevel) ? 0.88 : Math.min(1, Math.max(0.05, savedLevel)),
      charging: savedCharging,
      chargingTime: 0,
      dischargingTime: Infinity,
      isSimulated: true,
      temperatureC: 28.5,
      batteryHealth: 99,
      voltageV: 4.15,
      chargingSpeed: savedCharging ? 'Turbo AC 65W' : 'Discharging'
    };
  });

  useEffect(() => {
    let batteryManager: any = null;

    const updateBatteryInfo = (bm: any) => {
      const lvl = typeof bm.level === 'number' ? bm.level : 0.88;
      const chg = typeof bm.charging === 'boolean' ? bm.charging : true;
      
      setBatteryState({
        isSupported: true,
        level: lvl,
        charging: chg,
        chargingTime: bm.chargingTime || 0,
        dischargingTime: bm.dischargingTime || Infinity,
        isSimulated: false,
        temperatureC: chg ? 30.2 : 27.8,
        batteryHealth: 99,
        voltageV: chg ? 4.25 : 3.95,
        chargingSpeed: chg ? 'Turbo AC 65W' : 'Discharging'
      });

      try {
        localStorage.setItem('pm_batt_charging', String(chg));
        localStorage.setItem('pm_batt_level', String(lvl));
      } catch (e) {}
    };

    const handleLevelChange = () => {
      if (batteryManager) updateBatteryInfo(batteryManager);
    };

    const handleChargingChange = () => {
      if (batteryManager) {
        updateBatteryInfo(batteryManager);
        playChargingSurgeSound(batteryManager.charging);
      }
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
          console.debug('Battery Status API fallback to simulated mode:', err);
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

  const toggleSimulatedCharging = useCallback(() => {
    setBatteryState(prev => {
      const nextCharging = !prev.charging;
      playChargingSurgeSound(nextCharging);
      try {
        localStorage.setItem('pm_batt_charging', String(nextCharging));
      } catch (e) {}
      return {
        ...prev,
        charging: nextCharging,
        chargingSpeed: nextCharging ? 'Turbo AC 65W' : 'Discharging',
        temperatureC: nextCharging ? 30.5 : 27.5,
        voltageV: nextCharging ? 4.22 : 3.92
      };
    });
  }, []);

  const setManualLevel = useCallback((newLevel: number) => {
    const clamped = Math.min(1, Math.max(0.05, newLevel));
    setBatteryState(prev => {
      try {
        localStorage.setItem('pm_batt_level', String(clamped));
      } catch (e) {}
      return {
        ...prev,
        level: clamped
      };
    });
  }, []);

  return {
    ...batteryState,
    toggleSimulatedCharging,
    setManualLevel
  };
}

