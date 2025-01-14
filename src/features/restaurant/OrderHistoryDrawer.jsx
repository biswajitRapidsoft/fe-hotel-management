import React from "react";

import { DrawerHeader } from "./Restaurant";
import {
  Box,
  Divider,
  Drawer,
  Typography,
  Grid2 as Grid,
  Button,
  Rating,
  IconButton,
  Tooltip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  useUpdateFoodOrderStatusMutation,
  useRateFoodMutation,
} from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  CANCELLED,
  DELIVERED,
  ORDER_PLACED,
  REJECTED,
  FOOD_PREPARING,
} from "../../helper/constants";
import { jsPDF } from "jspdf";

import ReceiptIcon from "@mui/icons-material/Receipt";
import moment from "moment";

const drawerWidth = 430;

const OrderHistoryDrawer = ({ open, handleClose, orderHistory }) => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [cancelFoodDialog, setCancelFoodDialog] = React.useState(null);
  const [reviewDialog, setReviewDialog] = React.useState(null);
  const [cancelFood, cancelFoodRes] = useUpdateFoodOrderStatusMutation();
  const [rateFood, rateFoodRes] = useRateFoodMutation();
  const handleDownloadInvoice = React.useCallback((order) => {
    console.log("order", order);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Restaurant Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(order.bookingDetails.address, 20, 30);

    doc.setFontSize(12);
    doc.text(
      `Customer Name: ${order.bookingDetails.firstName} ${
        order.bookingDetails.middleName || ""
      } ${order.bookingDetails.lastName || ""}`,
      20,
      50
    );
    doc.text(
      `Order Status: ${order.bookingDetails.foodBookingStatus.replace(
        "_",
        " "
      )}`,
      20,
      55
    );
    doc.text(
      `Invoice Date: ${moment(order.bookingDetails.bookedOn).format(
        "DD/MM/YYYY hh:mma"
      )}`,
      20,
      60
    );
    doc.text(`Invoice Number: ${order.bookingDetails.orderId}`, 20, 65);

    const tableTop = 80;
    doc.text("Items", 20, tableTop);
    doc.text("Quantity", 120, tableTop);
    doc.text("Price", 180, tableTop);

    let yPosition = tableTop + 10;
    order.itemsList.forEach((item) => {
      doc.text(item.itemName, 20, yPosition);
      doc.text(item.noOfItems.toString(), 120, yPosition);
      doc.text(item.price.toString(), 180, yPosition);
      yPosition += 10;
    });

    const total = order.bookingDetails.totalPrice;
    doc.text("Subtotal:", 140, yPosition);
    doc.text(`Rs. ${total.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    const gst = total * 0.18;
    doc.text("GST (18%):", 140, yPosition);
    doc.text(`Rs. ${gst.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    const grandTotal = total + gst;
    doc.text("Total Amount:", 140, yPosition);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    doc.save("restaurant_invoice.pdf");
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
          Order History
        </Typography>
      </DrawerHeader>
      <Divider />
      <Box sx={{ padding: (theme) => theme.spacing(0, 1), mt: 1 }}>
        <Grid container rowSpacing={1}>
          {orderHistory.map((order) => {
            return (
              <Grid size={12} key={order.bookingDetails.id}>
                <Box
                  sx={{
                    p: 2,
                    boxShadow: (theme) => theme.shadows[2],
                    backgroundColor: "#F1F1F1",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">
                      {moment(order.bookingDetails.bookedOn).format(
                        "DD/MM/YYYY hh:mma"
                      )}
                    </Typography>
                    <Tooltip title="Download Invoice" arrow>
                      <IconButton onClick={() => handleDownloadInvoice(order)}>
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Dine Type:{" "}
                      {order.bookingDetails.dinningType.replace("_", " ")}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: (theme) =>
                          order.bookingDetails.foodBookingStatus ===
                          ORDER_PLACED
                            ? theme.palette.warning.main
                            : [REJECTED, CANCELLED].includes(
                                order.bookingDetails.foodBookingStatus
                              )
                            ? theme.palette.error.main
                            : order.bookingDetails.foodBookingStatus ===
                              DELIVERED
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      {order.bookingDetails.foodBookingStatus.replace("_", " ")}
                    </Typography>
                  </Box>
                  {Boolean(
                    order.bookingDetails.foodBookingStatus === "Cancelled"
                  ) && (
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, letterSpacing: 1 }}>
                        Cancellation Reason :{" "}
                      </Typography>
                      <Typography
                        sx={{
                          color: "gray",
                          fontSize: "17px",
                          // fontWeight: "bold",
                        }}
                      >
                        {order.bookingDetails?.bookingCancelReason}
                      </Typography>
                    </Box>
                  )}

                  <Grid container>
                    {order.itemsList.map((item) => {
                      return (
                        <Grid size={12} key={item.itemName + item.noOfItems}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="h6">
                              {item.itemName}
                            </Typography>
                            <Typography variant="h6">{`x${item.noOfItems}`}</Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      Total Price
                    </Typography>
                    <Typography sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      Rs. {order.bookingDetails.totalPrice}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      GST Price
                    </Typography>
                    <Typography sx={{ fontWeight: "bold", fontSize: "17px" }}>
                      Rs. {order?.bookingDetails?.gstPrice}
                    </Typography>
                  </Box>

                  {order?.bookingDetails?.promocode?.id && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{ fontWeight: "bold", fontSize: "17px" }}
                        >
                          Discount
                        </Typography>
                        <Typography
                          sx={{ fontWeight: "bold", fontSize: "17px" }}
                        >
                          Rs. {order?.bookingDetails?.discountPrice}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "2px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: "13.3px", fontWeight: 550 }}
                        >
                          {`${order?.bookingDetails?.promocode?.codeName} - ${
                            order?.bookingDetails?.promocode?.discountPercentage
                          }% off upto Rs. ${order?.bookingDetails?.promocode?.maxDiscountAmount?.toFixed(
                            2
                          )}`}
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Divider sx={{ mt: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", letterSpacing: 1 }}
                    >
                      Total{" "}
                      <span style={{ fontSize: "10px" }}>(Including GST)</span>
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Rs.{" "}
                      {(order?.bookingDetails?.totalPrice || 0) +
                        (order?.bookingDetails?.gstPrice || 0) -
                        (order?.bookingDetails?.discountPrice || 0)}
                    </Typography>
                  </Box>
                  {![CANCELLED, REJECTED, DELIVERED, FOOD_PREPARING].includes(
                    order.bookingDetails.foodBookingStatus
                  ) && (
                    <Button
                      color="error"
                      variant="contained"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        letterSpacing: 1,
                        display: "block",
                        mx: "auto",
                        mt: 1,
                        width: "100%",
                        textTransform: "none",
                        fontSize: 18,
                      }}
                      onClick={() => setCancelFoodDialog(order)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {DELIVERED === order.bookingDetails.foodBookingStatus &&
                    order.bookingDetails.isRated !== true && (
                      <Button
                        color="secondary"
                        variant="contained"
                        sx={{
                          color: "#fff",
                          display: "block",
                          width: "100%",
                          letterSpacing: 1,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: 18,
                          "&.Mui-disabled": {
                            background: "#B2E5F6",
                            color: "#FFFFFF",
                          },
                        }}
                        onClick={() => setReviewDialog(order)}
                      >
                        Review Your Order
                      </Button>
                    )}
                  {order.bookingDetails.isRated && (
                    <Rating
                      value={order.bookingDetails.ratingPoints}
                      disabled
                      size="large"
                      sx={{
                        mt: 1,
                        mx: "auto",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <FormDialog
        open={Boolean(cancelFoodDialog)}
        handleClose={() => setCancelFoodDialog(null)}
        cancelFood={cancelFood}
        orderObj={cancelFoodDialog}
        setSnack={setSnack}
      />
      <ReviewDialog
        open={Boolean(reviewDialog)}
        handleClose={() => setReviewDialog(null)}
        rateFood={rateFood}
        setSnack={setSnack}
        orderObj={reviewDialog}
      />
      <LoadingComponent
        open={cancelFoodRes.isLoading || rateFoodRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Drawer>
  );
};

function FormDialog({ open, handleClose, cancelFood, orderObj, setSnack }) {
  const [remark, setRemark] = React.useState("");
  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      cancelFood({
        orderId: orderObj?.bookingDetails?.orderId,
        bookingStatus: CANCELLED,
        descriptions: remark,
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
    [cancelFood, orderObj, remark, setSnack, handleClose]
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
          Cancel Order
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
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

function ReviewDialog({ open, handleClose, rateFood, setSnack, orderObj }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState("");

  const handleSubmitReview = React.useCallback(
    (event) => {
      event.preventDefault();
      rateFood({
        id: orderObj.id,
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
    [rateFood, setSnack, rating, review, handleClose, orderObj]
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
          Review Your Order
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

export default OrderHistoryDrawer;
