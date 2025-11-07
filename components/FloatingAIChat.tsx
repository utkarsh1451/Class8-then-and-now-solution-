import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import type { Message, ChatSession } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

interface FloatingAIChatProps {
    playClickSound: () => void;
    isOpen: boolean;
    onClose: () => void;
    initialPrompt?: string;
}

const LoadingDots: React.FC = () => (
    <div className="flex space-x-1">
        <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }} />
    </div>
);

const FloatingAIChat: React.FC<FloatingAIChatProps> = ({ playClickSound, isOpen, onClose, initialPrompt }) => {
    const [view, setView] = useState<'chat' | 'history'>('chat');
    const [chatHistory, setChatHistory] = useLocalStorage<ChatSession[]>('chatHistory', []);
    const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('activeChatId', null);
    
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Namaste! Main hoon aapka Study Dost. Koi sawaal hai to pooch sakte ho! 😊" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const textareaRef = useRef<null | HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            textareaRef.current?.focus();
            if (initialPrompt && !input) {
                setInput(initialPrompt);
            }
        } else {
            setIsMenuOpen(false);
            setView('chat');
        }
    }, [isOpen, initialPrompt, input]);

    useEffect(() => {
      const activeChat = chatHistory.find(chat => chat.id === activeChatId);
      if (activeChat) {
        setMessages(activeChat.messages);
      } else {
        setMessages([{ role: 'model', content: "Namaste! Main hoon aapka Study Dost. Koi sawaal hai to pooch sakte ho! 😊" }]);
      }
    }, [activeChatId, chatHistory]);

    const handleStartNewChat = () => {
        setActiveChatId(null);
        setInput('');
        removeSelectedFile();
        setView('chat');
        setIsMenuOpen(false);
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
        setView('chat');
        setIsMenuOpen(false);
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if (activeChatId === chatId) {
            setActiveChatId(null);
        }
    };

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
            setChatHistory([]);
            setActiveChatId(null);
            setView('chat');
            setIsMenuOpen(false);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (!currentInput && !selectedFile) return;

        setLoading(true);
        const userMessage: Message = { 
            role: 'user', 
            content: currentInput,
            ...(filePreview && { image: filePreview })
        };
        
        const currentMessages = messages;
        const historyWithUserMessage = [...currentMessages, userMessage];
        setMessages([...historyWithUserMessage, { role: 'loading', content: '...' }]);
        setInput('');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            const historyForAPI = historyWithUserMessage
                .filter(msg => msg.role === 'user' || msg.role === 'model')
                .map(msg => {
                    const parts: any[] = [];
                    if (msg.role === 'user' && msg.image) {
                        const [header, data] = msg.image.split(',');
                        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
                        parts.push({ inlineData: { data, mimeType } });
                    }
                    if (msg.content) {
                        parts.push({ text: msg.content });
                    }
                    return { role: msg.role, parts };
                });

            const genAIResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: historyForAPI,
                config: {
                    systemInstruction: "You are a friendly and helpful study assistant for Class 8 students in India. Your name is 'Study Dost'. Communicate in a simple, conversational mix of Hindi and English (Hinglish). Keep your answers concise and easy to understand, using simple markdown for formatting (like lists or bold text if needed). Analyse any images provided.",
                },
            });
            
            const text = genAIResponse.text;
            const modelMessage = { role: 'model' as const, content: text };
            const finalMessages = [...historyWithUserMessage, modelMessage];

            if (activeChatId) {
                setChatHistory(prev => prev.map(chat => 
                    chat.id === activeChatId ? { ...chat, messages: finalMessages, timestamp: Date.now() } : chat
                ));
            } else {
                const newId = Date.now().toString();
                const newTitle = currentInput.substring(0, 40) + (currentInput.length > 40 ? '...' : '');
                const newSession: ChatSession = { id: newId, title: newTitle, messages: finalMessages, timestamp: Date.now() };
                setChatHistory(prev => [newSession, ...prev]);
                setActiveChatId(newId);
            }
            setMessages(finalMessages);

        } catch (err) {
            console.error(err);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages.pop();
                newMessages.push({ role: 'error', content: 'Oops! Kuch gadbad ho gayi. Please try again.' });
                return newMessages;
            });
        } finally {
            setLoading(false);
            removeSelectedFile();
        }
    }, [input, selectedFile, filePreview, messages, activeChatId, setChatHistory, setActiveChatId]);

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            removeSelectedFile();
        }
    };
    
    const handleMicClick = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    setInput(prev => prev + event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };
        
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        }

        recognition.start();
        setIsRecording(true);
    };

    const renderChatView = () => (
        <>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">🤖</div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${
                                msg.role === 'user' ? 'bg-blue-500 rounded-br-none' :
                                msg.role === 'model' ? 'bg-gray-700/80 rounded-bl-none' :
                                msg.role === 'error' ? 'bg-red-500/50 rounded-bl-none' :
                                'bg-transparent'
                            }`}>
                                {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-48" />}
                                {msg.role === 'loading' ? <LoadingDots /> : <p className="text-white whitespace-pre-wrap">{msg.content}</p>}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                    {filePreview && (
                        <div className="mb-2 p-2 bg-black/30 rounded-lg flex items-center justify-between animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <img src={filePreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                                <span className="text-sm text-gray-300 truncate">{selectedFile?.name}</span>
                            </div>
                            <button onClick={removeSelectedFile} type="button" className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0">&times;</button>
                        </div>
                    )}
                    <div className="relative flex items-center gap-2">
                        <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                            placeholder="Type your question here..."
                            className="w-full pl-10 pr-20 py-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 resize-none"
                            rows={1} disabled={loading}
                        />
                        <button type="button" onClick={handleFileButtonClick} disabled={loading} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-gray-300 hover:text-white disabled:text-gray-500 disabled:cursor-not-allowed transition-colors" aria-label="Attach file">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 10-6 0v4a1 1 0 102 0V7a1 1 0 112 0v4a3 3 0 11-6 0V7a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        </button>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" onClick={handleMicClick} disabled={loading} className={`w-9 h-9 rounded-md flex items-center justify-center hover:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-300'}`} aria-label="Record voice">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                            </button>
                            <button type="submit" disabled={loading || (!input.trim() && !selectedFile)} className="w-9 h-9 bg-blue-500 rounded-md flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );

    const renderHistoryView = () => (
        <div className="p-4 flex flex-col h-full">
            <button onClick={handleStartNewChat} className="w-full mb-4 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
                + Start New Chat
            </button>
            <div className="flex-1 overflow-y-auto">
                {chatHistory.length > 0 ? (
                    <ul className="space-y-2">
                        {chatHistory.map(chat => (
                            <li key={chat.id}>
                                <button onClick={() => handleSelectChat(chat.id)} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-medium text-white truncate">{chat.title}</p>
                                        <p className="text-xs text-gray-400">{new Date(chat.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button onClick={(e) => handleDeleteChat(e, chat.id)} className="ml-2 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-300 transition-all">
                                        🗑️
                                    </button>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-center">No past chats yet.<br/>Start a conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-xl flex flex-col"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <header className="flex-shrink-0 p-4 border-b border-white/10">
                            <div className="max-w-4xl mx-auto flex items-center justify-between">
                                <div className="relative">
                                    <button onClick={() => setIsMenuOpen(o => !o)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                                        ⋮
                                    </button>
                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div 
                                                className="absolute top-full left-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-10"
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            >
                                                <button onClick={() => { setView('history'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors">Your History</button>
                                                <button onClick={handleClearHistory} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors text-red-400">Clear History</button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <h3 className="font-bold text-lg text-center">
                                    {view === 'history' ? 'Your History' : 'Ask AI'}
                                </h3>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                    ×
                                </button>
                            </div>
                        </header>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                className="flex-1 flex flex-col overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {view === 'chat' ? renderChatView() : renderHistoryView()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingAIChat;