export interface Student {
  id: number;
  studentId: string;
  name: string;
  email: string;
  department: string;
  yearOfStudy: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentInput {
  studentId: string;
  name: string;
  email: string;
  department: string;
  yearOfStudy: number;
}

export interface ApiErrorResponse {
  error: string;
  fieldErrors?: Record<string, string>;
}

export const ACADEMIC_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Mathematics',
  'Physics',
  'Business Administration',
  'Economics',
] as const;

export const YEAR_OPTIONS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
  { value: 5, label: '5th Year' },
];

export function formatYearLabel(year: number): string {
  const match = YEAR_OPTIONS.find((opt) => opt.value === year);
  if (match) {
    return match.label;
  }
  return `Year ${year}`;
}
