import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Student } from '../types/student';

interface DeleteConfirmModalProps {
  student: Student | null;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  student,
  deleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!student) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !deleting) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [student, deleting, onCancel]);

  if (!student) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 id="delete-modal-title" className="text-base font-semibold text-slate-900">
              Delete Student Record
            </h3>
            <p id="delete-modal-description" className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{student.name}</span> (
              <span className="font-mono text-xs text-slate-800">{student.studentId}</span>)? This
              permanently removes the record from the database.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            {deleting ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
