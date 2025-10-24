"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/nav"
import Link from "next/link"
import AnimatedBackground from "@/components/animated-background"

const colors = {
  primary: "#2D1B69", // Deep purple-blue
  secondary: "#FFD700", // Gold
  card: "#FFFFFF",
  cardForeground: "#1F1F1F",
  foreground: "#FFFFFF",
  foregroundMuted: "rgba(255, 255, 255, 0.8)",
}

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: colors.primary }}>
      <AnimatedBackground />
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative z-10">
        <motion.div
          className="max-w-3xl text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-balance"
              style={{ color: colors.foreground }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Turn Your PDFs Into{" "}
              <motion.span
                className="inline-block"
                style={{ color: colors.secondary }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Interactive Quizzes
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl text-balance"
              style={{ color: colors.foregroundMuted }}
              variants={itemVariants}
            >
              Upload any PDF and instantly create engaging quizzes. Perfect for students, educators, and teams.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center pt-4" variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href="/quizify"
                className="px-8 py-3 font-semibold rounded-lg hover:opacity-90 transition-opacity block"
                style={{ backgroundColor: colors.secondary, color: colors.primary }}
              >
                Get Started
              </Link>
            </motion.div>
            <motion.button
              className="px-8 py-3 border-2 font-semibold rounded-lg transition-colors"
              style={{ borderColor: colors.foreground, color: colors.foreground }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <motion.section
        className="px-4 py-20 relative z-10 backdrop-blur-sm"
        style={{ backgroundColor: `${colors.primary}CC` }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            style={{ color: colors.foreground }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Why Choose Quizify?
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            viewport={{ once: true }}
          >
            {/* Feature 1 */}
            <motion.div
              className="rounded-lg p-8 text-center space-y-4 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: colors.card }}
              variants={featureVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${colors.secondary}33` }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.secondary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold" style={{ color: colors.cardForeground }}>
                Lightning Fast
              </h3>
              <p style={{ color: `${colors.cardForeground}B3` }}>
                Create quizzes in seconds, not hours. Our AI-powered system extracts content instantly.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="rounded-lg p-8 text-center space-y-4 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: colors.card }}
              variants={featureVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${colors.secondary}33` }}
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.secondary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold" style={{ color: colors.cardForeground }}>
                Fully Customizable
              </h3>
              <p style={{ color: `${colors.cardForeground}B3` }}>
                Edit questions, add images, and adjust difficulty levels to match your needs.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="rounded-lg p-8 text-center space-y-4 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: colors.card }}
              variants={featureVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${colors.secondary}33` }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <svg
                  className="w-8 h-8"
                  style={{ color: colors.secondary }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold" style={{ color: colors.cardForeground }}>
                Multiplayer Mode
              </h3>
              <p style={{ color: `${colors.cardForeground}B3` }}>
                Challenge friends and compete in real-time. Track scores and climb the leaderboard.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer CTA */}
      <motion.section
        className="px-4 py-16 relative z-10"
        style={{ backgroundColor: colors.primary }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.h2
            className="text-3xl font-bold"
            style={{ color: colors.foreground }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            className="text-lg"
            style={{ color: colors.foregroundMuted }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Upload your first PDF and create an interactive quiz in minutes.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link
              href="/upload"
              className="inline-block px-8 py-3 font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.secondary, color: colors.primary }}
            >
              Start Creating
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
