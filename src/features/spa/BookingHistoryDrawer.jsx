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
  Tooltip,
  IconButton,
} from "@mui/material";
// import { jsPDF } from "jspdf";
// import moment from "moment";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
  console.log("bookingHistorybb", bookingHistory?.data);
  const [cancelBooking, cancelBookingRes] = useCancelBookingForSpaMutation();

  const handleCancelBooking = React.useCallback((booking) => {
    setCancelBookingDialog(booking);
  }, []);

  // const handleDownloadInvoice = React.useCallback((order) => {
  //   console.log("order", order);
  //   const doc = new jsPDF();
  //   doc.setFontSize(16);
  //   doc.text("Restaurant Invoice", 20, 20);
  //   doc.setFontSize(12);
  //   doc.text(order.customerAddress, 20, 30);

  //   doc.setFontSize(12);
  //   doc.text(
  //     `Customer Name: ${order.customerFirstName} ${
  //       order.customerMiddleName || ""
  //     } ${order.customerLastName || ""}`,
  //     20,
  //     50
  //   );
  //   doc.text(`Order Status: ${order.status.replace("_", " ")}`, 20, 55);
  //   doc.text(
  //     `Invoice Date: ${moment(order.endTime).format("DD/MM/YYYY hh:mma")}`,
  //     20,
  //     60
  //   );
  //   doc.text(`Invoice Number: ${order.bookingSpaRefNumber}`, 20, 65);

  //   const tableTop = 80;
  //   doc.text("Slot", 20, tableTop);
  //   doc.text("Start Time", 100, tableTop);
  //   doc.text("End Time", 150, tableTop);

  //   let yPosition = tableTop + 10;

  //   doc.text(
  //     `${order.startTime.split(" ")[1].slice(0, 5)}-${order.endTime
  //       .split(" ")[1]
  //       .slice(0, 5)}`,
  //     20,
  //     yPosition
  //   );
  //   doc.text(order.startTime, 100, yPosition);
  //   doc.text(order.endTime, 150, yPosition);
  //   yPosition += 10;

  //   // const total = order.bookingDetails.totalPrice;
  //   doc.text("Subtotal:", 120, yPosition);
  //   doc.text(`Rs. ${order?.paid.toFixed(2)}`, 150, yPosition);
  //   yPosition += 10;

  //   // const gst = total * 0.18;
  //   // doc.text("GST (18%):", 140, yPosition);
  //   // doc.text(`Rs. ${gst.toFixed(2)}`, 180, yPosition);
  //   // yPosition += 10;

  //   // const grandTotal = total + gst;
  //   // doc.text("Total Amount:", 140, yPosition);
  //   // doc.text(`Rs. ${grandTotal.toFixed(2)}`, 180, yPosition);
  //   // yPosition += 10;

  //   doc.save("restaurant_invoice.pdf");
  // }, []);
  const handleDownloadInvoice = React.useCallback((order) => {
    console.log("order", order);
    if (order) {
      sessionStorage.setItem("orderForSpaInvoice", JSON.stringify(order));
      window.open("/spaInvoice");
    }
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
                src={booking?.images ? booking?.images[0] : ""}
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
                  <Tooltip title="Download Invoice" arrow>
                    <IconButton onClick={() => handleDownloadInvoice(booking)}>
                      <ReceiptIcon />
                    </IconButton>
                  </Tooltip>{" "}
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
                  <Typography>{booking?.totalPrice}</Typography>
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
