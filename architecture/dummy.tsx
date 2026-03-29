// "use client";

// import { useState } from "react";

// const sections = [
//   { id: "overview", label: "Overview", icon: "◈" },
//   { id: "part1", label: "High-Level Architecture", icon: "①" },
//   { id: "part2", label: "Microservice Layers", icon: "②" },
//   { id: "part3", label: "Database Design", icon: "③" },
//   { id: "part4", label: "AI Architecture", icon: "④" },
//   { id: "part5", label: "Web3 Architecture", icon: "⑤" },
//   { id: "part6", label: "Security Architecture", icon: "⑥" },
//   { id: "part7", label: "Scalability & Production", icon: "⑦" },
// ];

// export default function Home() {
//   const [active, setActive] = useState("overview");

//   return (
//     <div className="min-h-screen bg-[#0a0e1a] text-gray-100 flex">
//       {/* Sidebar */}
//       <aside className="w-72 min-h-screen bg-[#0d1120] border-r border-[#1e2a45] flex flex-col sticky top-0 h-screen overflow-y-auto">
//         <div className="p-6 border-b border-[#1e2a45]">
//           <div className="flex items-center gap-3 mb-1">
//             <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">AI</div>
//             <div>
//               <div className="font-bold text-white text-sm">Mini AI-HRMS</div>
//               <div className="text-xs text-gray-400">System Architecture</div>
//             </div>
//           </div>
//         </div>
//         <nav className="p-4 flex flex-col gap-1 flex-1">
//           {sections.map((s) => (
//             <button
//               key={s.id}
//               onClick={() => setActive(s.id)}
//               className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
//                 active === s.id
//                   ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
//                   : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
//               }`}
//             >
//               <span className="text-base">{s.icon}</span>
//               {s.label}
//             </button>
//           ))}
//         </nav>
//         <div className="p-4 border-t border-[#1e2a45]">
//           <div className="text-xs text-gray-500 text-center">Production Architecture v1.0</div>
//           <div className="text-xs text-gray-600 text-center mt-0.5">Next.js · Supabase · Gemini · Ethereum</div>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 overflow-y-auto">
//         {active === "overview" && <OverviewSection />}
//         {active === "part1" && <Part1 />}
//         {active === "part2" && <Part2 />}
//         {active === "part3" && <Part3 />}
//         {active === "part4" && <Part4 />}
//         {active === "part5" && <Part5 />}
//         {active === "part6" && <Part6 />}
//         {active === "part7" && <Part7 />}
//       </main>
//     </div>
//   );
// }

// /* ─────────────────────────── SHARED COMPONENTS ─────────────────────────── */

// function PageHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
//   return (
//     <div className="px-10 pt-10 pb-6 border-b border-[#1e2a45]">
//       {badge && (
//         <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 mb-3">
//           {badge}
//         </span>
//       )}
//       <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
//       <p className="text-gray-400 text-base max-w-3xl">{subtitle}</p>
//     </div>
//   );
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="mb-10">
//       <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
//         <span className="w-1 h-5 bg-violet-500 rounded-full inline-block"></span>
//         {title}
//       </h2>
//       {children}
//     </div>
//   );
// }

// function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="mb-6">
//       <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3">{title}</h3>
//       {children}
//     </div>
//   );
// }

// function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
//   return (
//     <div className={`bg-[#0d1120] border border-[#1e2a45] rounded-xl p-5 ${className}`}>
//       {children}
//     </div>
//   );
// }

// function CodeBlock({ code, language = "text" }: { code: string; language?: string }) {
//   return (
//     <div className="rounded-xl overflow-hidden border border-[#1e2a45]">
//       <div className="bg-[#0d1528] px-4 py-2 flex items-center gap-2 border-b border-[#1e2a45]">
//         <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
//         <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
//         <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
//         <span className="ml-2 text-xs text-gray-500">{language}</span>
//       </div>
//       <pre className="bg-[#080d1a] p-5 text-sm text-green-300 overflow-x-auto leading-relaxed font-mono whitespace-pre">
//         {code}
//       </pre>
//     </div>
//   );
// }

// function Badge({ label, color }: { label: string; color: string }) {
//   const colors: Record<string, string> = {
//     violet: "bg-violet-600/20 text-violet-300 border-violet-500/30",
//     cyan: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
//     green: "bg-green-600/20 text-green-300 border-green-500/30",
//     orange: "bg-orange-600/20 text-orange-300 border-orange-500/30",
//     red: "bg-red-600/20 text-red-300 border-red-500/30",
//     blue: "bg-blue-600/20 text-blue-300 border-blue-500/30",
//     yellow: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
//   };
//   return (
//     <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium border ${colors[color] ?? colors.violet}`}>
//       {label}
//     </span>
//   );
// }

// function FlowStep({ step, label, detail, color = "violet" }: { step: string; label: string; detail: string; color?: string }) {
//   const colors: Record<string, string> = {
//     violet: "bg-violet-600/20 text-violet-300 border-violet-500/40",
//     cyan: "bg-cyan-600/20 text-cyan-300 border-cyan-500/40",
//     green: "bg-green-600/20 text-green-300 border-green-500/40",
//     orange: "bg-orange-600/20 text-orange-300 border-orange-500/40",
//     blue: "bg-blue-600/20 text-blue-300 border-blue-500/40",
//   };
//   return (
//     <div className="flex items-start gap-4 py-3">
//       <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[color]}`}>
//         {step}
//       </div>
//       <div>
//         <div className="text-sm font-semibold text-white">{label}</div>
//         <div className="text-xs text-gray-400 mt-0.5">{detail}</div>
//       </div>
//     </div>
//   );
// }

// function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
//   return (
//     <div className="overflow-x-auto rounded-xl border border-[#1e2a45]">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="bg-[#0d1528] border-b border-[#1e2a45]">
//             {headers.map((h) => (
//               <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, i) => (
//             <tr key={i} className={`border-b border-[#1e2a45]/60 ${i % 2 === 0 ? "bg-[#080d1a]" : "bg-[#0a1020]"}`}>
//               {row.map((cell, j) => (
//                 <td key={j} className={`px-4 py-3 text-sm ${j === 0 ? "text-cyan-300 font-mono" : "text-gray-300"}`}>
//                   {cell}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* ─────────────────────────── OVERVIEW ─────────────────────────── */

// function OverviewSection() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Mini AI-HRMS Platform"
//         subtitle="A production-ready, AI-powered Human Resource Management System with Web3 workforce logging, built for scalability and intelligence."
//         badge="System Architecture Blueprint"
//       />

