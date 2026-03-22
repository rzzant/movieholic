import React, { useCallback, useEffect, useState } from "react";
import {
  addToWatchlist,
  clearSession,
  fetchMovies,
  fetchWatchlist,
  getStoredUser,
  login,
  register,
  removeFromWatchlist,
  setSession
} from "./services/api";

const posterUrl = (path) =>
  path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : "https://via.placeholder.com/300x450";

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => getStoredUser());
  const [watchlist, setWatchlist] = useState([]);
  const [tab, setTab] = useState("browse");
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const watchlistIds = new Set(watchlist.map((w) => w.tmdbId));

  const loadWatchlist = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setWatchlist([]);
      return;
    }
    try {
      const list = await fetchWatchlist();
      setWatchlist(list);
      setError("");
    } catch (e) {
      if (e.message && e.message.includes("Session expired")) {
        setToken(null);
        setUser(null);
      }
      setError(e.message || "Could not load watchlist");
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const data = await fetchMovies();
      setMovies(data);
    };
    run();
  }, []);

  useEffect(() => {
    if (token) loadWatchlist();
    else setWatchlist([]);
  }, [token, loadWatchlist]);

  const handleSearch = async () => {
    const data = await fetchMovies(search);
    setMovies(data);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (authMode === "register") {
        await register(name, email, password);
        setError("Account created. You can sign in now.");
        setAuthMode("login");
        setPassword("");
      } else {
        const data = await login(email, password);
        setSession(data.token, data.user);
        setToken(data.token);
        setUser(data.user);
        setPassword("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
    setTab("browse");
  };

  const handleAdd = async (movie) => {
    if (!token) {
      setError("Sign in to save movies to your watchlist.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await addToWatchlist(movie);
      await loadWatchlist();
    } catch (err) {
      setError(err.message || "Could not add");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (tmdbId) => {
    setBusy(true);
    setError("");
    try {
      await removeFromWatchlist(tmdbId);
      await loadWatchlist();
    } catch (err) {
      setError(err.message || "Could not remove");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px"
      }}
    >
      <h1 style={{ textAlign: "center" }}>MovieHolic</h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "16px"
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setTab("browse")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              background: tab === "browse" ? "#e50914" : "#333",
              color: "white"
            }}
          >
            Browse
          </button>
          <button
            type="button"
            onClick={() => setTab("watchlist")}
            disabled={!token}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: token ? "pointer" : "not-allowed",
              background: tab === "watchlist" ? "#e50914" : "#333",
              color: "white",
              opacity: token ? 1 : 0.5
            }}
          >
            My watchlist
          </button>
        </div>

        {user ? (
          <span style={{ color: "#ccc" }}>
            Hi, {user.name}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginLeft: "12px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #555",
                background: "transparent",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              Log out
            </button>
          </span>
        ) : (
          <form
            onSubmit={handleAuth}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {authMode === "register" && (
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "none",
                background: "#e50914",
                color: "white",
                cursor: busy ? "wait" : "pointer"
              }}
            >
              {authMode === "register" ? "Register" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setError("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #555",
                background: "transparent",
                color: "#ccc",
                cursor: "pointer"
              }}
            >
              {authMode === "login" ? "Need an account?" : "Have an account?"}
            </button>
          </form>
        )}
      </div>

      {error ? (
        <p style={{ color: "#ff8a8a", textAlign: "center", marginBottom: "12px" }}>
          {error}
        </p>
      ) : null}

      {tab === "browse" && (
        <>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search movie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px"
            }}
          >
            {movies?.map((movie) => {
              const saved = watchlistIds.has(movie.id);
              return (
                <div
                  key={movie.id}
                  style={{
                    background: "#1c1c1c",
                    borderRadius: "10px",
                    overflow: "hidden",
                    textAlign: "center",
                    transition: "transform 0.2s"
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.03)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <img
                    src={posterUrl(movie.poster_path)}
                    alt={movie.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover"
                    }}
                  />

                  <h3 style={{ fontSize: "16px", padding: "10px" }}>
                    {movie.title}
                  </h3>

                  <p style={{ marginBottom: "8px" }}>
                    {movie.vote_average != null
                      ? `Rating ${movie.vote_average.toFixed(1)}`
                      : "—"}
                  </p>

                  <button
                    type="button"
                    disabled={busy || !token}
                    onClick={() =>
                      saved ? handleRemove(movie.id) : handleAdd(movie)
                    }
                    style={{
                      marginBottom: "12px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor:
                        busy || !token ? "not-allowed" : "pointer",
                      background: saved ? "#444" : "#e50914",
                      color: "white",
                      width: "90%"
                    }}
                  >
                    {!token
                      ? "Sign in to save"
                      : saved
                        ? "Remove from watchlist"
                        : "Add to watchlist"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "watchlist" && token && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px"
          }}
        >
          {watchlist.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#888" }}>
              Nothing saved yet. Browse movies and add them here.
            </p>
          ) : (
            watchlist.map((item) => (
              <div
                key={item._id}
                style={{
                  background: "#1c1c1c",
                  borderRadius: "10px",
                  overflow: "hidden",
                  textAlign: "center"
                }}
              >
                <img
                  src={posterUrl(item.posterPath)}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover"
                  }}
                />
                <h3 style={{ fontSize: "16px", padding: "10px" }}>{item.title}</h3>
                <p style={{ marginBottom: "8px", fontSize: "14px", color: "#ccc" }}>
                  {item.releaseDate || "—"}
                </p>
                <p style={{ marginBottom: "8px" }}>
                  {item.voteAverage != null
                    ? `Rating ${Number(item.voteAverage).toFixed(1)}`
                    : "—"}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleRemove(item.tmdbId)}
                  style={{
                    marginBottom: "12px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: busy ? "wait" : "pointer",
                    background: "#444",
                    color: "white",
                    width: "90%"
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#1c1c1c",
  color: "#fff",
  minWidth: "140px"
};

export default App;
