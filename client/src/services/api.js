const API_KEY = "18279ce723982eecf6c783c1d2b033dd";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (token, user) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
};

export const clearSession = () => setSession(null, null);

export const fetchMovies = async (query) => {
  const url = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
};

export const register = async (name, email, password) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Register failed");
  return data;
};

export const login = async (email, password) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Login failed");
  return data;
};

const handleAuthResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearSession();
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
};

export const fetchWatchlist = async () => {
  const res = await fetch("/api/watchlist", { headers: authHeaders() });
  const data = await handleAuthResponse(res);
  return Array.isArray(data) ? data : [];
};

export const tmdbMovieToPayload = (movie) => ({
  tmdbId: movie.id,
  title: movie.title,
  posterPath: movie.poster_path || "",
  overview: movie.overview || "",
  voteAverage: movie.vote_average ?? 0,
  releaseDate: movie.release_date || ""
});

export const addToWatchlist = async (movie) => {
  const res = await fetch("/api/watchlist", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(tmdbMovieToPayload(movie))
  });
  return handleAuthResponse(res);
};

export const removeFromWatchlist = async (tmdbId) => {
  const res = await fetch(`/api/watchlist/${tmdbId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return handleAuthResponse(res);
};
