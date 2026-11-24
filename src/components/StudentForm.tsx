import { useEffect, useState, type FormEvent, type RefObject } from 'react';
import {
  ACADEMIC_DEPARTMENTS,
  YEAR_OPTIONS,
  type Student,
  type StudentInput,
} from '../types/student';

interface StudentFormProps {
  editingStudent: Student | null;
  submitting: boolean;
  serverFieldErrors: Record<string, string>;
  studentIdInputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (data: StudentInput) => Promise<boolean>;
  onCancelEdit: () => void;
}

const CUSTOM_DEPARTMENT_VALUE = '__other__';

function isPresetDepartment(dept: string): boolean {
  return (ACADEMIC_DEPARTMENTS as readonly string[]).includes(dept);
}

export function StudentForm({
  editingStudent,
  submitting,
  serverFieldErrors,
  studentIdInputRef,
  onSubmit,
  onCancelEdit,
}: StudentFormProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(ACADEMIC_DEPARTMENTS[0]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<number>(1);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingStudent) {
      setStudentId(editingStudent.studentId);
      setName(editingStudent.name);
      setEmail(editingStudent.email);
      if (isPresetDepartment(editingStudent.department)) {
        setSelectedDepartment(editingStudent.department);
        setCustomDepartment('');
      } else {
        setSelectedDepartment(CUSTOM_DEPARTMENT_VALUE);
        setCustomDepartment(editingStudent.department);
      }
      setYearOfStudy(editingStudent.yearOfStudy);
      setLocalErrors({});
    } else {
      setStudentId('');
      setName('');
      setEmail('');
      setSelectedDepartment(ACADEMIC_DEPARTMENTS[0]);
      setCustomDepartment('');
      setYearOfStudy(1);
      setLocalErrors({});
    }
  }, [editingStudent]);

  const effectiveDepartment =
    selectedDepartment === CUSTOM_DEPARTMENT_VALUE ? customDepartment.trim() : selectedDepartment;

  const combinedErrors = { ...serverFieldErrors, ...localErrors };

  function resetForm() {
    setStudentId('');
    setName('');
    setEmail('');
    setSelectedDepartment(ACADEMIC_DEPARTMENTS[0]);
    setCustomDepartment('');
    setYearOfStudy(1);
    setLocalErrors({});
  }

  function validateClient(): Record<string, string> {
    const errors: Record<string, string> = {};
    const trimmedId = studentId.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedId) {
      errors.studentId = 'Student ID is required.';
    } else if (!/^[A-Za-z0-9_-]{2,32}$/.test(trimmedId)) {
      errors.studentId = 'Use 2–32 letters, numbers, hyphens, or underscores.';
    }

    if (!trimmedName) {
      errors.name = 'Student name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Student name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!effectiveDepartment) {
      errors.department = 'Department is required.';
    } else if (effectiveDepartment.length < 2) {
      errors.department = 'Department name must be at least 2 characters.';
    }

    if (!Number.isInteger(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 6) {
      errors.yearOfStudy = 'Select a valid year of study.';
    }

    return errors;
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateClient();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors({});
    const ok = await onSubmit({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: effectiveDepartment,
      yearOfStudy,
    });

    if (ok && !editingStudent) {
      resetForm();
    }
  }

  const isEditMode = editingStudent !== null;

  return (
    <section
      id="student-form-section"
      aria-labelledby="student-form-heading"
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-5 pb-4 border-b border-slate-200">
        <h2 id="student-form-heading" className="text-lg font-semibold text-slate-900">
          {isEditMode ? 'Edit Student Record' : 'Add New Student'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isEditMode
            ? `Updating record for ${editingStudent.name} (${editingStudent.studentId}).`
            : 'Enter student details below to save a permanent record.'}
        </p>
      </div>

      <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-slate-800 mb-1.5">
            Student ID
          </label>
          <input
            ref={studentIdInputRef}
            id="studentId"
            name="studentId"
            type="text"
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              if (localErrors.studentId) {
                setLocalErrors((prev) => ({ ...prev, studentId: '' }));
              }
            }}
            placeholder="e.g. STU-2026-005"
            aria-invalid={Boolean(combinedErrors.studentId)}
            aria-describedby={combinedErrors.studentId ? 'studentId-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:font-sans placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 ${
              combinedErrors.studentId ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {combinedErrors.studentId && (
            <p id="studentId-error" className="mt-1.5 text-xs font-medium text-red-700">
              {combinedErrors.studentId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-slate-800 mb-1.5">
            Student Name
          </label>
          <input
            id="studentName"
            name="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (localErrors.name) {
                setLocalErrors((prev) => ({ ...prev, name: '' }));
              }
            }}
            placeholder="e.g. Priya Nair"
            aria-invalid={Boolean(combinedErrors.name)}
            aria-describedby={combinedErrors.name ? 'studentName-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 ${
              combinedErrors.name ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {combinedErrors.name && (
            <p id="studentName-error" className="mt-1.5 text-xs font-medium text-red-700">
              {combinedErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="studentEmail" className="block text-sm font-medium text-slate-800 mb-1.5">
            Email
          </label>
          <input
            id="studentEmail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (localErrors.email) {
                setLocalErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder="e.g. priya.nair@university.edu"
            aria-invalid={Boolean(combinedErrors.email)}
            aria-describedby={combinedErrors.email ? 'studentEmail-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 ${
              combinedErrors.email ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {combinedErrors.email && (
            <p id="studentEmail-error" className="mt-1.5 text-xs font-medium text-red-700">
              {combinedErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="studentDepartment"
            className="block text-sm font-medium text-slate-800 mb-1.5"
          >
            Department
          </label>
          <select
            id="studentDepartment"
            name="department"
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              if (localErrors.department) {
                setLocalErrors((prev) => ({ ...prev, department: '' }));
              }
            }}
            aria-invalid={Boolean(combinedErrors.department)}
            aria-describedby={combinedErrors.department ? 'studentDepartment-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 ${
              combinedErrors.department ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            {ACADEMIC_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
            <option value={CUSTOM_DEPARTMENT_VALUE}>Other (Enter department)</option>
          </select>

          {selectedDepartment === CUSTOM_DEPARTMENT_VALUE && (
            <input
              type="text"
              value={customDepartment}
              onChange={(e) => {
                setCustomDepartment(e.target.value);
                if (localErrors.department) {
                  setLocalErrors((prev) => ({ ...prev, department: '' }));
                }
              }}
              placeholder="Enter department name"
              aria-label="Custom department name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
            />
          )}

          {combinedErrors.department && (
            <p id="studentDepartment-error" className="mt-1.5 text-xs font-medium text-red-700">
              {combinedErrors.department}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="studentYear" className="block text-sm font-medium text-slate-800 mb-1.5">
            Year of Study
          </label>
          <select
            id="studentYear"
            name="yearOfStudy"
            value={yearOfStudy}
            onChange={(e) => {
              setYearOfStudy(Number(e.target.value));
              if (localErrors.yearOfStudy) {
                setLocalErrors((prev) => ({ ...prev, yearOfStudy: '' }));
              }
            }}
            aria-invalid={Boolean(combinedErrors.yearOfStudy)}
            aria-describedby={combinedErrors.yearOfStudy ? 'studentYear-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 ${
              combinedErrors.yearOfStudy ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            {YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {combinedErrors.yearOfStudy && (
            <p id="studentYear-error" className="mt-1.5 text-xs font-medium text-red-700">
              {combinedErrors.yearOfStudy}
            </p>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {submitting
              ? isEditMode
                ? 'Saving...'
                : 'Adding...'
              : isEditMode
                ? 'Save Changes'
                : 'Add Student'}
          </button>

          {isEditMode ? (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Cancel Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
