"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"

const brands = [
  { name: "Infosys", logo: "IN" },
  { name: "Wipro", logo: "WP" },
  { name: "TCS", logo: "TC" },
  { name: "Deloitte", logo: "DL" },
  { name: "Accenture", logo: "AC" },
  { name: "IBM", logo: "IB" },
  { name: "Cognizant", logo: "CG" },
  { name: "HCL Tech", logo: "HC" },
  { name: "Capgemini", logo: "CP" },
  { name: "Tech Mahindra", logo: "TM" },
]

export function BrandCarousel() {
  useTheme()

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex space-x-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {/* First set of logos */}
        {brands.map((brand, index) => (
          <div
            key={`brand-1-${index}`}
            className="flex items-center justify-center min-w-[120px] h-10 glass-card rounded-md px-4 py-2 hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {brand.logo}
              </div>
              <span className="text-white text-sm font-medium">{brand.name}</span>
            </div>
          </div>
        ))}

        {/* Duplicate set for seamless looping */}
        {brands.map((brand, index) => (
          <div
            key={`brand-2-${index}`}
            className="flex items-center justify-center min-w-[120px] h-10 glass-card rounded-md px-4 py-2 hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {brand.logo}
              </div>
              <span className="text-white text-sm font-medium">{brand.name}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

