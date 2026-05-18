import React, { useState } from 'react';
import { Hexagon } from 'lucide-react';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export default function Logo({ compact = false, className = '' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/logo.png"
        alt="PoolMining.cloud"
        className={`${compact ? "h-5" : "h-7 sm:h-8"} object-contain ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <Hexagon 
        size={compact ? 20 : 28} 
        className="text-[#00f0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all" 
        strokeWidth={2} 
      />
      <span className={`${compact ? "text-sm" : "text-xl"} font-semibold text-primary tracking-tight`}>
        PoolMining<span className="text-[#0052ff]">.cloud</span>
      </span>
    </div>
  );
}
