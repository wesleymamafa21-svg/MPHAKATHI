import React, { useState, useEffect } from 'react';

interface BreathingVisualizerProps {
    calmingMessage: string;
}

const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({ calmingMessage }) => {
    const [instruction, setInstruction] = useState('Get Ready...');
    
    useEffect(() => {
        const cycle = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
        const durations = [4000, 4000, 4000, 2000]; // 4s in, 4s hold, 4s out, 2s pause
        let index = 0;
        
        const timer = setInterval(() => {
            setInstruction(cycle[index]);
            index = (index + 1) % cycle.length;
        }, durations[index]);

        // Initial start
        setTimeout(() => {
            setInstruction('Breathe In');
            index = 1;
        }, 2000);

        return () => clearInterval(timer);
    }, []);

    const isHolding = instruction === 'Hold';

    return (
        <div className="flex flex-col items-center justify-center text-center p-4">
             <style>{`
                @keyframes breathe-circle {
                  0% { transform: scale(0.8); }
                  33% { transform: scale(1.1); }
                  66%, 100% { transform: scale(0.8); }
                }
                .animate-breathe-circle {
                  animation: breathe-circle 12s ease-in-out infinite;
                }
            `}</style>
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <div className={`absolute w-full h-full bg-blue-500 rounded-full transition-all duration-1000 ${isHolding ? 'opacity-40' : 'opacity-20 animate-breathe-circle'}`}></div>
                <div className="z-10 text-white text-3xl font-bold">
                    {instruction}
                </div>
            </div>
            <p className="text-gray-300 italic text-lg">"{calmingMessage}"</p>
        </div>
    );
};

export default BreathingVisualizer;