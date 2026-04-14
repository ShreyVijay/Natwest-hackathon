import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'GB' },
  { code: 'hi', label: 'Hindi', flag: 'IN' },
  { code: 'bn', label: 'Bangla', flag: 'IN' },
  { code: 'te', label: 'Telugu', flag: 'IN' },
  { code: 'mr', label: 'Marathi', flag: 'IN' },
  { code: 'ta', label: 'Tamil', flag: 'IN' },
  { code: 'es', label: 'Espanol', flag: 'ES' },
  { code: 'fr', label: 'Francais', flag: 'FR' },
  { code: 'zh', label: 'Chinese', flag: 'CN' },
  { code: 'ar', label: 'Arabic', flag: 'SA' },
  { code: 'de', label: 'Deutsch', flag: 'DE' },
] as const;

interface LanguageSwitcherProps {
  onLanguageChange?: (code: string) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onLanguageChange }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((lang) => lang.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitch = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('t2d_language', code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    onLanguageChange?.(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-300 transition-all hover:border-violet-400/30 hover:bg-white/[0.07] hover:text-white"
        title="Switch language"
      >
        <Globe size={14} />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          style={{ maxHeight: '320px', overflowY: 'auto' }}
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === i18n.language;

            return (
              <button
                key={lang.code}
                onClick={() => handleSwitch(lang.code)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-200 shadow-[0_0_18px_rgba(168,85,247,0.18)]'
                    : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className="text-xs font-semibold text-zinc-500">{lang.flag}</span>
                <span>{lang.label}</span>
                {isActive && <span className="ml-auto text-xs font-semibold text-violet-300">Active</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
