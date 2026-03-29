"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Button } from "@/components/ui/button"
import { BarChart2, LineChartIcon, PieChartIcon, RadarIcon } from "lucide-react"
import { useTheme } from "next-themes"

// HRMS workforce analytics data
const monthlyData = [
  {
    name: "Jan",
    headcount: 420,
    newJoins: 18,
    exits: 8,
    onLeave: 32,
    attritionRate: 1.9,
    engagementScore: 76,
  },
  {
    name: "Feb",
    headcount: 430,
    newJoins: 22,
    exits: 12,
    onLeave: 28,
    attritionRate: 2.8,
    engagementScore: 78,
  },
  {
    name: "Mar",
    headcount: 440,
    newJoins: 25,
    exits: 15,
    onLeave: 35,
    attritionRate: 3.4,
    engagementScore: 80,
  },
  {
    name: "Apr",
    headcount: 450,
    newJoins: 30,
    exits: 20,
    onLeave: 40,
    attritionRate: 4.4,
    engagementScore: 75,
  },
  {
    name: "May",
    headcount: 460,
    newJoins: 28,
    exits: 18,
    onLeave: 38,
    attritionRate: 3.9,
    engagementScore: 79,
  },
  {
    name: "Jun",
    headcount: 470,
    newJoins: 24,
    exits: 14,
    onLeave: 42,
    attritionRate: 3.0,
    engagementScore: 82,
  },
  {
    name: "Jul",
    headcount: 480,
    newJoins: 20,
    exits: 10,
    onLeave: 30,
    attritionRate: 2.1,
    engagementScore: 85,
  },
]

const pieData = [
  { name: "Active", value: 420, color: "#7c3aed" },
  { name: "On Leave", value: 38, color: "#4f46e5" },
  { name: "New Joiners", value: 24, color: "#8b5cf6" },
  { name: "Exited", value: 18, color: "#10b981" },
]

const radarData = [
  { subject: "Attrition Control", A: 82, B: 68, fullMark: 100 },
  { subject: "Employee Engagement", A: 85, B: 72, fullMark: 100 },
  { subject: "Payroll Accuracy", A: 98, B: 88, fullMark: 100 },
  { subject: "Leave Compliance", A: 79, B: 70, fullMark: 100 },
  { subject: "Onboarding Speed", A: 88, B: 75, fullMark: 100 },
  { subject: "Performance Coverage", A: 91, B: 80, fullMark: 100 },
]

type ChartType = "line" | "bar" | "pie" | "radar"

export function InsightsSection() {
  const [chartType, setChartType] = useState<ChartType>("line")
  const { theme } = useTheme()

  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [chartRef, chartInView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  })

  const [statsRef, statsInView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  })

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <YAxis axisLine={false} tickLine={false} stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="headcount"
                stroke="#7c3aed"
                fillOpacity={1}
                fill="url(#colorResponses)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="newJoins"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorCandidates)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="onLeave"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="exits"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                stroke={theme === "dark" ? "#9ca3af" : "#6b7280"}
              />
              <YAxis axisLine={false} tickLine={false} stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                }}
              />
              <Legend />
              <Bar dataKey="headcount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newJoins" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="onLeave" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="exits" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "radar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke={theme === "dark" ? "#374151" : "#e5e7eb"} />
              <PolarAngleAxis dataKey="subject" stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={theme === "dark" ? "#9ca3af" : "#6b7280"} />
              <Radar name="With HRMS" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.6} />
              <Radar name="Industry Avg" dataKey="B" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <section ref={ref} className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full filter blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full filter blur-[80px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.8,
          }}
          className="max-w-4xl mx-auto mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Data-Driven HR Analytics
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Track & Optimise Your Workforce
            <br />
            with Actionable Insights.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Monitor headcount, attrition, leave trends, payroll costs, and engagement scores — all in real time. Make
            confident people decisions backed by live workforce data.
          </p>
        </motion.div>

        <motion.div
          ref={chartRef}
          initial={{ opacity: 0, y: 50 }}
          animate={chartInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.8,
            delay: 0.2,
          }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 max-w-5xl mx-auto premium-shadow"
        >
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Workforce Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 months</p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <div className="bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg flex">
                  <Button
                    variant={chartType === "line" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={`rounded-md ${chartType === "line" ? "bg-violet-600 hover:bg-violet-700 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <LineChartIcon size={16} />
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className={`rounded-md ${chartType === "bar" ? "bg-violet-600 hover:bg-violet-700 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <BarChart2 size={16} />
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className={`rounded-md ${chartType === "pie" ? "bg-violet-600 hover:bg-violet-700 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <PieChartIcon size={16} />
                  </Button>
                  <Button
                    variant={chartType === "radar" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType("radar")}
                    className={`rounded-md ${chartType === "radar" ? "bg-violet-600 hover:bg-violet-700 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"}`}
                  >
                    <RadarIcon size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-80 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={chartType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderChart()}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          >
            {[
              { label: "Attrition Rate", value: "3.2%", color: "bg-gradient-to-r from-violet-500 to-violet-600" },
              { label: "Avg Employee Tenure", value: "3.8 yrs", color: "bg-gradient-to-r from-indigo-600 to-indigo-700" },
              { label: "Time-to-Onboard", value: "4 days", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
              { label: "Engagement Score", value: "84%", color: "bg-gradient-to-r from-emerald-500 to-emerald-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white dark:bg-gray-700 p-4 rounded-lg hover:border-violet-500/20 transition-all duration-300 shadow-sm"
              >
                <div className={`h-2 w-16 ${stat.color} rounded-full mb-3`}></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

