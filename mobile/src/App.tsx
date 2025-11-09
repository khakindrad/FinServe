import React from "react";
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="app-container" style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h2>FinServe Hybrid App</h2>
      {loggedIn ? (
        <Dashboard onLogout={() => setLoggedIn(false)} />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;
