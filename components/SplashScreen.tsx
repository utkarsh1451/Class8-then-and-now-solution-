import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 120 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-6xl md:text-8xl">📘</div>
        <h1 className="text-4xl md:text-6xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Class 8 – Then and Now
        </h1>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;