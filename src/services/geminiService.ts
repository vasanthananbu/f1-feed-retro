import { GoogleGenerativeAI } from "@google/generative-ai";
import { LiveState, KeyMoment, SideQuest } from "../types";

const modelName = "gemini-1.5-flash";

let aiInstance: GoogleGenerativeAI | null = null;

function getAI(): GoogleGenerativeAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In deployed apps, we might need a fallback or a clear error
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your project settings.");
    }
    aiInstance = new GoogleGenerativeAI(apiKey);
  }
  return aiInstance;
}

export async function getRaceInsights(state: LiveState): Promise<string> {
  const prompt = `
    You are an expert F1 race commentator. Based on the current race state, provide a very concise (2-3 sentences), punchy, and exciting insight.
    
    Current State:
    - Drivers & Positions: ${JSON.stringify(Object.values(state.drivers).map(d => ({ name: d.full_name, pos: state.positions[d.driver_number] })))}
    - Key Recent Events: ${JSON.stringify(state.keyMomentHistory.slice(0, 5))}
    
    Write with a retro-gaming, high-energy vibe. Avoid being generic. Focus on the most interesting position changes or accidents.
  `;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: modelName });
    const response = await model.generateContent(prompt);
    return response.response.text() || "NO_SIGNAL // AWAITING_FEED";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "CONNECTION_INTERRUPTED // DATA_STREAM_CLEANING";
  }
}

export async function generateAIQuest(state: LiveState): Promise<Partial<SideQuest> | null> {
  const prompt = `
    Based on the F1 race state below, generate a new fan engagement 'Side Quest'.
    It can be a POLL or a QUIZ.
    
    Current State:
    - Top 3: ${JSON.stringify(Object.values(state.drivers).filter(d => state.positions[d.driver_number] <= 3).map(d => d.full_name))}
    
    Return a JSON object:
    {
      "type": "POLL" or "QUIZ",
      "title": "Short catchy title",
      "description": "Engaging description",
      "options": ["Option 1", "Option 2", "Option 3"],
      "correctOption": 0 (if QUIZ, index of correct answer)
    }
  `;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text().trim());
  } catch (error) {
    console.error("Gemini Quest Error:", error);
    return null;
  }
}

export async function generateAIKeyMoment(state: LiveState): Promise<Partial<KeyMoment> | null> {
    const prompt = `
      Based on the F1 race state below, generate a fictional but realistic 'Key Moment' for the show.
      
      Return a JSON object:
      {
        "type": "OVERTAKE" or "ACCIDENT" or "FASTEST_LAP" or "PIT_STOP",
        "message": "Dramatic announcer-style message",
        "driverName": "Name of a driver in the field",
        "teamColour": "Hex color without #"
      }
      
      Drivers available: ${JSON.stringify(Object.values(state.drivers).map(d => ({ name: d.full_name, team: d.team_name, color: d.team_colour })))}
    `;
  
    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const response = await model.generateContent(prompt);
      return JSON.parse(response.response.text().trim());
    } catch (error) {
      console.error("Gemini Moment Error:", error);
      return null;
    }
  }
