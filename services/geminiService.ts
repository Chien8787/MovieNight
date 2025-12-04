import { Movie } from "../types";

export const fetchMovieMetadata = async (
  movieName: string, 
  userNickname: string
): Promise<Omit<Movie, 'id' | 'createdAt'>> => {
  
  try {
    // Call our own backend proxy
    const response = await fetch('/.netlify/functions/movie-proxy', {
      method: 'POST',
      body: JSON.stringify({ movieName }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    return {
      title: data.title || movieName,
      year: data.year || "Unknown",
      genre: data.genre || "Unknown",
      description: data.description || "AI 暫時無法取得資訊",
      director: data.director || "Unknown",
      platform: data.platform || "未知",
      posterUrl: data.posterUrl || "",
      emoji: data.emoji || "🎬",
      addedBy: userNickname,
      votes: [],
    };
  } catch (error) {
    console.error("Movie Search Error:", error);
    // Fallback data
    return {
      title: movieName,
      year: "Unknown",
      genre: "Unknown",
      description: "搜尋時發生問題，請稍後再試。",
      director: "Unknown",
      platform: "未知",
      emoji: "🎬",
      addedBy: userNickname,
      votes: [],
    };
  }
};