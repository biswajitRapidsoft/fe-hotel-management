import React from "react";

import {
  useGetAllSpaTypeGuestQuery,
  useGetSpaSlotsQuery,
} from "../../services/spa";
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
  Tab,
} from "@mui/material";
import { DrawerHeader } from "../restaurant/Restaurant";
import { TabContext, TabList } from "@mui/lab";
import { DAY, NIGHT } from "../../helper/constants";
import moment from "moment";

const drawerWidth = 450;

const Spa = () => {
  const {
    data: spaTypeList = {
      data: [],
    },
  } = useGetAllSpaTypeGuestQuery(JSON.parse(sessionStorage.getItem("hotelId")));
  const [spaToBook, setSpaToBook] = React.useState(null);
  const [selectedSlotType, setSelectedSlotType] = React.useState(DAY);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState("");

  const {
    data: spaSlots = {
      data: [],
    },
  } = useGetSpaSlotsQuery(
    {
      spaTypeId: spaToBook?.id || null,
      shiftType: selectedSlotType,
      date: moment(selectedDate).format("DD-MM-YYYY"),
    },
    { skip: !Boolean(selectedDate) }
  );

  const handleTabChange = React.useCallback((e, value) => {
    setSelectedSlotType(value);
  }, []);

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
                        <Typography variant="body1" sx={{ fontSize: 18 }}>
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
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {spaToBook?.name}
                </Typography>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Booking Date"
                  type="date"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      borderBottom: (theme) =>
                        `3px solid ${theme.palette.primary.main}`,
                      fontWeight: "bold",
                    }}
                  >
                    Available Slots
                  </Typography>
                  <Box>
                    <TabContext value={selectedSlotType}>
                      <TabList onChange={handleTabChange}>
                        {[DAY, NIGHT].map((slotType) => {
                          return (
                            <Tab
                              label={slotType}
                              value={slotType}
                              key={slotType}
                            />
                          );
                        })}
                      </TabList>
                    </TabContext>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      {spaSlots.data.map((slot) => {
                        return (
                          <Grid
                            size={4}
                            key={`${slot.shiftType}-${slot.startTime}-${slot.endTime}`}
                          >
                            <Button
                              variant="outlined"
                              color={slot.isBooked ? "disabled" : "success"}
                              sx={{
                                backgroundColor:
                                  selectedSlot &&
                                  `${slot.shiftType}-${slot.startTime}-${slot.endTime}` ===
                                    `${selectedSlot.shiftType}-${selectedSlot.startTime}-${selectedSlot.endTime}`
                                    ? "lightgreen"
                                    : "transparent",
                                // "&:hover": {
                                //   backgroundColor: false ? "lightblue" : "transparent",
                                // },
                                whiteSpace: "nowrap",
                              }}
                              fullWidth
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {`${slot.startTime}-${slot.endTime}`}
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Box>
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
                display: "block",
                width: "100%",

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
