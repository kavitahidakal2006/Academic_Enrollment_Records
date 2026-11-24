import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createStudentRecord,
  deleteStudentRecord,
  findStudentByIdentifier,
  listStudents,
  updateStudentRecord,
} from '../db.ts';
import { validateStudentPayload } from '../validation.ts';

export const studentsRouter = Router();

function handleSqliteConstraintError(err: unknown, res: Response): boolean {
  if (!(err instanceof Error)) {
    return false;
  }

  const sqliteErr = err as Error & { code?: string };
  if (sqliteErr.code !== 'SQLITE_CONSTRAINT_UNIQUE' && sqliteErr.code !== 'SQLITE_CONSTRAINT') {
    return false;
  }

  const msg = sqliteErr.message.toLowerCase();
  if (msg.includes('students.student_id')) {
    res.status(409).json({
      error: 'A student with this Student ID already exists.',
      fieldErrors: { studentId: 'This Student ID is already registered.' },
    });
    return true;
  }

  if (msg.includes('students.email')) {
    res.status(409).json({
      error: 'A student with this email address already exists.',
      fieldErrors: { email: 'This email address is already registered.' },
    });
    return true;
  }

  res.status(409).json({ error: 'Student record conflicts with an existing entry.' });
  return true;
}

// GET /api/students - Retrieve all students (with optional filters)
studentsRouter.get('/', (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const department = typeof req.query.department === 'string' ? req.query.department : undefined;
    const yearParam = typeof req.query.year === 'string' ? req.query.year : undefined;
    const yearOfStudy = yearParam && /^\d+$/.test(yearParam) ? Number.parseInt(yearParam, 10) : undefined;

    const students = listStudents({ search, department, yearOfStudy });
    res.status(200).json({ students, count: students.length });
  } catch (error) {
    console.error('Failed to retrieve students:', error);
    res.status(500).json({ error: 'Failed to retrieve students from the database.' });
  }
});

// GET /api/students/:id - Retrieve one student
studentsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
    const student = findStudentByIdentifier(identifier);

    if (!student) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.status(200).json({ student });
  } catch (error) {
    console.error('Failed to retrieve student:', error);
    res.status(500).json({ error: 'Failed to retrieve student from the database.' });
  }
});

// POST /api/students - Create a new student
studentsRouter.post('/', (req: Request, res: Response) => {
  const validation = validateStudentPayload(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    });
    return;
  }

  try {
    const student = createStudentRecord(validation.data);
    res.status(201).json({
      student,
      message: `Student "${student.name}" (${student.studentId}) added successfully.`,
    });
  } catch (error) {
    if (handleSqliteConstraintError(error, res)) {
      return;
    }
    console.error('Failed to create student:', error);
    res.status(500).json({ error: 'Failed to create student record.' });
  }
});

// PUT /api/students/:id - Update an existing student
studentsRouter.put('/:id', (req: Request, res: Response) => {
  const validation = validateStudentPayload(req.body);
  if (!validation.valid) {
    res.status(400).json({
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    });
    return;
  }

  try {
    const rawId = req.params.id;
    const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
    const updated = updateStudentRecord(identifier, validation.data);

    if (!updated) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.status(200).json({
      student: updated,
      message: `Student "${updated.name}" (${updated.studentId}) updated successfully.`,
    });
  } catch (error) {
    if (handleSqliteConstraintError(error, res)) {
      return;
    }
    console.error('Failed to update student:', error);
    res.status(500).json({ error: 'Failed to update student record.' });
  }
});

// DELETE /api/students/:id - Delete a student
studentsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const identifier = Array.isArray(rawId) ? rawId[0] : rawId;
    const deleted = deleteStudentRecord(identifier);

    if (!deleted) {
      res.status(404).json({ error: 'Student record not found.' });
      return;
    }

    res.status(200).json({
      deleted,
      message: `Student "${deleted.name}" (${deleted.studentId}) deleted successfully.`,
    });
  } catch (error) {
    console.error('Failed to delete student:', error);
    res.status(500).json({ error: 'Failed to delete student record.' });
  }
});
