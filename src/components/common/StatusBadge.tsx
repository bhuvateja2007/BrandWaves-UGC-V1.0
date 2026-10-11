import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileEdit, 
  Send 
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type SubmissionStatusType = 
  | 'draft' 
  | 'submitted' 
  | 'pending' 
  | 'under_review' 
  | 'revision_requested' 
  | 'approved' 
  | 'rejected';

export interface StatusBadgeProps {
  status: SubmissionStatusType | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const normalized = status.toLowerCase().replace(/\s+/g, '_');

  const configMap: Record<
    string,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string; pulse: boolean }
  > = {
    draft: {
      label: 'Draft',
      icon: <FileEdit className="w-3.5 h-3.5" />,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      pulse: false,
    },
    submitted: {
      label: 'Submitted',
      icon: <Send className="w-3.5 h-3.5" />,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      pulse: true,
    },
    pending: {
      label: 'Under Review',
      icon: <Clock className="w-3.5 h-3.5" />,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      pulse: true,
    },
    under_review: {
      label: 'Under Review',
      icon: <Clock className="w-3.5 h-3.5" />,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      pulse: true,
    },
    revision_requested: {
      label: 'Revision Requested',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      pulse: false,
    },
    approved: {
      label: 'Approved',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      pulse: false,
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      pulse: false,
    },
  };

  const item = configMap[normalized] || {
    label: status,
    icon: <Clock className="w-3.5 h-3.5" />,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    pulse: false,
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border transition-colors ${sizeClasses} ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      {item.pulse && !prefersReducedMotion && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
      )}
      <span className="shrink-0">{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
};
