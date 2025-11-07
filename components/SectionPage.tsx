import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import type { ContentSection, QuestionAnswer } from '../types';
import BackButton from './BackButton';

const QACard: React.FC<{ qa: QuestionAnswer; sectionTitle: string }> = ({ qa, sectionTitle }) => {
  const isFillInBlanks = sectionTitle.startsWith('F. Fill in the Blanks');
  const isMultipleChoice = sectionTitle.startsWith('H. Choose the Correct Option');

  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (isTranslating) return;

    // If we already have the translation, just toggle
    if (translatedText) {
      setIsTranslated(!isTranslated);
      return;
    }

    setIsTranslating(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `Translate the following English text into simple, conversational Hinglish (a mix of Hindi and English) suitable for a Class 8 student. Do not add any extra explanations or introductory phrases, just provide the direct translation.\n\nEnglish Text:\n"""\n${qa.a}\n"""\n\nHinglish Translation:`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const translation = response.text;
      setTranslatedText(translation);
      setIsTranslated(true);
    } catch (err) {
      console.error("Translation failed:", err);
      setError("Translation failed. Please try again.");
      setTimeout(() => setError(null), 3000); // Hide error after 3 seconds
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="group p-4 rounded-lg bg-white/5 border border-white/10 mb-3 last:mb-0">
      <p className="font-semibold text-white mb-2 text-xl">{qa.q}</p>
      {qa.isTable && qa.table && (
        <div className="my-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {qa.table.headers.map((header, i) => (
                  <th key={i} className="border-b-2 border-white/20 p-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {qa.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-white/10 p-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="relative text-gray-300 whitespace-pre-wrap">
        {isFillInBlanks ? (
            <>
                {qa.q.split('____')[0]}
                <span className="font-bold text-blue-300 underline decoration-dotted mx-1">{qa.a}</span>
                {qa.q.split('____')[1] || ''}
            </>
        ) : isMultipleChoice ? (
            qa.a.split('\n').map((line, i) => <div key={i}>✅ {line}</div>)
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={isTranslated ? 'hinglish' : 'english'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {isTranslated ? translatedText : qa.a}
            </motion.div>
          </AnimatePresence>
        )}
        
        {!isFillInBlanks && !isMultipleChoice && qa.a && (
          <button 
            onClick={handleTranslate} 
            disabled={isTranslating}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-white/20 hover:scale-110 disabled:opacity-50 flex items-center justify-center"
            aria-label="Translate answer"
            title="Translate to Hinglish"
          >
            {isTranslating ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="text-sm">🌐</span>
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && 
          <motion.p 
            className="text-red-400 text-xs mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        }
      </AnimatePresence>
    </div>
  );
};

interface SectionPageProps {
  section: ContentSection;
  onGoBack: () => void;
}

const SectionPage: React.FC<SectionPageProps> = ({ section, onGoBack }) => {
  // We handle the question part of fill in the blanks inside the QACard
  const filteredQuestions = section.title.startsWith('F. Fill in the Blanks') 
    ? section.questions.map(q => ({...q, q: q.q.split('.')[0] + '.'})) 
    : section.questions;

  return (
    <div>
      <BackButton onClick={onGoBack} text="Back to Chapter" />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-2">
          {section.title}
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        {filteredQuestions.map((qa, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <QACard qa={qa} sectionTitle={section.title} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SectionPage;
