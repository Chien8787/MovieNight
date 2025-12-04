import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Movie } from "../types";

// Initialize Gemini Client
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const fetchMovieMetadata = async (
  movieName: string, 
  userNickname: string
): Promise<Omit<Movie, 'id' | 'createdAt'>> => {
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Traditional Chinese Title (Taiwan)" },
      year: { type: Type.STRING, description: "Release Year" },
      genre: { type: Type.STRING, description: "Main Genre in Traditional Chinese" },
      description: { type: Type.STRING, description: "A short, punchy summary in Traditional Chinese (Taiwan style), max 2 sentences." },
      director: { type: Type.STRING, description: "Director's name" },
      platform: { 
        type: Type.STRING, 
        description: "Best guessing streaming platform in Taiwan (e.g., Netflix TW, Disney+, Catchplay, HBO GO, Prime Video). If unknown, say '未知'." 
      },
      emoji: { type: Type.STRING, description: "A single emoji representing the movie theme." },
    },
    required: ["title", "year", "genre", "description", "director", "platform", "emoji"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find details for the movie "${movieName}". Context: Taiwanese audience. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a Taiwanese movie geek. You provide accurate metadata for movies including their availability on streaming platforms in Taiwan. Use Traditional Chinese (Taiwan standard).",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    return {
      title: data.title,
      year: data.year,
      genre: data.genre,
      description: data.description,
      director: data.director,
      platform: data.platform,
      emoji: data.emoji,
      addedBy: userNickname,
      votes: [],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return {
      title: movieName,
      year: "Unknown",
      genre: "Unknown",
      description: "AI 暫時無法取得資訊，但這部片一定很讚！",
      director: "Unknown",
      platform: "Unknown",
      emoji: "🎬",
      addedBy: userNickname,
      votes: [],
    };
  }
};
