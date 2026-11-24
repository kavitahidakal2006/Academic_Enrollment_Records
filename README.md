# Student Management System

A full-stack **Student Management System** built with React, TypeScript, Tailwind CSS, Node.js, Express, and SQLite (`better-sqlite3`). It supports all four CRUD operations (**Create**, **Read**, **Update**, and **Delete**) with persistent database storage, validation, and responsive design.

## Project Structure

- **Frontend (`src/`)**
  - `src/App.tsx` — Main application layout, state management, and CSV export
  - `src/components/Header.tsx` — Top navigation bar
  - `src/components/StudentForm.tsx` — Add / Edit student form with validation
  - `src/components/StudentTable.tsx` — Responsive table with search, filters, Edit, and Delete actions
  - `src/components/DeleteConfirmModal.tsx` — Confirmation dialog before deleting records
  - `src/components/FeedbackBanner.tsx` — Success and error notification banner
  - `src/services/studentApi.ts` — Fetch API client communicating with `/api/students`
  - `src/types/student.ts` — Shared TypeScript interfaces and academic constants
- **Backend & Database (`server.ts`, `server/`)**
  - `server.ts` — Express server entry point mounting `/api/students` and Vite middleware (dev) or `dist/` (production)
  - `server/routes/students.ts` — REST API route handlers (`POST`, `GET`, `PUT`, `DELETE`)
  - `server/validation.ts` — Request payload validation and normalization
  - `server/db.ts` — SQLite database connection, `students` table schema, and parameterized queries (`data/students.db`)

## REST API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/students` | Create a new student record |
| `GET` | `/api/students` | Retrieve all student records |
| `GET` | `/api/students/:id` | Retrieve a single student record by ID or Student ID |
| `PUT` | `/api/students/:id` | Update an existing student record |
| `DELETE` | `/api/students/:id` | Delete a student record |

## Installation & Startup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server (runs both Express backend and React frontend on port 3000):**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build and run in production mode:**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```
