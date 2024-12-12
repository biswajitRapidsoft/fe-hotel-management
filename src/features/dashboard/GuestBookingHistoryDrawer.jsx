import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid2";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Tooltip from "@mui/material/Tooltip";
import PaymentIcon from "@mui/icons-material/Payment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { PaymentDialog } from "./GuestDashboard";

import {
  Button,
  Divider,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
  Rating,
} from "@mui/material";
import moment from "moment";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { PiWarningCircleLight } from "react-icons/pi";

import CloseIcon from "@mui/icons-material/Close";
import {
  useCancelHotelRoomMutation,
  useRequestRoomCheckoutMutation,
  useRoomCleanRequestMutation,
  useAddRatingMutation,
  useMakePartialPaymentMutation,
} from "../../services/dashboard";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
import { useNavigate } from "react-router-dom";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import Swal from "sweetalert2";
// import Swal from "sweetalert2";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GuestBookingHistoryDrawer = ({ open, setOpen, bookingDetails }) => {
  console.log("bookingDetails", bookingDetails);
  const [cancelBookingOpen, setCancelBookingOpen] = React.useState(false);
  const [selectedBookingRefNumber, setSelectedBookingRefNumber] =
    React.useState(null);

  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);

  const [openVehicleParkingDialog, setOpenVehicleParkingDialog] =
    React.useState(false);

  const [reviewDialog, setReviewDialog] = React.useState(null);
  const [rateStay, rateStayRes] = useAddRatingMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [makePartialPayment, makePartialPaymentRes] =
    useMakePartialPaymentMutation();
  const [requestRoomCheckout, requestRoomCheckoutRes] =
    useRequestRoomCheckoutMutation();
  const [roomCleanRequest, roomCleanRequestRes] = useRoomCleanRequestMutation();
  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  // const [cancelBooking, cancelBookingRes] = useCancelHotelRoomMutation();

  const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  // Function to get status color
  const getStatusColour = (status) => {
    switch (status) {
      case "Booked":
        return "orange";
      case "Checked_In":
        return "green";
      case "Checked_Out":
        return "blue";
      case "Cancelled":
        return "red";
      case "Booking_Cancellation_Requested":
        return "#CC0000";
      default:
        return "gray";
    }
  };

  // check for amount remaining amount before amount
  // const handleMakePayment = React.useCallback(
  //   ({ booking }) => {
  //     console.log("booking for ", booking);
  //   },
  //   [booking]
  // );

  const handleMakePayment = React.useCallback((booking) => {
    console.log("bookinggg", booking);
    const totalDebit = booking?.transactionDetails
      ?.filter((item) => !item.isCredit)
      ?.reduce((sum, item) => sum + item.amount, 0);

    const totalCredit = booking?.transactionDetails
      ?.filter((item) => item.isCredit)
      ?.reduce((sum, item) => sum + item.amount, 0);

    const difference = totalDebit - totalCredit;

    console.log("difference", difference);
    if (Boolean(difference <= 0)) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "You don't have any outstanding amount to pay",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      const payload = {
        transactionReferenceNo: booking?.transactionReferenceNo,
        bookingRefNumber: booking?.bookingRefNumber,
        paidAmount: difference,
      };
      setMakePartialPaymentPayload(payload);
      setOpenPaymentDialog(true);
    }
  }, []);
  // api call for room checkout
  const handleRequestRoomCheckout = React.useCallback(
    (bookingRefNumber) => {
      const payload = {
        bookingRefNumber: bookingRefNumber,
      };
      requestRoomCheckout(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Check-out Request applied",
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message:
              err?.data?.message ||
              err?.data ||
              "Unable to submit checkout request",
            severity: "error",
          });
        });
    },
    [requestRoomCheckout]
  );

  // api call for room cleaning
  const handleRoomCleanRequest = React.useCallback(
    (roomId, hotelId) => {
      const payload = {
        id: roomId,
        hotelId: hotelId,
      };
      roomCleanRequest(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Room clean request submitted",
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message:
              err?.data?.message ||
              err?.data ||
              "Unable to submit room clean request",
            severity: "error",
          });
        });
    },
    [roomCleanRequest]
  );

  const handleCancelClick = (bookingRefNumber) => {
    setSelectedBookingRefNumber(bookingRefNumber);
    setCancelBookingOpen(true);
  };

  const handleOpenVehicleParkingModal = React.useCallback(() => {
    setOpenVehicleParkingDialog(true);
  }, []);

  const DrawerList = (
    <Box
      sx={{ width: 600, p: 2 }}
      role="presentation"
      // onClick={toggleDrawer(false)}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 10,
          // padding: "8px 16px",
          py: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Booking History
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {bookingDetails && bookingDetails?.data?.length > 0 ? (
          bookingDetails?.data?.map((booking, index) => (
            <TimelineItem key={booking.id}>
              <TimelineSeparator>
                <TimelineDot />
                {index < bookingDetails?.data?.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Box
                  sx={{
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    // height: "13rem",
                    p: 0.8,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      height: "100%",
                      gap: 2,
                    }}
                  >
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 4 }}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "100%",
                            // border: "2px solid black",
                          }}
                        >
                          <img
                            src={
                              booking?.roomType?.images?.[0] ||
                              "http://192.168.12.41:9000/download/1.jpg"
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                            alt="Room"
                          />
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 8 }}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                            // border: "2px solid black",
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              Hotel Name :
                            </Typography>
                            <Typography>
                              {booking?.hotel?.name || "N/A"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              Person Name :
                            </Typography>
                            <Typography>
                              {`${booking?.firstName || ""} ${
                                booking?.middleName || ""
                              } ${booking?.lastName || ""}`.trim()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              Booking Date :
                            </Typography>
                            <Typography>
                              {booking?.bookedOn
                                ? moment(booking?.bookedOn).format("DD/MM/YYYY")
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              No. of people:
                            </Typography>
                            <Typography>{booking?.noOfPeoples || 0}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>
                              Room Type:
                            </Typography>
                            <Typography>
                              {booking?.roomType?.type || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                wordWrap: "break-word",
                              }}
                            >
                              Ref Number:
                            </Typography>
                            <Typography>
                              {booking?.bookingRefNumber || "N/A"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Typography sx={{ fontWeight: "bold" }}>
                                Status:
                              </Typography>
                              <Typography
                                sx={{
                                  color: getStatusColour(booking.bookingStatus),
                                  fontWeight: "bold",
                                  wordWrap: "break-word",
                                }}
                              >
                                {booking?.bookingStatus?.split("_").join(" ") ||
                                  "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {/* {booking.bookingStatus === "Booked" && ( */}
                            {booking?.bookingStatus ===
                              "Pending_Confirmation" && (
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundImage:
                                    "linear-gradient(to right, #ff512f 0%, #dd2476 100%)",
                                  color: "white",
                                  "&:hover": {
                                    backgroundImage:
                                      "linear-gradient(to right, #ff512f 10%, #dd2476 90%)",
                                  },
                                  textTransform: "none",
                                }}
                                onClick={() => {
                                  handleCancelClick(booking?.bookingRefNumber);
                                  // handleBookingCancel(booking.bookingRefNumber);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking?.bookingStatus === "Checked_Out" &&
                              !Boolean(booking?.isRated) && (
                                <Button
                                  variant="contained"
                                  sx={{
                                    backgroundImage:
                                      "linear-gradient(to right, #ff512f 0%, #dd2476 100%)",
                                    color: "white",
                                    "&:hover": {
                                      backgroundImage:
                                        "linear-gradient(to right, #ff512f 10%, #dd2476 90%)",
                                    },
                                    textTransform: "none",
                                  }}
                                  onClick={() => setReviewDialog(booking)}
                                >
                                  Please Rate Us
                                </Button>
                              )}
                            {booking?.bookingStatus === "Checked_Out" &&
                              Boolean(booking?.isRated) && (
                                <Rating
                                  value={booking?.ratingPoints}
                                  disabled
                                  size="large"
                                />
                              )}

                            {booking?.bookingStatus === "Checked_In" &&
                              (booking?.roomDto?.isCheckoutProceed === null ||
                                booking?.roomDto?.isCheckoutProceed ===
                                  undefined) && (
                                // ||
                                //   Boolean(
                                //     booking?.roomDto?.isCheckoutProceed ===
                                //       "false" &&
                                //       booking?.roomDto
                                //         ?.isCheckedByKeepingStaff === "true"
                                //   )

                                <>
                                  <Grid
                                    container
                                    columnSpacing={3}
                                    // sx={{ ml: 2.5 }}
                                  >
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip title="Order Food" arrow>
                                          <Button
                                            variant="outlined"
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                            }}
                                            // startIcon={<RestaurantIcon />}
                                            onClick={() => {
                                              sessionStorage.setItem(
                                                "bookingRefNumber",
                                                booking?.bookingRefNumber
                                              );
                                              sessionStorage.setItem(
                                                "hotelId",
                                                booking?.hotel?.id
                                              );
                                              navigate("/resturant");
                                            }}
                                          >
                                            {/* Order Food */}
                                            <RestaurantIcon />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip
                                          title="Room cleaning Request"
                                          arrow
                                        >
                                          <Button
                                            variant="outlined"
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                              borderColor: "#1CAC78",
                                            }}
                                            // startIcon={<CleaningServicesIcon />}
                                            onClick={() =>
                                              handleRoomCleanRequest(
                                                booking.roomDto?.id,
                                                booking.hotel?.id
                                              )
                                            }
                                          >
                                            <CleaningServicesIcon
                                              sx={{ color: "#1CAC78" }}
                                            />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip title="Request Checkout" arrow>
                                          <Button
                                            variant="outlined"
                                            // sx={{
                                            //   textTransform: "none",
                                            //   width: "100%",
                                            //   color: "#E60026",
                                            //   borderColor: "#E60026",
                                            // }}
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                              borderColor: "#E60026",
                                            }}
                                            // startIcon={<ExitToAppIcon />}
                                            onClick={() =>
                                              handleRequestRoomCheckout(
                                                booking.bookingRefNumber
                                              )
                                            }
                                          >
                                            <ExitToAppIcon
                                              sx={{
                                                color: "#E60026",
                                              }}
                                            />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip title="Request Laundry" arrow>
                                          <Button
                                            variant="outlined"
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                              borderColor: "#3e4a61",
                                            }}
                                            // startIcon={<DryCleaningIcon />}
                                            onClick={() =>
                                              // handleRequestLaundryService(
                                              //   booking.bookingRefNumber
                                              // )
                                              {
                                                sessionStorage.setItem(
                                                  "bookingRefNumberForLaundry",
                                                  booking?.bookingRefNumber
                                                );
                                                navigate("/LaundryHistory");
                                              }
                                            }
                                          >
                                            {/* Laundry */}
                                            <DryCleaningIcon
                                              sx={{ color: "#3e4a61" }}
                                            />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip title="Make Payment" arrow>
                                          <Button
                                            variant="outlined"
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                              borderColor: "#D4AF37	",
                                            }}
                                          >
                                            {/* Laundry */}
                                            <PaymentIcon
                                              onClick={() =>
                                                handleMakePayment(booking)
                                              }
                                              sx={{ color: "#D4AF37	" }}
                                            />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 2 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          gap: 1,
                                          width: "100%",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Tooltip title="Vehicle Parking" arrow>
                                          <Button
                                            variant="outlined"
                                            sx={{
                                              minWidth: "unset",
                                              width: "11px",
                                              borderColor: (theme) =>
                                                theme.palette.warning.main,
                                            }}
                                          >
                                            {/* Laundry */}
                                            <DirectionsCarIcon
                                              onClick={
                                                handleOpenVehicleParkingModal
                                              }
                                              // sx={{ color: "#D4AF37	" }}
                                              color="warning"
                                            />
                                          </Button>
                                        </Tooltip>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </>
                              )}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))
        ) : (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography>No booking history found</Typography>
          </Box>
        )}
      </Timeline>
      <CancelRoomDialog
        open={cancelBookingOpen}
        onClose={() => setCancelBookingOpen(false)}
        selectedBookingRefNumber={selectedBookingRefNumber}
      />

      <LoadingComponent
        open={
          requestRoomCheckoutRes.isLoading ||
          rateStayRes.isLoading ||
          roomCleanRequestRes.isLoading ||
          makePartialPaymentRes.isLoading
        }
      />
      <ReviewDialog
        open={Boolean(reviewDialog)}
        handleClose={() => setReviewDialog(null)}
        setSnack={setSnack}
        rateStay={rateStay}
        orderObj={reviewDialog}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <PaymentDialog
        // openPaymentDialog={openPaymentDialog}
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        reserveHotelRoom={makePartialPayment}
      />
    </Box>
  );

  return (
    <div>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        anchor="right"
        sx={{ zIndex: 1300 }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
};

// Dialog for rating
function ReviewDialog({ open, handleClose, rateStay, setSnack, orderObj }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState("");

  console.log("orderObj", orderObj);
  const handleSubmitReview = React.useCallback(
    (event) => {
      event.preventDefault();
      rateStay({
        // id: orderObj.id,
        bookingRefNumber: orderObj.bookingRefNumber,
        ratingPoints: rating,
        ratingMessage: review,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setRating(0);
          setReview("");
          handleClose();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [rateStay, setSnack, rating, review, handleClose, orderObj]
  );

  return (
    <React.Fragment>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmitReview,
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          Review Your Stay
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid size={12}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={rating}
                onChange={(e, newVal) => setRating(newVal)}
                size="large"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                autoFocus
                margin="dense"
                name="review"
                label="Review Message"
                fullWidth
                variant="standard"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
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
            disabled={!Boolean(rating)}
            type="submit"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

// dialog for confirmation of cancelling room
const CancelRoomDialog = ({ open, onClose, selectedBookingRefNumber }) => {
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [cancelBooking, cancelBookingRes] = useCancelHotelRoomMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleDialogClose = () => {
    setRejectionReason("");
    onClose();
  };
  const handleSubmit = () => {
    if (Boolean(!rejectionReason || rejectionReason.trim() === "")) {
      return setSnack({
        open: true,
        message: "Please provide reason for booking cancellation",
        severity: "error",
      });
    }
    cancelBooking({
      bookingRefNumber: selectedBookingRefNumber,
      rejectionReason: rejectionReason,
    })
      .unwrap()
      .then((res) => {
        handleDialogClose();
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        setRejectionReason("");
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  };
  // console.log("hello");
  return (
    <>
      <Dialog
        TransitionComponent={Transition}
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "430px" } }}
      >
        {/* <DialogTitle>
          <Typography
            sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#A52A2A" }}
          >
            Confirm cancellation
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ mb: 1, fontWeight: "bold" }}>
            Are you sure you want to cancel the booking?
          </Typography>
          <TextField
            id="outlined-basic"
            name="firstName"
            label="Reason"
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            inputProps={{ maxLength: 25 }}
            required
            size="small"
            sx={{ mb: 2 }}
          />
        </DialogContent> */}
        {/* <DialogActions>
          <Button
            variant="contained"
            // onClick={onClose}
            onClick={handleDialogClose}
            sx={{ backgroundColor: "#E31837" }}
          >
            No
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ backgroundColor: "#228B22" }}
            disabled={Boolean(rejectionReason) ? "" : true}
          >
            Yes
          </Button>
        </DialogActions> */}
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              // backgroundColor: "red",
              display: "flex",
              gap: 1,
              flexDirection: "column",
            }}
          >
            <Box sx={{ margin: "auto", mt: 3 }}>
              {/* <ErrorOutlineIcon sx={{ fontSize: "6rem", color: "orange" }} /> */}
              <PiWarningCircleLight
                style={{ fontSize: "6.9rem", color: "#FAD5A5" }}
              />
            </Box>
            <Box sx={{ margin: "auto" }}>
              <Typography
                sx={{
                  fontSize: "2.3rem",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: "bold",
                  color: "#606470",
                }}
              >
                Cancel Booking!
              </Typography>
            </Box>
            <Box sx={{ margin: "auto" }}>
              <Typography
                sx={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "1.2rem",
                  color: "#606470",
                }}
              >
                Are you sure you want to cancel booking ?
              </Typography>
            </Box>
            <Box
              sx={{
                // backgroundColor: "green",
                // border: "1px solid black",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <TextField
                id="outlined-basic"
                name="firstName"
                // label="Reason"
                placeholder="Enter a remark for cancellation"
                variant="outlined"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                inputProps={{ maxLength: 25 }}
                required
                size="small"
                sx={{ mb: 2, width: 500 }}
                InputProps={{
                  style: { height: "45px" },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 1.7,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: "#318CE7", textTransform: "none" }}
                // disabled={Boolean(rejectionReason) ? "" : true}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                // onClick={onClose}
                onClick={handleDialogClose}
                sx={{ backgroundColor: "#E31837", textTransform: "none" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <LoadingComponent open={cancelBookingRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default GuestBookingHistoryDrawer;
