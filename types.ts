export interface Movie {
  id: string;
  title: string;
  year: string;
  genre: string;
  description: string;
  director: string;
  platform: string;
  posterUrl?: string; // Optional URL for the movie poster
  emoji: string;
  addedBy: string;
  votes: string[]; // Array of user nicknames
  createdAt: number;
}

export interface DatePoll {
  id: string;
  date: string; // YYYY-MM-DD
  votes: string[]; // Array of user nicknames
}

export interface User {
  name: string;
}

export interface RouletteState {
  isSpinning: boolean;
  winner: Movie | null;
  highlightedId: string | null;
}