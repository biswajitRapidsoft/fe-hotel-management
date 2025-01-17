import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
// import Tooltip from "@mui/material/Tooltip";
// import PaymentIcon from "@mui/icons-material/Payment";
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import LiquorIcon from "@mui/icons-material/Liquor";
// import { PaymentDialog } from "./GuestDashboard";

import {
  Button,
  Divider,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
  // Slide,
  TextField,
  Rating,
  Grid2 as Grid,
} from "@mui/material";
import moment from "moment";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
// import { PiWarningCircleLight } from "react-icons/pi";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import {
  // useCancelHotelRoomMutation,
  // useRequestRoomCheckoutMutation,
  // useRoomCleanRequestMutation,
  useAddRatingMutation,
  // useMakePartialPaymentMutation,
  // useLazyGetParkingDataForGuestQuery,
} from "../../services/dashboard";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
// import { useNavigate } from "react-router-dom";
// import RestaurantIcon from "@mui/icons-material/Restaurant";
// import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
// import ExitToAppIcon from "@mui/icons-material/ExitToApp";
// import DryCleaningIcon from "@mui/icons-material/DryCleaning";
// import Swal from "sweetalert2";
// import Swal from "sweetalert2";

// const Transition = React.forwardRef(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });

const GuestBookingHistoryDrawer = ({ open, setOpen, bookingDetails }) => {
  console.log("bookingDetails", bookingDetails);
  // const [cancelBookingOpen, setCancelBookingOpen] = React.useState(false);
  // const [selectedBookingRefNumber, setSelectedBookingRefNumber] =
  //   React.useState(null);

  // const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);

  // const [openVehicleParkingDialog, setOpenVehicleParkingDialog] =
  //   React.useState(false);

  const [reviewDialog, setReviewDialog] = React.useState(null);
  const [rateStay, rateStayRes] = useAddRatingMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  // const [makePartialPayment, makePartialPaymentRes] =
  //   useMakePartialPaymentMutation();
  // const [requestRoomCheckout, requestRoomCheckoutRes] =
  //   useRequestRoomCheckoutMutation();
  // const [roomCleanRequest, roomCleanRequestRes] = useRoomCleanRequestMutation();
  // const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
  //   React.useState(null);
  // const [cancelBooking, cancelBookingRes] = useCancelHotelRoomMutation();

  // const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // check for amount remaining amount before amount
  // const handleMakePayment = React.useCallback(
  //   ({ booking }) => {
  //     console.log("booking for ", booking);
  //   },
  //   [booking]
  // );

  // const handleMakePayment = React.useCallback((booking) => {
  //   console.log("bookinggg", booking);
  //   const totalDebit = booking?.transactionDetails
  //     ?.filter((item) => !item.isCredit)
  //     ?.reduce((sum, item) => sum + item.amount, 0);

  //   const totalCredit = booking?.transactionDetails
  //     ?.filter((item) => item.isCredit)
  //     ?.reduce((sum, item) => sum + item.amount, 0);

  //   const difference = totalDebit - totalCredit;

  //   console.log("difference", difference);
  //   if (Boolean(difference <= 0)) {
  //     Swal.fire({
  //       position: "center",
  //       icon: "error",
  //       title: "You don't have any outstanding amount to pay",
  //       showConfirmButton: false,
  //       timer: 3000,
  //     });
  //   } else {
  //     const payload = {
  //       transactionReferenceNo: booking?.transactionReferenceNo,
  //       bookingRefNumber: booking?.bookingRefNumber,
  //       paidAmount: difference,
  //     };
  //     setMakePartialPaymentPayload(payload);
  //     setOpenPaymentDialog(true);
  //   }
  // }, []);
  // api call for room checkout
  // const handleRequestRoomCheckout = React.useCallback(
  //   (bookingRefNumber) => {
  //     const payload = {
  //       bookingRefNumber: bookingRefNumber,
  //     };
  //     requestRoomCheckout(payload)
  //       .unwrap()
  //       .then((res) => {
  //         setSnack({
  //           open: true,
  //           message: res?.message || "Check-out Request applied",
  //           severity: "success",
  //         });
  //       })
  //       .catch((err) => {
  //         setSnack({
  //           open: true,
  //           message:
  //             err?.data?.message ||
  //             err?.data ||
  //             "Unable to submit checkout request",
  //           severity: "error",
  //         });
  //       });
  //   },
  //   [requestRoomCheckout]
  // );

  // api call for room cleaning
  // const handleRoomCleanRequest = React.useCallback(
  //   (roomId, hotelId) => {
  //     const payload = {
  //       id: roomId,
  //       hotelId: hotelId,
  //     };
  //     roomCleanRequest(payload)
  //       .unwrap()
  //       .then((res) => {
  //         setSnack({
  //           open: true,
  //           message: res?.message || "Room clean request submitted",
  //           severity: "success",
  //         });
  //       })
  //       .catch((err) => {
  //         setSnack({
  //           open: true,
  //           message:
  //             err?.data?.message ||
  //             err?.data ||
  //             "Unable to submit room clean request",
  //           severity: "error",
  //         });
  //       });
  //   },
  //   [roomCleanRequest]
  // );

  // const handleCancelClick = (bookingRefNumber) => {
  //   setSelectedBookingRefNumber(bookingRefNumber);
  //   setCancelBookingOpen(true);
  // };

  // const handleOpenVehicleParkingModal = React.useCallback(() => {
  //   setOpenVehicleParkingDialog(true);
  // }, []);

  // const handleOpenBar = React.useCallback(
  //   (bookingRefNumber, hotelId) => {
  //     sessionStorage.setItem("bookingRefNumber", bookingRefNumber);
  //     sessionStorage.setItem("hotelId", hotelId);
  //     navigate("/bar");
  //   },
  //   [navigate]
  // );

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

                          {booking?.bookingStatus === "Cancelled" && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Typography sx={{ fontWeight: "bold" }}>
                                Cancellation Reason:
                              </Typography>
                              <Typography>
                                {booking?.rejectionReason || 0}
                              </Typography>
                            </Box>
                          )}

                          <Box sx={{ display: "flex", gap: 1 }}>
                            {/* {booking.bookingStatus === "Booked" && ( */}
                            {/* {booking?.bookingStatus ===
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
                            )} */}
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

                            {/* {booking?.bookingStatus === "Checked_In" && (
                              <>
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
                                      <RestaurantIcon />
                                    </Button>
                                  </Tooltip>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    width: "100%",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="Room cleaning Request" arrow>
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        minWidth: "unset",
                                        width: "11px",
                                        borderColor: "#1CAC78",
                                      }}
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
                                      sx={{
                                        minWidth: "unset",
                                        width: "11px",
                                        borderColor: "#E60026",
                                      }}
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
                                      onClick={() => {
                                        sessionStorage.setItem(
                                          "bookingRefNumberForLaundry",
                                          booking?.bookingRefNumber
                                        );
                                        navigate("/LaundryHistory");
                                      }}
                                    >
                                      <DryCleaningIcon
                                        sx={{ color: "#3e4a61" }}
                                      />
                                    </Button>
                                  </Tooltip>
                                </Box>

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
                                      <PaymentIcon
                                        onClick={() =>
                                          handleMakePayment(booking)
                                        }
                                        sx={{ color: "#D4AF37	" }}
                                      />
                                    </Button>
                                  </Tooltip>
                                </Box>

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
                                      <DirectionsCarIcon
                                        onClick={handleOpenVehicleParkingModal}
                                        color="warning"
                                      />
                                    </Button>
                                  </Tooltip>
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    width: "100%",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="Bar" arrow>
                                    <Button
                                      variant="outlined"
                                      sx={{
                                        minWidth: "unset",
                                        width: "11px",
                                        borderColor: (theme) =>
                                          theme.palette.info.main,
                                      }}
                                    >
                                      <LiquorIcon
                                        onClick={() =>
                                          handleOpenBar(
                                            booking.bookingRefNumber,
                                            booking.hotel.id
                                          )
                                        }
                                        color="info"
                                      />
                                    </Button>
                                  </Tooltip>
                                </Box>
                              </>
                            )} */}
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
      {/* <CancelRoomDialog
        open={cancelBookingOpen}
        onClose={() => setCancelBookingOpen(false)}
        selectedBookingRefNumber={selectedBookingRefNumber}
      /> */}

      {/* <VehicleParkingDialog
        open={openVehicleParkingDialog}
        handleClose={() => setOpenVehicleParkingDialog(false)}
        setSnack={setSnack}
      /> */}

      <LoadingComponent
        open={
          // requestRoomCheckoutRes.isLoading ||
          rateStayRes.isLoading
          // ||
          // roomCleanRequestRes.isLoading ||
          // makePartialPaymentRes.isLoading
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
      {/* <PaymentDialog
        // openPaymentDialog={openPaymentDialog}
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        reserveHotelRoom={makePartialPayment}
      /> */}
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
// const CancelRoomDialog = ({ open, onClose, selectedBookingRefNumber }) => {
//   const [rejectionReason, setRejectionReason] = React.useState("");
//   const [cancelBooking, cancelBookingRes] = useCancelHotelRoomMutation();
//   const [snack, setSnack] = React.useState({
//     open: false,
//     message: "",
//     severity: "",
//   });

//   const handleDialogClose = () => {
//     setRejectionReason("");
//     onClose();
//   };
//   const handleSubmit = () => {
//     if (Boolean(!rejectionReason || rejectionReason.trim() === "")) {
//       return setSnack({
//         open: true,
//         message: "Please provide reason for booking cancellation",
//         severity: "error",
//       });
//     }
//     cancelBooking({
//       bookingRefNumber: selectedBookingRefNumber,
//       rejectionReason: rejectionReason,
//     })
//       .unwrap()
//       .then((res) => {
//         handleDialogClose();
//         setSnack({
//           open: true,
//           message: res.message,
//           severity: "success",
//         });
//         setRejectionReason("");
//       })
//       .catch((err) => {
//         setSnack({
//           open: true,
//           message: err.data?.message || err.data || "Something Went Wrong",
//           severity: "error",
//         });
//       });
//   };
//   // console.log("hello");
//   return (
//     <>
//       <Dialog
//         TransitionComponent={Transition}
//         open={open}
//         onClose={handleDialogClose}
//         maxWidth="sm"
//         fullWidth
//         sx={{ "& .MuiDialog-paper": { minHeight: "430px" } }}
//       >
//         <DialogContent>
//           <Box
//             sx={{
//               width: "100%",
//               // backgroundColor: "red",
//               display: "flex",
//               gap: 1,
//               flexDirection: "column",
//             }}
//           >
//             <Box sx={{ margin: "auto", mt: 3 }}>
//               <PiWarningCircleLight
//                 style={{ fontSize: "6.9rem", color: "#FAD5A5" }}
//               />
//             </Box>
//             <Box sx={{ margin: "auto" }}>
//               <Typography
//                 sx={{
//                   fontSize: "2.3rem",
//                   fontFamily: "'Times New Roman', Times, serif",
//                   fontWeight: "bold",
//                   color: "#606470",
//                 }}
//               >
//                 Cancel Booking!
//               </Typography>
//             </Box>
//             <Box sx={{ margin: "auto" }}>
//               <Typography
//                 sx={{
//                   fontFamily: "'Times New Roman', Times, serif",
//                   fontSize: "1.2rem",
//                   color: "#606470",
//                 }}
//               >
//                 Are you sure you want to cancel booking ?
//               </Typography>
//             </Box>
//             <Box
//               sx={{
//                 width: "100%",
//                 display: "flex",
//                 justifyContent: "center",
//                 mt: 2,
//               }}
//             >
//               <TextField
//                 id="outlined-basic"
//                 name="firstName"
//                 placeholder="Enter a remark for cancellation"
//                 variant="outlined"
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//                 inputProps={{ maxLength: 25 }}
//                 required
//                 size="small"
//                 sx={{ mb: 2, width: 500 }}
//                 InputProps={{
//                   style: { height: "45px" },
//                 }}
//               />
//             </Box>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "center",
//                 gap: 2,
//                 mt: 1.7,
//               }}
//             >
//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 sx={{ backgroundColor: "#318CE7", textTransform: "none" }}
//                 // disabled={Boolean(rejectionReason) ? "" : true}
//               >
//                 Yes
//               </Button>
//               <Button
//                 variant="contained"
//                 // onClick={onClose}
//                 onClick={handleDialogClose}
//                 sx={{ backgroundColor: "#E31837", textTransform: "none" }}
//               >
//                 Cancel
//               </Button>
//             </Box>
//           </Box>
//         </DialogContent>
//       </Dialog>
//       <LoadingComponent open={cancelBookingRes.isLoading} />
//       <SnackAlert snack={snack} setSnack={setSnack} />
//     </>
//   );
// };

// function VehicleParkingDialog({ open, handleClose, setSnack }) {
//   const [vehicleParkingDetails, setVehicleParkingDetails] =
//     React.useState(null);
//   const [vehicleNumber, setVehicleNumber] = React.useState("");
//   const [getParkingDetails, getParkingDetailsRes] =
//     useLazyGetParkingDataForGuestQuery();
//   const handleGetSetParkingRes = React.useCallback(() => {
//     getParkingDetails(vehicleNumber)
//       .unwrap()
//       .then((res) => {
//         setSnack({
//           open: true,
//           message: res.message,
//           severity: "success",
//         });
//         setVehicleParkingDetails(res.data);
//       })
//       .catch((err) => {
//         setVehicleParkingDetails(null);
//         setSnack({
//           open: true,
//           message: err.data?.message || err.data,
//           severity: "error",
//         });
//       });
//   }, [getParkingDetails, vehicleNumber, setSnack]);

//   React.useEffect(() => {
//     setVehicleParkingDetails(null);
//     setVehicleNumber("");
//   }, [open]);
//   return (
//     <Dialog
//       open={open}
//       maxWidth="sm"
//       fullWidth
//       sx={{
//         ".MuiDialogTitle-root": {
//           px: 5,
//           py: 3,
//         },
//       }}
//       PaperProps={{
//         sx: { borderRadius: 4 },
//       }}
//     >
//       <DialogTitle sx={{ fontSize: 24 }}>Vehicle Parking Details</DialogTitle>
//       <IconButton
//         aria-label="close"
//         onClick={handleClose}
//         sx={{
//           position: "absolute",
//           right: 30,
//           top: 16,
//           color: "#280071",
//         }}
//       >
//         <CloseIcon sx={{ fontSize: 30 }} />
//       </IconButton>
//       <DialogContent>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 2,
//             ".MuiTextField-root": {
//               backgroundColor: "transparent",
//               ".MuiInputBase-root": {
//                 // color: "#B4B4B4",
//               },
//             },
//             ".MuiFormLabel-root": {
//               color: (theme) => theme.palette.primary.main,
//               // fontWeight: 600,
//               // fontSize: 18,
//             },
//             ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
//               borderBottom: (theme) =>
//                 `1px solid ${theme.palette.primary.main}`,
//             },
//             ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
//               borderBottom: (theme) =>
//                 `1px solid ${theme.palette.primary.main}`,
//             },
//           }}
//         >
//           <TextField
//             size="small"
//             name="vehicleNumber"
//             // onChange={(e) => handleChange(e.target.name, e.target.value)}
//             label="Vehicle Number *"
//             value={vehicleNumber}
//             onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
//             fullWidth
//           />
//           <Button
//             sx={{
//               display: "block",
//               // margin: "1rem auto",
//               color: "#fff",
//               textTransform: "none",
//               // fontSize: 18,
//               px: 6,
//               // py: 1,
//               borderRadius: 2,
//               "&.Mui-disabled": {
//                 background: "#B2E5F6",
//                 color: "#FFFFFF",
//               },
//             }}
//             onClick={handleGetSetParkingRes}
//             variant="contained"
//             color="secondary"
//             disabled={!Boolean(vehicleNumber.trim())}
//           >
//             Submit
//           </Button>
//         </Box>
//         {Boolean(vehicleParkingDetails) && (
//           <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
//             <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
//             <Box sx={{ margin: "auto" }}>
//               <Typography
//                 sx={{
//                   fontWeight: "bold",
//                   fontFamily: "'Times New Roman', Times, serif",
//                   fontSize: "1.3rem",
//                 }}
//               >
//                 BOOKING RECEIPT
//               </Typography>
//             </Box>
//             <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
//             <Box
//               sx={{
//                 // backgroundColor: "yellow",
//                 width: "58%",
//                 margin: "auto",
//                 mt: 2,
//               }}
//             >
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Vehicle Number :
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography>
//                     {
//                       vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                         .vehicleNo
//                     }
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Area Name :
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography>{vehicleParkingDetails.areaName}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Slot Number :
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography>
//                     {vehicleParkingDetails.parkingSlotData.slotNumber}
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     From Date:
//                   </Typography>
//                 </Grid>

//                 <Grid size={{ xs: 6 }}>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .fromDate
//                   }
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     To Date:
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .toDate
//                   }
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Token No.
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .digitalTokenNo
//                   }
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Times New Roman', Times, serif",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Paid Amount
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   ₹{" "}
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .paidAmount
//                   }
//                 </Grid>
//               </Grid>
//             </Box>
//           </Box>
//         )}
//       </DialogContent>
//       <LoadingComponent open={getParkingDetailsRes.isLoading} />
//     </Dialog>
//   );
// }

// Function to get status color
export const getStatusColour = (status) => {
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

// function VehicleParkingDialog({ open, handleClose, setSnack }) {
//   const [vehicleParkingDetails, setVehicleParkingDetails] =
//     React.useState(null);
//   const [vehicleNumber, setVehicleNumber] = React.useState("");
//   const [getParkingDetails, getParkingDetailsRes] =
//     useLazyGetParkingDataForGuestQuery();
//   const handleGetSetParkingRes = React.useCallback(() => {
//     getParkingDetails(vehicleNumber)
//       .unwrap()
//       .then((res) => {
//         setSnack({
//           open: true,
//           message: res.message,
//           severity: "success",
//         });
//         setVehicleParkingDetails(res.data);
//       })
//       .catch((err) => {
//         setVehicleParkingDetails(null);
//         setSnack({
//           open: true,
//           message: err.data?.message || err.data,
//           severity: "error",
//         });
//       });
//   }, [getParkingDetails, vehicleNumber, setSnack]);

//   const handlePrintReceipt = () => {
//     const prtContent = document.getElementById("bookingReceiptCustomer");
//     var WinPrint = window.open(
//       "",
//       "",
//       "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
//     );
//     WinPrint.document.write(prtContent.innerHTML);
//     WinPrint.document.close();
//     WinPrint.focus();
//     WinPrint.print();
//     WinPrint.close();
//   };

//   React.useEffect(() => {
//     setVehicleParkingDetails(null);
//     setVehicleNumber("");
//   }, [open]);
//   return (
//     <Dialog
//       open={open}
//       maxWidth="sm"
//       fullWidth
//       sx={{
//         ".MuiDialogTitle-root": {
//           px: 5,
//           py: 3,
//         },
//       }}
//       PaperProps={{
//         sx: { borderRadius: 4 },
//       }}
//     >
//       <DialogTitle sx={{ fontSize: 24 }}>Vehicle Parking Details</DialogTitle>
//       <IconButton
//         aria-label="close"
//         onClick={handleClose}
//         sx={{
//           position: "absolute",
//           right: 30,
//           top: 16,
//           color: "#280071",
//         }}
//       >
//         <CloseIcon sx={{ fontSize: 30 }} />
//       </IconButton>
//       <DialogContent>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 2,
//             ".MuiTextField-root": {
//               backgroundColor: "transparent",
//               ".MuiInputBase-root": {
//                 // color: "#B4B4B4",
//               },
//             },
//             ".MuiFormLabel-root": {
//               color: (theme) => theme.palette.primary.main,
//               // fontWeight: 600,
//               // fontSize: 18,
//             },
//             ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
//               borderBottom: (theme) =>
//                 `1px solid ${theme.palette.primary.main}`,
//             },
//             ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
//               borderBottom: (theme) =>
//                 `1px solid ${theme.palette.primary.main}`,
//             },
//           }}
//         >
//           <TextField
//             size="small"
//             name="vehicleNumber"
//             // onChange={(e) => handleChange(e.target.name, e.target.value)}
//             label="Vehicle Number *"
//             value={vehicleNumber}
//             onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
//             fullWidth
//           />
//           <Button
//             sx={{
//               display: "block",
//               // margin: "1rem auto",
//               color: "#fff",
//               textTransform: "none",
//               // fontSize: 18,
//               px: 6,
//               // py: 1,
//               borderRadius: 2,
//               "&.Mui-disabled": {
//                 background: "#B2E5F6",
//                 color: "#FFFFFF",
//               },
//             }}
//             onClick={handleGetSetParkingRes}
//             variant="contained"
//             color="secondary"
//             disabled={!Boolean(vehicleNumber.trim())}
//           >
//             Submit
//           </Button>
//         </Box>
//         {Boolean(vehicleParkingDetails) && (
//           <div
//             style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
//             id="bookingReceiptCustomer"
//           >
//             <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
//             <div style={{ textAlign: "center" }}>
//               <h3>BOOKING RECEIPT</h3>
//             </div>
//             <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
//             <div
//               style={{
//                 width: "550px",
//                 margin: "auto",
//                 marginTop: 20,
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 20,
//               }}
//             >
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Vehicle Number :
//                 </div>
//                 <div>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .vehicleNo
//                   }
//                 </div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Area Name :
//                 </div>
//                 <div>{vehicleParkingDetails.areaName}</div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Slot Number :
//                 </div>
//                 <div>{vehicleParkingDetails.parkingSlotData.slotNumber}</div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   From Date:
//                 </div>
//                 <div>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .fromDate
//                   }
//                 </div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   To Date:
//                 </div>
//                 <div>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .toDate
//                   }
//                 </div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Token No.
//                 </div>
//                 <div>
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .digitalTokenNo
//                   }
//                 </div>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <div
//                   style={{
//                     width: "50%",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Paid Amount
//                 </div>
//                 <div>
//                   ₹{" "}
//                   {
//                     vehicleParkingDetails.parkingSlotData.parkingVehicleData
//                       .paidAmount
//                   }
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         {Boolean(vehicleParkingDetails) && (
//           <Button
//             variant="contained"
//             color="secondary"
//             sx={{
//               color: "#fff",
//               display: "block",
//               mx: "auto",
//               mt: 2,
//             }}
//             onClick={handlePrintReceipt}
//           >
//             Print Receipt
//           </Button>
//         )}
//       </DialogContent>
//       <LoadingComponent open={getParkingDetailsRes.isLoading} />
//     </Dialog>
//   );
// }

export default GuestBookingHistoryDrawer;
