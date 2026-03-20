import React, { useEffect, useState } from "react";
import { fetchMovies } from "./services/api";

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    const data = await fetchMovies();
    setMovies(data);
  };

  const handleSearch = async () => {
    const data = await fetchMovies(search);
    setMovies(data);
  };

  return (
    <div style={{ background: "#111", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>🎬 MovieHolic</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "none"
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 15px",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none",
            background: "#e50914",
            color: "white"
          }}
        >
          Search
        </button>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {movies?.map((movie) => (
          <div
            key={movie.id}
            style={{
              background: "#1c1c1c",
              borderRadius: "10px",
              overflow: "hidden",
              textAlign: "center",
              transition: "transform 0.2s",
              cursor: "pointer"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "https://via.placeholder.com/300x450"
              }
              alt={movie.title}
              style={{ width: "100%", height: "300px", objectFit: "cover" }}
            />

            <h3 style={{ fontSize: "16px", padding: "10px" }}>
              {movie.title}
            </h3>

            <p style={{ marginBottom: "10px" }}>
              ⭐ {movie.vote_average}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;