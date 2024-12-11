import React from "react";

import { Box } from "@mui/material";

import { Outlet } from "react-router-dom";

import Header from "../features/header/Header";

const SuperLayout = () => {
  return (
    <Box>
      <Header />

      <Outlet />
    </Box>
  );
};

export default SuperLayout;
