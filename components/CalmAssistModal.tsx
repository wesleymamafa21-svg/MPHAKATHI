import React, { useState, useEffect, useCallback } from 'react';
import { CalmAssistStyle } from '../types';
import { generateCalmingMessage } from '../services/geminiService';
import BreathingVisualizer from './BreathingVisualizer';

interface CalmAssistModalProps {
    isOpen: boolean;
    onClose: () => void;
    calmAssistStyle: CalmAssistStyle;
}

const CalmAssistModal: React.FC<CalmAssistModalProps> = ({ isOpen, onClose, calmAssistStyle }) => {
    const [view, setView] = useState<'prompt' | 'breathing' | 'sound'>('prompt');
    const [calmingMessage, setCalmingMessage] = useState('Let\'s take a moment...');
    const audioContextRef = React.useRef<AudioContext | null>(null);

    useEffect(() => {
        if (isOpen) {
            setView('prompt'); // Reset to initial view when opened
        }
    }, [isOpen]);

    const handleStartBreathing = async () => {
        setView('breathing');
        setCalmingMessage('Fetching a calming thought...');
        const message = await generateCalmingMessage(calmAssistStyle);
        setCalmingMessage(message);
    };

    const playCalmingSound = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioCtx = audioContextRef.current;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(120, audioCtx.currentTime); // Low frequency
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.5); // Fade in
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3); // Fade out
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 3);
        setView('sound');
    }, []);
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md border border-gray-600 relative">
                <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                
                {view === 'prompt' && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4">A Moment to Pause</h2>
                        <p className="text-gray-300 mb-6">
                            I've detected a bit of stress in your voice.
                            Let’s take a moment to breathe together.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={handleStartBreathing}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors shadow-lg"
                            >
                                Start Breathing Exercise
                            </button>
                             <button
                                onClick={playCalmingSound}
                                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors"
                            >
                                Play Calming Sound
                            </button>
                        </div>
                    </div>
                )}

                {view === 'breathing' && (
                   <BreathingVisualizer calmingMessage={calmingMessage} />
                )}

                {view === 'sound' && (
                    <div className="text-center p-4">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Listen</h2>
                        <p className="text-gray-300">A calming sound is playing. Focus on the tone and let your thoughts soften.</p>
                         <div className="mt-6">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-full transition-colors"
                            >
                                Close
                            </button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalmAssistModal;