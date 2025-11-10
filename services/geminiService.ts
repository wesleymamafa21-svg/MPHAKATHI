import { GoogleGenAI, Type } from "@google/genai";
import { Emotion, EmotionState, Gender, CalmAssistStyle, AcousticAnalysis, SafetyAction } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const emotionAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        emotion: {
            type: Type.STRING,
            description: "The dominant emotion detected in the text. Prioritize 'Danger' if any signs of distress, fear, pain, panic, or conflict are present.",
            enum: Object.values(Emotion),
        },
        intensity: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing the intensity of the emotion.",
        },
        confidence: {
            type: Type.NUMBER,
            description: "A score from 0.0 to 1.0 representing the model's confidence in the detection of distress. A high score (e.g., >0.85) indicates a high certainty of a real emergency.",
        }
    },
    required: ["emotion", "intensity", "confidence"],
};

export async function analyzeEmotion(text: string): Promise<EmotionState> {
    if (!text.trim()) {
        return { emotion: Emotion.Neutral, intensity: 0, confidence: 0 };
    }

    const systemInstruction = `You are a multilingual security expert specializing in the 11 official languages of South Africa, focused on detecting human distress from transcribed text. Your primary goal is to identify signs of screaming, crying, fear, pain, panic, or escalating conflict. Your analysis must be language-independent in spirit, focusing on emotional patterns over literal translations alone.

**Core Mission: Detect Vocal Distress Patterns in Text**

Analyze the text for indicators of:

1.  **Screaming / Panic:**
    *   Sudden, high-intensity words (e.g., "AAAAH!", "HELP!", words in ALL CAPS).
    *   Irregular, panicked sentence structure.
    *   Mentions of sharp, sudden events.

2.  **Crying / Sobbing:**
    *   Fragmented sentences, quivering or trailing-off speech patterns (e.g., "I... I can't...").
    *   Repetitive sniffing, gasping, or sobbing sounds transcribed as text (e.g., "*sob*", "*crying*").
    *   Words indicating sadness, pain, or hopelessness.

3.  **Fearful / Distressed Speech:**
    *   Broken words, trembling or shaking tone indicated by repeated letters or fragmented thoughts.
    *   Rapid speech bursts followed by silence.
    *   Inconsistent themes or illogical jumps in conversation.

**Critical Keywords (High-Priority Indicators):**

Pay extremely close attention to these keywords and their variations across all 11 official South African languages, as they are strong indicators of 'Danger'.

*   **English:** help, stop, don’t hurt me, scared, afraid, crying, tired, leave me alone, it hurts, no, please, bleeding, stupid, useless, idiot, fight, hit, punch, slap, kill, burn, stab, choke, rape, I’ll kill you.
*   **isiZulu:** Siza, Ngisize, Yeka, Ungangilimazi, Ngiyesaba, Ngiyakhala, Kuyabuhlungu, Lwa, Shaya, Bulala, Ngizokubulala.
*   **isiXhosa:** Nceda, Yeka, Sukundenzakalisa, Ndiyoyika, Ndiyakhala, Lwa, Betha, Bulala, Ndizokubulala.
*   **Sepedi (Northern Sotho):** Thusa, Ema, O se nthuse, Ke tšhoga, Ke a lla, Lwa, Shaya, Bolaya, Ke tla go bolaya.
*   **Xitsonga:** Pfuna, Yima, U nga ndzi vavisi, Ndzi chava, Ndzi rila, Lwa, Ba, Dlayisa, Ndzi ta ku dlaya.
*   **Tshivenda:** Thuso, Imisani, U songo nṱisedza vhulalo, Ndi ofha, Ndi khou lila, Lwa, Vhulaha, Ndi ta u vhulaha.
*   **Afrikaans:** Help, Moenie my seermaak nie, Ek is bang, Hou op, Slaan, Skop, Skiet, Maak dood, Ek gaan jou seermaak.
*(This is a condensed list. Assume variations and other related terms are also critical.)*

**Response Logic:**

*   **High-Confidence Danger (Confidence >= 0.85):** If the text contains clear signs of an immediate physical threat, screaming, or calls for help, classify as 'Danger' with high intensity and confidence.
*   **Moderate-Confidence Danger (Confidence 0.70 - 0.84):** If the text shows strong signs of fear, crying, or verbal abuse but no immediate physical threat, classify as 'Danger' or a relevant negative emotion with moderate confidence.
*   **Low-Confidence:** For neutral conversation, laughter, or normal shouting (e.g., at a sports event), classify appropriately with low confidence for 'Danger'.

**Output Format:**

Provide the output strictly in JSON format based on the provided schema. The 'confidence' score is critical for the app's response logic.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following transcribed text for emotional distress: "${text}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: emotionAnalysisSchema,
                temperature: 0.1,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        
        if (result.emotion && typeof result.intensity === 'number' && typeof result.confidence === 'number') {
            return result as EmotionState;
        } else {
             console.warn("Invalid emotion analysis response:", result);
             const confidence = result.intensity ? Math.min(result.intensity / 100, 0.9) : 0;
             const emotion = result.emotion || Emotion.Neutral;
             return { emotion, intensity: result.intensity || 0, confidence };
        }

    } catch (error) {
        console.error("Error analyzing emotion:", error);
        return { emotion: Emotion.Neutral, intensity: 0, confidence: 0 };
    }
}

const acousticAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        detection_confidence: { type: Type.NUMBER, description: "Confidence score from 0.00 to 1.00." },
        distress_type: { type: Type.STRING, enum: ['none', 'scream', 'cry', 'yell', 'fearful'] },
        trigger_status: { type: Type.STRING, enum: ['none', 'medium', 'high'] },
        reasoning: { type: Type.STRING, description: "Brief explanation of acoustic patterns found in the text." },
        recommended_action: { type: Type.STRING, enum: ['continue_monitoring', 'activate_emergency', 'escalate_listening'] },
    },
    required: ["detection_confidence", "distress_type", "trigger_status", "reasoning", "recommended_action"],
};

export async function analyzeAcousticDistress(text: string): Promise<AcousticAnalysis> {
    const systemInstruction = `
SYSTEM ROLE: You are an acoustic analysis AI specialized in detecting human distress sounds from transcribed audio text. Your task is to analyze the provided text, which is a transcription of spoken audio, and determine if it contains screaming, crying, or panic-filled vocalizations by inferring acoustic patterns from the text.

ANALYSIS INSTRUCTIONS:

1. PRIMARY ACOUSTIC MARKERS - From the text, infer these patterns:
    *   **Energy Spike:** Look for words in all caps (e.g., "HELP!", "STOP!"), sudden exclamations, or descriptions of loud noises. This implies a sudden loudness increase.
    *   **Pitch Characteristics:**
        *   **Screams:** Transcriptions like "AAAAAHHH", rapid, panicked, or nonsensical speech suggest a high spectral centroid.
        *   **Crying:** Fragmented sentences, repeated words, trailing-off speech ("I... I can't..."), or transcribed sounds like "*sob*", "*crying*", "*sniffle*" suggest rhythmic pitch wobble and a lower spectral range.
    *   **Vocal Quality:** Look for signs of voice breaks, tremors, or strain. This can be indicated by stuttering, fragmented words, or descriptions of a quivering voice.
    *   **Duration:** A sustained pattern of these indicators over multiple transcribed words or phrases is a stronger signal.

2. RECOGNITION TARGETS:
    *   **SCREAM DETECTION:** Abrupt onset (e.g., "NOOOO!"), high-pitched indicators, chaotic sentence structure.
    *   **CRYING DETECTION:** Cyclical energy patterns (e.g., "*sob*... and then... *sob*"), pitch vibrato indicators (e.g., "I-I-I don't know"), breathiness (e.g., "*gasp*").

3. FALSE POSITIVE FILTERING - IGNORE:
    *   **Laughter:** Regular "ha-ha" patterns, positive context.
    *   **Music/Sirens:** Often transcribed as sound effects (e.g., "*siren wailing*") without emotional speech.
    *   **Short bursts:** Single exclamations in a normal conversational context.
    *   **Non-biological sounds:** Transcribed sounds like "*door slams*", "*dog barks*".

OUTPUT FORMAT - Return ONLY this JSON structure:

{
  "detection_confidence": 0.00,
  "distress_type": "none/scream/cry/yell/fearful",
  "trigger_status": "none/medium/high",
  "reasoning": "brief explanation of acoustic patterns found",
  "recommended_action": "continue_monitoring/activate_emergency/escalate_listening"
}

CONFIDENCE SCORING:
*   **0.85-1.00:** Clear distress patterns → "high" trigger
*   **0.70-0.84:** Probable distress → "medium" trigger
*   **0.50-0.69:** Uncertain, needs verification → "none" trigger
*   **0.00-0.49:** No distress patterns → "none" trigger
`;

    if (!text.trim()) {
        return {
            detection_confidence: 0,
            distress_type: 'none',
            trigger_status: 'none',
            reasoning: 'No text provided.',
            recommended_action: 'continue_monitoring'
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following transcribed text for acoustic signs of distress: "${text}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: acousticAnalysisSchema,
                temperature: 0.1,
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return result as AcousticAnalysis;
    } catch (error) {
        console.error("Error analyzing acoustic distress:", error);
        return {
            detection_confidence: 0,
            distress_type: 'none',
            trigger_status: 'none',
            reasoning: 'AI analysis failed.',
            recommended_action: 'continue_monitoring'
        };
    }
}


const safetyActionSchema = {
    type: Type.OBJECT,
    properties: {
        action_type: { type: Type.STRING, enum: ['safety_tip', 'de_escalation', 'information'] },
        headline: { type: Type.STRING, description: "A short, engaging headline for the suggestion (e.g., 'Grounding Technique')." },
        suggestion: { type: Type.STRING, description: "A single, concise, actionable sentence with a practical tip (e.g., 'Name 5 things you can see around you right now.')." }
    },
    required: ["action_type", "headline", "suggestion"],
};

export async function getSafetyActions(emotionState: EmotionState, acousticAnalysis: AcousticAnalysis): Promise<SafetyAction | null> {
    if (
        (emotionState.emotion === Emotion.Neutral || emotionState.emotion === Emotion.Calm || emotionState.emotion === Emotion.Happy) &&
        acousticAnalysis.distress_type === 'none' &&
        emotionState.intensity < 40
    ) {
        return null;
    }

    const systemInstruction = `You are a safety advisor AI. Based on the user's emotional state and detected acoustic patterns from their conversation, your goal is to provide a SINGLE, concise, and actionable safety tip or de-escalation strategy. The tone must be calm, empowering, and non-judgmental. Focus on practical steps the user can take in the moment.

- If **Anger** or **Yelling** is detected, suggest a de-escalation technique (e.g., "Use 'I feel' statements to express your needs without blaming.").
- If **Stress** or **Fear** is high, suggest a grounding technique (e.g., "Focus on your breathing. Inhale for 4 counts, hold for 4, exhale for 6.").
- If **Danger** is detected, provide a clear, simple safety action (e.g., "If possible, move toward an exit or a public area.").
- If **Sadness** is detected, offer a gentle coping suggestion (e.g., "It's okay to feel this way. Consider reaching out to someone you trust.").

Provide the output strictly in JSON format based on the provided schema. The suggestion must be a single, short sentence.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this data: Emotion - ${emotionState.emotion} (Intensity: ${emotionState.intensity}), Acoustic Distress - ${acousticAnalysis.distress_type} (Confidence: ${acousticAnalysis.detection_confidence}), provide a relevant safety action.`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: safetyActionSchema,
                temperature: 0.5,
            },
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as SafetyAction;
    } catch (error) {
        console.error("Error fetching safety action:", error);
        return null;
    }
}


export async function getSafetyTip(gender: Gender, isSurvivor: boolean): Promise<string> {
    try {
        const survivorContext = isSurvivor 
            ? "Crucially, the user is a survivor of gender-based violence, so the tip must be trauma-informed, focusing on empowerment, grounding techniques, setting boundaries, or recognizing personal triggers rather than generic stranger-danger advice."
            : "";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a safety and empowerment coach. Provide a single, concise, practical, and encouraging safety tip for a ${gender} to help them avoid or navigate dangerous situations, particularly related to gender-based violence. ${survivorContext} The tip should be empowering, not fear-mongering. Make it short and impactful.`
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching safety tip:", error);
        return "Could not fetch a safety tip at this moment. Stay aware of your surroundings.";
    }
}

export async function generateCalmingMessage(style: CalmAssistStyle): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Act as a compassionate de-escalation coach. Provide a single, short, calming message for someone feeling stressed or angry. The tone should be "${style}". For example, if the style is 'Soft and soothing', say "It's okay to feel this way. Let's take a moment to breathe." Do not include any preamble like "Of course..." or extra formatting like quotation marks.`
        });
        return response.text.trim().replace(/"/g, ''); // Clean up response
    } catch (error) {
        console.error("Error generating calming message:", error);
        return "Take a deep breath. You are in control.";
    }
}