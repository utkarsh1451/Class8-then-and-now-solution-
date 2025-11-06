import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UNITS, CHAPTER_1_CONTENT } from './constants';
import type { Unit, Chapter, ContentSection } from './types';
import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import UnitPage from './components/UnitPage';
import ChapterPage from './components/ChapterPage';
import ComingSoonPage from './components/ComingSoonPage';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import SectionPage from './components/SectionPage';

type View =
  | { name: 'home' }
  | { name: 'unit'; unit: Unit }
  | { name: 'chapter'; chapter: Chapter; unit: Unit }
  | { name: 'section'; section: ContentSection; chapter: Chapter; unit: Unit }
  | { name: 'comingSoon'; chapter: Chapter; unit: Unit };

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>({ name: 'home' });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectUnit = (unit: Unit) => {
    setView({ name: 'unit', unit });
  };

  const handleSelectChapter = (chapter: Chapter, unit: Unit) => {
    if (chapter.active) {
      setView({ name: 'chapter', chapter, unit });
    } else {
      setView({ name: 'comingSoon', chapter, unit });
    }
  };

  const handleSelectSection = (section: ContentSection, chapter: Chapter, unit: Unit) => {
    setView({ name: 'section', section, chapter, unit });
  };

  const goBack = () => {
    if (view.name === 'section') {
      setView({ name: 'chapter', chapter: view.chapter, unit: view.unit });
    } else if (view.name === 'chapter' || view.name === 'comingSoon') {
      setView({ name: 'unit', unit: view.unit });
    } else if (view.name === 'unit') {
      setView({ name: 'home' });
    }
  };
  
  const goToHome = () => {
    setView({ name: 'home' });
  };


  const renderContent = () => {
    switch (view.name) {
      case 'home':
        return <HomePage units={UNITS} onSelectUnit={handleSelectUnit} />;
      case 'unit':
        return <UnitPage unit={view.unit} onSelectChapter={handleSelectChapter} onGoBack={goBack} />;
      case 'chapter':
        return <ChapterPage chapter={view.chapter} unit={view.unit} content={CHAPTER_1_CONTENT} onSelectSection={handleSelectSection} onGoBack={goBack} />;
      case 'section':
        return <SectionPage section={view.section} onGoBack={goBack} />;
      case 'comingSoon':
        return <ComingSoonPage onGoBack={goBack} />;
      default:
        return <HomePage units={UNITS} onSelectUnit={handleSelectUnit} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter selection:bg-blue-500/30">
      <div className="fixed inset-0 -z-10 h-full w-full bg-slate-950">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3e3e8f,transparent)]"></div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="splash">
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view.name + (view.name === 'unit' ? view.unit.id : '') + (view.name === 'chapter' ? view.chapter.id : '') + (view.name === 'section' ? view.section.title : '')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && <ScrollToTopButton />}
    </div>
  );
};

export default App;
