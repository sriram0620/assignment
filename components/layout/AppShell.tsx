"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import Sidebar from "./Sidebar";
import DashboardPage from "@/components/dashboard/DashboardPage";
import EmployeesPage from "@/components/employees/EmployeesPage";
import TasksPage from "@/components/tasks/TasksPage";
import AIPage from "@/components/ai/AIPage";


export type NavPage = "dashboard" | "employees" | "tasks" | "ai";

export default function AppShell() {
  const { user, theme } = useAppStore();

  // Apply theme class to <html> globally — affects all pages
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex" data-theme={theme}>
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Pages are rendered via Next.js routing (layout children) */}
      </main>
    </div>
  );
}

