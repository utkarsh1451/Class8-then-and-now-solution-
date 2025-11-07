import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UNITS, CHAPTER_1_CONTENT, CHAPTER_2_CONTENT, CHAPTER_3_CONTENT, CHAPTER_4_CONTENT, CHAPTER_5_CONTENT } from '../constants';
import type { Unit, Chapter, ContentSection, QuestionAnswer } from '../types';

interface SearchableItem {
  unit: Unit;
  chapter: Chapter;
  section: ContentSection;
  qa: QuestionAnswer;
}

interface SearchProps {
  onNavigate: (section: ContentSection, chapter: Chapter, unit: Unit) => void;
}

const Search: React.FC<SearchProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [isActive, setIsActive] = useState(false);

  const searchIndex = useMemo<SearchableItem[]>(() => {
    const allContent: { [key: string]: ContentSection[] } = {
      '1-1': CHAPTER_1_CONTENT,
      '1-2': CHAPTER_2_CONTENT,
      '1-3': CHAPTER_3_CONTENT,
      '1-4': CHAPTER_4_CONTENT,
      '1-5': CHAPTER_5_CONTENT,
    };
    const index: SearchableItem[] = [];
    UNITS.forEach(unit => {
      unit.chapters.forEach(chapter => {
        if (chapter.active) {
          const contentKey = `${unit.id}-${chapter.id}`;
          const chapterContent = allContent[contentKey];
          if (chapterContent) {
            chapterContent.forEach(section => {
              section.questions.forEach(qa => {
                index.push({ unit, chapter, section, qa });
              });
            });
          }
        }
      });
    });
    return index;
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = searchIndex.filter(item =>
      item.qa.q.toLowerCase().includes(lowerCaseQuery) ||
      item.qa.a.toLowerCase().includes(lowerCaseQuery) ||
      item.chapter.title.toLowerCase().includes(lowerCaseQuery)
    );
    setResults(filteredResults);
  }, [query, searchIndex]);

  const handleResultClick = (result: SearchableItem) => {
    onNavigate(result.section, result.chapter, result.unit);
    setQuery('');
    setResults([]);
    setIsActive(false);
  };
  
  const handleInputFocus = () => setIsActive(true);
  const handleInputBlur = () => {
    // Delay blur to allow click on results
    setTimeout(() => setIsActive(false), 150);
  };


  return (
    <motion.div 
        layout 
        className="relative max-w-2xl mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="🔍 Search any question or chapter…"
          className="w-full pl-5 pr-12 py-4 text-lg rounded-full text-white bg-slate-800/50 backdrop-blur-sm border border-white/10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all duration-300 shadow-[0_0_15px_rgba(70,130,250,0.1)]"
        />
      </div>

      <AnimatePresence>
        {(isActive && (query.length > 2 || results.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto p-2 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 z-10"
          >
            {results.length > 0 ? (
              results.map((result, index) => (
                <motion.button
                  key={`${result.unit.id}-${result.chapter.id}-${result.section.title}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <p className="font-medium text-white line-clamp-2">{result.qa.q}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {result.unit.title} &gt; Ch {result.chapter.id}: {result.chapter.title}
                  </p>
                </motion.button>
              ))
            ) : (
                query.length > 2 && (
                    <div className="p-4 text-center text-gray-400">
                        No results found for "{query}"
                    </div>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Search;
