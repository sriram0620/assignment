"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Check } from "lucide-react"
import Image from "next/image"
export function FeatureSection() {

  const [ref1, inView1] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [ref2, inView2] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [ref3, inView3] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })
 
  const [ref4, inView4] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8,
      },
    },
  }

  // const staggerContainer = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.2,
  //     },
  //   },
  // }

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/5 rounded-full"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref1}
          variants={fadeInUp}
          initial="hidden"
          animate={inView1 ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-block px-4 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView1 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            AI-Powered HRMS
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Everything HR, Under{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              One Roof.
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From onboarding to offboarding — manage your entire workforce effortlessly. Let AI handle the complexity while
            you focus on your people. 60% less admin work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            ref={ref2}
            variants={fadeInUp}
            initial="hidden"
            animate={inView2 ? "visible" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Department</span>
                <div className="ml-2 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                  Engineering
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Status</span>
                <div className="ml-2 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                  Active
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Role</span>
                <div className="ml-2 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                  Senior Engineer
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Smart Employee
              <br />
              Directory & Profiles
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access a 360° view of every employee — from personal details and documents to role history, skills, and
              performance. Search and filter across your entire workforce instantly.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Centralised employee records</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Document & contract management</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Role &amp; department tracking</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={ref3}
            variants={fadeInUp}
            initial="hidden"
            animate={inView3 ? "visible" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  Automated Payroll
                  <br />
                  with Zero Errors
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Payroll Accuracy</span>
                      <span className="text-sm font-medium text-violet-600 dark:text-violet-400">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={inView3 ? { width: "99.8%" } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Auto Tax & Deductions</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Payslip Generation</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Statutory Compliance</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              Process payroll in minutes, not days. HRMS automates salary calculations, tax deductions, and statutory
              compliance so your team gets paid accurately and on time — every time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Leave & Attendance Management</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Track attendance, manage leave requests and approvals, and monitor shift schedules — all in real time.
              Biometric and geo-tagged check-in support included.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                  A
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Ananya Rao • Software Engineer
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Leave balance: 12 days remaining</div>
                </div>
              </div>

              <motion.div
                className="ml-11 border-l-2 border-gray-300 dark:border-gray-600 pl-4 space-y-3"
                initial={{ height: 0, opacity: 0 }}
                animate={inView3 ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Sick Leave → Approved ✓</div>
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Annual Leave → Pending Manager Review</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            ref={ref4}
            initial={{ opacity: 0, y: 60 }}
            animate={inView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Performance &
              <br />
              Goal Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Set OKRs, run 360° reviews, and track employee progress continuously. Identify high performers and coach
              employees who need support — all from one dashboard.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">Q1 PERFORMANCE REVIEW</div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <Image src="/placeholder.svg" alt="Profile" className="h-full w-full object-cover" width={40} height={40} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Rohan Mehta • Product Manager</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Goal completion: 87% · Rating: Exceeds Expectations</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

