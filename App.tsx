import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UNITS, CHAPTER_1_CONTENT, CHAPTER_2_CONTENT, CHAPTER_3_CONTENT, CHAPTER_4_CONTENT, CHAPTER_5_CONTENT } from './constants';
import type { Unit, Chapter, ContentSection, UserInfo, DownloadedFile } from './types';
import SplashScreen from './components/SplashScreen';
import HomePage from './components/HomePage';
import UnitPage from './components/UnitPage';
import ChapterPage from './components/ChapterPage';
import ComingSoonPage from './components/ComingSoonPage';
import Footer from './components/Footer';
import ScrollToTopButton from './components/ScrollToTopButton';
import SectionPage from './components/SectionPage';
import FloatingAIChat from './components/FloatingAIChat';
import OnboardingModal from './components/OnboardingModal';
import MeSidebar from './components/MeSidebar';
import useLocalStorage from './hooks/useLocalStorage';

type View =
  | { name: 'home' }
  | { name: 'unit'; unit: Unit }
  | { name: 'chapter'; chapter: Chapter; unit: Unit }
  | { name: 'section'; section: ContentSection; chapter: Chapter; unit: Unit }
  | { name: 'comingSoon'; chapter: Chapter; unit: Unit };

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>({ name: 'home' });
  const [userInfo, setUserInfo] = useLocalStorage<UserInfo | null>('userInfo', null);
  const [downloads, setDownloads] = useLocalStorage<DownloadedFile[]>('downloads', []);
  const [isMeSidebarOpen, setIsMeSidebarOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const playClickSound = () => {
    if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
        } else {
            console.warn("Web Audio API is not supported in this browser.");
            return;
        }
    }
    
    const audioCtx = audioCtxRef.current;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.05);
  };
  
  const handleSaveUserInfo = (info: UserInfo) => {
    setUserInfo(info);
  };

  const handleAddDownload = (chapter: Chapter, unit: Unit) => {
    const newDownload: DownloadedFile = {
      id: `u${unit.id}-c${chapter.id}`,
      name: `Chapter ${chapter.id} - ${chapter.title}`,
      unitTitle: unit.title,
      timestamp: Date.now(),
    };
    if (!downloads.find(d => d.id === newDownload.id)) {
      setDownloads([...downloads, newDownload]);
    }
  };

  const handleDeleteDownload = (downloadId: string) => {
    setDownloads(downloads.filter(d => d.id !== downloadId));
  };

  const handleSelectUnit = (unit: Unit) => {
    playClickSound();
    setView({ name: 'unit', unit });
  };

  const handleSelectChapter = (chapter: Chapter, unit: Unit) => {
    playClickSound();
    if (chapter.active) {
      setView({ name: 'chapter', chapter, unit });
    } else {
      setView({ name: 'comingSoon', chapter, unit });
    }
  };

  const handleSelectSection = (section: ContentSection, chapter: Chapter, unit: Unit) => {
    playClickSound();
    setView({ name: 'section', section, chapter, unit });
  };
  
  const openAiChat = (prompt: string = '') => {
    playClickSound();
    setAiInitialPrompt(prompt);
    setIsAiChatOpen(true);
  };

  const goBack = () => {
    playClickSound();
    if (view.name === 'section') {
      setView({ name: 'chapter', chapter: view.chapter, unit: view.unit });
    } else if (view.name === 'chapter' || view.name === 'comingSoon') {
      setView({ name: 'unit', unit: view.unit });
    } else if (view.name === 'unit') {
      setView({ name: 'home' });
    }
  };
  
  const goToHome = () => {
    playClickSound();
    setView({ name: 'home' });
  };

  const getChapterContent = useCallback((unitId: number, chapterId: number): ContentSection[] => {
    if (unitId === 1) { // Resources and Development
      switch (chapterId) {
        case 1: return CHAPTER_1_CONTENT;
        case 2: return CHAPTER_2_CONTENT;
        case 3: return CHAPTER_3_CONTENT;
        case 4: return CHAPTER_4_CONTENT;
        case 5: return CHAPTER_5_CONTENT;
        default: return [];
      }
    }
    return [];
  }, []);

  const renderContent = () => {
    switch (view.name) {
      case 'home':
        return <HomePage units={UNITS} onSelectUnit={handleSelectUnit} onNavigateToSection={handleSelectSection} />;
      case 'unit':
        return <UnitPage unit={view.unit} onSelectChapter={handleSelectChapter} onGoBack={goBack} onAskAi={openAiChat} />;
      case 'chapter':
        return <ChapterPage chapter={view.chapter} unit={view.unit} content={getChapterContent(view.unit.id, view.chapter.id)} onSelectSection={handleSelectSection} onGoBack={goBack} onAddDownload={handleAddDownload} />;
      case 'section':
        return <SectionPage section={view.section} onGoBack={goBack} />;
      case 'comingSoon':
        return <ComingSoonPage onGoBack={goBack} />;
      default:
        return <HomePage units={UNITS} onSelectUnit={handleSelectUnit} onNavigateToSection={handleSelectSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter selection:bg-blue-500/30 text-lg">
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
            {!userInfo && <OnboardingModal onSave={handleSaveUserInfo} />}
            <header className="fixed top-0 left-0 right-0 z-40 p-4">
              <div className="container mx-auto flex justify-between items-center">
                 <motion.button
                    onClick={() => { playClickSound(); setIsMeSidebarOpen(true); }}
                    className="px-4 py-2 text-sm md:text-base md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(147, 197, 253, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    👤 Me
                  </motion.button>
                <motion.button
                    onClick={() => openAiChat()}
                    className="px-4 py-2 text-sm md:text-base md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold shadow-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(196, 181, 253, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    Having a doubt? Ask AI 💬
                </motion.button>
              </div>
            </header>
            
            <MeSidebar 
              isOpen={isMeSidebarOpen} 
              onClose={() => setIsMeSidebarOpen(false)} 
              userInfo={userInfo} 
              downloads={downloads}
              onDelete={handleDeleteDownload}
            />

            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 pt-24 md:pt-32">
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
      {!loading && <ScrollToTopButton playClickSound={playClickSound} />}
      <FloatingAIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} playClickSound={playClickSound} initialPrompt={aiInitialPrompt} />
    </div>
  );
};

export default App;