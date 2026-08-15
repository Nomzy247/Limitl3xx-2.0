import React, { useState } from 'react';
import { Hexagon } from 'lucide-react';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export default function Logo({ compact = false, className = '' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="PoolMining Emblem"
          referrerPolicy="no-referrer"
          className={`${compact ? "w-6 h-6" : "w-8 h-8 sm:w-9 sm:h-9"} rounded-lg object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.35)] transition-transform duration-300 group-hover:scale-105`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${compact ? "w-6 h-6" : "w-8 h-8 sm:w-9 sm:h-9"} rounded-lg bg-gradient-to-br from-[#00f0ff]/20 to-[#0052ff]/20 border border-[#00f0ff]/40 flex items-center justify-center`}>
          <Hexagon 
            size={compact ? 16 : 22} 
            className="text-[#00f0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all" 
            strokeWidth={2} 
          />
        </div>
      )}
      <div className="flex flex-col leading-none">
        <span className={`${compact ? "text-sm" : "text-lg sm:text-xl"} font-bold text-primary tracking-tight`}>
          PoolMining<span className="text-[#00f0ff]">.cloud</span>
        </span>
        {!compact && (
          <span className="text-[9px] uppercase tracking-wider text-secondary font-medium hidden sm:block">
            Next-Gen Hash Network
          </span>
        )}
      </div>
    </div>
  );
}
