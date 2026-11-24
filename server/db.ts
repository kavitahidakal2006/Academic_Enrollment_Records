import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { Student, StudentInput } from '../src/types/student.ts';

interface StudentRow {
  id: number;
  student_id: string;
  name: string;
  email: string;
  department: string;
  year_of_study: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data', 'students.db');
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : DEFAULT_DB_PATH;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    department TEXT NOT NULL,
    year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

function seedInitialStudentsIfFirstRun(): void {
  const metaRow = db
    .prepare("SELECT value FROM schema_meta WHERE key = 'initial_seed_done'")
    .get() as { value: string } | undefined;

  if (metaRow?.value === '1') {
    return;
  }

  const countRow = db.prepare('SELECT COUNT(*) AS total FROM students').get() as { total: number };
  const seedTransaction = db.transaction(() => {
    if (countRow.total === 0) {
      const insertStmt = db.prepare(`
        INSERT INTO students (student_id, name, email, department, year_of_study)
        VALUES (?, ?, ?, ?, ?)
      `);
      const starterRecords: ReadonlyArray<[string, string, string, string, number]> = [
        ['STU-2026-001', 'Aarav Patel', 'aarav.patel@university.edu', 'Computer Science', 3],
        ['STU-2026-002', 'Maya Lin', 'maya.lin@university.edu', 'Electrical Engineering', 2],
        ['STU-2026-003', 'Daniel Brooks', 'daniel.brooks@university.edu', 'Mathematics', 4],
        ['STU-2026-004', 'Sofia Alvarez', 'sofia.alvarez@university.edu', 'Business Administration', 1],
      ];
      for (const record of starterRecords) {
        insertStmt.run(...record);
      }
    }
    db.prepare("INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('initial_seed_done', '1')").run();
  });

  seedTransaction();
}

seedInitialStudentsIfFirstRun();

function mapRowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    studentId: row.student_id,
    name: row.name,
    email: row.email,
    department: row.department,
    yearOfStudy: row.year_of_study,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface StudentFilters {
  search?: string;
  department?: string;
  yearOfStudy?: number;
}

export function listStudents(filters: StudentFilters = {}): Student[] {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.search && filters.search.trim() !== '') {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push('(student_id LIKE ? OR name LIKE ? OR email LIKE ? OR department LIKE ?)');
    params.push(pattern, pattern, pattern, pattern);
  }

  if (filters.department && filters.department.trim() !== '') {
    conditions.push('department = ?');
    params.push(filters.department.trim());
  }

  if (typeof filters.yearOfStudy === 'number' && !Number.isNaN(filters.yearOfStudy)) {
    conditions.push('year_of_study = ?');
    params.push(filters.yearOfStudy);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT id, student_id, name, email, department, year_of_study, created_at, updated_at
    FROM students
    ${whereClause}
    ORDER BY id DESC
  `;

  const rows = db.prepare(query).all(...params) as StudentRow[];
  return rows.map(mapRowToStudent);
}

export function findStudentByIdentifier(identifier: string): Student | null {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    const numericId = Number.parseInt(trimmed, 10);
    const byId = db
      .prepare(
        'SELECT id, student_id, name, email, department, year_of_study, created_at, updated_at FROM students WHERE id = ?',
      )
      .get(numericId) as StudentRow | undefined;
    if (byId) {
      return mapRowToStudent(byId);
    }
  }

  const byCode = db
    .prepare(
      'SELECT id, student_id, name, email, department, year_of_study, created_at, updated_at FROM students WHERE student_id = ?',
    )
    .get(trimmed) as StudentRow | undefined;

  return byCode ? mapRowToStudent(byCode) : null;
}

export function createStudentRecord(input: StudentInput): Student {
  const result = db
    .prepare(`
      INSERT INTO students (student_id, name, email, department, year_of_study)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(input.studentId, input.name, input.email, input.department, input.yearOfStudy);

  const inserted = db
    .prepare(
      'SELECT id, student_id, name, email, department, year_of_study, created_at, updated_at FROM students WHERE id = ?',
    )
    .get(result.lastInsertRowid) as StudentRow;

  return mapRowToStudent(inserted);
}

export function updateStudentRecord(identifier: string, input: StudentInput): Student | null {
  const existing = findStudentByIdentifier(identifier);
  if (!existing) {
    return null;
  }

  db.prepare(`
    UPDATE students
    SET student_id = ?,
        name = ?,
        email = ?,
        department = ?,
        year_of_study = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `).run(input.studentId, input.name, input.email, input.department, input.yearOfStudy, existing.id);

  const updated = db
    .prepare(
      'SELECT id, student_id, name, email, department, year_of_study, created_at, updated_at FROM students WHERE id = ?',
    )
    .get(existing.id) as StudentRow;

  return mapRowToStudent(updated);
}

export function deleteStudentRecord(identifier: string): Student | null {
  const existing = findStudentByIdentifier(identifier);
  if (!existing) {
    return null;
  }

  db.prepare('DELETE FROM students WHERE id = ?').run(existing.id);
  return existing;
}