//       <div className="pt-8 space-y-8">
//         {/* Stack Grid */}
//         <Section title="Technology Stack">
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             {[
//               { layer: "Frontend", tech: "Next.js 14 + Tailwind CSS", icon: "⬡", color: "cyan", detail: "App Router, Server Components, RSC streaming" },
//               { layer: "Backend", tech: "Node.js + Express", icon: "⬡", color: "green", detail: "REST API, middleware pipeline, service orchestration" },
//               { layer: "Database & Auth", tech: "Supabase (PostgreSQL)", icon: "⬡", color: "violet", detail: "JWT auth, Row Level Security, Realtime" },
//               { layer: "AI Engine", tech: "Google Gemini API", icon: "⬡", color: "orange", detail: "Productivity scoring, skill gap, smart assignment" },
//               { layer: "Blockchain", tech: "Ethereum + Solidity", icon: "⬡", color: "blue", detail: "Immutable task event logs, on-chain workforce history" },
//               { layer: "Wallet", tech: "MetaMask + ethers.js", icon: "⬡", color: "yellow", detail: "Wallet-based identity, message signing, tx dispatch" },
//             ].map((item) => (
//               <Card key={item.layer} className="flex flex-col gap-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.layer}</span>
//                   <Badge label={item.color === "cyan" ? "Frontend" : item.color === "green" ? "Backend" : item.color === "violet" ? "Data" : item.color === "orange" ? "AI" : item.color === "blue" ? "Web3" : "Wallet"} color={item.color} />
//                 </div>
//                 <div className="text-sm font-bold text-white">{item.tech}</div>
//                 <div className="text-xs text-gray-400">{item.detail}</div>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         {/* Feature Pillars */}
//         <Section title="Five System Pillars">
//           <div className="space-y-2">
//             {[
//               { num: "01", title: "Organization Onboarding & Auth", desc: "Supabase Auth with JWT, org-scoped multi-tenancy, role-based access (Admin, HR, Manager, Employee)", color: "violet" },
//               { num: "02", title: "Employee Management", desc: "Full CRUD employee profiles, department/team hierarchy, skills registry, performance history", color: "cyan" },
//               { num: "03", title: "Task Assignment & Tracking", desc: "Task lifecycle management (created → assigned → in-progress → completed), deadline tracking, comments", color: "green" },
//               { num: "04", title: "AI Workforce Intelligence", desc: "Gemini-powered productivity scoring, skill gap detection, smart workload-aware task assignment", color: "orange" },
//               { num: "05", title: "Web3 Workforce Logging", desc: "MetaMask wallet auth, Solidity contract event emission, immutable task completion records on Ethereum", color: "blue" },
//             ].map((p) => (
//               <Card key={p.num} className="flex items-start gap-4">
//                 <div className={`text-2xl font-black text-gray-700 w-10 flex-shrink-0`}>{p.num}</div>
//                 <div>
//                   <div className="text-sm font-bold text-white mb-0.5">{p.title}</div>
//                   <div className="text-xs text-gray-400">{p.desc}</div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         {/* System interaction overview */}
//         <Section title="System Interaction Overview">
//           <Card>
//             <div className="font-mono text-xs leading-relaxed text-gray-300">
//               <div className="text-cyan-400 font-bold mb-3">// End-to-End Request Flow</div>
//               <div>
//                 <span className="text-violet-300">Browser</span>
//                 <span className="text-gray-500"> ──[HTTPS]──▶ </span>
//                 <span className="text-cyan-300">Next.js App Router</span>
//                 <span className="text-gray-500"> ──[API Routes / RSC]──▶ </span>
//                 <span className="text-green-300">Express Backend</span>
//               </div>
//               <div className="mt-1 ml-8 text-gray-500">│</div>
//               <div className="ml-8">
//                 <span className="text-gray-500">├──▶ </span>
//                 <span className="text-violet-300">Supabase Auth</span>
//                 <span className="text-gray-500"> (JWT verify + RLS)</span>
//               </div>
//               <div className="ml-8">
//                 <span className="text-gray-500">├──▶ </span>
//                 <span className="text-violet-300">Supabase PostgreSQL</span>
//                 <span className="text-gray-500"> (data queries)</span>
//               </div>
//               <div className="ml-8">
//                 <span className="text-gray-500">├──▶ </span>
//                 <span className="text-orange-300">AI Service Layer</span>
//                 <span className="text-gray-500"> → Gemini API (analysis)</span>
//               </div>
//               <div className="ml-8">
//                 <span className="text-gray-500">└──▶ </span>
//                 <span className="text-blue-300">Web3 Service Layer</span>
//                 <span className="text-gray-500"> → Ethereum RPC → Smart Contract</span>
//               </div>
//             </div>
//           </Card>
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 1 ─────────────────────────── */

// function Part1() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 1: High-Level Architecture"
//         subtitle="System components, interaction flows, request lifecycle, and separation of concerns across the full stack."
//         badge="Architecture Foundation"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="System Components">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[
//               {
//                 layer: "Presentation Layer",
//                 items: [
//                   "Next.js 14 (App Router) — SSR/SSG/ISR pages",
//                   "Tailwind CSS — utility-first responsive design",
//                   "shadcn/ui — accessible component library",
//                   "React Query (TanStack) — server state management",
//                   "Zustand — client-side global state",
//                   "ethers.js — MetaMask wallet integration",
//                 ],
//                 color: "cyan",
//               },
//               {
//                 layer: "API Gateway Layer",
//                 items: [
//                   "Next.js API Routes — BFF (Backend for Frontend) proxy",
//                   "Express.js — main REST API server",
//                   "JWT middleware — auth verification on every route",
//                   "Zod — request schema validation",
//                   "Rate limiting — per-IP and per-user throttling",
//                   "CORS — domain-scoped origin allowlist",
//                 ],
//                 color: "green",
//               },
//               {
//                 layer: "Business Logic Layer",
//                 items: [
//                   "AuthService — registration, login, token refresh",
//                   "OrgService — organization CRUD + multi-tenancy",
//                   "EmployeeService — profile, skills, hierarchy",
//                   "TaskService — lifecycle management, assignments",
//                   "AIService — Gemini prompt orchestration",
//                   "Web3Service — contract interaction, tx dispatch",
//                 ],
//                 color: "violet",
//               },
//               {
//                 layer: "Data Layer",
//                 items: [
//                   "Supabase PostgreSQL — primary relational store",
//                   "Supabase Auth — user identity, JWT issuance",
//                   "Row Level Security (RLS) — org-scoped isolation",
//                   "Supabase Realtime — WebSocket-based live updates",
//                   "Redis (optional) — session cache, AI result TTL",
//                   "IPFS (optional) — decentralized document storage",
//                 ],
//                 color: "orange",
//               },
//             ].map((block) => (
//               <Card key={block.layer}>
//                 <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${block.color === "cyan" ? "text-cyan-400" : block.color === "green" ? "text-green-400" : block.color === "violet" ? "text-violet-400" : "text-orange-400"}`}>
//                   {block.layer}
//                 </div>
//                 <ul className="space-y-1.5">
//                   {block.items.map((item) => (
//                     <li key={item} className="flex items-start gap-2 text-xs text-gray-300">
//                       <span className="text-gray-600 mt-0.5">▸</span>
//                       {item}
//                     </li>
//                   ))}
//                 </ul>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         <Section title="Request Lifecycle">
//           <Card>
//             <div className="space-y-0 divide-y divide-[#1e2a45]/50">
//               <FlowStep step="1" color="violet" label="Client Request" detail="User action triggers fetch/mutation from React Query client in Next.js browser app" />
//               <FlowStep step="2" color="cyan" label="Next.js API Route (BFF)" detail="Optional server-side proxy; enriches headers, injects org-id, forwards to Express" />
//               <FlowStep step="3" color="green" label="JWT Middleware" detail="Express verifies Bearer token against Supabase JWT secret; extracts user_id + role + org_id" />
//               <FlowStep step="4" color="orange" label="Route Handler" detail="Controller validates Zod schema, calls service layer, handles errors with typed responses" />
//               <FlowStep step="5" color="violet" label="Service Execution" detail="Business logic runs; may call Supabase DB, AI service, or Web3 service in parallel" />
//               <FlowStep step="6" color="cyan" label="Database Query" detail="Supabase client queries PostgreSQL; RLS policies enforce org-scoped data isolation" />
//               <FlowStep step="7" color="green" label="AI / Web3 Side Effects" detail="If task completion: Gemini updates score; Web3Service emits Ethereum event" />
//               <FlowStep step="8" color="orange" label="Response Assembly" detail="Controller assembles typed JSON response, sets cache headers, returns 200/201/4xx/5xx" />
//             </div>
//           </Card>
//         </Section>

//         <Section title="Separation of Concerns">
//           <CodeBlock language="Architecture Diagram" code={`
// ┌─────────────────────────────────────────────────────────────────┐
// │                     PRESENTATION LAYER                          │
// │   Next.js App Router  │  React Components  │  Tailwind CSS     │
// │   React Query         │  Zustand Store     │  ethers.js        │
// └────────────────────────────┬────────────────────────────────────┘
//                              │ HTTPS (REST / WebSocket)
// ┌────────────────────────────▼────────────────────────────────────┐
// │                     API GATEWAY LAYER                           │
// │   Next.js BFF Routes  │  Express Router    │  JWT Middleware   │
// │   Zod Validation      │  Rate Limiter      │  CORS Policy      │
// └────────────────────────────┬────────────────────────────────────┘
//                              │ Internal function calls
// ┌────────────────────────────▼────────────────────────────────────┐
// │                   BUSINESS LOGIC LAYER                          │
// │   AuthService    │  EmployeeService  │  TaskService            │
// │   OrgService     │  AIService        │  Web3Service            │
// └──────┬─────────────────────┬──────────────────┬───────────────┘
//       │                     │                  │
// ┌──────▼──────┐    ┌─────────▼──────┐  ┌───────▼──────────────┐
// │  SUPABASE   │    │   AI SERVICE   │  │   WEB3 SERVICE       │
// │  PostgreSQL │    │  Gemini API    │  │  Ethereum RPC        │
// │  Auth / RLS │    │  Prompt Engine │  │  Smart Contract      │
// │  Realtime   │    │  Result Cache  │  │  MetaMask Signer     │
// └─────────────┘    └────────────────┘  └──────────────────────┘
// `} />
//         </Section>

//         <Section title="Interaction Flow: AI Task Assignment">
//           <Card>
//             <div className="space-y-0 divide-y divide-[#1e2a45]/50">
//               <FlowStep step="A" color="violet" label="Manager creates task" detail="POST /api/tasks — title, description, required_skills[], deadline, priority" />
//               <FlowStep step="B" color="cyan" label="TaskService triggers AI" detail="Fetches all eligible employees with skills + current workload from Supabase" />
//               <FlowStep step="C" color="orange" label="Gemini prompt execution" detail="Sends employee profiles + task spec to Gemini; receives ranked assignment recommendation" />
//               <FlowStep step="D" color="green" label="Assignment persisted" detail="Best candidate stored in task.assigned_to; notification dispatched via Supabase Realtime" />
//               <FlowStep step="E" color="blue" label="Employee completes task" detail="PATCH /api/tasks/:id/complete — status → completed, timestamp recorded" />
//               <FlowStep step="F" color="violet" label="Blockchain event emitted" detail="Web3Service calls HRMSLogger.logTaskCompletion() — tx hash stored in tasks.tx_hash" />
//             </div>
//           </Card>
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 2 ─────────────────────────── */

// function Part2() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 2: Microservice Layer Breakdown"
//         subtitle="Detailed decomposition of each service layer — API, AI, Web3, and Auth — with contracts, responsibilities, and communication patterns."
//         badge="Service Architecture"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="API Service Layer">
//           <SubSection title="Responsibility">
//             <Card>
//               <p className="text-sm text-gray-300 leading-relaxed">
//                 The Express API server is the central orchestrator. It exposes versioned REST endpoints, enforces
//                 auth/authorization, validates inputs, delegates to domain services, and assembles responses. It acts
//                 as a single entry point for all backend operations — keeping the frontend decoupled from data and AI internals.
//               </p>
//             </Card>
//           </SubSection>
//           <SubSection title="Route Structure">
//             <CodeBlock language="Express Router Layout" code={`
// /api/v1
// ├── /auth
// │   ├── POST /register          # org + admin user creation
// │   ├── POST /login             # email+password → JWT
// │   ├── POST /refresh           # rotate access/refresh tokens
// │   ├── POST /wallet-login      # MetaMask signature → JWT
// │   └── POST /logout            # invalidate refresh token
// │
// ├── /organizations
// │   ├── GET  /me                # current org details
// │   ├── PATCH /me               # update org settings
// │   └── GET  /me/stats          # headcount, dept breakdown
// │
// ├── /employees
// │   ├── GET    /                # list (paginated, filterable)
// │   ├── POST   /                # create employee profile
// │   ├── GET    /:id             # employee detail + skills
// │   ├── PATCH  /:id             # update profile
// │   ├── DELETE /:id             # soft delete
// │   ├── GET    /:id/tasks       # assigned tasks history
// │   └── GET    /:id/ai-report   # AI productivity analysis
// │
// ├── /tasks
// │   ├── GET    /                # list (filterable by status/assignee)
// │   ├── POST   /                # create + optional AI assignment
// │   ├── GET    /:id             # task detail
// │   ├── PATCH  /:id             # update task
// │   ├── PATCH  /:id/assign      # manual reassignment
// │   └── PATCH  /:id/complete    # mark complete + trigger Web3
// │
// └── /ai
//     ├── POST /score/:employeeId # trigger productivity score refresh
//     ├── POST /skill-gap/:employeeId
//     └── POST /suggest-assignment
// `} />
//           </SubSection>
//           <SubSection title="Middleware Stack">
//             <div className="space-y-2">
//               {[
//                 { mw: "helmet()", desc: "Sets security headers: X-Frame-Options, Content-Security-Policy, HSTS" },
//                 { mw: "cors(config)", desc: "Whitelists NEXT_PUBLIC_APP_URL; blocks other origins" },
//                 { mw: "rateLimit()", desc: "100 req/min per IP on public routes; 500 req/min for authenticated" },
//                 { mw: "express.json()", desc: "Parses request body; enforces 1MB payload limit" },
//                 { mw: "authMiddleware()", desc: "Verifies JWT via Supabase; attaches req.user with role + org_id" },
//                 { mw: "orgScopeMiddleware()", desc: "Ensures all queries are filtered by req.user.org_id (tenant isolation)" },
//                 { mw: "zodValidate(schema)", desc: "Per-route schema validation; returns structured 400 on failure" },
//                 { mw: "errorHandler()", desc: "Global error boundary; maps exceptions to typed HTTP responses" },
//               ].map((m) => (
//                 <div key={m.mw} className="flex gap-3 bg-[#080d1a] border border-[#1e2a45] rounded-lg px-4 py-2.5">
//                   <code className="text-cyan-300 text-xs w-48 flex-shrink-0 font-mono">{m.mw}</code>
//                   <span className="text-gray-400 text-xs">{m.desc}</span>
//                 </div>
//               ))}
//             </div>
//           </SubSection>
//         </Section>

//         <Section title="AI Service Layer">
//           <SubSection title="Responsibility">
//             <Card>
//               <p className="text-sm text-gray-300 leading-relaxed">
//                 The AI Service is a dedicated internal module that manages all Gemini API interactions. It constructs
//                 structured prompts with business context, parses responses into typed objects, caches results with TTL,
//                 and exposes clean async interfaces to the Task and Employee services. It never touches the HTTP layer directly.
//               </p>
//             </Card>
//           </SubSection>
//           <SubSection title="Module Interface">
//             <CodeBlock language="TypeScript" code={`
// // services/ai.service.ts

// interface AIService {
//   calculateProductivityScore(
//     employeeId: string,
//     context: EmployeeTaskContext
//   ): Promise<ProductivityScore>;

//   detectSkillGaps(
//     employee: EmployeeProfile,
//     orgRequiredSkills: Skill[]
//   ): Promise<SkillGapReport>;

//   suggestTaskAssignment(
//     task: TaskSpec,
//     candidates: EmployeeProfile[]
//   ): Promise<AssignmentRecommendation>;

//   generateWorkforceReport(
//     org: OrgContext,
//     timeRange: DateRange
//   ): Promise<WorkforceInsights>;
// }

// // Internal: Gemini API call wrapper
// async function callGemini(
//   systemPrompt: string,
//   userPrompt: string,
//   responseSchema: ZodSchema
// ): Promise<unknown> {
//   const response = await geminiClient.generateContent({
//     contents: [{ role: "user", parts: [{ text: userPrompt }] }],
//     systemInstruction: systemPrompt,
//     generationConfig: {
//       responseMimeType: "application/json",
//       maxOutputTokens: 2048,
//     },
//   });
//   return responseSchema.parse(JSON.parse(response.text));
// }
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Web3 Service Layer">
//           <SubSection title="Responsibility">
//             <Card>
//               <p className="text-sm text-gray-300 leading-relaxed">
//                 The Web3 Service manages all Ethereum interactions: signing transactions with a server-side hot wallet
//                 (or forwarding to MetaMask), calling smart contract write functions, reading on-chain event history,
//                 and verifying wallet ownership signatures. All blockchain side effects are non-blocking; failures do
//                 not break the main API response.
//               </p>
//             </Card>
//           </SubSection>
//           <SubSection title="Module Interface">
//             <CodeBlock language="TypeScript" code={`
// // services/web3.service.ts
// import { ethers } from "ethers";

// interface Web3Service {
//   logTaskCompletion(
//     taskId: string,
//     employeeAddress: string,
//     completedAt: number
//   ): Promise<{ txHash: string; blockNumber: number }>;

//   verifyWalletSignature(
//     message: string,
//     signature: string,
//     expectedAddress: string
//   ): Promise<boolean>;

//   getEmployeeOnChainHistory(
//     employeeAddress: string
//   ): Promise<TaskCompletionEvent[]>;

//   getContractState(): Promise<ContractStats>;
// }

// // Singleton provider + contract instance
// const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
// const signer   = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);
// const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Auth Layer">
//           <SubSection title="Responsibility">
//             <Card>
//               <p className="text-sm text-gray-300 leading-relaxed">
//                 Auth is handled by Supabase Auth with custom extensions for wallet-based login and multi-tenancy.
//                 The backend never stores passwords — Supabase owns identity. The backend verifies JWTs, enforces
//                 RBAC via claims, and manages org-level permissions. Wallet login uses EIP-191 message signing
//                 to prove key ownership without private key exposure.
//               </p>
//             </Card>
//           </SubSection>
//           <SubSection title="Token Architecture">
//             <CodeBlock language="JWT Payload Structure" code={`
// // Supabase-issued JWT — verified server-side
// {
//   "sub": "uuid-user-id",           // Supabase user UUID
//   "email": "alice@acme.com",
//   "role": "authenticated",         // Supabase role (for RLS)
//   "exp": 1740000000,
//   "iat": 1739996400,
//   "app_metadata": {
//     "org_id": "uuid-org-id",       // injected during registration
//     "hrms_role": "admin",          // admin | hr_manager | manager | employee
//     "wallet_address": "0xABCD..."  // optional, set after wallet link
//   }
// }

// // Custom claims set via Supabase Auth Hooks (Edge Function)
// // trigger: on user.created → enrich JWT with org_id + hrms_role
// `} />
//           </SubSection>
//           <SubSection title="Role Definitions">
//             <TableBlock
//               headers={["Role", "Scope", "Key Permissions"]}
//               rows={[
//                 ["admin", "Full org", "All CRUD, billing, invite users, view all AI reports"],
//                 ["hr_manager", "Full org", "Employee CRUD, view all tasks, view AI reports, no billing"],
//                 ["manager", "Own department", "Create/assign tasks in dept, view team analytics"],
//                 ["employee", "Own profile", "View own tasks, update task status, view own AI score"],
//               ]}
//             />
//           </SubSection>
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 3 ─────────────────────────── */

// function Part3() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 3: Database Design"
//         subtitle="Full PostgreSQL schema with relationships, constraints, indexing strategy, and multi-tenant scalability design."
//         badge="Data Architecture"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="Schema Overview">
//           <CodeBlock language="Entity Relationship (logical)" code={`
// organizations (1)
//     │
//     ├──< departments (many)
//     │       └──< employees (many)
//     │
//     └──< employees (many)
//             │
//             ├── wallet_address (unique per org)
//             ├──< tasks.assigned_to (many tasks)
//             ├──< task_comments (many)
//             ├──< employee_skills (many)
//             └──< ai_scores (many, time-series)

// tasks (1)
//     ├── created_by → employees
//     ├── assigned_to → employees
//     ├──< task_skills (required skills)
//     ├──< task_comments
//     └── tx_hash (nullable, set on completion)

// skills (master table)
//     ├──< employee_skills (junction)
//     └──< task_skills (junction)
// `} />
//         </Section>

//         <Section title="Full DDL Schema">
//           <CodeBlock language="PostgreSQL DDL" code={`
// -- ── ORGANIZATIONS ────────────────────────────────────────────
// CREATE TABLE organizations (
//   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   name         TEXT NOT NULL,
//   slug         TEXT UNIQUE NOT NULL,        -- URL-safe identifier
//   industry     TEXT,
//   plan         TEXT DEFAULT 'free',         -- free | pro | enterprise
//   created_at   TIMESTAMPTZ DEFAULT now(),
//   updated_at   TIMESTAMPTZ DEFAULT now()
// );

// -- ── DEPARTMENTS ──────────────────────────────────────────────
// CREATE TABLE departments (
//   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
//   name         TEXT NOT NULL,
//   parent_id    UUID REFERENCES departments(id),  -- tree hierarchy
//   created_at   TIMESTAMPTZ DEFAULT now()
// );

// -- ── EMPLOYEES ────────────────────────────────────────────────
// CREATE TABLE employees (
//   id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
//   user_id          UUID UNIQUE REFERENCES auth.users(id),  -- Supabase auth
//   department_id    UUID REFERENCES departments(id),
//   manager_id       UUID REFERENCES employees(id),
//   full_name        TEXT NOT NULL,
//   email            TEXT NOT NULL,
//   role             TEXT NOT NULL DEFAULT 'employee',
//   wallet_address   TEXT,
//   job_title        TEXT,
//   hire_date        DATE,
//   is_active        BOOLEAN DEFAULT true,
//   created_at       TIMESTAMPTZ DEFAULT now(),
//   updated_at       TIMESTAMPTZ DEFAULT now(),
//   UNIQUE(org_id, email),
//   UNIQUE(org_id, wallet_address)
// );

// -- ── SKILLS MASTER ────────────────────────────────────────────
// CREATE TABLE skills (
//   id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
//   name       TEXT NOT NULL,
//   category   TEXT,   -- technical | soft | domain
//   UNIQUE(org_id, name)
// );

// -- ── EMPLOYEE SKILLS ──────────────────────────────────────────
// CREATE TABLE employee_skills (
//   employee_id   UUID REFERENCES employees(id) ON DELETE CASCADE,
//   skill_id      UUID REFERENCES skills(id) ON DELETE CASCADE,
//   proficiency   SMALLINT CHECK (proficiency BETWEEN 1 AND 5),
//   verified_at   TIMESTAMPTZ,
//   PRIMARY KEY (employee_id, skill_id)
// );

// -- ── TASKS ────────────────────────────────────────────────────
// CREATE TABLE tasks (
//   id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
//   created_by      UUID NOT NULL REFERENCES employees(id),
//   assigned_to     UUID REFERENCES employees(id),
//   department_id   UUID REFERENCES departments(id),
//   title           TEXT NOT NULL,
//   description     TEXT,
//   priority        TEXT DEFAULT 'medium',    -- low | medium | high | critical
//   status          TEXT DEFAULT 'pending',   -- pending | assigned | in_progress
//                                             -- | review | completed | cancelled
//   deadline        TIMESTAMPTZ,
//   completed_at    TIMESTAMPTZ,
//   tx_hash         TEXT,                     -- Ethereum tx on completion
//   block_number    BIGINT,
//   ai_assigned     BOOLEAN DEFAULT false,    -- true if Gemini made the match
//   created_at      TIMESTAMPTZ DEFAULT now(),
//   updated_at      TIMESTAMPTZ DEFAULT now()
// );

// -- ── TASK REQUIRED SKILLS ─────────────────────────────────────
// CREATE TABLE task_skills (
//   task_id    UUID REFERENCES tasks(id) ON DELETE CASCADE,
//   skill_id   UUID REFERENCES skills(id) ON DELETE CASCADE,
//   PRIMARY KEY (task_id, skill_id)
// );

// -- ── TASK COMMENTS ────────────────────────────────────────────
// CREATE TABLE task_comments (
//   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   task_id      UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
//   author_id    UUID NOT NULL REFERENCES employees(id),
//   content      TEXT NOT NULL,
//   created_at   TIMESTAMPTZ DEFAULT now()
// );

// -- ── AI PRODUCTIVITY SCORES (TIME-SERIES) ────────────────────
// CREATE TABLE ai_scores (
//   id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
//   org_id          UUID NOT NULL REFERENCES organizations(id),
//   score           NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
//   tasks_completed INT DEFAULT 0,
//   tasks_overdue   INT DEFAULT 0,
//   avg_completion_days NUMERIC(5,2),
//   skill_match_avg NUMERIC(5,2),
//   ai_summary      TEXT,                 -- Gemini narrative
//   computed_at     TIMESTAMPTZ DEFAULT now()
// );

// -- ── AI SKILL GAP REPORTS ────────────────────────────────────
// CREATE TABLE skill_gap_reports (
//   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
//   missing_skills JSONB,                 -- [{skill, importance, resources}]
//   recommendations TEXT,
//   generated_at  TIMESTAMPTZ DEFAULT now()
// );
// `} />
//         </Section>

//         <Section title="Indexing Strategy">
//           <CodeBlock language="PostgreSQL Indexes" code={`
// -- ── ORGANIZATION SCOPE (most critical — on every query) ───────
// CREATE INDEX idx_employees_org_id   ON employees(org_id);
// CREATE INDEX idx_tasks_org_id       ON tasks(org_id);
// CREATE INDEX idx_departments_org_id ON departments(org_id);
// CREATE INDEX idx_ai_scores_org_id   ON ai_scores(org_id);

// -- ── TASK QUERIES ─────────────────────────────────────────────
// CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
// CREATE INDEX idx_tasks_status      ON tasks(status);
// CREATE INDEX idx_tasks_deadline    ON tasks(deadline);
// CREATE INDEX idx_tasks_created_by  ON tasks(created_by);

// -- ── COMPOSITE: dashboard queries ─────────────────────────────
// CREATE INDEX idx_tasks_org_status  ON tasks(org_id, status);
// CREATE INDEX idx_tasks_org_assigned ON tasks(org_id, assigned_to, status);

// -- ── EMPLOYEE LOOKUP ──────────────────────────────────────────
// CREATE INDEX idx_employees_user_id ON employees(user_id);
// CREATE INDEX idx_employees_wallet  ON employees(wallet_address);
// CREATE INDEX idx_employees_dept    ON employees(department_id);

// -- ── AI SCORES TIME-SERIES ────────────────────────────────────
// CREATE INDEX idx_ai_scores_employee_time
//   ON ai_scores(employee_id, computed_at DESC);

// -- ── FULL-TEXT SEARCH (tasks + employees) ─────────────────────
// CREATE INDEX idx_tasks_fts ON tasks
//   USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));
// CREATE INDEX idx_employees_fts ON employees
//   USING gin(to_tsvector('english', full_name || ' ' || coalesce(job_title, '')));
// `} />
//         </Section>

//         <Section title="Row Level Security (Multi-Tenancy)">
//           <CodeBlock language="PostgreSQL RLS" code={`
// -- Enable RLS on all org-scoped tables
// ALTER TABLE employees    ENABLE ROW LEVEL SECURITY;
// ALTER TABLE tasks        ENABLE ROW LEVEL SECURITY;
// ALTER TABLE departments  ENABLE ROW LEVEL SECURITY;
// ALTER TABLE ai_scores    ENABLE ROW LEVEL SECURITY;

// -- Employees can only read within their org
// CREATE POLICY "org_isolation_employees" ON employees
//   FOR ALL USING (
//     org_id = (
//       SELECT (raw_app_meta_data->>'org_id')::uuid
//       FROM auth.users WHERE id = auth.uid()
//     )
//   );

// -- Tasks: same org isolation
// CREATE POLICY "org_isolation_tasks" ON tasks
//   FOR ALL USING (
//     org_id = (
//       SELECT (raw_app_meta_data->>'org_id')::uuid
//       FROM auth.users WHERE id = auth.uid()
//     )
//   );

// -- Employees can only update/see their own AI scores
// CREATE POLICY "own_ai_scores" ON ai_scores
//   FOR SELECT USING (
//     employee_id = (
//       SELECT id FROM employees WHERE user_id = auth.uid()
//     )
//     OR
//     (SELECT raw_app_meta_data->>'hrms_role'
//      FROM auth.users WHERE id = auth.uid()) IN ('admin', 'hr_manager')
//   );
// `} />
//         </Section>

//         <Section title="Scalability Considerations">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[
//               { title: "Table Partitioning", body: "Partition ai_scores and task_comments by month using PostgreSQL declarative partitioning. Old partitions can be archived to cold storage or detached without locking." },
//               { title: "Connection Pooling", body: "Use Supabase's built-in PgBouncer (transaction mode) to pool connections. Configure pool size relative to Postgres max_connections (typically 100–200)." },
//               { title: "Read Replicas", body: "Route read-heavy queries (reports, AI score history, dashboards) to Supabase read replicas. Write operations go to primary." },
//               { title: "JSONB for Flexibility", body: "skill_gap_reports.missing_skills and other semi-structured AI outputs use JSONB for schema flexibility without migrations. Indexed with GIN." },
//             ].map((item) => (
//               <Card key={item.title}>
//                 <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">{item.title}</div>
//                 <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
//               </Card>
//             ))}
//           </div>
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 4 ─────────────────────────── */

// function Part4() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 4: AI Architecture"
//         subtitle="How Gemini powers productivity scoring, skill gap detection, smart task assignment, and workforce intelligence."
//         badge="AI Intelligence Layer"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="Productivity Score Calculation">
//           <SubSection title="Input Signals">
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//               {[
//                 { signal: "Task Completion Rate", weight: "30%", desc: "Tasks completed / tasks assigned in period" },
//                 { signal: "On-Time Delivery", weight: "25%", desc: "% of tasks completed before deadline" },
//                 { signal: "Skill Match Score", weight: "20%", desc: "Avg overlap between task_skills and employee_skills" },
//                 { signal: "Task Complexity", weight: "15%", desc: "Weighted by priority: critical=4, high=3, medium=2, low=1" },
//                 { signal: "Collaboration Rate", weight: "10%", desc: "Comment activity + cross-department tasks" },
//                 { signal: "Trend Direction", weight: "bonus", desc: "Score delta vs previous period; rewarded positively" },
//               ].map((s) => (
//                 <Card key={s.signal} className="flex flex-col gap-1.5">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs font-bold text-white">{s.signal}</span>
//                     <Badge label={s.weight} color="violet" />
//                   </div>
//                   <p className="text-xs text-gray-400">{s.desc}</p>
//                 </Card>
//               ))}
//             </div>
//           </SubSection>
//           <SubSection title="Gemini Prompt — Productivity Score">
//             <CodeBlock language="Prompt Template" code={`
// SYSTEM:
// You are an AI workforce analyst. Analyze the employee performance data
// and return a JSON productivity score report. Be objective, precise, and
// constructive. Do not hallucinate — only reference provided data.

// USER:
// Analyze productivity for employee: {employee.full_name}
// Role: {employee.job_title}, Department: {department.name}

// --- Performance Data (last 30 days) ---
// Tasks Assigned: {stats.assigned}
// Tasks Completed: {stats.completed}
// Tasks Overdue: {stats.overdue}
// Average Completion Time: {stats.avg_days} days
// Task Priorities: {stats.priorityBreakdown}
// Skill Match Scores: {stats.skillMatchAvg}/5
// Peer Collaboration Events: {stats.collaborations}
// Previous Score: {prev.score}/100

// --- Response Schema ---
// {
//   "score": number (0-100),
//   "breakdown": {
//     "completion_rate": number,
//     "on_time_rate": number,
//     "skill_alignment": number,
//     "complexity_handled": number,
//     "collaboration": number
//   },
//   "trend": "improving" | "stable" | "declining",
//   "summary": string (2-3 sentence narrative),
//   "top_strength": string,
//   "top_concern": string
// }
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Skill Gap Detection">
//           <SubSection title="How It Works">
//             <Card>
//               <div className="space-y-2 text-sm text-gray-300">
//                 <div className="flex gap-3"><span className="text-violet-400 font-bold">Step 1</span><span>Fetch employee's current skills with proficiency levels from employee_skills</span></div>
//                 <div className="flex gap-3"><span className="text-violet-400 font-bold">Step 2</span><span>Fetch all task_skills required by tasks assigned to this employee (last 90 days)</span></div>
//                 <div className="flex gap-3"><span className="text-violet-400 font-bold">Step 3</span><span>Fetch org-wide "strategic skills" defined by HR (future-looking requirements)</span></div>
//                 <div className="flex gap-3"><span className="text-violet-400 font-bold">Step 4</span><span>Compute set difference: required_skills − employee_skills → gap_set</span></div>
//                 <div className="flex gap-3"><span className="text-violet-400 font-bold">Step 5</span><span>Send gap_set + context to Gemini for prioritization, importance scoring, and learning resource recommendations</span></div>
//               </div>
//             </Card>
//           </SubSection>
//           <SubSection title="Gemini Prompt — Skill Gap">
//             <CodeBlock language="Prompt Template" code={`
// SYSTEM:
// You are an expert L&D (Learning & Development) advisor in an enterprise HR system.
// Analyze skill gaps and provide actionable, realistic development recommendations.

// USER:
// Employee: {name}, Role: {job_title}
// Current Skills: {skills_with_proficiency_json}

// Skills required by recent assigned tasks (not possessed):
// {gap_skills_json}

// Organization's strategic skill priorities:
// {org_priority_skills_json}

// Return JSON:
// {
//   "critical_gaps": [
//     {
//       "skill": string,
//       "importance": "critical" | "high" | "medium",
//       "reason": string,
//       "estimated_learning_weeks": number,
//       "resources": [{ "type": "course|book|practice", "title": string, "url": string }]
//     }
//   ],
//   "nice_to_have_gaps": [...same structure...],
//   "development_plan_summary": string,
//   "estimated_full_readiness_weeks": number
// }
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Smart Task Assignment">
//           <SubSection title="Assignment Algorithm">
//             <Card>
//               <div className="space-y-3">
//                 <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pre-filtering (SQL)</div>
//                 <div className="text-xs text-gray-300">Filter candidates: active employees in org, not at capacity (&lt;80% workload), skills overlap &gt; 0 with task requirements</div>
//                 <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mt-2">Scoring (Gemini)</div>
//                 <div className="text-xs text-gray-300">Send top 10 pre-filtered candidates with full profiles to Gemini for holistic ranking including soft factors</div>
//                 <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mt-2">Selection</div>
//                 <div className="text-xs text-gray-300">Use Gemini's #1 recommendation; store reasoning; log ai_assigned = true on task</div>
//               </div>
//             </Card>
//           </SubSection>
//           <SubSection title="Gemini Prompt — Smart Assignment">
//             <CodeBlock language="Prompt Template" code={`
// SYSTEM:
// You are a smart workload optimizer for an enterprise HR system.
// Select the optimal employee for a task based on skills, availability,
// past performance, and growth potential.

// USER:
// Task: "{task.title}"
// Description: {task.description}
// Required Skills: {task_skills_json}
// Priority: {task.priority}
// Deadline: {task.deadline}

// Candidate Employees:
// {candidates_json}
// // Each candidate includes: full_name, skills[], current_task_count,
// // productivity_score, recent_performance_trend, department

// Return JSON:
// {
//   "recommended_employee_id": string,
//   "reasoning": string (2-3 sentences),
//   "confidence": number (0-1),
//   "alternatives": [
//     { "employee_id": string, "rank": 2, "note": string },
//     { "employee_id": string, "rank": 3, "note": string }
//   ],
//   "risk_flags": string[] // e.g. ["near deadline", "skill gap in X"]
// }
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Gemini Integration Architecture">
//           <CodeBlock language="TypeScript — Gemini Client" code={`
// // lib/gemini.client.ts
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export const geminiPro = genAI.getGenerativeModel({
//   model: "gemini-1.5-pro",
//   generationConfig: {
//     responseMimeType: "application/json",
//     temperature: 0.3,        // low temp = more deterministic/factual
//     maxOutputTokens: 2048,
//   },
// });

// // Cache wrapper — avoid re-scoring unchanged data
// const scoreCache = new Map<string, { result: unknown; expiry: number }>();

// export async function cachedGeminiCall<T>(
//   cacheKey: string,
//   ttlMs: number,
//   promptFn: () => Promise<T>
// ): Promise<T> {
//   const cached = scoreCache.get(cacheKey);
//   if (cached && cached.expiry > Date.now()) {
//     return cached.result as T;
//   }
//   const result = await promptFn();
//   scoreCache.set(cacheKey, { result, expiry: Date.now() + ttlMs });
//   return result;
// }

// // Usage: productivity score cached for 1 hour per employee
// const score = await cachedGeminiCall(
//   \`score:\${employeeId}:\${periodKey}\`,
//   60 * 60 * 1000,
//   () => aiService.calculateProductivityScore(employeeId, context)
// );
// `} />
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 5 ─────────────────────────── */

// function Part5() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 5: Web3 Architecture"
//         subtitle="MetaMask wallet authentication, Solidity smart contract design, on-chain event logging, and gas optimization strategies."
//         badge="Blockchain Layer"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="Wallet Authentication Flow">
//           <Card className="mb-4">
//             <div className="space-y-0 divide-y divide-[#1e2a45]/50">
//               <FlowStep step="1" color="blue" label="Connect MetaMask" detail="Frontend calls window.ethereum.request({ method: 'eth_requestAccounts' }) → user approves → returns wallet address" />
//               <FlowStep step="2" color="violet" label="Request Nonce" detail="GET /api/auth/nonce?address=0xABC → backend generates random nonce, stores with 5min TTL in Redis/Supabase" />
//               <FlowStep step="3" color="cyan" label="Sign Message" detail="Frontend: ethereum.request({ method: 'personal_sign', params: [message, address] }) — private key never leaves browser" />
//               <FlowStep step="4" color="green" label="Verify Signature" detail="POST /api/auth/wallet-login with { address, signature } → backend uses ethers.verifyMessage() to recover signer address" />
//               <FlowStep step="5" color="orange" label="Identity Lookup" detail="If recovered_address === submitted_address → find employee by wallet_address in Supabase → issue JWT via signJWT()" />
//               <FlowStep step="6" color="blue" label="JWT Issued" detail="Standard Supabase JWT returned with org_id + hrms_role claims; wallet_address embedded in app_metadata" />
//             </div>
//           </Card>
//           <CodeBlock language="TypeScript — Wallet Login Verification" code={`
// // POST /api/v1/auth/wallet-login
// import { ethers } from "ethers";

// async function walletLogin(address: string, signature: string) {
//   // 1. Retrieve stored nonce
//   const { data: nonceRecord } = await supabase
//     .from("auth_nonces")
//     .select("nonce, created_at")
//     .eq("address", address.toLowerCase())
//     .single();

//   if (!nonceRecord) throw new Error("No nonce found — initiate again");

//   // 2. Check nonce expiry (5 minutes)
//   const age = Date.now() - new Date(nonceRecord.created_at).getTime();
//   if (age > 5 * 60 * 1000) throw new Error("Nonce expired");

//   // 3. Reconstruct the message that was signed
//   const message = \`Sign in to Mini AI-HRMS\\nNonce: \${nonceRecord.nonce}\\nTimestamp: \${nonceRecord.created_at}\`;

//   // 4. Recover signer from signature
//   const recovered = ethers.verifyMessage(message, signature);

//   if (recovered.toLowerCase() !== address.toLowerCase()) {
//     throw new Error("Signature verification failed");
//   }

//   // 5. Invalidate nonce (one-time use)
//   await supabase.from("auth_nonces").delete().eq("address", address);

//   // 6. Find employee and issue JWT
//   const employee = await findEmployeeByWallet(address);
//   return issueJWT(employee);
// }
// `} />
//         </Section>

//         <Section title="Smart Contract Structure">
//           <SubSection title="HRMSLogger.sol">
//             <CodeBlock language="Solidity" code={`
// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Pausable.sol";

// /**
//  * @title HRMSLogger
//  * @notice Immutable on-chain log of workforce task completion events
//  * @dev Owner is the backend server wallet; employees are indexed by address
//  */
// contract HRMSLogger is Ownable, Pausable {

//     // ── EVENTS ───────────────────────────────────────────────
//     event TaskCompleted(
//         bytes32 indexed taskId,          // keccak256 of UUID
//         address indexed employeeAddress,
//         address indexed orgAddress,      // org's registered wallet
//         uint256 completedAt,             // unix timestamp
//         uint8   priority,                // 1=low 2=med 3=high 4=critical
//         bytes32 taskHash                 // keccak256(title+description)
//     );

//     event EmployeeRegistered(
//         address indexed employeeAddress,
//         address indexed orgAddress,
//         bytes32         employeeIdHash   // keccak256 of UUID
//     );

//     // ── STATE ────────────────────────────────────────────────
//     mapping(address => bool) public registeredOrgs;
//     mapping(address => address) public employeeOrg;        // employee → org
//     mapping(bytes32 => bool)  public taskLogged;           // prevent duplicate logs
//     uint256 public totalTasksLogged;

//     // ── CONSTRUCTOR ──────────────────────────────────────────
//     constructor() Ownable(msg.sender) {}

//     // ── ORG REGISTRATION ─────────────────────────────────────
//     function registerOrg(address orgAddress) external onlyOwner {
//         registeredOrgs[orgAddress] = true;
//     }

//     // ── EMPLOYEE REGISTRATION ────────────────────────────────
//     function registerEmployee(
//         address employeeAddress,
//         bytes32 employeeIdHash
//     ) external onlyOwner {
//         require(registeredOrgs[msg.sender] || msg.sender == owner(),
//             "Not authorized");
//         employeeOrg[employeeAddress] = msg.sender;
//         emit EmployeeRegistered(employeeAddress, msg.sender, employeeIdHash);
//     }

//     // ── LOG TASK COMPLETION ──────────────────────────────────
//     function logTaskCompletion(
//         bytes32 taskId,
//         address employeeAddress,
//         address orgAddress,
//         uint256 completedAt,
//         uint8   priority,
//         bytes32 taskHash
//     ) external onlyOwner whenNotPaused {
//         require(!taskLogged[taskId], "Task already logged");
//         require(registeredOrgs[orgAddress], "Unknown org");

//         taskLogged[taskId] = true;
//         totalTasksLogged++;

//         emit TaskCompleted(
//             taskId,
//             employeeAddress,
//             orgAddress,
//             completedAt,
//             priority,
//             taskHash
//         );
//     }

//     // ── ADMIN ────────────────────────────────────────────────
//     function pause()   external onlyOwner { _pause(); }
//     function unpause() external onlyOwner { _unpause(); }
// }
// `} />
//           </SubSection>
//         </Section>

//         <Section title="Gas Optimization Strategy">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {[
//               { title: "Events over Storage", body: "All data lives in events (logs), NOT in contract storage mappings. Events cost ~375 gas per topic vs ~20,000 gas for SSTORE. We only store a boolean taskLogged mapping to prevent duplicate submissions." },
//               { title: "bytes32 over string", body: "All IDs and hashes use bytes32 instead of string. bytes32 is a fixed-size value type: no dynamic ABI encoding, no length prefix, fits in a single EVM word (32 bytes). Pass keccak256(uuid) from backend." },
//               { title: "Batching (future)", body: "For high-volume orgs, implement logBatchCompletions(bytes32[] taskIds, ...) to amortize the 21,000 base transaction gas across multiple events in a single call." },
//               { title: "L2 Deployment", body: "Deploy on Polygon PoS or Base (Coinbase L2) for 100-1000x cheaper gas than Ethereum mainnet. Same Solidity/ethers.js code; only chain ID and RPC URL change." },
//               { title: "Pausable Circuit Breaker", body: "If ETH gas spikes, owner can pause() the contract. Backend detects pause state and queues completions in Redis, re-submitting when unpaused. No task completions are lost." },
//               { title: "Indexed Events", body: "taskId, employeeAddress, and orgAddress are indexed topics for fast off-chain querying via eth_getLogs with topic filters. Avoids full log scans." },
//             ].map((item) => (
//               <Card key={item.title}>
//                 <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">{item.title}</div>
//                 <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         <Section title="Web3Service Backend Integration">
//           <CodeBlock language="TypeScript" code={`
// // services/web3.service.ts
// import { ethers } from "ethers";
// import HRMSLoggerABI from "../contracts/HRMSLogger.json";

// class Web3Service {
//   private contract: ethers.Contract;

//   constructor() {
//     const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
//     const signer = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY!, provider);
//     this.contract = new ethers.Contract(
//       process.env.CONTRACT_ADDRESS!,
//       HRMSLoggerABI,
//       signer
//     );
//   }

//   async logTaskCompletion(task: Task, employee: Employee, org: Organization) {
//     const taskId     = ethers.id(task.id);     // keccak256
//     const taskHash   = ethers.id(\`\${task.title}:\${task.description}\`);
//     const orgAddress = org.wallet_address ?? ethers.ZeroAddress;

//     try {
//       const tx = await this.contract.logTaskCompletion(
//         taskId,
//         employee.wallet_address,
//         orgAddress,
//         Math.floor(Date.now() / 1000),
//         priorityToNumber(task.priority),
//         taskHash,
//         { gasLimit: 120_000 }               // safe ceiling for this function
//       );

//       const receipt = await tx.wait(1);     // wait for 1 confirmation

//       return {
//         txHash:      receipt.hash,
//         blockNumber: receipt.blockNumber,
//       };
//     } catch (error) {
//       // Non-blocking: log error, don't throw, task completion still succeeds
//       console.error("[Web3] logTaskCompletion failed:", error);
//       return null;
//     }
//   }

//   async getEmployeeHistory(walletAddress: string): Promise<TaskCompletionEvent[]> {
//     const filter = this.contract.filters.TaskCompleted(
//       null,               // taskId: any
//       walletAddress,      // employeeAddress: filter this
//       null                // orgAddress: any
//     );
//     const events = await this.contract.queryFilter(filter, -10_000); // last 10k blocks
//     return events.map(e => ({
//       taskId:    e.args!.taskId,
//       completedAt: Number(e.args!.completedAt),
//       priority:  e.args!.priority,
//       txHash:    e.transactionHash,
//     }));
//   }
// }
// `} />
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 6 ─────────────────────────── */

// function Part6() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 6: Security Architecture"
//         subtitle="JWT authentication flow, role-based access control, API protection layers, and wallet signature verification."
//         badge="Security Design"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="JWT Authentication Flow">
//           <Card className="mb-4">
//             <div className="space-y-0 divide-y divide-[#1e2a45]/50">
//               <FlowStep step="1" color="violet" label="User Login" detail="POST /api/auth/login with email+password → Supabase Auth validates credentials" />
//               <FlowStep step="2" color="cyan" label="Token Pair Issued" detail="Supabase returns: access_token (15min TTL) + refresh_token (7 days TTL, httpOnly cookie)" />
//               <FlowStep step="3" color="green" label="Request Authorization" detail="Every API request includes Authorization: Bearer {access_token} header" />
//               <FlowStep step="4" color="orange" label="Server Verification" detail="Express authMiddleware calls supabase.auth.getUser(token) — verifies signature + expiry" />
//               <FlowStep step="5" color="blue" label="Claims Extraction" detail="user_id, org_id, hrms_role extracted from JWT payload — attached to req.user" />
//               <FlowStep step="6" color="violet" label="Silent Refresh" detail="Frontend React Query intercepts 401 → calls /api/auth/refresh with refresh_token cookie → new access_token" />
//             </div>
//           </Card>
//           <CodeBlock language="TypeScript — Auth Middleware" code={`
// // middleware/auth.middleware.ts
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role: bypass RLS for verification
// );

// export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
//   const token = req.headers.authorization?.replace("Bearer ", "");
//   if (!token) return res.status(401).json({ error: "No token provided" });

//   const { data: { user }, error } = await supabase.auth.getUser(token);
//   if (error || !user) return res.status(401).json({ error: "Invalid token" });

//   req.user = {
//     id:             user.id,
//     email:          user.email!,
//     org_id:         user.app_metadata.org_id,
//     hrms_role:      user.app_metadata.hrms_role,
//     wallet_address: user.app_metadata.wallet_address,
//   };

//   next();
// }

// // RBAC guard factory
// export function requireRole(...roles: string[]) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.hrms_role)) {
//       return res.status(403).json({ error: "Insufficient permissions" });
//     }
//     next();
//   };
// }

// // Usage:
// // router.delete("/:id", authMiddleware, requireRole("admin"), deleteEmployee);
// // router.get("/ai-report", authMiddleware, requireRole("admin","hr_manager"), getReport);
// `} />
//         </Section>

//         <Section title="Role-Based Access Control Matrix">
//           <TableBlock
//             headers={["Endpoint", "admin", "hr_manager", "manager", "employee"]}
//             rows={[
//               ["GET /employees", "All org", "All org", "Own dept", "Own profile"],
//               ["POST /employees", "Yes", "Yes", "No", "No"],
//               ["DELETE /employees/:id", "Yes", "No", "No", "No"],
//               ["GET /tasks", "All", "All", "Own dept", "Assigned to self"],
//               ["POST /tasks", "Yes", "Yes", "Yes (dept)", "No"],
//               ["PATCH /tasks/:id/complete", "Yes", "Yes", "Yes", "Own tasks only"],
//               ["GET /ai/score/:id", "Any", "Any", "Own dept", "Own only"],
//               ["POST /ai/suggest-assignment", "Yes", "Yes", "Yes", "No"],
//               ["GET /organizations/me/stats", "Yes", "Yes", "No", "No"],
//             ]}
//           />
//         </Section>

//         <Section title="API Protection Layers">
//           <div className="space-y-3">
//             {[
//               { layer: "Transport Security", items: ["TLS 1.3 enforced via reverse proxy (Nginx/Vercel)", "HSTS header: max-age=31536000; includeSubDomains", "Certificate pinning on mobile clients (if applicable)"] },
//               { layer: "Input Validation", items: ["Zod schema validation on all request bodies and query params", "File upload restrictions: type whitelist + 5MB max", "SQL injection prevention: Supabase parameterized queries only (no raw SQL interpolation)"] },
//               { layer: "Rate Limiting", items: ["Auth endpoints: 5 requests/min per IP (brute-force protection)", "AI endpoints: 20 requests/min per user (cost protection)", "General API: 100 requests/min per user, 1000/min per org"] },
//               { layer: "CORS Policy", items: ["Origin whitelist: NEXT_PUBLIC_APP_URL only", "Credentials: true (needed for httpOnly refresh cookie)", "Methods: GET, POST, PATCH, DELETE only; no OPTIONS pass-through"] },
//               { layer: "Secret Management", items: ["All secrets in environment variables — never committed to git", "Supabase service_role key only on server; anon key on client", "Backend private key for Ethereum signing in env; rotatable"] },
//             ].map((block) => (
//               <Card key={block.layer}>
//                 <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">{block.layer}</div>
//                 <ul className="space-y-1">
//                   {block.items.map((item) => (
//                     <li key={item} className="flex gap-2 text-xs text-gray-300">
//                       <span className="text-gray-600">▸</span>{item}
//                     </li>
//                   ))}
//                 </ul>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         <Section title="Wallet Signature Verification">
//           <CodeBlock language="TypeScript — EIP-191 Verification" code={`
// // EIP-191: "Signed Data" standard — personal_sign
// // MetaMask prepends: "\\x19Ethereum Signed Message:\\n{len}{message}"

// function buildSignInMessage(address: string, nonce: string, timestamp: string): string {
//   return [
//     "Mini AI-HRMS — Wallet Sign-In",
//     "",
//     "I authorize this wallet to access my HRMS account.",
//     "",
//     \`Address:   \${address}\`,
//     \`Nonce:     \${nonce}\`,
//     \`Timestamp: \${timestamp}\`,
//     "",
//     "This request will not trigger a blockchain transaction",
//     "or cost any gas fees.",
//   ].join("\\n");
// }

// function verifySignature(
//   address: string,
//   signature: string,
//   nonce: string,
//   timestamp: string
// ): boolean {
//   const message  = buildSignInMessage(address, nonce, timestamp);
//   const recovered = ethers.verifyMessage(message, signature);
//   return recovered.toLowerCase() === address.toLowerCase();
// }

// // Security notes:
// // - Nonce is single-use: deleted from DB immediately after verification
// // - Timestamp is validated server-side: reject if > 5 minutes old
// // - Address is checksummed before comparison (case-sensitive Ethereum addresses)
// // - Rate-limit nonce generation: max 3 nonces per address per 10 minutes
// `} />
//         </Section>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────── PART 7 ─────────────────────────── */

// function Part7() {
//   return (
//     <div className="px-10 py-10 max-w-5xl">
//       <PageHeader
//         title="Part 7: Scalability & Production Design"
//         subtitle="Horizontal scaling, caching architecture, load balancing, observability, and roadmap for microservices migration."
//         badge="Production Engineering"
//       />

//       <div className="pt-8 space-y-8">
//         <Section title="Horizontal Scaling Architecture">
//           <CodeBlock language="Infrastructure Diagram" code={`
//                     ┌─────────────────────┐
//                     │   Cloudflare CDN    │  ← Static assets, DDoS protection
//                     │   (Global Edge)     │
//                     └──────────┬──────────┘
//                               │
//                     ┌──────────▼──────────┐
//                     │   Load Balancer     │  ← Nginx / AWS ALB / Vercel Edge
//                     │   (Round-Robin)     │
//                     └─┬──────┬──────┬────┘
//                       │      │      │
//               ┌───────▼┐ ┌───▼──┐ ┌─▼──────┐
//               │Next.js │ │Next  │ │Next.js │   ← Stateless; scale horizontally
//               │App 1   │ │App 2 │ │App 3   │   ← Vercel (auto-scales)
//               └────┬───┘ └──┬───┘ └───┬────┘
//                   │        │         │
//               ┌────▼────────▼─────────▼────┐
//               │     Express API Cluster    │  ← PM2 cluster / ECS tasks
//               │   (N workers, stateless)   │
//               └────────────┬───────────────┘
//                           │
//               ┌───────────┼───────────┐
//               │           │           │
//         ┌──────▼──┐  ┌─────▼──┐  ┌────▼──────┐
//         │Supabase │  │ Redis  │  │AI/Web3    │
//         │Postgres │  │ Cache  │  │Services   │
//         │(managed)│  │(ElastiC│  │(container)│
//         └─────────┘  └────────┘  └───────────┘
// `} />
//         </Section>

//         <Section title="Caching Architecture">
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {[
//                 { title: "CDN Cache (Cloudflare)", ttl: "Varies", scope: "Global", items: ["Static assets: JS/CSS bundles (1 year, hash-busted)", "Public org landing pages (5 minutes)", "API responses with Cache-Control headers"] },
//                 { title: "Next.js ISR Cache", ttl: "60s–1hr", scope: "Server", items: ["Dashboard summary pages (revalidate: 60)", "Employee directory (revalidate: 300)", "Public org stats (revalidate: 3600)"] },
//                 { title: "Redis Application Cache", ttl: "Configurable", scope: "Backend", items: ["AI productivity scores: 1hr TTL per employee", "Skill gap reports: 24hr TTL", "Task assignment suggestions: 30min TTL", "Auth nonces: 5min TTL (then deleted)"] },
//                 { title: "Supabase Query Cache", ttl: "Request-level", scope: "DB", items: ["Prepared statements auto-cached by PgBouncer", "Frequent dashboard queries wrapped in DB views", "Materialized views for org-level stats (refreshed hourly)"] },
//               ].map((block) => (
//                 <Card key={block.title}>
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{block.title}</div>
//                     <div className="flex gap-2">
//                       <Badge label={`TTL: ${block.ttl}`} color="violet" />
//                       <Badge label={block.scope} color="green" />
//                     </div>
//                   </div>
//                   <ul className="space-y-1">
//                     {block.items.map((item) => (
//                       <li key={item} className="flex gap-2 text-xs text-gray-400"><span>▸</span>{item}</li>
//                     ))}
//                   </ul>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </Section>

//         <Section title="Observability Stack">
//           <div className="space-y-2">
//             {[
//               { tool: "Sentry", role: "Error Tracking", detail: "Capture frontend + backend exceptions with stack traces, user context, and org_id tagging. Set alert thresholds per error rate." },
//               { tool: "Datadog / Grafana", role: "Metrics & APM", detail: "Track API latency p50/p95/p99, Gemini API call duration, Ethereum tx confirmation time, DB query time." },
//               { tool: "Pino (structured logs)", role: "Application Logs", detail: "JSON-structured logs with req_id, user_id, org_id, duration on every API request. Shipped to Datadog or Loki." },
//               { tool: "Supabase Dashboard", role: "DB Monitoring", detail: "Built-in query performance insights, slow query log, connection pool utilization." },
//               { tool: "UptimeRobot / BetterStack", role: "Uptime Monitoring", detail: "External health checks on /api/health every 60s. Alert on degradation before users notice." },
//             ].map((item) => (
//               <div key={item.tool} className="flex gap-4 bg-[#080d1a] border border-[#1e2a45] rounded-lg px-4 py-3">
//                 <div className="w-28 flex-shrink-0">
//                   <div className="text-xs font-bold text-white">{item.tool}</div>
//                   <div className="text-xs text-violet-400">{item.role}</div>
//                 </div>
//                 <div className="text-xs text-gray-400">{item.detail}</div>
//               </div>
//             ))}
//           </div>
//         </Section>

//         <Section title="Microservices Migration Roadmap">
//           <div className="space-y-3">
//             {[
//               { phase: "Phase 1 (Current)", label: "Modular Monolith", color: "green", items: ["Single Express app with service modules", "Clear domain boundaries within monolith", "Shared Supabase DB", "Easy to develop and debug"] },
//               { phase: "Phase 2 (Scale trigger: 50k+ employees)", label: "Extract AI Service", color: "orange", items: ["AI Service → dedicated Python FastAPI microservice", "Internal gRPC or HTTP communication", "Independent scaling of AI workloads", "Own cache (Redis) and rate limiting"] },
//               { phase: "Phase 3 (Scale trigger: multi-region)", label: "Extract Web3 Service", color: "blue", items: ["Web3 Service → dedicated Node.js microservice", "Message queue (Bull/Redis) for tx submission", "Retry logic + dead letter queue", "Separate monitoring for chain health"] },
//               { phase: "Phase 4 (Enterprise)", label: "Full Microservices", color: "violet", items: ["Auth Service (separate)", "Notification Service (email/push)", "Analytics Service (ClickHouse/BigQuery)", "API Gateway (Kong/AWS API Gateway)", "Service mesh (Istio) for inter-service mTLS"] },
//             ].map((p) => (
//               <Card key={p.phase} className="flex gap-4">
//                 <div className="w-36 flex-shrink-0">
//                   <div className={`text-xs font-bold uppercase tracking-wider ${p.color === "green" ? "text-green-400" : p.color === "orange" ? "text-orange-400" : p.color === "blue" ? "text-blue-400" : "text-violet-400"}`}>{p.phase}</div>
//                   <div className="text-xs text-white mt-1">{p.label}</div>
//                 </div>
//                 <ul className="space-y-1 flex-1">
//                   {p.items.map((item) => (
//                     <li key={item} className="flex gap-2 text-xs text-gray-400"><span className="text-gray-600">▸</span>{item}</li>
//                   ))}
//                 </ul>
//               </Card>
//             ))}
//           </div>
//         </Section>

//         <Section title="Deployment Architecture">
//           <CodeBlock language="Production Stack" code={`
// ┌─────────────────────────────────────────────────────┐
// │               PRODUCTION DEPLOYMENT                 │
// ├─────────────────────────────────────────────────────┤
// │                                                     │
// │  Frontend (Next.js)                                 │
// │  └── Vercel                                         │
// │      ├── Auto-scaling serverless functions          │
// │      ├── Edge network (100+ PoPs globally)          │
// │      ├── Preview deployments on every PR            │
// │      └── Environment: NEXT_PUBLIC_API_URL, etc.     │
// │                                                     │
// │  Backend (Express API)                              │
// │  └── Railway / Render / AWS ECS                     │
// │      ├── Docker container (node:20-alpine)          │
// │      ├── PM2 cluster mode (N = CPU cores)           │
// │      ├── Health check: GET /api/health              │
// │      └── Auto-restart on crash                      │
// │                                                     │
// │  Database                                           │
// │  └── Supabase (managed PostgreSQL)                  │
// │      ├── Automated daily backups                    │
// │      ├── Point-in-time recovery (PITR)              │
// │      └── Connection pooling via PgBouncer           │
// │                                                     │
// │  Cache                                              │
// │  └── Upstash Redis (serverless Redis)               │
// │      ├── AI result caching                          │
// │      ├── Auth nonce storage                         │
// │      └── Rate limit counters                        │
// │                                                     │
// │  Blockchain                                         │
// │  └── Alchemy / Infura (Ethereum RPC)                │
// │      ├── Primary + fallback RPC endpoints           │
// │      ├── Webhook for tx confirmation events         │
// │      └── Polygon PoS for low-cost production        │
// │                                                     │
// │  CI/CD                                              │
// │  └── GitHub Actions                                 │
// │      ├── Test → Lint → Build → Deploy               │
// │      ├── Supabase migrations on merge to main       │
// │      └── Hardhat contract tests before deploy       │
// │                                                     │
// └─────────────────────────────────────────────────────┘
// `} />
//         </Section>
//       </div>
//     </div>
//   );
// }
