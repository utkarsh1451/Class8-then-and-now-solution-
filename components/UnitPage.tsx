import React from 'react';
import { motion } from 'framer-motion';
import type { Unit, Chapter } from '../types';
import BackButton from './BackButton';

interface UnitPageProps {
  unit: Unit;
  onSelectChapter: (chapter: Chapter, unit: Unit) => void;
  onGoBack: () => void;
  onAskAi: (prompt: string) => void;
}

const ChapterCard: React.FC<{
  chapter: Chapter;
  unit: Unit;
  onSelectChapter: (chapter: Chapter, unit: Unit) => void;
  onAskAiClick: () => void;
}> = ({ chapter, unit, onSelectChapter, onAskAiClick }) => {

  return (
    <motion.div
      layout
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-md transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
      variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}
      whileHover={{ scale: 1.03 }}
    >
      <div
        onClick={() => onSelectChapter(chapter, unit)}
        className="cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-medium pr-4">{`${chapter.id}. ${chapter.title}`}</h3>
          <span className="text-2xl">{chapter.active ? '✅' : '🚧'}</span>
        </div>
        <p className="text-gray-400 text-base line-clamp-2">{chapter.summary}</p>
      </div>
      
      {chapter.active && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button onClick={onAskAiClick} aria-label="Ask AI" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors duration-200 hover:shadow-lg hover:shadow-pink-500/30">💬</button>
        </div>
      )}
    </motion.div>
  );
};


const UnitPage: React.FC<UnitPageProps> = ({ unit, onSelectChapter, onGoBack, onAskAi }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div>
      <BackButton onClick={onGoBack} />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          <span className="mr-4">{unit.icon}</span>
          {unit.title}
        </h1>
        <p className="text-gray-400">Select a chapter to begin.</p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {unit.chapters.map((chapter) => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            unit={unit}
            onSelectChapter={onSelectChapter}
            onAskAiClick={() => onAskAi(`Explain a key concept from the chapter "${chapter.title}".`)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default UnitPage;