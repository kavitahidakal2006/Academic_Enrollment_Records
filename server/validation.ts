import type { StudentInput } from '../src/types/student.ts';

export type ValidationResult =
  | { valid: true; data: StudentInput }
  | { valid: false; error: string; fieldErrors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STUDENT_ID_PATTERN = /^[A-Za-z0-9_-]{2,32}$/;

function parseYearOfStudy(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d+$/.test(trimmed)) {
      return Number.parseInt(trimmed, 10);
    }
    const ordinalMatch = trimmed.match(/^([1-6])(?:st|nd|rd|th)?\s*(?:year)?$/i);
    if (ordinalMatch) {
      return Number.parseInt(ordinalMatch[1], 10);
    }
  }
  return null;
}

export function validateStudentPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      error: 'Request body must be a valid JSON object.',
      fieldErrors: {},
    };
  }

  const record = body as Record<string, unknown>;
  const fieldErrors: Record<string, string> = {};

  const rawStudentId = record.studentId ?? record.student_id;
  const rawName = record.name ?? record.studentName ?? record.student_name;
  const rawEmail = record.email;
  const rawDepartment = record.department;
  const rawYear = record.yearOfStudy ?? record.year_of_study ?? record.year;

  const studentId = typeof rawStudentId === 'string' ? rawStudentId.trim() : '';
  const name = typeof rawName === 'string' ? rawName.trim() : '';
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const department = typeof rawDepartment === 'string' ? rawDepartment.trim() : '';
  const yearOfStudy = parseYearOfStudy(rawYear);

  if (!studentId) {
    fieldErrors.studentId = 'Student ID is required.';
  } else if (!STUDENT_ID_PATTERN.test(studentId)) {
    fieldErrors.studentId = 'Student ID must be 2–32 characters using letters, numbers, hyphens, or underscores.';
  }

  if (!name) {
    fieldErrors.name = 'Student name is required.';
  } else if (name.length < 2 || name.length > 100) {
    fieldErrors.name = 'Student name must be between 2 and 100 characters.';
  }

  if (!email) {
    fieldErrors.email = 'Email address is required.';
  } else if (email.length > 150 || !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!department) {
    fieldErrors.department = 'Department is required.';
  } else if (department.length < 2 || department.length > 80) {
    fieldErrors.department = 'Department must be between 2 and 80 characters.';
  }

  if (yearOfStudy === null || yearOfStudy < 1 || yearOfStudy > 6) {
    fieldErrors.yearOfStudy = 'Year of Study must be a whole number between 1 and 6.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstMessage = Object.values(fieldErrors)[0];
    return {
      valid: false,
      error: firstMessage,
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      studentId,
      name,
      email,
      department,
      yearOfStudy: yearOfStudy as number,
    },
  };
}
