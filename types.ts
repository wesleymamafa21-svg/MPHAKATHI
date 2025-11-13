export enum Emotion {
  Calm = 'Calm',
  Happy = 'Happy',
  Sad = 'Sad',
  Angry = 'Angry',
  Stressed = 'Stressed',
  Fearful = 'Fearful',
  Danger = 'Danger',
  Neutral = 'Neutral',
}

export enum AlertLevel {
  None = 'None',
  Warning = 'Warning',
  Critical = 'Critical',
  Success = 'Success',
}

export enum Gender {
    Woman = 'Woman',
    Man = 'Man',
    NonBinary = 'Non-Binary person',
    PreferNotToSay = 'Person',
}

export enum CalmAssistStyle {
    Soothing = 'Soft and soothing',
    Empowering = 'Strong and encouraging',
    Mindfulness = 'Mindfulness mode',
}

export enum SensitivityLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export enum CheckInInterval {
    FifteenMinutes = '15 Minutes',
    ThirtyMinutes = '30 Minutes',
    OneHour = '1 Hour',
    Never = 'Never',
}

export enum ReminderInterval {
    OneHour = '1 Hour',
    TwoHours = '2 Hours',
    FourHours = '4 Hours',
    Never = 'Never',
}

export enum SafetyInboxStatus {
    Safe = 'Safe',
    ActiveDanger = 'Active Danger',
    NoResponse = 'No Response',
}

export enum DayOfWeek {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    gender: Gender | null;
    isSurvivor: boolean;
}

export interface EmotionState {
  emotion: Emotion;
  intensity: number;
  confidence: number;
}

export interface AcousticAnalysis {
    detection_confidence: number;
    distress_type: 'none' | 'scream' | 'cry' | 'yell' | 'fearful';
    trigger_status: 'none' | 'medium' | 'high';
    reasoning: string;
    recommended_action: 'continue_monitoring' | 'activate_emergency' | 'escalate_listening';
}

export interface SafetyAction {
    action_type: 'safety_tip' | 'de_escalation' | 'information';
    headline: string;
    suggestion: string;
}

export interface Alert {
  level: AlertLevel;
  message: string;
}

export interface TranscriptionEntry {
  id: string;
  text: string;
  timestamp: Date;
  emotionState: EmotionState | null;
}

export interface EmergencyContact {
    name: (string | null)[];
    tel: (string | null)[];
}

export interface SimulatedUser {
    id: string;
    name: string;
    avatar: string;
}

export interface CompletedRecording {
    id: string;
    blob: Blob;
    timestamp: Date;
}

export interface VoiceSafeCode {
    phrase: string;
    // In a real app, this would be a complex embedding. We'll simulate with a string hash.
    voiceprint: string; 
}

export interface SecurityLogEntry {
    id: string;
    timestamp: Date;
    triggerType: string;
    details: string;
    confidence?: number;
}

export interface SafetyInboxMessage {
    id: string;
    sender: 'user' | 'contact'; // 'user' is me, 'contact' is the person in distress
    timestamp: Date;
    type: 'text' | 'audio';
    content: string; // for text, it's the message string. for audio, it's a base64 data URL.
}

export interface SafetyInboxThread {
    id:string;
    userName: string;
    avatar: string;
    location: { latitude: number; longitude: number } | null;
    timestamp: Date;
    status: SafetyInboxStatus;
    messages: SafetyInboxMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  groundingChunks?: any[]; 
}

export interface AutoActivationSchedule {
    time: string | null;
    days: DayOfWeek[];
}