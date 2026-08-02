import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../i18n';
import { toast } from 'sonner';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'cards';
  className?: string;
}

export default function LanguageSelector({ variant = 'dropdown', className = '' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize current language code (e.g. "en-US" -> "en")
  const currentLangCode = (i18n.language || 'en').split('-')[0];
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: LanguageOption) => {
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
    toast.success(t('settings.languageUpdated', { defaultValue: `Language updated to ${lang.nativeName}` }), {
      description: `${lang.flag} ${lang.name} (${lang.region}) is now active across all dashboards.`,
      duration: 3500
    });
  };

  if (variant === 'cards') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'border-2 border-[#0052ff] bg-surface shadow-lg shadow-blue-500/10'
                    : 'border-border bg-surface/40 hover:border-[#0052ff]/40 hover:bg-surface/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{lang.nativeName}</span>
                      <span className="text-xs text-muted font-normal">({lang.name})</span>
                    </div>
                    <p className="text-[11px] text-secondary mt-0.5">{lang.region}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-xs font-bold text-[#0052ff] bg-[#0052ff]/10 border border-[#0052ff]/20 px-2.5 py-1 rounded-full">
                    <Check size={13} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-surface border border-border hover:border-[#0052ff]/50 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]/20 min-w-[210px]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none" role="img" aria-label={currentLang.name}>
            {currentLang.flag}
          </span>
          <div className="text-left">
            <span className="font-bold text-xs text-primary block leading-tight">{currentLang.nativeName}</span>
            <span className="text-[10px] text-muted block leading-tight">{currentLang.name}</span>
          </div>
        </div>
        <ChevronDown size={15} className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <Globe size={12} /> {t('settings.selectLanguageLabel', 'Interface Language')}
            </span>
            <span className="text-[10px] bg-[#0052ff]/10 text-[#0052ff] font-semibold px-2 py-0.5 rounded-full">
              {SUPPORTED_LANGUAGES.length} {t('common.active', 'Active')}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLangCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#0052ff]/10 text-primary font-bold'
                      : 'hover:bg-subtle/80 text-secondary hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg leading-none" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <p className="text-xs font-bold leading-none">{lang.nativeName}</p>
                      <p className="text-[10px] text-muted leading-tight mt-0.5">{lang.name} • {lang.region}</p>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-[#0052ff] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
