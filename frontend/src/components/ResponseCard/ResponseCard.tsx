import React, { useState } from 'react';
import { AlertCircle, ArrowRight, HelpCircle, TrendingUp, Volume2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../services/feedbackService';
import { simplifyBlock, type SimplifyContext } from '../../services/geminiService';
import { useAppContext } from '../../stores/appStore';
import type { Persona, RenderedResponse, ResponseBlock } from '../../types';
import { ChartRenderer } from './ChartRenderer';
import { ConfidenceBadge } from './ConfidenceBadge';

const CONFUSION_LABEL_KEYS: Record<Persona, string> = {
  Beginner: 'response.help',
  Everyday: 'response.explain',
  SME: 'response.detail',
  Executive: 'response.soWhat',
  Analyst: 'response.methodology',
  Compliance: 'response.auditNote',
};

const BlockWithConfusion: React.FC<{
  block: ResponseBlock;
  children: React.ReactNode;
  context?: SimplifyContext;
}> = ({ block, children, context }) => {
  const [showSimplified, setShowSimplified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicExplanation, setDynamicExplanation] = useState<string | null>(null);
  const { currentPersona } = useAppContext();
  const { t } = useTranslation();

  const handleToggle = async () => {
    if (!showSimplified && !dynamicExplanation) {
      if (currentPersona === 'Analyst') {
        trackEvent('methodology_clicked');
      } else {
        trackEvent('confusion_clicked');
      }

      setShowSimplified(true);
      setIsLoading(true);

      try {
        const text = await simplifyBlock(block.content, block.type, currentPersona, context);
        setDynamicExplanation(text);
      } catch {
        setDynamicExplanation(t('response.unableToLoad'));
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowSimplified(!showSimplified);
    }
  };

  const btnLabel = t(CONFUSION_LABEL_KEYS[currentPersona]) ?? '?';

  return (
    <div className="response-block relative group">
      {children}
      <button onClick={handleToggle} className="confusion-btn mt-2 flex items-center gap-1" title={t('response.help')}>
        {showSimplified ? <X size={11} /> : <HelpCircle size={11} />}
        {showSimplified ? t('response.hideExplanation') : btnLabel}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showSimplified ? 'mt-3 max-h-56 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="rounded-[1rem] border border-cyan-400/15 bg-cyan-500/10 p-2.5 text-[13px] leading-relaxed text-cyan-100">
          {isLoading ? (
            <div className="flex items-center gap-2">
              {[0, 150, 300].map((d) => (
                <div
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
              <span className="ml-2 text-xs font-medium text-zinc-400">{t('response.simplifying')}</span>
            </div>
          ) : (
            <>{dynamicExplanation ?? block.simplified}</>
          )}
        </div>
      </div>
    </div>
  );
};

const AuditBanner: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex items-start gap-2 rounded-[1rem] border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-amber-100">
    <AlertCircle size={13} className="mt-0.5 shrink-0" />
    <span className="font-mono text-xs leading-relaxed">{content}</span>
  </div>
);

const DiagnosticPill: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[11px] font-medium leading-relaxed text-amber-100">
    <TrendingUp size={12} className="mt-0.5 shrink-0 text-amber-300" />
    {text.replace(/^.\s*/, '')}
  </div>
);

const KpiStrip: React.FC<{ data: ResponseBlock }> = ({ data }) => {
  const metrics = data.chartData ?? [];
  if (metrics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5 py-1">
      {metrics.map((m, i) => (
        <div key={i} className="min-w-[128px] rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{m.label}</span>
          <span className="mt-1 block text-lg font-bold text-white">
            {m.value.toLocaleString()} <span className="text-xs font-normal text-zinc-400">{m.unit}</span>
          </span>
          {m.delta_pct != null && (
            <span className={`text-[11px] font-semibold ${m.delta_pct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {m.delta_pct >= 0 ? 'UP' : 'DOWN'} {Math.abs(m.delta_pct).toFixed(1)}% vs prior
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export interface ResponseCardProps {
  response: RenderedResponse;
  onActionClick?: (actionText: string) => void;
  onInspect?: () => void;
  isInspected?: boolean;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({ response, onActionClick, onInspect, isInspected = false }) => {
  const { currentPersona, voiceMode, blindMode } = useAppContext();
  const { t } = useTranslation();

  const isCompliance = currentPersona === 'Compliance';
  const isAnalyst = currentPersona === 'Analyst';

  const readAloud = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    let fullText = `${response.ttsHeadline}. `;
    const insight = response.blocks.find((b) => b.type === 'insight')?.content;
    const action = response.blocks.find((b) => b.type === 'action')?.content;
    if (insight) fullText += `${insight}. `;
    if (action) fullText += `Recommended next step: ${action}.`;
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  React.useEffect(() => {
    if (voiceMode || blindMode) readAloud();
    return () => {
      if (voiceMode || blindMode) window.speechSynthesis.cancel();
    };
  }, []);

  const simplifyCtx: SimplifyContext = {
    query: response.ttsHeadline,
    mainSummary: response.ttsHeadline,
    metrics: response.evidence.rawValues.map((v) => ({
      label: v.label,
      value: v.value,
      prev_value: v.prev_value ?? null,
      unit: v.unit,
    })),
    breakdown: response.evidence.rawValues.map((v) => ({ label: v.label, value: v.value })),
    anomalies: response.evidence.limitations ?? [],
  };

  const actionBlocks = response.blocks.filter((b) => b.type === 'action');
  const diagBlocks = response.blocks.filter((b) => b.type === 'audit' && b.content.startsWith('⚑'));
  const coreBlocks = response.blocks.filter((b) => !actionBlocks.includes(b) && !diagBlocks.includes(b));

  return (
    <div className={`relative w-full space-y-3.5 rounded-[1.35rem] border bg-white/[0.04] p-4 persona-card persona-${currentPersona.toLowerCase()} ${
      isInspected ? 'border-cyan-300/25 shadow-[0_0_24px_rgba(77,226,255,0.1)]' : 'border-white/10'
    }`}>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
        <div className="no-speech mr-2 flex gap-1">
          {(Array.isArray(response.queryType) ? response.queryType : []).map((qt, i) => (
            <span
              key={i}
              className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-tighter text-zinc-400"
            >
              {qt}
            </span>
          ))}
        </div>

        <span className={`persona-chip persona-chip-${currentPersona.toLowerCase()}`}>{response.personaLabel}</span>
        <ConfidenceBadge status={response.confidenceLabel} />
        <button
          onClick={readAloud}
          className="rounded-full border border-white/10 bg-white/[0.05] p-1.5 text-zinc-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
          title={t('response.readAloud')}
        >
          <Volume2 size={15} />
        </button>
        {onInspect && (
          <button
            onClick={onInspect}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-all ${
              isInspected
                ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100'
                : 'border-white/10 bg-white/[0.05] text-zinc-400 hover:border-cyan-300/20 hover:bg-cyan-400/10 hover:text-cyan-100'
            }`}
            title="Open evidence, confidence, and method details in the right panel"
          >
            Inspect
          </button>
        )}
      </div>

      {coreBlocks.map((block, i) => {
        if (block.type === 'headline') {
          return (
            <BlockWithConfusion key={i} block={block} context={simplifyCtx}>
              <h3
                className={`pr-28 font-semibold leading-snug text-white ${
                  currentPersona === 'Beginner' ? 'text-[15px]' : currentPersona === 'Executive' ? 'text-[18px]' : 'text-[16px]'
                }`}
              >
                {block.content}
              </h3>
            </BlockWithConfusion>
          );
        }

        if (block.type === 'audit' && block.auditContent) {
          return <AuditBanner key={i} content={block.auditContent} />;
        }

        if (block.type === 'kpi' && block.chartData) {
          return <KpiStrip key={i} data={block} />;
        }

        if (block.type === 'chart' && block.chartData && block.chartData.length > 0 && block.chartType) {
          return (
            <div className="response-block" key={i}>
              {block.content && <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{block.content}</p>}
              <ChartRenderer visual={block.chartType} data={block.chartData} />
            </div>
          );
        }

        if (block.type === 'secondary_chart' && block.chartData && block.chartData.length > 0 && block.chartType) {
          return (
            <div key={i} className="response-block secondary-visual">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{t('response.supportingView')}</p>
              <ChartRenderer visual={block.chartType} data={block.chartData} compact />
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={i} className="response-block">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{t('response.exactRecordValues')}</p>
              <ChartRenderer visual="Table" data={block.tableData ?? block.chartData ?? []} />
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">{block.content}</p>
            </div>
          );
        }

        if (block.type === 'insight') {
          return (
            <BlockWithConfusion key={i} block={block} context={simplifyCtx}>
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 min-h-[20px] w-1 shrink-0 rounded-full ${
                    isCompliance ? 'bg-amber-300' : isAnalyst ? 'bg-violet-300' : 'bg-cyan-300'
                  }`}
                  style={{ height: 'auto' }}
                />
                <p
                  className={`leading-relaxed ${
                    currentPersona === 'Analyst' ? 'font-mono text-[11px] text-zinc-300' : 'text-[13px] font-medium text-zinc-200'
                  }`}
                >
                  {block.content}
                </p>
              </div>
            </BlockWithConfusion>
          );
        }

        return null;
      })}

      {diagBlocks.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{t('response.keyDrivers')}</p>
          <div className="flex flex-wrap gap-2">
            {diagBlocks.map((b, i) => (
              <DiagnosticPill key={i} text={b.content} />
            ))}
          </div>
        </div>
      )}

      {actionBlocks.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="mb-3 mt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {t('response.recommendedNextSteps')}
          </p>
          {actionBlocks.map((block, i) => (
            <BlockWithConfusion key={i} block={block} context={simplifyCtx}>
              <button
                onClick={() => {
                  trackEvent('action_followed');
                  onActionClick?.(block.content);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-left text-[13px] font-semibold text-zinc-200 transition-all hover:border-cyan-300/20 hover:bg-cyan-400/8 hover:text-white"
              >
                {block.content}
                <ArrowRight size={14} className="ml-auto shrink-0 text-zinc-500" />
              </button>
            </BlockWithConfusion>
          ))}
        </div>
      )}
    </div>
  );
};
