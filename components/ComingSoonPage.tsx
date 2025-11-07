import React from 'react';
import { motion } from 'framer-motion';
import BackButton from './BackButton';

interface ComingSoonPageProps {
  onGoBack: () => void;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ onGoBack }) => {
  return (
    <div>
        <BackButton onClick={onGoBack} />
        <div className="flex flex-col items-center justify-center text-center mt-12">
            <motion.div
                className="p-8 md:p-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
            >
                <h1 className="text-5xl mb-4">🚧</h1>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Coming Soon</h2>
                <p className="text-gray-300">Content for this chapter will be added soon.</p>
            </motion.div>
        </div>
    </div>
  );
};

export default ComingSoonPage;