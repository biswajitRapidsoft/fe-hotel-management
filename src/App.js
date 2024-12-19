import React from "react";
import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";

const Login = React.lazy(() => import("./features/login/Login"));
const Dashboard = React.lazy(() => import("./features/dashboard/Dashboard"));
const Layout = React.lazy(() => import("./routes/Layout"));
const SuperLayout = React.lazy(() => import("./routes/SuperLayout"));
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
const Restaurant = React.lazy(() => import("./features/restaurant/Restaurant"));
const RestaurantAdmin = React.lazy(() =>
  import("./features/restaurant/RestaurantAdmin")
);
const Bar = React.lazy(() => import("./features/bar/Bar"));
const FrontdeskBookingHistory = React.lazy(() =>
  import("./features/frontdeskBookingHistory/FrontdeskBookingHistory")
);
const HotelBillInvoice = React.lazy(() =>
  import("./features/HotelBillInvoice/HotelBillInvoice")
);
const HallBookingDashboard = React.lazy(() =>
  import("./features/hallBookingDashboard/HallBookingDashboard")
);
const Parking = React.lazy(() => import("./features/parking/Parking"));

const LaundryHistory = React.lazy(() =>
  import("./features/dashboard/LaundryHistory")
);

const HallList = React.lazy(() => import("./features/hotel/HallList"));
const BanquetList = React.lazy(() => import("./features/hotel/BanquetList"));

const HouseKeepingHistory = React.lazy(() =>
  import("./features/houseKeepingHistory/HouseKeepingHistory")
);

const PromocodeList = React.lazy(() => import("./features/hotel/PromcodeList"));

const BarAdmin = React.lazy(() => import("./features/bar/BarAdmin"));

const ManagerDashboard = React.lazy(() =>
  import("./features/managerDashboard/ManagerDashboard")
);

const SpaType = React.lazy(() => import("./features/spaType/SpaType"));

function App() {
  return (
    <div className="App">
      <React.Suspense fallback={<LoadingComponent open={true} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/guest-login" />} />
          <Route path="/guest-login" element={<Login key="guest-login" />} />
          <Route path="/staff-login" element={<Login key="staff-login" />} />
          <Route
            path="/hotelBillInvoice/:bookingRefNo"
            element={<HotelBillInvoice key="hotel-bill" />}
          />
          <Route element={<SuperLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/hotel-list" element={<HotelList />} />
            <Route path="/room-type" element={<RoomType />} />
            <Route path="/extra-item" element={<ExtraItem />} />
            <Route path="/employee-list" element={<EmployeeList />} />
            <Route path="/spa-type" element={<SpaType />} />
            <Route path="/HallList" element={<HallList />} />
            <Route path="/BanquetList" element={<BanquetList />} />
            <Route path="/PromocodeList" element={<PromocodeList />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/resturant" element={<Restaurant />} />
            <Route path="/restaurant-admin" element={<RestaurantAdmin />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/bar-admin" element={<BarAdmin />} />
            <Route path="/Parking" element={<Parking />} />
            <Route path="/managerDashboard" element={<ManagerDashboard />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/frontdeskBookingHistory"
              element={<FrontdeskBookingHistory />}
            />
            <Route path="/hallBookings" element={<HallBookingDashboard />} />

            <Route
              path="/HouseKeepingHistory"
              element={<HouseKeepingHistory />}
            />

            <Route
              path="/housekeeper-dashboard"
              element={<HouseKeeperDashboard />}
            />
            <Route path="/LaundryHistory" element={<LaundryHistory />} />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
