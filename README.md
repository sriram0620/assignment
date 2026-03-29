# 🚀 Mini AI-HRMS ( Platform)

Welcome to the **Mini AI-HRMS**, a next-generation Workforce Intelligence platform built for the ** Core Team Internship Assessment**. This project integrates **Full-Stack development**, **AI-driven insights**, and **Web3 transparency** to redefine how organizations manage their workforce.

---

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand (State Management), React Query.
- **Backend**: Next.js API Routes, Supabase (PostgreSQL), JWT Authentication.
- **AI Engine**: Google Gemini AI (Productivity scoring, Skill gap analysis, Smart assignment).

---

## 📂 Core Modules & Features

### 🔐 Module 1: Organization & Employee Management
The system uses a robust **JWT-based authentication** layer to secure organizational data.
- **Organization Registration**: Admins can register their organization, creating a unique workspace.
- **Secure Login**: Session management is handled via JWT. Tokens are stored securely in `localStorage` and automatically attached to API requests.
- **Employee Management**: Admins have full CRUD capabilities to add and manage employees, including their roles, departments, and skills.

### 📝 Module 2: Workforce Task Management
A centralized hub for tracking organizational productivity.
- **Task Assignment**: Admins can assign tasks to specific employees.
- **Real-time Status Updates**: Employees can transition tasks through `Assigned` → `In Progress` → `Completed`.
- **Backend Tracking**: Every status change is validated and logged in the Supabase database.

### 📊 Module 3: Workforce Dashboard
A data-rich command center providing a bird's-eye view of organization health:
- **Core Metrics**: Total & Active Employees, Pending & Completed Tasks.
- **Productivity Indicators**: Aggregated data to visualize how the workforce is performing at a glance.

### 🤖 Module 4: AI Workforce Intelligence (Mandatory)
Powered by the **Google Gemini Pro** model, the platform provides deep insights that traditional HRMS systems lack:
- **AI Productivity Score**: Analyzes task completion history and speed to generate a dynamic productivity score for each employee.
- **Smart Task Assignment**: Recommends the best-suited employee for a new task based on their existing skillset and current workload.
- **Skill Gap Detection**: Automatically compares an employee's profile against their role requirements to suggest missing skills and learning paths.
- **Performance Trends**: Predicts future performance changes using specialized AI scoring logic.

---

## 🚀 How It Works (The Architecture)

1.  **Authentication**: The app uses `auth.ts` (backend) and `store.ts` (frontend) to manage JWTs. Protected routes are wrapped in `requireUser()`.
2.  **API Layer**: The `lib/api.ts` file serves as a unified client for fetching data, handling headers, and managing errors.
3.  **Database**: **Supabase** acts as the primary source of truth, storing all relational data (employees, tasks, orgs).
4.  **AI Integration**: Backend routes in `/api/ai` communicate with Gemini to process natural language descriptions of tasks and employee performance.

---

## 📈 Future Enhancements
- [ ] On-chain payroll distribution.
- [ ] Multi-agent AI specialized for different departments.
- [ ] Advanced productivity heatmaps.

---

# assignment
