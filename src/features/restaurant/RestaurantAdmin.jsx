import React from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Collapse,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Grid2 as Grid,
  Rating,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useGetFoodOrderListAdminQuery,
  useGetAllFoodOrderStatusQuery,
  useUpdateFoodOrderStatusMutation,
} from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  CANCELLED,
  DELIVERED,
  KITCHENSTAFF,
  ORDER_PLACED,
  REJECTED,
} from "../../helper/constants";

const Row = ({ order, index, setUpdateStatusDialog }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{
          ".MuiTableCell-root": {
            letterSpacing: 1,
            fontSize: 18,
          },
          "& > *": { borderBottom: "unset" },
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>{order.bookingDetails.orderId}</TableCell>
        {/* <TableCell>{order.bookingDetails.bookingRefNo}</TableCell> */}
        <TableCell sx={{ minWidth: 150 }}>{`${order.bookingDetails.firstName} ${
          order.bookingDetails.middleName || ""
        } ${order.bookingDetails.lastName || ""}`}</TableCell>
        <TableCell>{order.bookingDetails.phoneNo}</TableCell>
        <TableCell>
          {order.bookingDetails.dinningType.replace("_", " ")}
        </TableCell>
        <TableCell>
          {order.bookingDto
            ? `${order?.bookingDto?.roomDto?.roomNo}(${order?.bookingDto?.roomDto?.floorNo})`
            : "--"}
        </TableCell>
        <TableCell>{order?.bookingDetails?.bookingCancelReason}</TableCell>
        <TableCell>
          <Typography
            sx={{
              color: (theme) =>
                order.bookingDetails.foodBookingStatus === ORDER_PLACED
                  ? theme.palette.warning.main
                  : [REJECTED, CANCELLED].includes(
                      order.bookingDetails.foodBookingStatus
                    )
                  ? theme.palette.error.main
                  : order.bookingDetails.foodBookingStatus === DELIVERED
                  ? theme.palette.success.main
                  : theme.palette.warning.main,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {order.bookingDetails.foodBookingStatus.replace("_", " ")}
          </Typography>
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ p: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: "#f4f4f4" }}>
              {order.bookingDetails.isRated && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Box>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      size="large"
                      value={order.bookingDetails.ratingPoints}
                      disabled
                    />
                  </Box>
                  <Typography>{order.bookingDetails.ratingMessage}</Typography>
                </Box>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      ".MuiTableCell-root": {
                        letterSpacing: 1,
                        fontWeight: 600,
                        fontSize: 16,
                      },
                    }}
                  >
                    <TableCell>SL no.</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.itemsList.map((orderItem, orderItemIndex) => {
                    return (
                      <TableRow
                        sx={{
                          ".MuiTableCell-root": {
                            letterSpacing: 1,
                            fontSize: 16,
                          },
                          "& > *": { borderBottom: "unset" },
                        }}
                        key={`${order.id}-${orderItem.itemName}`}
                      >
                        <TableCell>{orderItemIndex + 1}</TableCell>
                        <TableCell>{orderItem.itemName}</TableCell>
                        <TableCell>{orderItem.noOfItems}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {![DELIVERED, CANCELLED, REJECTED].includes(
                order.bookingDetails.foodBookingStatus
              ) && (
                <Button
                  sx={{
                    display: "block",
                    mx: "auto",
                    mt: 2,
                    mb: 1,
                    textTransform: "none",
                    fontSize: 18,
                    fontWeight: 600,
                    px: 3,
                    letterSpacing: 1,
                  }}
                  variant="outlined"
                  color="secondary"
                  onClick={() => setUpdateStatusDialog(order)}
                >
                  Update Status
                </Button>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

function FormDialog({
  open,
  handleClose,
  statusList,
  updateStatus,
  order,
  setSnack,
}) {
  const [remark, setRemark] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [selectedStatusInputVal, setSelectedStatusInputVal] =
    React.useState("");
  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      updateStatus({
        orderId: order.bookingDetails.orderId,
        bookingStatus: selectedStatus,
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
    [updateStatus, selectedStatus, remark, order, setSnack, handleClose]
  );

  const isStatusDisabled = React.useCallback(
    (option) => {
      const currentStatus = order?.bookingDetails?.foodBookingStatus;
      return (
        option === currentStatus ||
        (currentStatus === "Food_Preparing" && option === "Order_Placed")
      );
    },
    [order?.bookingDetails?.foodBookingStatus]
  );
  React.useEffect(() => {
    setRemark("");
    setSelectedStatus(order?.bookingDetails?.foodBookingStatus || null);
    setSelectedStatusInputVal(order?.bookingDetails?.foodBookingStatus || "");
  }, [open, order]);

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
          sx: {
            ".MuiTextField-root": {
              width: "100%",
              backgroundColor: "transparent",
              ".MuiInputBase-root": {
                color: "#7A7A7A",
              },
            },
            ".MuiFormLabel-root": {
              color: (theme) => `${theme.palette.primary.main} !important`,
              fontWeight: 600,
              fontSize: 18,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-iwxl7s::before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-iwxl7s::after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-1kbklr8::before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-1kbklr8::after": {
              borderBottom: "1px solid #fff !important",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          Update Order Status
          <Typography sx={{ fontWeight: 600, color: "#7A7A7A" }}>
            {order?.bookingDetails?.orderId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container rowSpacing={2}>
            <Grid size={12}>
              <Autocomplete
                // options={statusList}
                options={statusList.filter((status) => status !== "Cancelled")}
                // options={filteredStatusList}
                getOptionLabel={(option) => option.replace("_", " ")}
                value={selectedStatus}
                onChange={(e, newVal) => setSelectedStatus(newVal)}
                inputValue={selectedStatusInputVal}
                onInputChange={(e, newVal) => setSelectedStatusInputVal(newVal)}
                clearOnEscape
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                sx={{
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
                    backgroundColor: "#E9E5F1",
                    color: "#280071",
                    fontWeight: 600,
                  },
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected='true']:hover":
                    {
                      backgroundColor: "#E9E5F1",
                      color: "#280071",
                      fontWeight: 600,
                    },
                }}
                clearIcon={<ClearIcon color="primary" />}
                getOptionDisabled={isStatusDisabled}
                PaperComponent={(props) => (
                  <Paper
                    sx={{
                      background: "#fff",
                      color: "#B4B4B4",
                      borderRadius: "10px",
                    }}
                    {...props}
                  />
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <React.Fragment>
                        Select Status{" "}
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
                    variant="standard"
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                autoFocus
                margin="dense"
                name="remark"
                label={
                  <React.Fragment>
                    Remark{" "}
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
                fullWidth
                variant="standard"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            sx={{
              display: "block",
              mx: "auto",
              mb: 1,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              fontSize: 16,
              mt: 1.5,
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            size="small"
            disabled={!Boolean(remark.trim() && selectedStatus)}
            type="submit"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const RestaurantAdmin = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatus, updateStatusRes] = useUpdateFoodOrderStatusMutation();
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();
  const {
    data: orderList = {
      data: [],
    },
    isLoading,
  } = useGetFoodOrderListAdminQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId,
    {
      skip:
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== KITCHENSTAFF,
    }
  );
  const {
    data: statusList = {
      data: [],
    },
  } = useGetAllFoodOrderStatusQuery();
  return (
    <React.Fragment>
      <Paper>
        <Toolbar
          sx={[
            {
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            },
          ]}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Food Order List
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    fontWeight: "bold",
                    letterSpacing: 1,
                    backgroundColor: "#3F3C87",
                    color: "#fff",
                    fontSize: 18,
                  },
                }}
              >
                <TableCell>SL No.</TableCell>
                <TableCell>Order ID</TableCell>
                {/* <TableCell>Bookig Ref. No</TableCell> */}
                <TableCell>Guest</TableCell>
                <TableCell>Phone no.</TableCell>
                <TableCell>Dine Type</TableCell>
                <TableCell>Room No.(Floor)</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orderList.data.map((order, index) => {
                return (
                  <Row
                    key={order.id}
                    order={order}
                    index={index}
                    setUpdateStatusDialog={setUpdateStatusDialog}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <FormDialog
        open={Boolean(updateStatusDialog)}
        handleClose={() => setUpdateStatusDialog(null)}
        statusList={statusList.data}
        updateStatus={updateStatus}
        order={updateStatusDialog}
        setSnack={setSnack}
      />
      <LoadingComponent open={isLoading || updateStatusRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export default RestaurantAdmin;
