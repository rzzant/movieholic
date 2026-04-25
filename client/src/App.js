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
        setAuthMode("login");
      } else {
        const data = await login(email, password);
        setSession(data.token, data.user);
        setToken(data.token);
        setUser(data.user);
      }
    } catch (err) {
      setError("Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const handleAdd = async (movie) => {
    await addToWatchlist(movie);
    await loadWatchlist();
  };

  const handleRemove = async (id) => {
    await removeFromWatchlist(id);
    await loadWatchlist();
  };

  return (
    <div style={{ background: "#111", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>MovieHolic</h1>

      {!user ? (
        <form onSubmit={handleAuth} style={{ textAlign: "center" }}>
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
          <button>{authMode === "login" ? "Login" : "Register"}</button>
        </form>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <input
          placeholder="Search movie"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,200px)", gap: "20px", marginTop: "20px" }}>
        {movies.map((m) => (
          <div key={m.id}>
            <img src={posterUrl(m.poster_path)} alt="" width="100%" />
            <p>{m.title}</p>
            <button onClick={() => handleAdd(m)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;