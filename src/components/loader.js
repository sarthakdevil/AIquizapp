"use client";
// components/LoadingSpinner.js
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      repeat: Infinity,
      duration: 1,
      ease: "linear",
    }}
    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
  />
);

export default LoadingSpinner;
