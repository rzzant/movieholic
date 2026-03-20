const API_KEY = "18279ce723982eecf6c783c1d2b033dd";

export const fetchMovies = async (query) => {
  const url = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results;
};