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
        description: "List available streaming platforms in TAIWAN (e.g., Netflix, Disney+, Catchplay+, friDay, HBO GO, Apple TV, Google Play). Separate with commas. Be accurate for the Taiwan region." 
      },
      posterUrl: { 
        type: Type.STRING, 
        description: "A direct URL to the movie poster image. Prioritize official posters or high-quality covers from standard sources (like Wikimedia Commons, TMDB source, or official studio sites). Returns empty string if no reliable URL is found." 
      },
      emoji: { type: Type.STRING, description: "A single emoji representing the movie theme." },
    },
    required: ["title", "year", "genre", "description", "director", "platform", "emoji"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find details for the movie "${movieName}". Target audience: Taiwan. 
      1. Find the official Traditional Chinese title used in Taiwan.
      2. Identify specifically which streaming platforms in Taiwan currently have this movie.
      3. Find a valid URL for the movie poster.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a Taiwanese movie expert. You provide accurate metadata for movies, especially their availability on streaming platforms in Taiwan (Netflix TW, Disney+, Catchplay+, friDay, Hami Video, etc). You always try to find a visual poster for the movie.",
        tools: [{googleSearch: {}}], // Enable search to help find platforms and posters
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
      posterUrl: data.posterUrl,
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
      platform: "未知",
      emoji: "🎬",
      addedBy: userNickname,
      votes: [],
    };
  }
};