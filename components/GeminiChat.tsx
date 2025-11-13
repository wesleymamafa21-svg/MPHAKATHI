import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface GeminiChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isResponding: boolean;
    onBack: () => void;
    isAnonymous: boolean;
    onStartAnonymousChat: () => void;
}

const AnonymousConfirmModal: React.FC<{ onConfirm: () => void, onCancel: () => void }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-yellow-600">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Anonymous Reporting</h2>
            <p className="text-gray-300 mb-2">
                You are about to start an anonymous chat session.
            </p>
            <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1 text-sm">
                <li>Your chat history for this session will be cleared.</li>
                <li>Your personal details and location will not be shared.</li>
                <li>The conversation may be reviewed by moderators for safety purposes.</li>
            </ul>
            <div className="flex justify-end gap-4">
                <button 
                    onClick={onCancel} 
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={onConfirm} 
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full transition-colors"
                >
                    Proceed Anonymously
                </button>
            </div>
        </div>
    </div>
);

const GeminiChat: React.FC<GeminiChatProps> = ({ messages, onSendMessage, isResponding, onBack, isAnonymous, onStartAnonymousChat }) => {
    const [input, setInput] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prefillSuggestions = ["Where is the nearest police station?", "What are the signs of a panic attack?", "Give me a safety tip for walking alone at night."];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const parseText = (text: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const listRegex = /^\s*[\*\-]\s(.*)/gm;
    
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html.replace(boldRegex, '<strong>$1</strong>');
        html = html.replace(listRegex, '<li class="ml-4 list-disc">$1</li>');
        return <div dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br />') }} />;
    };

    return (
        <div className="w-full max-w-4xl h-full flex flex-col p-4 animate-fade-in">
             {showConfirmModal && (
                <AnonymousConfirmModal 
                    onConfirm={() => {
                        onStartAnonymousChat();
                        setShowConfirmModal(false);
                    }}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
            {/* Header */}
            <header className="flex-shrink-0 w-full flex items-center justify-between pb-4 border-b border-gray-700">
                <button onClick={onBack} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors flex items-center gap-2">
                    &larr; <span className="hidden sm:inline">Back to Main</span>
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Mphakathi Assistant</h2>
                    <p className="text-sm text-green-400">Powered by Gemini</p>
                </div>
                <div className="w-32 text-right">
                    {!isAnonymous ? (
                        <button 
                            onClick={() => setShowConfirmModal(true)} 
                            className="text-sm text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-1 rounded-full transition-colors"
                            aria-label="Start Anonymous Reporting"
                        >
                            Anonymous Report
                        </button>
                    ) : (
                        <span className="text-sm font-semibold text-red-400 animate-pulse">Anonymous Mode</span>
                    )}
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto p-2 my-2">
                {messages.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3 className="text-2xl font-semibold text-gray-200">How can I help you?</h3>
                        <p className="mt-2">Ask me for safety information or nearby places.</p>
                        <div className="mt-6 w-full max-w-md space-y-2">
                            {prefillSuggestions.map(suggestion => (
                                <button key={suggestion} onClick={() => onSendMessage(suggestion)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-yellow-600 text-black rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                            {msg.role === 'system' ? (
                                <p className="text-yellow-300 italic text-sm">{msg.text}</p>
                            ) : (
                                parseText(msg.text)
                            )}
                            {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-500/50">
                                    <h4 className="text-xs font-bold mb-1">Sources:</h4>
                                    {msg.groundingChunks.map((chunk, index) => (
                                        <a key={index} href={chunk.maps?.uri || chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-300 hover:underline truncate">
                                            📍 {chunk.maps?.title || chunk.web?.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isResponding && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-gray-700 text-white rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for help or information..."
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-full p-3 pl-5 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        disabled={isResponding}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isResponding || !input.trim()}
                        className="p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send Message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default GeminiChat;