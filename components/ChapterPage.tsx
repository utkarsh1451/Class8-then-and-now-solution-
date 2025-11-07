import React from 'react';
import { motion } from 'framer-motion';
import type { Chapter, ContentSection, Unit } from '../types';
import BackButton from './BackButton';
import FloatingToolbar from './FloatingToolbar';

interface ChapterPageProps {
  chapter: Chapter;
  unit: Unit;
  content: ContentSection[];
  onGoBack: () => void;
  onSelectSection: (section: ContentSection, chapter: Chapter, unit: Unit) => void;
  onAddDownload: (chapter: Chapter, unit: Unit) => void;
}

const ChapterPage: React.FC<ChapterPageProps> = ({ chapter, unit, content, onGoBack, onSelectSection, onAddDownload }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div>
      <BackButton onClick={onGoBack} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          {`Chapter ${chapter.id}: ${chapter.title}`}
        </h1>
        <p className="text-gray-400">Select a section to view its content.</p>
      </div>
      <motion.div
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {content.map((section, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectSection(section, chapter, unit)}
            className="w-full p-4 mb-4 text-left flex justify-between items-center rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-colors duration-200"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <motion.div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.button>
        ))}
      </motion.div>
      <FloatingToolbar chapter={chapter} unit={unit} content={content} onAddDownload={onAddDownload} />
    </div>
  );
};

export default ChapterPage;