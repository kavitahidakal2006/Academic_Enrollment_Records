import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

interface FeedbackBannerProps {
  feedback: FeedbackState | null;
  onDismiss: () => void;
}

export function FeedbackBanner({ feedback, onDismiss }: FeedbackBannerProps) {
  if (!feedback) {
    return null;
  }

  const isSuccess = feedback.type === 'success';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div>
          <span className="font-semibold mr-1.5">{isSuccess ? 'Success:' : 'Error:'}</span>
          <span>{feedback.message}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className={`p-1 rounded-md transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
          isSuccess
            ? 'text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-700'
            : 'text-red-700 hover:bg-red-100 focus-visible:ring-red-700'
        }`}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
