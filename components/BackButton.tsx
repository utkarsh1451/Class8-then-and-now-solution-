import React from 'react';
import { motion } from 'framer-motion';

interface BackButtonProps {
    onClick: () => void;
    text?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, text = 'Back' }) => {
    return (
        <motion.button
            onClick={onClick}
            className="mb-8 flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {text}
        </motion.button>
    );
};

export default BackButton;
