import React from 'react';
import { motion } from 'framer-motion';
import type { Unit, Chapter, ContentSection } from '../types';
import Search from './Search';

interface HomePageProps {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
  onNavigateToSection: (section: ContentSection, chapter: Chapter, unit: Unit) => void;
}

const HomePage: React.FC<HomePageProps> = ({ units, onSelectUnit, onNavigateToSection }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="text-center">
      <motion.h1
        className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Class 8 – Then and Now
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl text-gray-300 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Select a unit or search for a topic to begin.
      </motion.p>
      
      <Search onNavigate={onNavigateToSection} />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {units.map((unit) => (
          <motion.button
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg overflow-hidden transition-all duration-300 hover:bg-white/20 hover:shadow-2xl hover:-translate-y-1"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <span className="text-5xl">{unit.icon}</span>
              <h2 className="text-2xl font-semibold text-white">{unit.title}</h2>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default HomePage;
