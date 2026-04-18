const API = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// ───────── AUTH ─────────
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Helper for headers
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: "Bearer " + localStorage.getItem("token"),
});

// ───────── AUTH API ─────────
export const login = async (email, password) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) throw new Error("Register failed");
  return res.json();
};

// ───────── WATCHLIST ─────────
export const fetchWatchlist = async () => {
  const res = await fetch(`${API}/watchlist`, {
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
};

export const addToWatchlist = async (movie) => {
  const res = await fetch(`${API}/watchlist`, {   // ✅ FIXED
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      tmdbId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      releaseDate: movie.release_date,
    }),
  });

  if (!res.ok) throw new Error("Failed to add");
  return res.json();
};

export const removeFromWatchlist = async (tmdbId) => {
  const res = await fetch(`${API}/watchlist/${tmdbId}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) throw new Error("Failed to remove");
  return res.json();
};

// ───────── MOVIES (TMDB) ─────────
const TMDB_API_KEY = "55a815c9929d79db04d1b67e0777af17"; // 🔥 PUT REAL KEY HERE

export const fetchMovies = async (query = "") => {
  const url = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error("Failed to fetch movies");

  const data = await res.json();
  return data.results || [];
};