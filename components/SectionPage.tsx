import React from 'react';
import { motion } from 'framer-motion';
import type { ContentSection, QuestionAnswer } from '../types';
import BackButton from './BackButton';

const QACard: React.FC<{ qa: QuestionAnswer; sectionTitle: string }> = ({ qa, sectionTitle }) => {
  const isFillInBlanks = sectionTitle.startsWith('F. Fill in the Blanks');

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-3 last:mb-0">
      {isFillInBlanks ? (
        <p className="font-semibold text-white mb-2">
            {qa.q.split('____')[0]}
            <span className="font-bold text-blue-300 underline decoration-dotted mx-1">{qa.a}</span>
            {qa.q.split('____')[1] || ''}
        </p>
      ) : (
        <>
            <p className="font-semibold text-white mb-2">{qa.q}</p>
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
            <p className="text-gray-300 whitespace-pre-wrap">
                {sectionTitle.startsWith('H. Choose the Correct Option') && '✅ '}
                {qa.a}
            </p>
        </>
      )}
    </div>
  );
};


interface SectionPageProps {
  section: ContentSection;
  onGoBack: () => void;
}

const SectionPage: React.FC<SectionPageProps> = ({ section, onGoBack }) => {
  return (
    <div>
      <BackButton onClick={onGoBack} text="Back to Chapter" />
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">
          {section.title}
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        {section.questions.map((qa, index) => (
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
