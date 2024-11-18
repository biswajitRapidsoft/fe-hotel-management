import React from "react";
import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";
import Dashboard from "./features/dashboard/Dashboard";

const Login = React.lazy(() => import("./features/login/Login"));

function App() {
  return (
    <div className="App">
      <React.Suspense fallback={<LoadingComponent open={true} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
