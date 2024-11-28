import React from "react";
import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";

const Login = React.lazy(() => import("./features/login/Login"));
const Dashboard = React.lazy(() => import("./features/dashboard/Dashboard"));
const Layout = React.lazy(() => import("./routes/Layout"));
const AdminDashboard = React.lazy(() =>
  import("./features/dashboard/AdminDashboard")
);
const GuestDashboard = React.lazy(() =>
  import("./features/dashboard/GuestDashboard")
);
const HotelList = React.lazy(() => import("./features/hotel/HotelList"));
const RoomType = React.lazy(() => import("./features/roomType/RoomType"));
const ExtraItem = React.lazy(() => import("./features/extraItem/ExtraItem"));
const EmployeeList = React.lazy(() => import("./features/employee/Employee"));
const HouseKeeperDashboard = React.lazy(() =>
  import("./features/dashboard/HouseKeeperDashboard")
);
const FrontdeskBookingHistory = React.lazy(() =>
  import("./features/frontdeskBookingHistory/FrontdeskBookingHistory")
);

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
            <Route path="/room-type" element={<RoomType />} />
            <Route path="/extra-item" element={<ExtraItem />} />
            <Route path="/employee-list" element={<EmployeeList />} />
            <Route
              path="/housekeeper-dashboard"
              element={<HouseKeeperDashboard />}
            />
            <Route
              path="/frontdeskBookingHistory"
              element={<FrontdeskBookingHistory />}
            />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
