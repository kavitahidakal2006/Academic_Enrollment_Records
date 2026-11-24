import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { FeedbackBanner, type FeedbackState } from './components/FeedbackBanner';
import { Header } from './components/Header';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import {
  createStudent,
  deleteStudent,
  fetchStudentById,
  fetchStudents,
  StudentApiError,
  updateStudent,
} from './services/studentApi';
import { ACADEMIC_DEPARTMENTS, formatYearLabel, type Student, type StudentInput } from './types/student';

function escapeCsvCell(value: string): string {
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentPendingDelete, setStudentPendingDelete] = useState<Student | null>(null);

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const studentIdInputRef = useRef<HTMLInputElement | null>(null);

  const loadStudents = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load students from the server.';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents(true);
  }, [loadStudents]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>(ACADEMIC_DEPARTMENTS);
    for (const student of students) {
      if (student.department) {
        set.add(student.department);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      if (departmentFilter && student.department !== departmentFilter) {
        return false;
      }
      if (yearFilter && String(student.yearOfStudy) !== yearFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        student.studentId.toLowerCase().includes(query) ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)
      );
    });
  }, [students, searchQuery, departmentFilter, yearFilter]);

  const activeDepartmentCount = useMemo(() => {
    return new Set(students.map((s) => s.department)).size;
  }, [students]);

  const latestStudentId = students.length > 0 ? students[0].studentId : '—';

  function focusCreateForm() {
    setEditingStudent(null);
    setServerFieldErrors({});
    const formEl = document.getElementById('student-form-section');
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      studentIdInputRef.current?.focus();
    }, 120);
  }

  function navigateDirectory() {
    const dirEl = document.getElementById('student-directory-section');
    dirEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExportCsv() {
    if (students.length === 0) {
      return;
    }
    const headers = ['Student ID', 'Student Name', 'Email', 'Department', 'Year of Study'];
    const rows = filteredStudents.map((s) =>
      [
        escapeCsvCell(s.studentId),
        escapeCsvCell(s.name),
        escapeCsvCell(s.email),
        escapeCsvCell(s.department),
        escapeCsvCell(formatYearLabel(s.yearOfStudy)),
      ].join(','),
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleFormSubmit(input: StudentInput): Promise<boolean> {
    setSubmitting(true);
    setServerFieldErrors({});
    setFeedback(null);

    try {
      if (editingStudent) {
        const result = await updateStudent(editingStudent.id, input);
        setStudents((prev) =>
          prev.map((item) => (item.id === result.student.id ? result.student : item)),
        );
        setEditingStudent(null);
        setFeedback({ type: 'success', message: result.message });
      } else {
        const result = await createStudent(input);
        setStudents((prev) => [result.student, ...prev]);
        setFeedback({ type: 'success', message: result.message });
      }
      return true;
    } catch (error) {
      if (error instanceof StudentApiError) {
        setServerFieldErrors(error.fieldErrors);
        setFeedback({ type: 'error', message: error.message });
      } else {
        setFeedback({
          type: 'error',
          message: 'An unexpected network error occurred. Please try again.',
        });
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSelectEdit(student: Student) {
    setServerFieldErrors({});
    setFeedback(null);
    try {
      const freshStudent = await fetchStudentById(student.id);
      setEditingStudent(freshStudent);
    } catch {
      setEditingStudent(student);
    }
    const formEl = document.getElementById('student-form-section');
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      studentIdInputRef.current?.focus();
    }, 120);
  }

  function handleCancelEdit() {
    setEditingStudent(null);
    setServerFieldErrors({});
  }

  async function handleConfirmDelete() {
    if (!studentPendingDelete) {
      return;
    }
    setDeleting(true);
    setFeedback(null);

    try {
      const result = await deleteStudent(studentPendingDelete.id);
      setStudents((prev) => prev.filter((item) => item.id !== result.deleted.id));
      if (editingStudent?.id === result.deleted.id) {
        setEditingStudent(null);
        setServerFieldErrors({});
      }
      setStudentPendingDelete(null);
      setFeedback({ type: 'success', message: result.message });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete the student record.';
      setStudentPendingDelete(null);
      setFeedback({ type: 'error', message });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        onNavigateDirectory={navigateDirectory}
        onStartNewStudent={focusCreateForm}
        onExportCsv={handleExportCsv}
        canExport={filteredStudents.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Academic Enrollment Records
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600">
              Add, view, update, and remove student records stored permanently in the SQLite
              database.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-3 divide-x divide-slate-200 shrink-0">
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Total Students</p>
              <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">
                {students.length}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Departments</p>
              <p className="mt-0.5 text-xl font-semibold text-slate-900 tabular-nums">
                {activeDepartmentCount}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-slate-500">Latest ID</p>
              <p className="mt-0.5 text-sm sm:text-base font-mono font-medium text-slate-900 tabular-nums truncate max-w-[120px]">
                {latestStudentId}
              </p>
            </div>
          </div>
        </div>

        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <StudentForm
              editingStudent={editingStudent}
              submitting={submitting}
              serverFieldErrors={serverFieldErrors}
              studentIdInputRef={studentIdInputRef}
              onSubmit={handleFormSubmit}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          <div className="lg:col-span-8">
            <StudentTable
              students={filteredStudents}
              totalCount={students.length}
              loading={loading}
              editingId={editingStudent?.id ?? null}
              searchQuery={searchQuery}
              departmentFilter={departmentFilter}
              yearFilter={yearFilter}
              availableDepartments={availableDepartments}
              onSearchChange={setSearchQuery}
              onDepartmentFilterChange={setDepartmentFilter}
              onYearFilterChange={setYearFilter}
              onClearFilters={() => {
                setSearchQuery('');
                setDepartmentFilter('');
                setYearFilter('');
              }}
              onRefresh={() => {
                setFeedback(null);
                void loadStudents(true);
              }}
              onEdit={(student) => void handleSelectEdit(student)}
              onRequestDelete={setStudentPendingDelete}
              onFocusCreateForm={focusCreateForm}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Student Management System</span>
          <span>SQLite Persistent Storage · Full CRUD Directory</span>
        </div>
      </footer>

      <DeleteConfirmModal
        student={studentPendingDelete}
        deleting={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) {
            setStudentPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
