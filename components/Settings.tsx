import React, { useState } from 'react';
import { User, Gender, CalmAssistStyle, SensitivityLevel, CheckInInterval, ReminderInterval, AutoActivationSchedule, DayOfWeek } from '../types';

const PinManager: React.FC<{onSetPin: (pin: string) => void; pinIsSet: boolean}> = ({ onSetPin, pinIsSet }) => {
    const [newPin, setNewPin] = useState('');
    const [error, setError] = useState('');
    
    const handleSet = () => {
        if (!/^\d{4}$/.test(newPin)) {
            setError('PIN must be exactly 4 digits.');
            return;
        }
        onSetPin(newPin);
        setError('');
        setNewPin('');
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">{pinIsSet ? 'Change' : 'Set'} Security PIN</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">A 4-digit PIN is required to deactivate a session. This is a safety feature to prevent accidental or unauthorized deactivation.</p>
            <div className="flex flex-col gap-4">
                <input 
                    type="password" 
                    placeholder="Enter 4-digit PIN" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 text-center text-xl tracking-widest"
                    maxLength={4}
                    pattern="\d{4}"
                    inputMode="numeric"
                    autoComplete="new-password"
                />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button
                    onClick={handleSet}
                    className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full transition-colors font-semibold"
                >
                    {pinIsSet ? 'Update PIN' : 'Set PIN'}
                </button>
            </div>
        </div>
    );
};

interface SettingsProps {
    user: User;
    onUserUpdate: (user: User) => void;
    pinIsSet: boolean;
    onSetPin: (pin: string) => void;
    calmAssistStyle: CalmAssistStyle;
    onCalmAssistStyleChange: (style: CalmAssistStyle) => void;
    sensitivity: SensitivityLevel;
    onSensitivityChange: (level: SensitivityLevel) => void;
    checkInInterval: CheckInInterval;
    onCheckInIntervalChange: (interval: CheckInInterval) => void;
    reminderInterval: ReminderInterval;
    onReminderIntervalChange: (interval: ReminderInterval) => void;
    onManageVoiceCode: () => void;
    canInstall: boolean;
    onInstallApp: () => void;
    onLogout: () => void;
    onBack: () => void;
    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;
    isAutoActivationEnabled: boolean;
    onAutoActivationToggle: (enabled: boolean) => void;
    autoActivationSchedules: AutoActivationSchedule[];
    onAutoActivationSchedulesChange: (schedules: AutoActivationSchedule[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
    user, onUserUpdate, pinIsSet, onSetPin, 
    calmAssistStyle, onCalmAssistStyleChange, sensitivity, onSensitivityChange, 
    checkInInterval, onCheckInIntervalChange, reminderInterval, onReminderIntervalChange, 
    onManageVoiceCode, canInstall, onInstallApp, onLogout, onBack,
    theme, onThemeChange,
    isAutoActivationEnabled, onAutoActivationToggle,
    autoActivationSchedules, onAutoActivationSchedulesChange
}) => {

    const [newSchedule, setNewSchedule] = useState<AutoActivationSchedule>({ time: '', days: [] });
    
    const handleUserNameChange = (name: string) => {
        onUserUpdate({ ...user, fullName: name });
    };

    const weekDays = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday];

    const handleNewScheduleTimeChange = (time: string) => {
        setNewSchedule({ ...newSchedule, time });
    };

    const handleNewScheduleDayToggle = (day: DayOfWeek) => {
        const currentDays = newSchedule.days;
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        setNewSchedule({ ...newSchedule, days: newDays });
    };

    const handleNewScheduleEverydayToggle = () => {
        const allDaysSelected = newSchedule.days.length === weekDays.length;
        const newDays = allDaysSelected ? [] : weekDays;
        setNewSchedule({ ...newSchedule, days: newDays });
    };

    const handleAddSchedule = () => {
        if (!newSchedule.time || newSchedule.days.length === 0) return;
        onAutoActivationSchedulesChange([...autoActivationSchedules, newSchedule]);
        setNewSchedule({ time: '', days: [] }); // Reset form
    };

    const handleRemoveSchedule = (indexToRemove: number) => {
        onAutoActivationSchedulesChange(
            autoActivationSchedules.filter((_, index) => index !== indexToRemove)
        );
    };

