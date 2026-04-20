import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileUploader } from './components/FileUploader';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { PresentationShell } from './components/PresentationShell';
import { TrustTransition } from './components/TrustTransition';
import { useBlindMode } from './hooks/useBlindMode';
import { useAppContext } from './stores/appStore';

const AppContent: React.FC = () => {
  const { appView, blindMode, setBlindMode } = useAppContext();
  const { t } = useTranslation();

  useBlindMode(blindMode, setBlindMode);

  return (
    <div className="min-h-screen w-full bg-black p-2 font-sans md:p-3">
      {blindMode && (
        <div
          className="fixed left-3 right-3 top-3 z-[9999] rounded-2xl bg-violet-600/90 py-2 text-center text-xs font-semibold tracking-wide text-white shadow-[0_0_18px_rgba(168,85,247,0.45)] animate-pulse md:text-sm"
          role="status"
          aria-live="assertive"
        >
          BLIND MODE ACTIVE - Tab to navigate - Buttons read aloud - AI auto-speaks - Enter to voice-query
        </div>
      )}

      <div className="main-container mx-auto flex h-[calc(100vh-16px)] min-h-0 max-h-[940px] w-full max-w-[1600px] overflow-hidden md:h-[calc(100vh-24px)]">
        {appView === 'booting' && (
          <div className="flex h-full w-full flex-col items-center justify-center bg-black">
            <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-pulse" />
            <p className="font-medium text-zinc-400">{t('configuringApp')}</p>
          </div>
        )}
        {appView === 'login' && <Login />}
        {appView === 'upload' && <FileUploader />}
        {appView === 'onboarding' && <Onboarding />}
        {appView === 'transition' && <TrustTransition />}
        {appView === 'chat' && <PresentationShell />}
      </div>
    </div>
  );
};

export default AppContent;
