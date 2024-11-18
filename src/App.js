import React from "react";
import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";
import Dashboard from "./features/dashboard/Dashboard";
import Layout from "./routes/Layout";

const Login = React.lazy(() => import("./features/login/Login"));

function App() {
  return (
    <div className="App">
      <React.Suspense fallback={<LoadingComponent open={true} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/guest-login" />} />
          <Route path="/guest-login" element={<Login />} />
          <Route path="/staff-login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
