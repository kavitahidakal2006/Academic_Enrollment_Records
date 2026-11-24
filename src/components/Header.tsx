interface HeaderProps {
  onNavigateDirectory: () => void;
  onStartNewStudent: () => void;
  onExportCsv: () => void;
  canExport: boolean;
}

export function Header({
  onNavigateDirectory,
  onStartNewStudent,
  onExportCsv,
  canExport,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-md"
        >
          Student Management System
        </a>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={onNavigateDirectory}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            Directory
          </button>
          <button
            type="button"
            onClick={onStartNewStudent}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            Enrollment Form
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            disabled={!canExport}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded"
          >
            Export CSV
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartNewStudent}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            Add Student
          </button>
        </div>
      </div>
    </header>
  );
}
