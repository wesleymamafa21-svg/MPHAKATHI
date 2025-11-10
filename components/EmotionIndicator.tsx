import React from 'react';
import { Emotion, EmotionState } from '../types';

interface EmotionIndicatorProps {
  emotionState: EmotionState;
  isListening: boolean;
  isCountingDown: boolean;
}

const emotionConfig: Record<Emotion, { color: string; ringColor: string; textColor: string }> = {
  [Emotion.Neutral]: { color: 'bg-green-500', ringColor: 'ring-green-400', textColor: 'text-green-300' },
  [Emotion.Calm]: { color: 'bg-green-500', ringColor: 'ring-green-400', textColor: 'text-green-300' },
  [Emotion.Happy]: { color: 'bg-green-500', ringColor: 'ring-green-400', textColor: 'text-green-300' },
  [Emotion.Sad]: { color: 'bg-yellow-500', ringColor: 'ring-yellow-400', textColor: 'text-yellow-300' },
  [Emotion.Stressed]: { color: 'bg-yellow-500', ringColor: 'ring-yellow-400', textColor: 'text-yellow-300' },
  [Emotion.Fearful]: { color: 'bg-yellow-500', ringColor: 'ring-yellow-400', textColor: 'text-yellow-300' },
  [Emotion.Angry]: { color: 'bg-red-600', ringColor: 'ring-red-500', textColor: 'text-red-400' },
  [Emotion.Danger]: { color: 'bg-red-700', ringColor: 'ring-red-600', textColor: 'text-red-500' },
};

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotionState, isListening, isCountingDown }) => {
  const { emotion, intensity } = emotionState;
  const config = emotionConfig[emotion] || emotionConfig[Emotion.Neutral];
  const circumference = 2 * Math.PI * 90; // 2 * pi * radius
  const offset = circumference - (intensity / 100) * circumference;

  const animationClass = isListening ? 'animate-pulse' : '';
  
  return (
    <div 
      className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80"
      role="status"
      aria-live="polite"
      aria-label={`Current emotion is ${emotion} with an intensity of ${intensity} out of 100`}
    >
      <div className={`absolute w-full h-full rounded-full ${config.color} opacity-20 ${animationClass} transition-all duration-500`} aria-hidden="true"></div>
      {isCountingDown && <div className={`absolute w-full h-full rounded-full ${config.ringColor.replace('ring-','bg-')} opacity-75 animate-ping`} aria-hidden="true"></div>}
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          r="90"
          cx="100"
          cy="100"
        />
        <circle
          className={`${config.textColor.replace('text-', 'stroke-')}`}
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r="90"
          cx="100"
          cy="100"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <div className="z-10 text-center" aria-hidden="true">
        <div className={`text-6xl md:text-7xl font-bold ${config.textColor} transition-colors duration-500`}>
          {intensity}
        </div>
        <div className={`text-2xl md:text-3xl font-semibold uppercase tracking-widest ${config.textColor} transition-colors duration-500`}>
          {emotion}
        </div>
      </div>
    </div>
  );
};

export default EmotionIndicator;