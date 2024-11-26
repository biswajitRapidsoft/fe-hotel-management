import { Grid2 as Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const tabList = [
  { label: "Hotel List", count: 100, path: "/hotel-list" },
  { label: "Room Type", count: 100, path: "/room-type" },
  { label: "Extra Item", count: 100, path: "/extra-item" },
  { label: "Employee List", count: 100, path: "/employee-list" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();

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
                      {tab.count}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      {/* hotel list table  */}
    </React.Fragment>
  );
};

export default AdminDashboard;
