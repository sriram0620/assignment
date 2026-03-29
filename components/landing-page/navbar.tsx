"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isDark, setIsDark] = useState(true)

  // Read persisted theme (same key as Zustand store)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hrms-store")
      if (stored) {
        const parsed = JSON.parse(stored)
        const dark = parsed?.state?.theme !== "light"
        setIsDark(dark)
        document.documentElement.classList.remove("dark", "light")
        document.documentElement.classList.add(dark ? "dark" : "light")
      }
    } catch { }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
      const headerHeight =
        document.querySelector(".bg-gradient-to-r.from-rose-500")?.getBoundingClientRect().height || 0
      setIsHeaderVisible(window.scrollY < headerHeight - 100)
      const sections = document.querySelectorAll("section[id]")
      let currentSection = "home"
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        if (window.scrollY >= sectionTop - 100) currentSection = section.id
      })
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    // Persist into the same Zustand localStorage key
    try {
      const stored = localStorage.getItem("hrms-store")
      const parsed = stored ? JSON.parse(stored) : { state: {} }
      parsed.state = { ...(parsed.state ?? {}), theme: next ? "dark" : "light" }
      localStorage.setItem("hrms-store", JSON.stringify(parsed))
    } catch { }
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(next ? "dark" : "light")
    document.body.style.backgroundColor = next ? "#080d1a" : "#f0f4f8"
    document.body.style.color = next ? "#f9fafb" : "#1a202c"
  }

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Modules", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ]

  const getNavbarBackground = () => {
    if (!isScrolled) return "bg-transparent"
    return isHeaderVisible
      ? "bg-gradient-to-r from-rose-500 via-violet-500 to-blue-500 shadow-md"
      : "bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 shadow-md"
  }

  const getMobileMenuBackground = () =>
    isHeaderVisible
      ? "bg-gradient-to-r from-rose-500 via-violet-500 to-blue-500"
      : "bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500"

  // Toggle pill adapts to scrolled (coloured) vs transparent navbar
  const toggleClass = isScrolled
    ? "bg-white/20 hover:bg-white/30 border border-white/30 text-white"
    : isDark
      ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
      : "bg-black/10 hover:bg-black/15 border border-black/10 text-gray-800"

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("fixed top-0 w-full z-50 transition-all duration-500 ease-in-out", getNavbarBackground())}
    >
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">

        {/* Logo */}
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-8 h-8 mr-2 bg-white rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.4" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">HRMS</span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative hover:text-opacity-80 transition-colors py-2 text-white font-medium"
            >
              {item.name}
              {activeSection === item.name.toLowerCase() && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-white"
                />
              )}
            </Link>
          ))}

          <Link href="/login" className="text-white hover:text-opacity-80 transition-colors font-medium">
            Login
          </Link>

          {/* ── Theme toggle pill ──────────────────────────────────────── */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${toggleClass}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  {/* Sun */}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                  Light
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-1.5"
                >
                  {/* Moon */}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          {/* ── /Theme toggle ──────────────────────────────────────────── */}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-white text-violet-600 hover:bg-white/90 hover:text-violet-700 px-6 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg h-auto">
              Get Free Demo
            </Button>
          </motion.div>
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${toggleClass}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.button>

          <motion.button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.9 }}>
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden shadow-lg overflow-hidden ${getMobileMenuBackground()}`}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn("text-white hover:text-white/80 transition-colors py-2", activeSection === item.name.toLowerCase() ? "font-medium" : "")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link href="/login" className="text-white hover:text-white/80 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Button
                className="bg-white text-violet-600 hover:bg-white/90 hover:text-violet-700 px-6 py-3 rounded-full font-medium transition-all duration-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Free Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
