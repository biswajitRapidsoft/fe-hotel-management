import React from "react";

import { useGetAllSpaTypeGuestQuery } from "../../services/spa";
import {
  Box,
  Grid2 as Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Drawer,
  Divider,
  TextField,
} from "@mui/material";
import { DrawerHeader } from "../restaurant/Restaurant";

const drawerWidth = 450;

const Spa = () => {
  const {
    data: spaTypeList = {
      data: [],
    },
  } = useGetAllSpaTypeGuestQuery(JSON.parse(sessionStorage.getItem("hotelId")));
  const [spaToBook, setSpaToBook] = React.useState(null);
  return (
    <React.Fragment>
      <Box>
        <Grid container spacing={2}>
          {spaTypeList.data.map((spa) => {
            return (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                  xl: 2.5,
                }}
                key={spa.id}
              >
                <Card sx={{ boxShadow: 3 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={spa.images[0]}
                    alt={spa.name}
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {spa.name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {`Rs. ${spa.price.toFixed(2)}`}
                        </Typography>
                      </Box>
                      <Box>
                        <Button
                          color="secondary"
                          variant="contained"
                          sx={{
                            color: "#fff",
                            display: "block",
                            mx: "auto",
                            letterSpacing: 1,
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: 18,
                            "&.Mui-disabled": {
                              background: "#B2E5F6",
                              color: "#FFFFFF",
                            },
                          }}
                          onClick={() => setSpaToBook(spa)}
                        >
                          Book Now
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Drawer
          sx={{
            position: "relative",
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
          //   variant="persistent"
          anchor="right"
          open={Boolean(spaToBook)}
          onClose={() => setSpaToBook(null)}
        >
          <DrawerHeader>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Reserve a Spa Time
            </Typography>
          </DrawerHeader>
          <Divider />
          <Typography variant="h6" sx={{ p: 2 }}>
            {spaToBook?.name}
          </Typography>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <TextField
                  label="From Date"
                  type="datetime-local"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="To Date"
                  type="datetime-local"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Typography>Total: 2000</Typography>
              </Grid>
            </Grid>
          </Box>
          <Box
            sx={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
            }}
          >
            <Button
              color="secondary"
              variant="contained"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 18,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              //   disabled={!Boolean(cartItems.length && dineType)}
              //   onClick={handlePlaceOrder}
            >
              Reserve
            </Button>
          </Box>
        </Drawer>
      </Box>
    </React.Fragment>
  );
};

export default Spa;
