import React, { memo } from "react";
import Grid from "@mui/material/Grid2";
// import { hotels } from "./dummyHotelsJson";
// import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";

import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetAllHotelsQuery } from "../../services/dashboard";
import TextField from "@mui/material/TextField";

import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const GuestDashboard = () => {
  const {
    data: hotelList = {
      data: [],
    },
  } = useGetAllHotelsQuery();

  return (
    <>
      <Box sx={{ width: "100%", px: 2, py: 5 }}>
        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ width: "100%" }}>
              <Grid container size={12} spacing={2}>
                {hotelList?.data?.map((item, index) => {
                  return (
                    <Grid
                      key={`hotel${index}`}
                      size={{ xs: 12, sm: 6, md: 4, lg: 2.4, xl: 2.4 }}
                    >
                      <CustomHotelCard hotelDetails={item} />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

const CustomHotelCard = memo(function ({ hotelDetails }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };
  return (
    <Box
      sx={{
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        // boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* <Box sx={{ width: "100%", height: "15rem" }}>
          {hotelDetails?.images && (
            <img
              src={hotelDetails.images[0]}
              alt={hotelDetails.name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
              }}
            />
          )}
        </Box> */}
        <Box sx={{ width: "100%", height: "15rem" }}>
          {hotelDetails?.images?.[0] && (
            <img
              src={hotelDetails.images[0]}
              alt={hotelDetails?.hotelDto?.name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            px: 1,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              {hotelDetails?.hotelDto?.name}
            </Typography>
            <Typography sx={{ color: "gray" }}>
              {hotelDetails?.hotelDto?.address}
            </Typography>
            <Typography>₹{hotelDetails?.basePrice}</Typography>
          </Box>
          <Box sx={{ display: "flex", marginY: "auto" }}>
            <Button
              variant="contained"
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                color: "white",
                "&:hover": {
                  backgroundImage:
                    "linear-gradient(to right, #0acffe 10%, #495aff 90%)", // Optional hover adjustment
                },
              }}
              onClick={toggleDrawer(true)}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Drawer for booking details */}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        // BackdropProps={{
        //   sx: {
        //     backdropFilter: "blur(1.3px)",
        //     backgroundColor: "rgba(0, 0, 0, 0.5)",
        //   },
        // }}
      >
        <Box sx={{ width: 500 }} role="presentation">
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 550, fontSize: "1.5em" }}>
              Booking Details
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ px: 2, py: 2 }}>
            <Grid container size={12} spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="First Name"
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="Middle Name"
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="Phone No."
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="Email"
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  label="Address"
                  variant="outlined"
                  // size="small"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker label="From Date" />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker label="To Date" />
                  </DemoContainer>
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundImage:
                      "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                    color: "white",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(to right, #0acffe 10%, #495aff 90%)", // Optional hover adjustment
                    },
                  }}
                >
                  Reserve
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
});

export default GuestDashboard;
