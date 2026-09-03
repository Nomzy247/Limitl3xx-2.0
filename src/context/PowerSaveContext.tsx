import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useBattery } from '../hooks/useBattery';
import { toast } from 'sonner';

interface PowerSaveContextType {
  powerSaveMode: boolean;
  isEffectivePowerSaving: boolean; // True if powerSaveMode is enabled AND battery is discharging (not charging)
  togglePowerSaveMode: () => void;
  setPowerSaveMode: (enabled: boolean) => void;
  updateIntervalMs: number; // Active polling / telemetry refresh cadence in milliseconds
  
  // Battery HUD View Settings
  batteryViewMode: 'minimalist' | 'detailed';
  setBatteryViewMode: (mode: 'minimalist' | 'detailed') => void;
  toggleBatteryViewMode: () => void;
  
  showFloatingBattery: boolean;
  setShowFloatingBattery: (show: boolean) => void;
  toggleFloatingBattery: () => void;
  
  chargingPulseEffect: boolean;
  setChargingPulseEffect: (enabled: boolean) => void;
}

const PowerSaveContext = createContext<PowerSaveContextType | undefined>(undefined);

export function PowerSaveProvider({ children }: { children: ReactNode }) {
  const battery = useBattery();
  
  const [powerSaveMode, setPowerSaveModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('power_save_mode');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      console.debug('Error reading power_save_mode from localStorage', e);
    }
    return false; // Default off unless toggled
  });

  const [batteryViewMode, setBatteryViewModeState] = useState<'minimalist' | 'detailed'>(() => {
    try {
      const saved = localStorage.getItem('battery_view_mode');
      if (saved === 'minimalist' || saved === 'detailed') {
        return saved;
      }
    } catch (e) {
      console.debug('Error reading battery_view_mode from localStorage', e);
    }
    return 'detailed'; // Default to rich detailed view
  });

  const [showFloatingBattery, setShowFloatingBatteryState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('show_floating_battery');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      console.debug('Error reading show_floating_battery from localStorage', e);
    }
    return true; // Default floating indicator enabled
  });

  const [chargingPulseEffect, setChargingPulseEffectState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('charging_pulse_effect');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      console.debug('Error reading charging_pulse_effect from localStorage', e);
    }
    return true; // Default subtle charging pulse enabled
  });

  // Effective power saving applies when user enables it and the device is discharging on battery
  // (or when Battery API isn't available, defaults strictly to user's powerSaveMode preference)
  const isEffectivePowerSaving = powerSaveMode && (battery.isSupported ? !battery.charging : true);

  // Normal update frequency: 15 seconds (15000ms)
  // Power-Save update frequency: 90 seconds (90000ms) to dramatically cut CPU wakeups and radio activity
  const updateIntervalMs = isEffectivePowerSaving ? 90000 : 15000;

  useEffect(() => {
    try {
      localStorage.setItem('power_save_mode', String(powerSaveMode));
    } catch (e) {
      console.debug('Error writing power_save_mode to localStorage', e);
    }
  }, [powerSaveMode]);

  useEffect(() => {
    try {
      localStorage.setItem('battery_view_mode', batteryViewMode);
    } catch (e) {
      console.debug('Error writing battery_view_mode to localStorage', e);
    }
  }, [batteryViewMode]);

  useEffect(() => {
    try {
      localStorage.setItem('show_floating_battery', String(showFloatingBattery));
    } catch (e) {
      console.debug('Error writing show_floating_battery to localStorage', e);
    }
  }, [showFloatingBattery]);

  useEffect(() => {
    try {
      localStorage.setItem('charging_pulse_effect', String(chargingPulseEffect));
    } catch (e) {
      console.debug('Error writing charging_pulse_effect to localStorage', e);
    }
  }, [chargingPulseEffect]);

  const setBatteryViewMode = (mode: 'minimalist' | 'detailed') => {
    setBatteryViewModeState(mode);
    toast.info(`Battery HUD set to ${mode === 'minimalist' ? 'Minimalist' : 'Detailed'} view`);
  };

  const toggleBatteryViewMode = () => {
    setBatteryViewModeState((prev) => {
      const next = prev === 'minimalist' ? 'detailed' : 'minimalist';
      toast.info(`Switched to ${next === 'minimalist' ? 'Minimalist' : 'Detailed'} Battery View`);
      return next;
    });
  };

  const setShowFloatingBattery = (show: boolean) => {
    setShowFloatingBatteryState(show);
    toast.info(show ? 'Floating Battery HUD visible' : 'Floating Battery HUD hidden');
  };

  const toggleFloatingBattery = () => {
    setShowFloatingBatteryState((prev) => {
      const next = !prev;
      toast.info(next ? 'Floating Battery HUD enabled' : 'Floating Battery HUD hidden');
      return next;
    });
  };

  const setChargingPulseEffect = (enabled: boolean) => {
    setChargingPulseEffectState(enabled);
    toast.info(enabled ? 'Charging glow pulse enabled' : 'Charging glow pulse disabled');
  };

  const togglePowerSaveMode = () => {
    setPowerSaveModeState((prev) => {
      const next = !prev;
      if (next) {
        toast.success('Power-Save Mode Enabled', {
          description: 'Background telemetry and mining sync frequencies are throttled to conserve battery.',
          duration: 4000
        });
      } else {
        toast.info('Power-Save Mode Disabled', {
          description: 'Restored real-time background sync rates.',
          duration: 3000
        });
      }
      return next;
    });
  };

  const setPowerSaveMode = (enabled: boolean) => {
    if (enabled !== powerSaveMode) {
      setPowerSaveModeState(enabled);
      if (enabled) {
        toast.success('Power-Save Mode Enabled', {
          description: 'Background telemetry and mining sync frequencies are throttled to conserve battery.',
          duration: 4000
        });
      } else {
        toast.info('Power-Save Mode Disabled', {
          description: 'Restored real-time background sync rates.',
          duration: 3000
        });
      }
    }
  };

  return (
    <PowerSaveContext.Provider
      value={{
        powerSaveMode,
        isEffectivePowerSaving,
        togglePowerSaveMode,
        setPowerSaveMode,
        updateIntervalMs
      }}
    >
      {children}
    </PowerSaveContext.Provider>
  );
}

export function usePowerSave() {
  const context = useContext(PowerSaveContext);
  if (!context) {
    throw new Error('usePowerSave must be used within a PowerSaveProvider');
  }
  return context;
}
