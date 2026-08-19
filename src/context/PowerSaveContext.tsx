import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useBattery } from '../hooks/useBattery';
import { toast } from 'sonner';

interface PowerSaveContextType {
  powerSaveMode: boolean;
  isEffectivePowerSaving: boolean; // True if powerSaveMode is enabled AND battery is discharging (not charging)
  togglePowerSaveMode: () => void;
  setPowerSaveMode: (enabled: boolean) => void;
  updateIntervalMs: number; // Active polling / telemetry refresh cadence in milliseconds
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
