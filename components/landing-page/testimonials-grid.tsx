"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Star } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import Image from "next/image"

const testimonials = [
  {
    name: "Riya S.",
    company: "TechCorp India",
    quote: "HRMS transformed our HR operations completely. Love it!",
    stats: [
      { label: "Admin Time Saved", value: "60%" },
      { label: "Payroll Processing", value: "TechCorp" },
    ],
  },
  {
    name: "Arjun M.",
    company: "Infosys BPM",
    quote:
      "The platform accurately tracks attendance, leave, and payroll — saving our HR team hours every single week.",
    stats: [
      { label: "Payroll Accuracy", value: "99%" },
      { label: "HR Automation", value: "Infosys" },
    ],
  },
  {
    name: "Sneha R.",
    company: "Wipro HR",
    quote: "Onboarding new employees used to take days. With HRMS, it's done in hours.",
    stats: [
      { label: "New Joiners Onboarded", value: "+200" },
      { label: "in under 48 hours", value: "Wipro" },
    ],
  },
  {
    name: "Deepak K.",
    company: "Deloitte India",
    quote: "HRMS gives us a real-time pulse of our workforce. Indispensable for every CHRO.",
    stats: [],
  },
  {
    name: "Meera Joshi",
    company: "CHRO",
    quote:
      "The automation of payroll and compliance has saved us enormous time and eliminated costly errors across all departments.",
    stats: [
      { label: "Compliance Errors", value: "0%" },
      { label: "Payroll Automation", value: "Accenture" },
    ],
  },
  {
    name: "Karan B.",
    company: "HCL Tech",
    quote: "A must-have HRMS for any fast-growing organisation",
    stats: [
      { label: "Employees Managed", value: "+500" },
      { label: "Attrition Reduced", value: "-30%" },
    ],
  },
  {
    name: "Pooja T.",
    company: "Cognizant",
    quote: "I would never want to go back to spreadsheet-based HR management.",
    stats: [],
  },
]

export function TestimonialsGrid() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const { } = useTheme()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Function to determine card background color
  const getCardBg = (index: number) => {
    if (index % 2 === 0) {
      return "bg-violet-50 dark:bg-gray-800"
    } else {
      return "bg-white dark:bg-gray-800"
    }
  }

  return (
    <section ref={ref} className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
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
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            HR Teams Delivering Real Results
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Real stories from People teams achieving more with HRMS HRMS.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.slice(0, 8).map((testimonial, index) => (
            <motion.div
              key={index}
              variants={item}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.1), 0 10px 10px -5px rgba(124, 58, 237, 0.05)",
                transition: { duration: 0.3 },
              }}
              className={`${getCardBg(index)} rounded-xl p-6 shadow-sm transition-all duration-300 cursor-pointer ${
                index % 2 === 0 ? "even-card" : "odd-card"
              } relative overflow-hidden`}
            >
              {/* Animated background effect on hover */}
              {hoveredCard === index && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <div className="flex items-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-violet-500 text-violet-500 dark:fill-violet-400 dark:text-violet-400"
                  />
                ))}
              </div>

              {testimonial.stats.length > 0 && testimonial.stats[0].value.includes("%") && (
                <div className="mb-4 relative z-10">
                  <motion.div
                    className="text-5xl font-bold text-violet-600 dark:text-violet-400"
                    animate={hoveredCard === index ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {testimonial.stats[0].value}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.stats[0].label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">{testimonial.stats[1]?.label}</div>
                  <div className="text-sm text-violet-500 dark:text-violet-400 font-medium">
                    {testimonial.stats[1]?.value}
                  </div>
                </div>
              )}

              {testimonial.stats.length > 0 && testimonial.stats[0].value.startsWith("+") && (
                <div className="mb-4 relative z-10">
                  <motion.div
                    className="text-5xl font-bold text-violet-600 dark:text-violet-400"
                    animate={hoveredCard === index ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {testimonial.stats[0].value}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.stats[0].label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">{testimonial.stats[1]?.label}</div>
                  <div className="text-sm text-violet-500 dark:text-violet-400 font-medium">
                    {testimonial.stats[1]?.value}
                  </div>
                </div>
              )}

              {(!testimonial.stats.length ||
                (!testimonial.stats[0].value.includes("%") && !testimonial.stats[0].value.startsWith("+"))) && (
                <blockquote className="text-gray-800 dark:text-gray-200 font-medium mb-4 relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
              )}

              <div className="flex items-center mt-auto relative z-10">
                {testimonial.name && (
                  <div className="flex items-center">
                    {index % 2 === 0 && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-3 relative">
                        <Image
                          src="/placeholder.svg"
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="object-cover"
                          priority={index < 4} // Prioritize loading for first 4 images
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                )}
              </div>

              {testimonial.stats.length > 0 &&
                (testimonial.stats[0].value.includes("%") || testimonial.stats[0].value.startsWith("+")) && (
                  <blockquote className="text-gray-800 dark:text-gray-200 font-medium mt-4 relative z-10">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

