import React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const StockManagement = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <Grid container size={12} spacing={2}>
        <Grid size={{ xs: 3 }}>
          <Box
            sx={{
              boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              height: "170px",
              borderRadius: "14px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
            onClick={() => navigate("/BarStockManagement")}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "1.4rem",
              }}
            >
              Bar Stock Management
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockManagement;
