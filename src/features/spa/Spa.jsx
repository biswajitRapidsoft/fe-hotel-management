import React from "react";

import {
  useGetAllSpaTypeGuestQuery,
  useGetSpaSlotsQuery,
  useBookSpaMutation,
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
  Tab,
} from "@mui/material";
import { DrawerHeader } from "../restaurant/Restaurant";
import { TabContext, TabList } from "@mui/lab";
import { DAY, NIGHT } from "../../helper/constants";
import moment from "moment";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import dayjs from "dayjs";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import BookingHistoryDrawer from "./BookingHistoryDrawer";
import { PaymentDialog } from "./SpaAdmin";

const drawerWidth = 450;

const Spa = () => {
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(null);
  const [isBookingHistoryDrawer, setIsBookingHistoryDrawer] =
    React.useState(false);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [bookSpa, bookSpaRes] = useBookSpaMutation();
  const {
    data: spaTypeList = {
      data: [],
    },
  } = useGetAllSpaTypeGuestQuery(JSON.parse(sessionStorage.getItem("hotelId")));
  const [spaToBook, setSpaToBook] = React.useState(null);
  const [selectedSlotType, setSelectedSlotType] = React.useState(DAY);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(dayjs(new Date()));
  const [bookingPayload, setBookingPayload] = React.useState({});

  const {
    data: spaSlots = {
      data: [],
    },
  } = useGetSpaSlotsQuery(
    {
      spaTypeId: spaToBook?.id || null,
      shiftType: selectedSlotType,
      date: selectedDate && moment(selectedDate.$d).format("DD-MM-YYYY"),
    },
    {
      skip: !Boolean(selectedDate) || !Boolean(spaToBook),
      refetchOnMountOrArgChange: true,
    }
  );

  const handleTabChange = React.useCallback((e, value) => {
    setSelectedSlotType(value);
    setSelectedSlot(null);
  }, []);

  const handleReserveSpa = React.useCallback(() => {
    if (spaToBook.isAdvanceNeeded) {
      setOpenPaymentDialog((spaToBook.price * 0.2).toFixed(2));
      setBookingPayload({
        spaTypeId: spaToBook.id,
        hotelBookingReferenceNumber: sessionStorage.getItem("bookingRefNumber"),
        startTime: `${moment(selectedDate.$d).format("DD-MM-YYYY")} ${
          selectedSlot.startTime
        }:00`,
        endTime: `${moment(selectedDate.$d).format("DD-MM-YYYY")} ${
          selectedSlot.endTime
        }:00`,
        bookingDate: moment(selectedDate.$d).format("DD-MM-YYYY"),
        price: spaToBook.price,
        transactionReferenceNo: null,
        paymentMethod: null,
        totalPrice: (spaToBook.price + spaToBook.price * 0.18).toFixed(2),
        paidAmount: null,
        hotelId: sessionStorage.getItem("hotelId"),
      });
    } else {
      bookSpa({
        spaTypeId: spaToBook.id,
        hotelBookingReferenceNumber: sessionStorage.getItem("bookingRefNumber"),
        startTime: `${moment(selectedDate.$d).format("DD-MM-YYYY")} ${
          selectedSlot.startTime
        }:00`,
        endTime: `${moment(selectedDate.$d).format("DD-MM-YYYY")} ${
          selectedSlot.endTime
        }:00`,
        bookingDate: moment(selectedDate.$d).format("DD-MM-YYYY"),
        price: spaToBook.price,
        transactionReferenceNo: null,
        paymentMethod: null,
        totalPrice: (spaToBook.price + spaToBook.price * 0.18).toFixed(2),
        paidAmount: null,
        hotelId: sessionStorage.getItem("hotelId"),
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setSelectedSlot(null);
          setSpaToBook(null);
          setSelectedDate(dayjs(new Date()));
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    }
  }, [bookSpa, spaToBook, selectedDate, selectedSlot]);

  return (
    <React.Fragment>
      <Box>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            color: "white",
            fontWeight: 600,
            letterSpacing: 1,
            display: "block",
            ml: "auto",
            mb: 1,
          }}
          onClick={() => setIsBookingHistoryDrawer(true)}
        >
          Spa Booking History
        </Button>
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
                            whiteSpace: "nowrap",
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
          onClose={() => {
            setSpaToBook(null);
            setSelectedSlot(null);
          }}
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
                {/* <TextField
                  label="Booking Date"
                  type="date"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      min: new Date().toISOString().split("T")[0],
                    },
                  }}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  fullWidth
                /> */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    disablePast
                    label={
                      <React.Fragment>
                        Booking Date{" "}
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.secondary.main,
                          }}
                        >
                          *
                        </Box>
                      </React.Fragment>
                    }
                    value={selectedDate}
                    onChange={(newVal) => {
                      setSelectedDate(newVal);
                      setSelectedSlot(null);
                    }}
                    slotProps={{
                      textField: { variant: "outlined", readOnly: true },
                    }}
                    slots={{
                      openPickerIcon: StyledCalendarIcon,
                    }}
                    format="DD/MM/YYYY"
                  />
                </LocalizationProvider>
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
                              color={slot.isBooked ? "error" : "success"}
                              sx={{
                                backgroundColor:
                                  selectedSlot &&
                                  `${slot.shiftType}-${slot.startTime}-${slot.endTime}` ===
                                    `${selectedSlot.shiftType}-${selectedSlot.startTime}-${selectedSlot.endTime}`
                                    ? "lightgreen"
                                    : "transparent",
                                "&:hover": {
                                  backgroundColor: !slot.isBooked
                                    ? "lightblue"
                                    : "transparent",
                                },
                                whiteSpace: "nowrap",
                              }}
                              fullWidth
                              disabled={slot.isBooked}
                              onClick={() => {
                                if (slot.isBooked === false) {
                                  setSelectedSlot(slot);
                                }
                              }}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Total
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${(spaToBook?.price || 0).toFixed(2)}`}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                GST (18%)
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${((spaToBook?.price || 0) * 0.18).toFixed(2)}`}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
                mb: 3,
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Total <span style={{ fontSize: "10px" }}>(Including GST)</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${(
                  (spaToBook?.price || 0) +
                  (spaToBook?.price || 0) * 0.18
                ).toFixed(2)}`}
              </Typography>
            </Box>
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
              disabled={!Boolean(selectedSlot)}
              onClick={handleReserveSpa}
            >
              {spaToBook?.isAdvanceNeeded ? "Pay And Reserve" : "Reserve"}
            </Button>
          </Box>
        </Drawer>
      </Box>
      <BookingHistoryDrawer
        open={isBookingHistoryDrawer}
        handleClose={() => setIsBookingHistoryDrawer(false)}
      />
      <PaymentDialog
        openPaymentDialog={Boolean(openPaymentDialog)}
        amountToPay={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(null)}
        setSnack={setSnack}
        fetchApi={bookSpa}
        apiPayload={bookingPayload}
        handleReset={() => {
          setSpaToBook(null);
          setSelectedSlot(null);
        }}
      />
      <LoadingComponent open={bookSpaRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export default Spa;
