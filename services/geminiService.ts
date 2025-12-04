import { GoogleGenAI } from "@google/genai";
import { Movie } from "../types";

// Helper to safely get key from process.env or window override
const getApiKey = () => {
  const envKey = process.env.API_KEY;
  // If the key is still the placeholder (meaning replacement failed or didn't run), return empty
  if (envKey === '__API_KEY__') {
    // Check if user defined a global variable via snippet injection as fallback
    return (window as any).GEMINI_API_KEY || '';
  }
  return envKey || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const fetchMovieMetadata = async (
  movieName: string, 
  userNickname: string
): Promise<Omit<Movie, 'id' | 'createdAt'>> => {
  
  if (!apiKey || apiKey === '__API_KEY__') {
    console.error("Critical: API Key is missing.");
    throw new Error("系統未設定 API Key。請確認 Netlify 的 Environment Variables 設定，或檢查 netlify.toml 是否生效。");
  }

  try {
    // Note: When using googleSearch tool, we cannot use responseMimeType: 'application/json' or responseSchema.
    // We must prompt the model to output JSON text and parse it manually.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find details for the movie "${movieName}". Target audience: Taiwan. 
      1. Find the official Traditional Chinese title used in Taiwan.
      2. Identify specifically which streaming platforms in Taiwan currently have this movie.
      3. Find a valid URL for the movie poster.
      
      Return the result strictly as a raw JSON object (do not wrap in markdown code blocks) with the following keys:
      - title (string)
      - year (string)
      - genre (string)
      - description (string, max 2 sentences in Traditional Chinese)
      - director (string)
      - platform (string, comma separated list of Taiwan platforms like Netflix TW, Disney+, Catchplay+)
      - posterUrl (string, valid URL or empty)
      - emoji (string)
      `,
      config: {
        // responseMimeType: "application/json", // DISABLED due to googleSearch conflict
        systemInstruction: "You are a Taiwanese movie expert. You provide accurate metadata for movies, especially their availability on streaming platforms in Taiwan (Netflix TW, Disney+, Catchplay+, friDay, Hami Video, etc). You always try to find a visual poster for the movie.",
        tools: [{googleSearch: {}}], // Enable search to help find platforms and posters
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean up markdown if the model returns it despite instructions
    // e.g., ```json { ... } ``` or ``` { ... } ```
    text = text.replace(/^```json\s*/g, '').replace(/^```\s*/g, '').replace(/```$/g, '').trim();

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON:", text);
        // Fallback or re-throw
        throw new Error("AI returned invalid JSON format");
    }

    return {
      title: data.title || movieName,
      year: data.year || "Unknown",
      genre: data.genre || "Unknown",
      description: data.description || "AI 暫時無法取得完整資訊",
      director: data.director || "Unknown",
      platform: data.platform || "未知",
      posterUrl: data.posterUrl || "",
      emoji: data.emoji || "🎬",
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