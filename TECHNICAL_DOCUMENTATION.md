# 📄 AI-HRMS Technical Documentation

This document provides a deep-dive into the technical architecture, data models, and implementation details of the AI-HRMS platform. It is intended for developers, architects, and stakeholders to understand how the system functions under the hood.

---

## 1. System Architecture

The project follows a modern, serverless-first architecture optimized for performance and scalability.

### 🏗 High-Level Architecture
- **Framework**: [Next.js](https://nextjs.org/) (App Router) for both frontend and backend API logic.
- **Authentication**: Custom JWT-based session management with persistent state via **Zustand**.
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) for relational data storage and Row Level Security (RLS).
- **AI Integration**: [Google Gemini 2.0 Flash](https://ai.google.dev/) for productivity analysis and smart workforce optimization.

---

## 2. Data Models (Supabase Schema)

The database consists of 7 core tables. Security is enforced via **Row Level Security (RLS)**, ensuring that only authenticated server-side requests can access sensitive data.

### 2.1 Core Tables
| Table | Description | Key Fields |
| :--- | :--- | :--- |
| `organizations` | Stores organizational metadata. | `id`, `slug`, `industry` |
| `hrms_users` | The authentication table (custom users). | `email`, `password` (bcrypt), `role`, `org_id` |
| `employees` | Rich profile data for the workforce. | `full_name`, `skills` (JSONB), `tasks_completed` |
| `departments` | Organizational structure categories. | `name`, `parent_id`, `org_id` |
| `tasks` | Tracking work items and status. | `title`, `priority`, `status`, `assigned_to` |
| `skills` | A global catalog of technical/soft skills. | `name`, `category` |

---

## 3. Implementation Details

### 3.1 Authentication & Authorization
The system uses a custom authentication layer instead of Supabase Auth to maintain full control over the user lifecycle.
- **JWT Signing**: Tokens are signed containing `userId`, `orgId`, and `role`. 
- **Route Protection**: Every protected API route utilizes a `requireUser()` utility which validates the Bearer token and checks for role-based permissions (Admin vs Manager vs Employee).
- **Security**: Passwords are never stored in plain text; they are hashed using **bcrypt** (10 salt rounds).

### 3.2 AI Workforce Intelligence (Google Gemini)
The AI features are implemented in `app/api/_server/gemini.ts` using structured JSON prompts.

| Feature | Logic | AI Goal |
| :--- | :--- | :--- |
| **Productivity Score** | Multi-factor analysis of completion rates vs deadlines. | Generate realistic scores (0-100) and performance trends. |
| **Skill Gap Analysis** | Compares employee skills against organizational needs. | Suggest actionable 4-8 week learning roadmaps. |
| **Smart Assignment** | Ranks candidates based on match score and workload. | Optimize task distribution to improve team efficiency. |


---

## 4. API Workflow Example: Employee Onboarding

1.  **Request**: Admin submits employee details via the UI.
2.  **Auth Validation**: `requireUser()` ensures the requester is an Admin or HR Manager.
3.  **User Creation**: A entry is created in `hrms_users` with a temporary hashed password.
4.  **Profile Creation**: An entry is created in `employees`, linking the `user_id`. Skills are mapped from the global catalog.
5.  **Response**: The system returns the employee profile and the plain-text temporary password to the Admin.

---

## 5. Configuration & Environment

The following environment variables are required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Admin key for server-side database access.
- `JWT_SECRET`: High-entropy string for signing tokens.
- `GEMINI_API_KEY`: API key for Google Generative AI features.

---
*Documentation Version: 1.0.0*
*Last Updated: 2026-02-25*
