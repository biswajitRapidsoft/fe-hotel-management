import React, { memo } from "react";

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
  Slide,
  DialogTitle,
  Dialog,
  DialogContent,
  IconButton,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PaymentDialog } from "./SpaAdmin";
export const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
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
  const [openSpaDetailsDialog, setOpenSpaDetailsDialog] = React.useState(false);
  const [spaDetailsData, setSpaDetailsData] = React.useState(null);

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
        // price: spaToBook.price,
        gstPrice: spaToBook.price * 0.18,
        transactionReferenceNo: null,
        paymentMethod: "Online",
        totalPrice: spaToBook.price.toFixed(2),
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
        // price: spaToBook.price,
        gstPrice: spaToBook.price * 0.18,

        transactionReferenceNo: null,
        paymentMethod: null,
        // totalPrice: (spaToBook.price + spaToBook.price * 0.18).toFixed(2),
        totalPrice: spaToBook.price.toFixed(2),

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

  // handleSpaDetails
  const handleSpaDetails = (item) => {
    setOpenSpaDetailsDialog(true);
    setSpaDetailsData(item);
  };
  const handleSpaDetailsDialogClose = () => {
    setOpenSpaDetailsDialog(false);
    setSpaDetailsData(null);
  };
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
                  {/* <CardMedia
                      component="img"
                      height="200"
                      image={spa.images[0]}
                      alt={spa.name}
                    /> */}

                  {/* <Box sx={{ height: 200 }}> */}
                  {spa?.images && spa?.images?.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={spa.images[0]}
                      alt={spa.name}
                      onClick={() => handleSpaDetails(spa)}
                      sx={{ cursor: "pointer" }}
                    />
                  ) : (
                    // <CardMedia
                    //   component="img"
                    //   height="200"
                    //   image=""
                    //   alt="No image available"
                    // />

                    <CardContent
                      style={{
                        height: "200px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        No image available
                      </Typography>
                    </CardContent>
                  )}
                  {/* </Box> */}

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
            <Box sx={{ width: "100%", mb: 1 }}>
              {Boolean(spaToBook?.isAdvanceNeeded) && (
                <Typography sx={{ color: "gray" }}>
                  You need to pay ₹{(spaToBook?.price * 0.2).toFixed(2)} in
                  advance
                </Typography>
              )}
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

      <SpaDetailsDialog
        open={openSpaDetailsDialog}
        handleSpaDetailsDialogClose={handleSpaDetailsDialogClose}
        spaDetailsData={spaDetailsData}
      />
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

const SpaDetailsDialog = memo(function ({
  open,
  handleSpaDetailsDialogClose,
  spaDetailsData,
}) {
  console.log("spaDetailsData", spaDetailsData);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? spaDetailsData?.images?.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === spaDetailsData?.images?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      onClose={handleSpaDetailsDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontSize: "1.7rem",
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: "bold",
              // color: "#606470",
              color: "#0f0f0f",
            }}
          >
            {spaDetailsData?.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {spaDetailsData?.images?.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                fontSize: "1.5rem",
                color: "#555",
                // margin: "20px 0",
              }}
            >
              No images found
            </Box>
          ) : (
            <Box
              sx={{
                height: "400px",
                overflow: "hidden",
                borderRadius: "8px",
                position: "relative",
                // border: "2px solid black",
                width: "100%",
              }}
            >
              {/* Main image slider */}
              <Box
                sx={{
                  display: "flex",
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: "transform 0.5s ease-in-out",
                }}
              >
                {spaDetailsData?.images?.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: "0 0 100%",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`Image ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Navigation buttons */}
              {/* Navigation buttons */}
              {spaDetailsData?.images?.length > 1 && (
                <>
                  <IconButton
                    onClick={goToPrevious}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "16px",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    onClick={goToNext}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: "16px",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}

              {/* Dots navigation */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {spaDetailsData?.images?.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToSlide(index)}
                    sx={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === currentIndex
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default Spa;
