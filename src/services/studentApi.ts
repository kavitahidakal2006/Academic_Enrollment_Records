import type { ApiErrorResponse, Student, StudentInput } from '../types/student';

export class StudentApiError extends Error {
  public readonly status: number;
  public readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'StudentApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const payload = await parseJsonSafe<T & ApiErrorResponse>(response);

  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}.`;
    const fieldErrors = payload?.fieldErrors || {};
    throw new StudentApiError(message, response.status, fieldErrors);
  }

  if (payload === null) {
    throw new StudentApiError('Server returned an empty response.', response.status);
  }

  return payload as T;
}

export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch('/api/students', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ students: Student[] }>(response);
  return data.students;
}

export async function fetchStudentById(id: number): Promise<Student> {
  const response = await fetch(`/api/students/${encodeURIComponent(String(id))}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const data = await handleResponse<{ student: Student }>(response);
  return data.student;
}

export async function createStudent(input: StudentInput): Promise<{ student: Student; message: string }> {
  const response = await fetch('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });
  return handleResponse<{ student: Student; message: string }>(response);
}

export async function updateStudent(
  id: number,
  input: StudentInput,
): Promise<{ student: Student; message: string }> {
  const response = await fetch(`/api/students/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
  });
  return handleResponse<{ student: Student; message: string }>(response);
}

export async function deleteStudent(id: number): Promise<{ deleted: Student; message: string }> {
  const response = await fetch(`/api/students/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  return handleResponse<{ deleted: Student; message: string }>(response);
}
