import React from "react";

import { Box } from "@mui/material";

import { Outlet } from "react-router-dom";

import Header from "../features/header/Header";
import Sidebar from "../features/Sidebar/Sidebar";

const Layout = () => {
  return (
    <Box>
      <Header />
      <Sidebar />
      {/* <Box sx={{ p: 2 }}> */}
      <Box sx={{ p: 2, pl: 11 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
