import { Pencil, RefreshCw, Search, Trash2, Users, X } from 'lucide-react';
import { formatYearLabel, YEAR_OPTIONS, type Student } from '../types/student';

interface StudentTableProps {
  students: Student[];
  totalCount: number;
  loading: boolean;
  editingId: number | null;
  searchQuery: string;
  departmentFilter: string;
  yearFilter: string;
  availableDepartments: string[];
  onSearchChange: (value: string) => void;
  onDepartmentFilterChange: (value: string) => void;
  onYearFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  onEdit: (student: Student) => void;
  onRequestDelete: (student: Student) => void;
  onFocusCreateForm: () => void;
}

export function StudentTable({
  students,
  totalCount,
  loading,
  editingId,
  searchQuery,
  departmentFilter,
  yearFilter,
  availableDepartments,
  onSearchChange,
  onDepartmentFilterChange,
  onYearFilterChange,
  onClearFilters,
  onRefresh,
  onEdit,
  onRequestDelete,
  onFocusCreateForm,
}: StudentTableProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' || departmentFilter !== '' || yearFilter !== '';

  return (
    <section
      id="student-directory-section"
      aria-labelledby="student-directory-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 id="student-directory-heading" className="text-lg font-semibold text-slate-900">
              Student Directory
            </h2>
            <span className="text-sm text-slate-500 tabular-nums">
              {hasActiveFilters
                ? `${students.length} of ${totalCount} records`
                : `${totalCount} ${totalCount === 1 ? 'record' : 'records'}`}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by ID, name, or email..."
              aria-label="Search students by ID, name, or email"
              className="w-full rounded-lg border border-slate-300 pl-9 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              aria-label="Filter by department"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
            >
              <option value="">All Departments</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={yearFilter}
              onChange={(e) => onYearFilterChange(e.target.value)}
              aria-label="Filter by year of study"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
            >
              <option value="">All Years</option>
              {YEAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-200" aria-busy="true" aria-label="Loading students">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3.5 w-52 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-28 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </div>
          {totalCount === 0 ? (
            <>
              <h3 className="text-base font-semibold text-slate-900">No student records yet</h3>
              <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
                Add your first student using the enrollment form to store and manage records in the
                database.
              </p>
              <button
                type="button"
                onClick={onFocusCreateForm}
                className="mt-5 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
              >
                Add First Student
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-semibold text-slate-900">No matching students</h3>
              <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
                No records match your current search or filter criteria.
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop and tablet table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th scope="col" className="py-3 pl-6 pr-3 whitespace-nowrap">
                    Student ID
                  </th>
                  <th scope="col" className="py-3 px-3 whitespace-nowrap">
                    Student Name
                  </th>
                  <th scope="col" className="py-3 px-3 whitespace-nowrap">
                    Email
                  </th>
                  <th scope="col" className="py-3 px-3 whitespace-nowrap">
                    Department
                  </th>
                  <th scope="col" className="py-3 px-3 whitespace-nowrap">
                    Year of Study
                  </th>
                  <th scope="col" className="py-3 pl-3 pr-6 text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {students.map((student) => {
                  const isEditing = editingId === student.id;
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isEditing ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 pl-6 pr-3 font-mono text-xs font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {student.studentId}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[220px] truncate">
                        {student.email}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        {student.department}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 tabular-nums whitespace-nowrap">
                        {formatYearLabel(student.yearOfStudy)}
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(student)}
                            aria-label={`Edit ${student.name}`}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                              isEditing
                                ? 'bg-blue-700 text-white border-blue-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{isEditing ? 'Editing' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestDelete(student)}
                            aria-label={`Delete ${student.name}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive stacked list */}
          <div className="md:hidden divide-y divide-slate-200">
            {students.map((student) => {
              const isEditing = editingId === student.id;
              return (
                <div
                  key={student.id}
                  className={`p-4 space-y-3 ${isEditing ? 'bg-blue-50/60' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{student.name}</p>
                      <p className="text-xs font-mono text-slate-500 tabular-nums mt-0.5">
                        {student.studentId}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-700 tabular-nums shrink-0">
                      {formatYearLabel(student.yearOfStudy)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="truncate">{student.email}</p>
                    <p className="text-slate-700">{student.department}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className={`flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                        isEditing
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Pencil className="w-4 h-4" aria-hidden="true" />
                      <span>{isEditing ? 'Editing' : 'Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRequestDelete(student)}
                      className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
