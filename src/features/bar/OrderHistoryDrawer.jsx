import React from "react";

import { DrawerHeader } from "./Bar";
import {
  Box,
  Divider,
  Drawer,
  Typography,
  Grid2 as Grid,
  Button,
  Rating,
  Tooltip,
  IconButton,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useRateBeerMutation } from "../../services/bar";
import { useChangeBarOrderStatusMutation } from "../../services/bar";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { jsPDF } from "jspdf";

import ReceiptIcon from "@mui/icons-material/Receipt";
import moment from "moment";
import {
  CANCELLED_BAR,
  DELIVERED,
  DELIVERED_BAR,
  ORDER_PLACED,
  REJECTED,
} from "../../helper/constants";

const drawerWidth = 430;

const OrderHistoryDrawer = ({ open, handleClose, orderHistory }) => {
  console.log("orderHistory for bar", orderHistory);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [cancelFoodDialog, setCancelFoodDialog] = React.useState(null);
  const [reviewDialog, setReviewDialog] = React.useState(null);
  // const [cancelFood, cancelFoodRes] = useUpdateFoodOrderStatusMutation();
  const [cancelBarOrder, cancelBarOrderRes] = useChangeBarOrderStatusMutation();
  const [rateFood, rateFoodRes] = useRateBeerMutation();

  const handleDownloadInvoice = React.useCallback((order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Bar Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(order.hotel.address, 20, 30);

    doc.setFontSize(12);
    doc.text(`Customer Name: ${order.customerName}`, 20, 50);
    doc.text(`Order Status: ${order.orderStatus.replace("_", " ")}`, 20, 55);
    doc.text(
      `Invoice Date: ${moment(order.createdAt).format("DD/MM/YYYY hh:mma")}`,
      20,
      60
    );
    doc.text(`Invoice Number: ${order.orderId}`, 20, 65);

    const tableTop = 80;
    doc.text("Items", 20, tableTop);
    doc.text("Quantity", 120, tableTop);
    doc.text("Price", 180, tableTop);

    let yPosition = tableTop + 10;
    order.ordersList.forEach((item) => {
      doc.text(item.item.name, 20, yPosition);
      doc.text(item.noOfQty.toString(), 120, yPosition);
      doc.text(item.item.price.toString(), 180, yPosition);
      yPosition += 10;
    });

    const total = order.totalAmount;
    doc.text("Subtotal:", 140, yPosition);
    doc.text(`Rs. ${total.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    const gst = order.gstPrice;
    doc.text("GST (18%):", 140, yPosition);
    doc.text(`Rs. ${gst.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    const grandTotal = total + gst;
    doc.text("Total Amount:", 140, yPosition);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 180, yPosition);
    yPosition += 10;

    doc.save("bar_invoice.pdf");
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
              <Grid size={12} key={order.id}>
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
                      {moment(order.createdAt).format("DD/MM/YYYY hh:mma")}
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
                      Dine Type: {order.dinningType.replace("_", " ")}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: (theme) =>
                          order.orderStatus === ORDER_PLACED
                            ? theme.palette.warning.main
                            : [REJECTED, CANCELLED_BAR].includes(
                                order.orderStatus
                              )
                            ? theme.palette.error.main
                            : order.orderStatus === DELIVERED
                            ? theme.palette.success.main
                            : theme.palette.warning.main,
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      {order.orderStatus.replace("_", " ")}
                    </Typography>
                  </Box>
                  <Grid container>
                    {order.ordersList.map((item) => {
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
                              {item.item.name}
                            </Typography>
                            <Typography variant="h6">{`x${item.noOfQty}`}</Typography>
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
                      Rs. {order.totalAmount}
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
                      Rs. {order.gstPrice}
                    </Typography>
                  </Box>

                  {order?.promocode?.id && (
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
                          Rs. {order?.discountPrice}
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
                      {(order?.totalAmount || 0) +
                        (order?.gstPrice || 0) -
                        (order?.discountPrice || 0)}
                    </Typography>
                  </Box>
                  {![CANCELLED_BAR, REJECTED, DELIVERED_BAR].includes(
                    order.orderStatus
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
                  {"DELIVERED" === order?.orderStatus &&
                    order?.isRated !== true && (
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
                  {order.isRated && (
                    <Rating
                      value={order.ratingPoints}
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
        cancelFood={cancelBarOrder}
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
        open={cancelBarOrderRes.isLoading || rateFoodRes.isLoading}
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
        id: orderObj.id,
        orderStatus: CANCELLED_BAR,
        description: remark,
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
