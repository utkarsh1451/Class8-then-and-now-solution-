import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import type { Unit } from '../types';

interface AIAssistantProps {
  unit: Unit;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ unit }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `You are an expert Social Studies (SST) teacher for Class 8 students in India. Your name is 'Professor Gyan'. Explain concepts clearly, concisely, and in a friendly manner. When asked a question, provide an answer relevant to the unit: '${unit.title}'. Your answer should be formatted in simple markdown. Here is the student's question: "${query}"`;
      
      const genAIResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = genAIResponse.text;
      setResponse(text);
    } catch (err) {
      console.error(err);
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, loading, unit.title]);

  const responseVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      layout
      className="mb-12 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <span className="text-4xl mt-1">🧠</span>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Ask Professor Gyan</h2>
          <p className="text-gray-300">Your AI SST teacher for '{unit.title}'</p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., What are biotic resources?"
          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 resize-none"
          rows={3}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="mt-4 w-full md:w-auto px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            'Ask Question'
          )}
        </button>
      </form>
      <AnimatePresence>
        {error && (
          <motion.div
            className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300"
            variants={responseVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {error}
          </motion.div>
        )}
        {response && (
          <motion.div
            className="mt-6 pt-4 border-t border-white/20"
            variants={responseVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <h3 className="text-xl font-semibold mb-2 text-white">Professor Gyan's Answer:</h3>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAssistant;
