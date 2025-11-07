import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chapter, ContentSection, Unit } from '../types';

// Declare jspdf and html2canvas from global scope (CDN)
declare const jspdf: any;
declare const html2canvas: any;

interface FloatingToolbarProps {
  chapter: Chapter;
  unit: Unit;
  content: ContentSection[];
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ chapter, unit, content }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Create a temporary element to render the PDF content
    const pdfContentEl = document.createElement('div');
    pdfContentEl.style.position = 'absolute';
    pdfContentEl.style.left = '-9999px';
    pdfContentEl.style.width = '800px';
    pdfContentEl.style.padding = '40px';
    pdfContentEl.style.fontFamily = 'sans-serif';
    pdfContentEl.style.color = '#111827';
    pdfContentEl.innerHTML = `
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">Chapter ${chapter.id}: ${chapter.title}</h1>
      <h2 style="font-size: 20px; color: #4b5563; margin-bottom: 24px;">${unit.title}</h2>
      ${content.map(section => `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 22px; font-weight: bold; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 16px;">${section.title}</h3>
          ${section.questions.map(qa => {
            let answerHtml = '';
            if (qa.isTable && qa.table) {
                answerHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;"><thead><tr>${qa.table.headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">${h}</th>`).join('')}</tr></thead><tbody>`;
                answerHtml += qa.table.rows.map(row => `<tr>${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`).join('');
                answerHtml += `</tbody></table>`;
            }
            if (qa.a) {
                answerHtml += `<div style="font-size: 16px; white-space: pre-wrap; color: #374151;">${qa.a}</div>`;
            }
            return `
                <div style="margin-bottom: 16px; page-break-inside: avoid;">
                  <p style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">${qa.q}</p>
                  ${answerHtml}
                </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    `;
    document.body.appendChild(pdfContentEl);

    try {
      const canvas = await html2canvas(pdfContentEl, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps= pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`Chapter ${chapter.id} - ${chapter.title}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Sorry, there was an error creating the PDF.");
    } finally {
        document.body.removeChild(pdfContentEl);
        setIsDownloading(false);
    }
  };

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <AnimatePresence>
        {showCopied && (
          <motion.div
            className="absolute -top-10 right-0 px-3 py-1 text-sm bg-green-500/80 backdrop-blur-sm text-white rounded-md shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleDownload}
        disabled={isDownloading}
        className="group relative w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        aria-label="Download as PDF"
      >
        {isDownloading ? (
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
      </motion.button>
      
      <motion.button
        onClick={handleShare}
        className="group relative w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300 shadow-lg"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
        whileTap={{ scale: 0.95 }}
        aria-label="Share Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342A2 2 0 0110 12h4a2 2 0 110 4h-4a2 2 0 01-1.316-.658L4.684 12l4-1.342zM12 6a2 2 0 110-4 2 2 0 010 4zm0 12a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default FloatingToolbar;