    const formatDays = (days: DayOfWeek[]): string => {
        if (days.length === 7) return 'Everyday';
        if (days.length === 0) return 'No days selected';
        const sortedDays = weekDays.filter(day => days.includes(day));
        return sortedDays.map(d => d.substring(0, 3)).join(', ');
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center p-4 animate-fade-in">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Settings</h2>
                <button onClick={onBack} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors">
                    &larr; Back to Main
                </button>
            </div>

            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Appearance</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">Choose how Mphakathi looks to you.</p>
                <div className="flex justify-center gap-2 flex-wrap bg-gray-200 dark:bg-gray-900/50 p-2 rounded-full">
                    <button
                        onClick={() => onThemeChange('light')}
                        className={`w-1/2 px-4 py-2 rounded-full transition-colors font-semibold ${
                            theme === 'light'
                            ? 'bg-yellow-400 text-black shadow'
                            : 'bg-transparent text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        ☀️ Light
                    </button>
                    <button
                        onClick={() => onThemeChange('dark')}
                        className={`w-1/2 px-4 py-2 rounded-full transition-colors font-semibold ${
                            theme === 'dark'
                            ? 'bg-yellow-500 text-black shadow'
                            : 'bg-transparent text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        🌙 Dark
                    </button>
                </div>
            </div>

             <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Personal Details</h3>
                <label htmlFor="userName" className="block text-gray-700 dark:text-gray-300 mb-2">Your Name (for alerts)</label>
                <input 
                    id="userName"
                    type="text" 
                    placeholder="Enter your name" 
                    value={user.fullName || ''} 
                    onChange={e => handleUserNameChange(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                />
            </div>

            <PinManager pinIsSet={pinIsSet} onSetPin={onSetPin} />

            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-yellow-400">Automatic Activation</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isAutoActivationEnabled} onChange={(e) => onAutoActivationToggle(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                    </label>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">App will automatically activate 'Listen Only' mode at the set times.</p>
                
                <div className={`space-y-4 transition-opacity ${isAutoActivationEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Active Schedules</h4>
                        {autoActivationSchedules.length > 0 ? (
                            <ul className="space-y-2">
                                {autoActivationSchedules.map((schedule, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md">
                                        <div>
                                            <span className="font-mono text-lg font-semibold text-white">{schedule.time}</span>
                                            <span className="text-gray-400 ml-3">{formatDays(schedule.days)}</span>
                                        </div>
                                        <button onClick={() => handleRemoveSchedule(index)} className="px-2 py-1 text-red-400 hover:text-red-300 font-bold text-xl rounded-full hover:bg-red-500/10">
                                            &times;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic text-center py-2">No schedules set.</p>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Add a New Schedule</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <label htmlFor="activation-time" className="w-16 text-gray-700 dark:text-gray-300 font-semibold">Time:</label>
                            <input
                                type="time"
                                id="activation-time"
                                value={newSchedule.time || ''}
                                onChange={(e) => handleNewScheduleTimeChange(e.target.value || '')}
                                className="flex-grow bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="pt-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Repeat on Days:</h4>
                            <div className="flex justify-center gap-1.5 flex-wrap">
                                {weekDays.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => handleNewScheduleDayToggle(day)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                                            newSchedule.days.includes(day)
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleNewScheduleEverydayToggle}
                                className="mt-3 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors font-semibold"
                            >
                                {newSchedule.days.length === weekDays.length ? 'Clear All' : 'Select Everyday'}
                            </button>
                        </div>
                         <button
                            onClick={handleAddSchedule}
                            disabled={!newSchedule.time || newSchedule.days.length === 0}
                            className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Schedule
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">🤫 Voice Secret Code</h3>
                 <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Set a secret phrase to silently activate an emergency alert using only your voice.
                </p>
                 <button
                    onClick={onManageVoiceCode}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors font-semibold"
                >
                    Manage Voice Secret Code
                </button>
            </div>
            
            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                 <h3 className="text-xl font-semibold text-yellow-400 mb-4">Calm Assist Personalization</h3>
                 <p className="text-gray-700 dark:text-gray-300 mb-3">Choose the tone for calming messages when stress is detected:</p>
                 <div className="flex justify-center gap-2 flex-wrap">
                     {(Object.values(CalmAssistStyle)).map(style => (
                         <button
                             key={style}
                             onClick={() => onCalmAssistStyleChange(style)}
                             className={`px-4 py-2 rounded-full transition-colors ${
                                calmAssistStyle === style
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                             }`}
                         >
                            {style}
                         </button>
                     ))}
                 </div>
            </div>

            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                 <h3 className="text-xl font-semibold text-yellow-400 mb-4">Detection Sensitivity</h3>
                 <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
                    Adjust how sensitive the app is to acoustic events and distress signals during an active listening session. 'High' is more responsive but may have more false positives.
                </p>
                {user.isSurvivor && (
                     <p className="text-sm text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-md mb-4 border border-yellow-300 dark:border-yellow-700">
                        Based on your profile, sensitivity is defaulted to <strong>High</strong> for enhanced protection. You can adjust it here if needed.
                    </p>
                )}
                <div className="flex justify-center gap-2 flex-wrap">
                    {(Object.values(SensitivityLevel)).map(level => (
                        <button
                            key={level}
                            onClick={() => onSensitivityChange(level)}
                            className={`px-4 py-2 rounded-full transition-colors ${
                                sensitivity === level
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Safety Automations</h3>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Safety Check-in Interval</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Mphakathi will periodically ask if you are safe. Select how often.</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {(Object.values(CheckInInterval)).map(interval => (
                            <button
                                key={interval}
                                onClick={() => onCheckInIntervalChange(interval)}
                                className={`px-4 py-2 rounded-full transition-colors ${
                                    checkInInterval === interval
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Voice Secret Code Reminder</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Periodically get a reminder of your secret phrase. Useful if you've recently set or changed it.</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {(Object.values(ReminderInterval)).map(interval => (
                            <button
                                key={interval}
                                onClick={() => onReminderIntervalChange(interval)}
                                className={`px-4 py-2 rounded-full transition-colors ${
                                    reminderInterval === interval
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                {interval}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {canInstall && (
                <div className="w-full bg-white dark:bg-gray-800/50 p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-4">Install Mphakathi App</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        For faster access and an improved experience, install Mphakathi directly on your device's home screen.
                    </p>
                    <button
                        onClick={onInstallApp}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors font-bold flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-l4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Install on this Device
                    </button>
                </div>
            )}

            <div className="w-full mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 bg-red-800 hover:bg-red-700 text-white rounded-full transition-colors font-bold"
                >
                    Log Out
                </button>
            </div>

        </div>
    );
};

export default Settings;