import React from "react";

import {
  Typography,
  Drawer,
  Divider,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { DrawerHeader } from "../restaurant/Restaurant";

import {
  useGetSpaBookingHistoryGuestQuery,
  useCancelBookingForSpaMutation,
} from "../../services/spa";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  ACTIVE_SPA,
  BOOKED_SPA,
  CANCELLATION_REQUESTED_SPA,
  CANCELLED_SPA,
  DONE_SPA,
} from "../../helper/constants";

const drawerWidth = 550;

const BookingHistoryDrawer = ({ open, handleClose }) => {
  const [cancelBookingDialog, setCancelBookingDialog] = React.useState(null);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const {
    data: bookingHistory = {
      data: [],
    },
  } = useGetSpaBookingHistoryGuestQuery(
    sessionStorage.getItem("bookingRefNumber")
  );
  const [cancelBooking, cancelBookingRes] = useCancelBookingForSpaMutation();

  const handleCancelBooking = React.useCallback((booking) => {
    setCancelBookingDialog(booking);
  }, []);

  return (
    <Drawer
      sx={{
        position: "relative",
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
        },
      }}
      anchor="right"
      open={open}
      onClose={handleClose}
    >
      <DrawerHeader>
        <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
          Booking History
        </Typography>
      </DrawerHeader>
      <Divider />
      <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        {bookingHistory.data.map((booking) => {
          return (
            <Paper sx={{ display: "flex", gap: 1, p: 1 }} key={booking.id}>
              <Box
                component="img"
                src="http://192.168.12.43:8080/be-hms/download/Spa_1734595526336.jpeg"
                sx={{ width: 175 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">{booking.spaTypeName}</Typography>
                  {/* <Typography variant="body2">
                    {moment(booking.createdAt).format("DD-MM-YYYY hh:mma")}
                  </Typography> */}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ width: "100px", fontWeight: "bold" }}>
                    Date:
                  </Typography>
                  <Typography>{booking.bookingDate}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ width: "100px", fontWeight: "bold" }}>
                    Slot:
                  </Typography>
                  <Typography>{`${booking.startTime
                    .split(" ")[1]
                    .slice(0, 5)}-${booking.endTime
                    .split(" ")[1]
                    .slice(0, 5)}`}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ width: "100px", fontWeight: "bold" }}>
                    Price:
                  </Typography>
                  <Typography>Rs. 1,000</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ width: "100px", fontWeight: "bold" }}>
                    Status:
                  </Typography>
                  <Typography
                    sx={{
                      // color: (theme) =>
                      //   [CANCELLATION_REQUESTED_SPA, CANCELLED_SPA].includes(
                      //     booking.status
                      //   )
                      //     ? theme.palette.error.main
                      //     : theme.palette.warning.main,
                      color: (theme) =>
                        [CANCELLED_SPA].includes(booking.status)
                          ? theme.palette.error.dark
                          : [CANCELLATION_REQUESTED_SPA].includes(
                              booking.status
                            )
                          ? theme.palette.error.light
                          : [DONE_SPA].includes(booking.status)
                          ? theme.palette.success.dark
                          : [ACTIVE_SPA].includes(booking.status)
                          ? theme.palette.success.light
                          : theme.palette.warning.main,
                    }}
                  >
                    {booking.status.replace("_", " ")}
                  </Typography>
                </Box>
                {booking.status === BOOKED_SPA && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    sx={{ my: 1 }}
                    color="error"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
      <FormDialog
        open={Boolean(cancelBookingDialog)}
        handleClose={() => setCancelBookingDialog(null)}
        cancelBooking={cancelBooking}
        bookObj={cancelBookingDialog}
        setSnack={setSnack}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <LoadingComponent open={cancelBookingRes.isLoading} />
    </Drawer>
  );
};

function FormDialog({ open, handleClose, cancelBooking, bookObj, setSnack }) {
  const [remark, setRemark] = React.useState("");
  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      cancelBooking({
        hotelBookingReferenceNumber: bookObj.bookingSpaRefNumber,
        remarks: remark,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
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
    [cancelBooking, bookObj, remark, setSnack, handleClose]
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
          onSubmit: handleSubmitDialogForm,
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            name="remark"
            label="Remark"
            fullWidth
            variant="standard"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            // onClick={handleClose}
            color="error"
            variant="contained"
            sx={{
              fontSize: 18,
              textTransform: "none",
              "&.Mui-disabled": {
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                color: "rgba(255, 255, 255, 0.5)",
              },
              fontWeight: 600,
              letterSpacing: 1,
            }}
            type="submit"
            disabled={!Boolean(remark.trim())}
          >
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default BookingHistoryDrawer;
