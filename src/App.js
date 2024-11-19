import React from "react";
import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";
import Dashboard from "./features/dashboard/Dashboard";
import Layout from "./routes/Layout";
import AdminDashboard from "./features/dashboard/AdminDashboard";
import GuestDashboard from "./features/dashboard/GuestDashboard";
import HotelList from "./features/hotel/HotelList";

const Login = React.lazy(() => import("./features/login/Login"));

function App() {
  return (
    <div className="App">
      <React.Suspense fallback={<LoadingComponent open={true} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/guest-login" />} />
          <Route path="/guest-login" element={<Login key="guest-login" />} />
          <Route path="/staff-login" element={<Login key="staff-login" />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/hotel-list" element={<HotelList />} />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
