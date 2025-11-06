import React from 'react';
import { motion } from 'framer-motion';
import type { Unit, Chapter } from '../types';
import BackButton from './BackButton';

interface UnitPageProps {
  unit: Unit;
  onSelectChapter: (chapter: Chapter, unit: Unit) => void;
  onGoBack: () => void;
}

const UnitPage: React.FC<UnitPageProps> = ({ unit, onSelectChapter, onGoBack }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <div>
      <BackButton onClick={onGoBack} />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          <span className="mr-4">{unit.icon}</span>
          {unit.title}
        </h1>
        <p className="text-gray-400">Select a chapter to continue.</p>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {unit.chapters.map((chapter) => (
          <motion.div
            key={chapter.id}
            onClick={() => onSelectChapter(chapter, unit)}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-md cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium pr-4">{`${chapter.id}. ${chapter.title}`}</h3>
              <span className="text-2xl">{chapter.active ? '✅' : '🚧'}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UnitPage;
