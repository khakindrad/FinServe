import React from "react";

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div>
      <h3>Welcome to FinServe Dashboard</h3>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
