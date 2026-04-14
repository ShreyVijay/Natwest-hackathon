import React, { useState } from 'react';
import { useAppContext } from '../stores/appStore';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BoltLogo } from './BoltLogo';

export const Login: React.FC = () => {
  const { loginUser, setLanguage } = useAppContext();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      loginUser(username.trim());
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black px-4">
      <div className="pointer-events-none absolute left-[8%] top-[-6%] h-[280px] w-[280px] rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[4%] h-[320px] w-[320px] rounded-full bg-violet-500/12 blur-[140px]" />

      {/* Language Switcher in top right */}
      <div className="absolute right-4 top-4 z-50 md:right-5 md:top-5">
        <LanguageSwitcher onLanguageChange={setLanguage} />
      </div>

      <div className="glass-card-high relative z-10 flex w-full max-w-[420px] flex-col rounded-[1.6rem] border border-cyan-300/8 bg-[linear-gradient(180deg,rgba(8,12,18,0.88),rgba(8,9,14,0.94))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:p-6">
        <div className="relative mb-7 flex flex-col items-center">
          <BoltLogo className=" w-[410px] max-w-full mix-blend-screen opacity-92 [filter:drop-shadow(0_0_18px_rgba(77,226,255,0.12))_drop-shadow(0_0_24px_rgba(180,108,255,0.12))]" />
          {/* <h1 className="compact-title text-[1.65rem] font-semibold text-white md:text-[1.9rem]">
            {t('appName')}
          </h1>
          <p className="mt-2 max-w-[300px] text-center text-[13px] leading-relaxed text-zinc-400">
            {t('login.subtitle')}
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative group">
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="peer h-11 w-full rounded-[1rem] border border-cyan-300/8 bg-white/[0.03] px-4 text-sm font-medium text-zinc-100 placeholder:text-transparent transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder={t('login.userIdPlaceholder')}
            />
            {/* Smooth floating label matching light aesthetic */}
            <label
              htmlFor="username"
              className="pointer-events-none absolute left-4 top-2 z-10 origin-[0] -translate-y-4 scale-[0.85] transform px-1 text-[12px] text-zinc-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-[0.85] peer-focus:text-cyan-300"
            >
              {t('login.userIdPlaceholder')}
            </label>
          </div>

          <button
            type="submit"
            className="group relative flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-[1rem] bg-[linear-gradient(90deg,#26d9ff_0%,#6ea6ff_38%,#a85cff_72%,#cf78ff_100%)] px-4 text-sm font-semibold text-white transition-all shadow-[0_0_22px_rgba(86,196,255,0.16),0_0_22px_rgba(180,108,255,0.14)] hover:brightness-110"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('login.continue')}
              <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? (document.documentElement.dir === 'rtl' ? '-translate-x-1' : 'translate-x-1') : ''}`} />
            </span>
          </button>
        </form>
      </div>

      <div className="mt-4 px-4 text-center text-[11px] font-medium text-zinc-600">
        {t('login.securityNotice')}
      </div>
    </div>
  );
};
