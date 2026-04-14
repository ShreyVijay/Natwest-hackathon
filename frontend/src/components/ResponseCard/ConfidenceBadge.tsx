import React from 'react';
import type { ConfidenceState } from '../../types';
import { CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface ConfidenceBadgeProps {
  status: ConfidenceState;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ status }) => {
  const config: Record<ConfidenceState, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
    Verified: {
      icon: <CheckCircle2 size={13} />,
      bg: 'bg-emerald-400/12 border border-emerald-400/18',
      text: 'text-emerald-200',
      label: 'Verified',
    },
    Estimated: {
      icon: <AlertCircle size={13} />,
      bg: 'bg-amber-400/12 border border-amber-400/18',
      text: 'text-amber-200',
      label: 'Estimated',
    },
    Transparent: {
      icon: <Eye size={13} />,
      bg: 'bg-white/[0.06] border border-white/10',
      text: 'text-zinc-300',
      label: 'Transparent',
    },
  };

  const { icon, bg, text, label } = config[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold shadow-sm ${bg} ${text}`}
      style={{ border: 'none' }}
      title={status === 'Transparent' ? 'Some data may be missing or inferred' : undefined}
    >
      {icon}
      {label}
    </div>
  );
};
