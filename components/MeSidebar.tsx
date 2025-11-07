import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserInfo, DownloadedFile } from '../types';

interface MeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo | null;
  downloads: DownloadedFile[];
  onDelete: (downloadId: string) => void;
}

const MeSidebar: React.FC<MeSidebarProps> = ({ isOpen, onClose, userInfo, downloads, onDelete }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[150]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl z-[160] p-6 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="mb-8 p-4 rounded-xl bg-white/5">
              <h3 className="text-lg font-semibold mb-3 text-blue-300">👤 User Info</h3>
              {userInfo ? (
                <div className="space-y-2 text-gray-300">
                  <p><span className="font-semibold text-white">Name:</span> {userInfo.name}</p>
                  <p><span className="font-semibold text-white">Date of Birth:</span> {userInfo.dob}</p>
                </div>
              ) : (
                <p className="text-gray-400">No user info saved.</p>
              )}
            </div>

            <div className="flex-1 flex flex-col p-4 rounded-xl bg-white/5 overflow-hidden">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">📥 My Downloads</h3>
                {downloads.length > 0 ? (
                    <ul className="space-y-3 overflow-y-auto -mr-2 pr-2">
                        {[...downloads].sort((a,b) => b.timestamp - a.timestamp).map(file => (
                            <li key={file.id} className="p-3 rounded-lg bg-black/30 flex items-center justify-between">
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-gray-400">{file.unitTitle}</p>
                                </div>
                                <button onClick={() => onDelete(file.id)} className="ml-2 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center hover:bg-red-500/20 text-red-300 transition-colors">
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-400 text-center">No chapters downloaded yet. <br/> Download a chapter to see it here.</p>
                    </div>
                )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MeSidebar;
