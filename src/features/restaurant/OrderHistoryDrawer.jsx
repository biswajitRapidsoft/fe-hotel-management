import React from "react";

import { DrawerHeader } from "./Restaurant";
import {
  Box,
  Divider,
  Drawer,
  Typography,
  Grid2 as Grid,
  Button,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useUpdateFoodOrderStatusMutation } from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  CANCELLED,
  DELIVERED,
  ORDER_PLACED,
  REJECTED,
} from "../../helper/constants";
const drawerWidth = 430;

const OrderHistoryDrawer = ({ open, handleClose, orderHistory }) => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [cancelFoodDialog, setCancelFoodDialog] = React.useState(null);
  const [cancelFood, cancelFoodRes] = useUpdateFoodOrderStatusMutation();

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
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Total Price
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      Rs. {order.bookingDetails.totalPrice}
                    </Typography>
                  </Box>
                  {![CANCELLED, REJECTED, DELIVERED].includes(
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
                      }}
                      onClick={() => setCancelFoodDialog(order)}
                    >
                      Cancel Order
                    </Button>
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
      <LoadingComponent open={cancelFoodRes.isLoading} />
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

export default OrderHistoryDrawer;
