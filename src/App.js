import React from "react";
import "./App.css";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoadingComponent from "./components/LoadingComponent";
import ParkingList from "./features/parking/ParkingList";

// const Login = React.lazy(() => import("./features/login/Login"));
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

const ParkingBillInvoice = React.lazy(() =>
  import("./features/ParkingInvoice/ParkingInvoice")
);

const FoodInvoice = React.lazy(() =>
  import("./features/foodInvoice/FoodInvoice")
);
// const BarInvoice = React.lazy(() => import("./features/BarInvoice/BarInvoice"));
const BarInvoice = React.lazy(() => import("./features/bar/BarInvoice"));
const HallBookingDashboard = React.lazy(() =>
  import("./features/hallBookingDashboard/HallBookingDashboard")
);
const Parking = React.lazy(() => import("./features/parking/Parking"));

const LaundryHistoryForAdmin = React.lazy(() =>
  import("./features/dashboard/LaundryHistory")
);

const LaundryHistoryForGuest = React.lazy(() =>
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
const Spa = React.lazy(() => import("./features/spa/Spa"));
const SpaInvoice = React.lazy(() => import("./features/spa/SpaInvoice"));

const SpaInvoiceForFrontesk = React.lazy(() =>
  import("./features/spaInvoiceForFrontdesk/SpaInvoiceForFrontdesk")
);
const LoginV2 = React.lazy(() => import("./features/login/Loginv2"));
const SpaAdmin = React.lazy(() => import("./features/spa/SpaAdmin"));
const CleaningServiceHistory = React.lazy(() =>
  import("./features/dashboard/CleaningServiceHistory")
);
const ParkingHistory = React.lazy(() =>
  import("./features/parking/ParkingHistory")
);

const FoodItemList = React.lazy(() => import("./features/hotel/FoodItemList"));

const InventoryManagement = React.lazy(() =>
  import("./features/inventory/InventoryManagement")
);

function App() {
  const location = useLocation();
  // console.log("hello3", location);

  React.useEffect(() => {
    // console.log("hello", location);
    if (
      location.pathname === "/staff-login" ||
      location.pathname === "/guest-login"
    ) {
      // console.log("hello1", location);
      sessionStorage.clear();
    }
  }, [location]);

  return (
    <div className="App">
      <React.Suspense fallback={<LoadingComponent open={true} />}>
        <Routes>
          <Route path="/" element={<Navigate to="/guest-login" />} />
          {/* <Route path="/guest-login" element={<Login key="guest-login" />} /> */}
          {/* <Route path="/staff-login" element={<Login key="staff-login" />} /> */}
          <Route path="/guest-login" element={<LoginV2 key="guest-login" />} />
          <Route path="/staff-login" element={<LoginV2 key="staff-login" />} />
          {/* <Route path="/LoginV2" element={<LoginV2 />} /> */}
          <Route
            path="/hotelBillInvoice/:bookingRefNo"
            element={<HotelBillInvoice key="hotel-bill" />}
          />
          <Route
            path="/parkingBillInvoice/:bookingRefNo"
            element={<ParkingBillInvoice key="park-bill" />}
          />
          <Route
            path="/foodBillInvoice/:bookingRefNo"
            element={<FoodInvoice key="food-bill" />}
          />
          <Route
            path="/BarInvoice/:bookingRefNo"
            element={<BarInvoice key="food-bill" />}
          />
          <Route path="/spaInvoice" element={<SpaInvoice />} />
          <Route
            path="/SpaInvoiceForFrontesk/:bookingRefNo"
            element={<SpaInvoiceForFrontesk />}
          />
          <Route element={<SuperLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/hotel-list" element={<HotelList />} />
            <Route path="/room-type" element={<RoomType />} />
            <Route path="/extra-item" element={<ExtraItem />} />
            <Route path="/employee-list" element={<EmployeeList />} />
            <Route path="/spa-type" element={<SpaType />} />
            <Route path="/spa" element={<Spa />} />
            <Route path="/HallList" element={<HallList />} />
            <Route path="/BanquetList" element={<BanquetList />} />
            <Route path="/PromocodeList" element={<PromocodeList />} />
            <Route path="/parking-list" element={<ParkingList />} />
            <Route path="/guest-dashboard" element={<GuestDashboard />} />
            <Route path="/resturant" element={<Restaurant />} />
            <Route path="/restaurant-admin" element={<RestaurantAdmin />} />
            <Route path="/bar" element={<Bar />} />
            <Route path="/bar-admin" element={<BarAdmin />} />
            <Route path="/managerDashboard" element={<ManagerDashboard />} />
            <Route
              path="/inventoryManagement"
              element={<InventoryManagement />}
            />
            <Route
              path="/LaundryHistoryForGuest"
              element={<LaundryHistoryForGuest />}
            />
            <Route path="/FoodItemList" element={<FoodItemList />} />

            {/* LaundryHistoryForGuest */}
          </Route>

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/frontdeskBookingHistory"
              element={<FrontdeskBookingHistory />}
            />
            <Route path="/spa-admin" element={<SpaAdmin />} />
            <Route path="/hallBookings" element={<HallBookingDashboard />} />

            <Route
              path="/HouseKeepingHistory"
              element={<HouseKeepingHistory />}
            />

            <Route
              path="/housekeeper-dashboard"
              element={<HouseKeeperDashboard />}
            />
            <Route
              path="/LaundryHistory"
              element={<LaundryHistoryForAdmin />}
            />
            <Route
              path="/CleaningServiceHistory"
              element={<CleaningServiceHistory />}
            />
            <Route path="/Parking" element={<Parking />} />
            <Route path="/ParkingHistory" element={<ParkingHistory />} />
          </Route>
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
