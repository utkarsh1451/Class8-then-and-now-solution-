import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserInfo } from '../types';

interface OnboardingModalProps {
  onSave: (userInfo: UserInfo) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && dob) {
      onSave({ name, dob });
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">✨ Welcome!</h2>
              <p className="text-gray-300 mb-6">Tell us a bit about you.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">🧍 Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  placeholder="e.g., Rohan Kumar"
                />
              </div>
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-200 mb-1">🎂 Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
              >
                Continue
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
