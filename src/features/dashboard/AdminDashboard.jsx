import { Grid2 as Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

import { useGetMasterDataListQuery } from "../../services/dashboard";
import LoadingComponent from "../../components/LoadingComponent";
import { ADMIN } from "../../helper/constants";

const tabList = [
  {
    label: "Inventory List",
    path: "/extra-item",
    key: "noOfExtraItems",
  },
  { label: "Room Type", path: "/room-type", key: "noOfRoomTypes" },
  { label: "Hotel List", path: "/hotel-list", key: "noOfHotels" },
  {
    label: "Employee List",
    path: "/employee-list",
    key: "noOfUsers",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const {
    data: dashboardData = {
      data: {
        noOfExtraItems: 0,
        noOfHotels: 0,
        noOfRoomTypes: 0,
        noOfUsers: 0,
      },
    },
    isLoading,
  } = useGetMasterDataListQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN,
    }
  );

  const handleClick = React.useCallback(
    (pathName) => {
      navigate(pathName);
    },
    [navigate]
  );

  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {tabList.map((tab) => {
          return (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, xl: 3 }}
              sx={{
                ".MuiPaper-root": {
                  p: 1,
                  cursor: "pointer",
                },
                ".MuiTypography-h5": {
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 600,
                  letterSpacing: 0.75,
                },
                ".MuiTypography-h6": {
                  color: (theme) => theme.palette.secondary.main,
                  fontWeight: 600,
                  letterSpacing: 0.75,
                },
              }}
              key={tab.label}
            >
              <Paper onClick={() => handleClick(tab.path)}>
                <Grid container>
                  <Grid size={12}>
                    <Typography align="center" variant="h5">
                      {tab.label}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Typography align="center" variant="h6">
                      {dashboardData.data[tab.key]}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <LoadingComponent open={isLoading} />
    </React.Fragment>
  );
};

export default AdminDashboard;
