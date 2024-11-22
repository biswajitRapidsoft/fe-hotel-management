import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
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
} from "@mui/material";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import { useCancelHotelRoomMutation } from "../../services/dashboard";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";

// import Swal from "sweetalert2";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GuestBookingHistoryDrawer = ({ open, setOpen, bookingDetails }) => {
  const [cancelBookingOpen, setCancelBookingOpen] = React.useState(false);
  const [selectedBookingRefNumber, setSelectedBookingRefNumber] =
    React.useState(null);

  // api for cancelling booking

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
      default:
        return "gray";
    }
  };

  // const handleBookingCancel = () => {
  // Swal.fire({
  //   title: "Are you sure?",
  //   input: "text", // Add a text field
  //   text: "You won't be able to revert this!",
  //   icon: "warning",
  //   showCancelButton: true,
  //   confirmButtonColor: "#3085d6",
  //   cancelButtonColor: "#d33",
  //   confirmButtonText: "Yes",
  // });
  // };

  const handleCancelClick = (bookingRefNumber) => {
    setSelectedBookingRefNumber(bookingRefNumber);
    setCancelBookingOpen(true);
  };
  const DrawerList = (
    <Box sx={{ width: 600, p: 2 }} role="presentation">
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
                {index < bookingDetails.data.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Box
                  sx={{
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    height: "11rem",
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
                    <Box sx={{ width: "40%", height: "100%" }}>
                      <img
                        src={
                          booking.roomType?.images?.[0] ||
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
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Hotel Name :
                        </Typography>
                        <Typography>{booking.hotel?.name || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Person Name :
                        </Typography>
                        <Typography>
                          {`${booking.firstName || ""} ${
                            booking.middleName || ""
                          } ${booking.lastName || ""}`.trim()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Booking Date :
                        </Typography>
                        <Typography>
                          {booking?.bookedOn
                            ? moment(booking.bookedOn).format("DD/MM/YYYY")
                            : "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          No. of people:
                        </Typography>
                        <Typography>{booking.noOfPeoples || 0}</Typography>
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
                            }}
                          >
                            {booking.bookingStatus || "N/A"}
                          </Typography>
                        </Box>
                        <Box>
                          {booking.bookingStatus === "Booked" && (
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
                              }}
                              // onClick={handleBookingCancel}
                              onClick={() => {
                                handleCancelClick(booking.bookingRefNumber);
                                // toggleDrawer(false)();
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
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
    </Box>
  );

  return (
    <div>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        {DrawerList}
      </Drawer>
    </div>
  );
};

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

  return (
    <>
      <Dialog
        TransitionComponent={Transition}
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography
            sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#A52A2A" }}
          >
            Confirm cancellation
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* <Box sx={{ p: 2 }}>hello</Box> */}
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
        </DialogContent>
        <DialogActions>
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
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <LoadingComponent open={cancelBookingRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default GuestBookingHistoryDrawer;
