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
  Collapse,
  Divider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
} from "@mui/material";

import React, { useCallback, useEffect, useState } from "react";
import { BootstrapDialog } from "../header/Header";
import { jsPDF } from "jspdf";

import ReceiptIcon from "@mui/icons-material/Receipt";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from "@mui/icons-material/Clear";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import moment from "moment";
import {
  CANCELLED,
  DELIVERED,
  ORDER_PLACED,
  // READY_TO_SERVE,
  REJECTED,
} from "../../helper/constants";
import { useNavigate } from "react-router-dom";
import { PaymentDialog } from "../dashboard/GuestDashboard";
import { useGetBookingDetailsFromRoomNumberMutation } from "../../services/restaurant";
import { useGetAllBarTableForCounterStaffQuery } from "../../services/dashboard";

import {
  useAssosciateBarOrderWithRoomMutation,
  useCompleteBarOrderMutation,
  useGetAllDineInRequestForBarFromRoomQuery,
  useGetAllWaitersForBarQuery,
  useAssignTableToBarWaiterMutation,
  useGetAllBarServiceStaffQuery,
  useAssignBarServiceStaffMutation,
} from "../../services/bar";

const BarDineIn = () => {
  const navigate = useNavigate();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();

  const [isSplit, setIsSplit] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  const [assignStaffDialog, setAssignStaffDialog] = React.useState();

  const [orderMapDtos, setOrderMapDtos] = useState([]);
  const [customOrderMapDtos, setCustomOrderMapDtos] = useState([]);
  const [formDataForDialog, setFormDataForDialog] = React.useState({
    isAssosciateWithRoom: false,
    isProceedToPayment: false,
    roomNumber: "",
    paymentType: null,
  });
  const handlePayment = React.useCallback((item) => {
    const totalPrice = item?.totalPrice || 0;
    const gstPrice = item?.gstPrice || 0;

    const payload = {
      paidAmount: totalPrice + gstPrice,
      orderId: item?.orderId,
    };
    setMakePartialPaymentPayload(payload);
    setOpenPaymentDialog(true);
  }, []);
  const handleCloseOrderDetailsDialog = React.useCallback(() => {
    setFormDataForDialog({
      isAssosciateWithRoom: false,
      isProceedToPayment: false,
      roomNumber: "",
      paymentType: null,
    });

    setIsSplit(false);
    setOrderMapDtos([]);
    setCustomOrderMapDtos([]);

    setOrderDetailsDialog(null);
  }, []);

  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(null);
  console.log("orderDetailsDialog", orderDetailsDialog);
  const handleOpenPaymentDialog = React.useCallback(() => {
    const totalPrice = orderDetailsDialog?.totalAmount || 0;
    const gstPrice = orderDetailsDialog?.gstPrice || 0;

    const payload = {
      paidAmount: totalPrice + gstPrice,
      orderId: orderDetailsDialog?.orderId,
    };

    setMakePartialPaymentPayload(payload);
    setOpenPaymentDialog(true);
  }, [orderDetailsDialog]);

  const {
    data: todayBarOrderRequests = { data: [] },
    isLoading: istodayBarOrderDataLoading,
    isFetching: istodayBarOrderDataFetching,
  } = useGetAllDineInRequestForBarFromRoomQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    date: moment().format("YYYY-MM-DD"),
  });

  const { data: tableListForBarCounterStaff = { data: [] } } =
    useGetAllBarTableForCounterStaffQuery({
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
      userId: JSON.parse(sessionStorage.getItem("data")).id,
    });

  const { data: waiterListForBar = { data: [] } } = useGetAllWaitersForBarQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    }
  );
  const { data: barServiceStaffList = { data: [] } } =
    useGetAllBarServiceStaffQuery({
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    });

  const [bookingDetails, bookingDetailsRes] =
    useGetBookingDetailsFromRoomNumberMutation();

  const [assignServiceStaff, assignServiceStaffRes] =
    useAssignBarServiceStaffMutation();
  const [assosciateWithRoom, assosciateWithRoomRes] =
    useAssosciateBarOrderWithRoomMutation();
  const [completeOrder, completeOrderRes] = useCompleteBarOrderMutation();
  const [assignTableToBarWaiter, assignTableToBarWaiterRes] =
    useAssignTableToBarWaiterMutation();

  return (
    <React.Fragment>
      <Paper>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
              Bar Dine-In List
            </Typography>
          </Toolbar>

          <Box>
            <Button
              color="secondary"
              variant="contained"
              size="small"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 18,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              onClick={() => {
                sessionStorage.setItem("isStayingGuest", false);
                sessionStorage.setItem("OrderCreatedByBarCounterStaff", true);
                sessionStorage.setItem(
                  "hotelIdFromBarWaiter",
                  // orderDetailsDialog?.hotelId
                  JSON.parse(sessionStorage.getItem("data"))?.hotelId
                );
                navigate("/bar");
              }}
            >
              Place Order
            </Button>
          </Box>
        </Box>

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
                <TableCell>Guest</TableCell>
                <TableCell>Phone no.</TableCell>
                <TableCell>Dine Type</TableCell>
                <TableCell>Room No.(Floor)</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {todayBarOrderRequests?.data?.map((item, index) => {
                return (
                  <Row
                    key={item.id}
                    item={item}
                    index={index}
                    setUpdateStatusDialog={setUpdateStatusDialog}
                    setMakePartialPaymentPayload={setMakePartialPaymentPayload}
                    setOpenPaymentDialog={setOpenPaymentDialog}
                    handlePayment={handlePayment}
                    setAssignStaffDialog={setAssignStaffDialog}
                    setOrderDetailsDialog={setOrderDetailsDialog}
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
        order={updateStatusDialog}
        setSnack={setSnack}
        tableListForBarCounterStaff={tableListForBarCounterStaff}
        waiterList={waiterListForBar}
        assignTableToWaiter={assignTableToBarWaiter}
      />
      <AssignStaffDialog
        assignStaffDialog={assignStaffDialog}
        setAssignStaffDialog={setAssignStaffDialog}
        serviceStaffList={barServiceStaffList}
        handleClose={() => setAssignStaffDialog(null)}
        assignServiceStaff={assignServiceStaff}
        setSnack={setSnack}
      />
      <OrderDetailsDialog
        orderDetailsDialog={orderDetailsDialog}
        handleCloseOrderDetailsDialog={handleCloseOrderDetailsDialog}
        setSnack={setSnack}
        bookingDetails={bookingDetails}
        bookingDetailsRes={bookingDetailsRes}
        assosciateWithRoom={assosciateWithRoom}
        handleOpenPaymentDialog={handleOpenPaymentDialog}
        completeOrder={completeOrder}
        formData={formDataForDialog}
        setFormData={setFormDataForDialog}
        isSplit={isSplit}
        setIsSplit={setIsSplit}
        orderMapDtos={orderMapDtos}
        setOrderMapDtos={setOrderMapDtos}
        customOrderMapDtos={customOrderMapDtos}
        setCustomOrderMapDtos={setCustomOrderMapDtos}
      />
      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        setSnack={setSnack}
        reserveHotelRoom={completeOrder}
        // handleAfterSuccessFunction={() => {
        //   handleCloseOrderDetailsDialog();
        // }}
      />

      <LoadingComponent
        open={
          assignServiceStaffRes.isLoading ||
          bookingDetailsRes.isLoading ||
          istodayBarOrderDataLoading ||
          istodayBarOrderDataFetching ||
          assosciateWithRoomRes.isLoading ||
          completeOrderRes.isLoading ||
          assignTableToBarWaiterRes.isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const Row = ({
  item,
  index,
  setUpdateStatusDialog,
  // setOpenPaymentDialog,
  // setMakePartialPaymentPayload,
  handlePayment,
  setAssignStaffDialog,
  setOrderDetailsDialog,
}) => {
  console.log("foodBookingStatus", item);
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
        <TableCell>{item?.orderId}</TableCell>
        {/* <TableCell sx={{ minWidth: 150 }}>{`${item.firstName} ${
          item.middleName || ""
        } ${item.lastName || ""}`}</TableCell> */}
        <TableCell sx={{ minWidth: 150 }}>{item?.customerName}</TableCell>
        <TableCell>{item.bookingDetails.phoneNumber}</TableCell>
        <TableCell>{item.dinningType.replace("_", " ")}</TableCell>
        <TableCell>
          {item?.bookingDetails
            ? `${item?.bookingDetails?.roomDto?.roomNo}(${item?.bookingDetails?.roomDto?.floorNo})`
            : "--"}
        </TableCell>
        <TableCell>
          <Typography
            sx={{
              color: (theme) => theme.palette.warning.main,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {item?.orderStatus}
          </Typography>
        </TableCell>{" "}
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
              {item?.bookingDetails?.isRated && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Box>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      size="large"
                      value={item?.bookingDetails?.ratingPoints}
                      disabled
                    />
                  </Box>
                  <Typography>{item?.bookingDetails?.ratingMessage}</Typography>
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
                  {item?.trailData?.map((orderItem, orderItemIndex) => {
                    return (
                      <TableRow
                        sx={{
                          ".MuiTableCell-root": {
                            letterSpacing: 1,
                            fontSize: 16,
                          },
                          "& > *": { borderBottom: "unset" },
                        }}
                        key={`${item.id}-${orderItem.name}`}
                      >
                        <TableCell>{orderItemIndex + 1}</TableCell>
                        <TableCell>{orderItem.name}</TableCell>
                        <TableCell>{orderItem.quantity}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* dont show in case of takeaway */}
              {[DELIVERED, CANCELLED, REJECTED, ORDER_PLACED].includes(
                item?.orderStatus
              ) &&
                item?.dinningType !== "Room_Delivery" &&
                item?.dinningType !== "Take_Away" &&
                item?.dinningType === "Dine_In" && (
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
                    onClick={() => setUpdateStatusDialog(item)}
                  >
                    Update Status
                  </Button>
                )}
              {/* {item?.orderStatus === READY_TO_SERVE && (
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
                  // onClick={() => handlePayment(item)}
                  onClick={() => {
                    if (Boolean(item?.totalAmount)) {
                      setOrderDetailsDialog(item);
                    }
                  }}
                >
                  Proceed to Payment
                </Button>
              )} */}
              {item?.dinningType === "Room_Delivery" && (
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
                  onClick={() => setAssignStaffDialog(item)}
                >
                  Assign Staff
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
  tableListForBarCounterStaff,
  waiterList,
  order,
  setSnack,
  assignTableToWaiter,
}) {
  console.log("order", order);
  // const [remark, setRemark] = React.useState("");
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [selectedWaiter, setSelectedWaiter] = React.useState(null);
  const [selectedTableInputVal, setSelectedTableInputVal] = React.useState("");
  const [selectedWaiterInputVal, setSelectedWaiterInputVal] =
    React.useState("");
  console.log("selectedWaiter", selectedWaiter);

  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      assignTableToWaiter({
        orderId: order?.orderId,
        tableId: selectedTable?.id,
        orderTakenBy: {
          id: selectedWaiter?.id,
        },
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
    [
      selectedTable,
      // remark,
      order,
      setSnack,
      handleClose,
      assignTableToWaiter,
      selectedWaiter,
    ]
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
    // setRemark("");
    setSelectedTable(order?.bookingDetails?.foodBookingStatus || null);
    setSelectedTableInputVal(order?.bookingDetails?.foodBookingStatus || "");
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
                options={tableListForBarCounterStaff?.data.filter((item) =>
                  Boolean(item.isActive)
                )}
                // getOptionLabel={(option) => option?.tableNo?.toString() || ""}
                getOptionLabel={(option) =>
                  option?.tableNo
                    ? `${option.tableNo} (Capacity: ${option.noOfSeats})`
                    : ""
                }
                value={selectedTable}
                onChange={(e, newVal) => setSelectedTable(newVal)}
                inputValue={selectedTableInputVal}
                onInputChange={(e, newVal) =>
                  setSelectedTableInputVal(newVal || "")
                }
                clearOnEscape
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                sx={{
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
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
                      <>
                        Select Table
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.secondary.main,
                          }}
                        >
                          *
                        </Box>
                      </>
                    }
                    variant="standard"
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                options={waiterList?.data || []}
                getOptionLabel={(option) => option.name}
                value={selectedWaiter}
                onChange={(e, newVal) => setSelectedWaiter(newVal)}
                inputValue={selectedWaiterInputVal}
                onInputChange={(e, newVal) => setSelectedWaiterInputVal(newVal)}
                clearOnEscape
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                sx={{
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
                    backgroundColor: "#E9E5F1",
                    color: "#280071",
                    fontWeight: 600,
                  },
                }}
                clearIcon={<ClearIcon color="primary" />}
                // getOptionDisabled={isStatusDisabled}
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
                      <>
                        Select Waiter
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.secondary.main,
                          }}
                        >
                          *
                        </Box>
                      </>
                    }
                    variant="standard"
                  />
                )}
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
            disabled={!Boolean(selectedWaiter && selectedTable)}
            type="submit"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

function AssignStaffDialog({
  assignStaffDialog,
  setAssignStaffDialog,
  serviceStaffList,
  handleClose,
  assignServiceStaff,
  setSnack,
}) {
  const [selectedServiceStaff, setSelectedServiceStaff] = React.useState(null);
  console.log("assignStaffDialog", assignStaffDialog);
  const [selectedServiceStaffInputVal, setSelectedServiceStaffInputVal] =
    React.useState("");

  const handleSubmitAssignStaffForm = React.useCallback(
    (e) => {
      e.preventDefault();
      assignServiceStaff({
        orderId: assignStaffDialog?.orderId,
        orderTakenBy: {
          id: selectedServiceStaff?.id,
        },
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
    [
      assignServiceStaff,
      assignStaffDialog,
      setSnack,
      handleClose,
      selectedServiceStaff,
    ]
  );
  return (
    <React.Fragment>
      <Dialog
        maxWidth="md"
        fullWidth
        open={Boolean(assignStaffDialog)}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmitAssignStaffForm,
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
          Assign Staff
          <Typography sx={{ fontWeight: 600, color: "#7A7A7A" }}>
            {assignStaffDialog?.orderId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      ".MuiTableCell-root": {
                        fontWeight: "bold",
                        fontSize: "1rem",
                        letterSpacing: 1,
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell>Sl. No.</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Delivered</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignStaffDialog?.trailData?.map((item, index) => {
                    return (
                      <>
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item?.name}</TableCell>
                          <TableCell>{item?.quantity}</TableCell>
                          <TableCell>
                            {Boolean(item?.isDelivered) ? "Yes" : "No"}
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Grid container rowSpacing={2}>
            <Grid size={6}>
              <Autocomplete
                options={serviceStaffList?.data}
                getOptionLabel={(option) => option?.name}
                value={selectedServiceStaff}
                onChange={(e, newVal) => setSelectedServiceStaff(newVal)}
                inputValue={selectedServiceStaffInputVal}
                onInputChange={(e, newVal) =>
                  setSelectedServiceStaffInputVal(newVal || "")
                }
                clearOnEscape
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                sx={{
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
                    backgroundColor: "#E9E5F1",
                    color: "#280071",
                    fontWeight: 600,
                  },
                }}
                clearIcon={<ClearIcon color="primary" />}
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
                      <>
                        Select Staff
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.secondary.main,
                          }}
                        >
                          *
                        </Box>
                      </>
                    }
                    variant="standard"
                  />
                )}
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
            // disabled={!Boolean(selectedWaiter && selectedTable)}
            type="submit"
          >
            Assign Staff
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const OrderDetailsDialog = ({
  orderDetailsDialog,
  handleCloseOrderDetailsDialog,
  bookingDetails,
  setSnack,
  bookingDetailsRes,
  assosciateWithRoom,
  handleOpenPaymentDialog,
  completeOrder,
  formData,
  setFormData,
  isSplit,
  setIsSplit,
  orderMapDtos,
  setOrderMapDtos,
  customOrderMapDtos,
  setCustomOrderMapDtos,
}) => {
  console.log("orderDetailsDialog", orderDetailsDialog?.orderId);

  console.log("customOrderMapDtos : ", customOrderMapDtos);

  const paymentOptions = [
    { id: 1, type: "Cash" },
    { id: 2, type: "Online" },
  ];

  const handleGetBookingDetails = React.useCallback(() => {
    bookingDetails({
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
      roomNo: formData.roomNumber,
    })
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [bookingDetails, formData, setSnack]);

  const handleAssosciateWithRoom = React.useCallback(() => {
    if (!isSplit) {
      const totalPrice = orderDetailsDialog?.totalPrice ?? 0;
      const gstPrice = orderDetailsDialog?.gstPrice ?? 0;
      const totalAmount = totalPrice + gstPrice;
      assosciateWithRoom({
        isSplit: false,
        orderId: orderDetailsDialog?.orderId,
        bookingRefNo: bookingDetailsRes?.data?.data?.bookingRefNumber,
        orderMapDtos: [
          {
            bookingRefNo: bookingDetailsRes?.data?.data?.bookingRefNumber,
            totalPrice: totalAmount || 0,
          },
        ],
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleCloseOrderDetailsDialog();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    } else if (isSplit) {
      assosciateWithRoom({
        isSplit: true,
        orderId: orderDetailsDialog?.orderId,
        orderMapDtos: customOrderMapDtos?.map((item) => ({
          bookingRefNo: item?.bookingRefNumber,
          totalPrice: item?.payableAmount || 0,
        })),
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleCloseOrderDetailsDialog();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    }
  }, [
    assosciateWithRoom,
    orderDetailsDialog,
    bookingDetailsRes,
    setSnack,
    isSplit,
    customOrderMapDtos,
    handleCloseOrderDetailsDialog,
  ]);

  const handleMakePaymentWithCash = React.useCallback(() => {
    const totalPrice = orderDetailsDialog?.totalPrice || 0;
    const gstPrice = orderDetailsDialog?.gstPrice || 0;

    completeOrder({
      orderId: orderDetailsDialog?.orderId,
      paidAmount: totalPrice + gstPrice,
      paymentMethod: "Cash",
    })
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        handleCloseOrderDetailsDialog();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [
    completeOrder,
    orderDetailsDialog,
    setSnack,
    handleCloseOrderDetailsDialog,
  ]);

  const handleChange = React.useCallback(
    (e, newValue, reason, details) => {
      if (reason === "selectOption" || reason === "clear") {
        setFormData((prevData) => ({
          ...prevData,
          paymentType: newValue,
        }));
        return;
      }

      const { name, type, checked, value } = e.target;

      setFormData((prevData) => {
        if (name === "roomNumber") {
          return {
            ...prevData,
            [name]: value.replace(/\D/g, ""),
          };
        } else if (type === "checkbox") {
          return {
            ...prevData,
            isAssosciateWithRoom:
              name === "isAssosciateWithRoom" ? checked : false,
            isProceedToPayment: name === "isProceedToPayment" ? checked : false,
          };
        }
        return prevData;
      });
    },
    [setFormData]
  );

  const handleDownloadInvoice = React.useCallback((orderDetailsDialog) => {
    const imageUrl = JSON.parse(sessionStorage.getItem("data")).hotelLogoUrl;
    const hotelName = JSON.parse(sessionStorage.getItem("data")).hotelName;
    const doc = new jsPDF();

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = canvas.toDataURL("image/png");

      doc.addImage(imgData, "PNG", 150, 10, 40, 20);

      doc.setFontSize(16);
      doc.text("Restaurant Invoice", 20, 20);
      doc.setFontSize(12);
      doc.setFontSize(14);
      doc.text(hotelName, 20, 26);
      doc.setFontSize(12);
      doc.text(orderDetailsDialog?.address, 20, 32);

      doc.setFontSize(12);
      doc.text(
        `Customer Name: ${orderDetailsDialog?.firstName} ${
          orderDetailsDialog?.middleName || ""
        } ${orderDetailsDialog?.lastName || ""}`,
        20,
        50
      );
      doc.text(
        `Order Status: ${orderDetailsDialog.orderStatus.replace("_", " ")}`,
        20,
        55
      );
      doc.text(
        `Invoice Date: ${moment(orderDetailsDialog.bookedOn).format(
          "DD/MM/YYYY hh:mma"
        )}`,
        20,
        60
      );
      doc.text(`Invoice Number: ${orderDetailsDialog.orderId}`, 20, 65);

      const tableTop = 80;
      doc.text("Items", 20, tableTop);
      doc.text("Quantity", 120, tableTop);
      doc.text("Price", 180, tableTop);

      let yPosition = tableTop + 10;
      orderDetailsDialog?.trailData?.forEach((item) => {
        doc.text(item.name, 20, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(item.price.toString(), 180, yPosition);
        yPosition += 10;
      });

      const total = orderDetailsDialog.totalAmount;
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
    };
  }, []);

  const removeBookingByRefNumber = useCallback(
    (refNumber) => {
      setOrderMapDtos((prev) =>
        prev.filter((item) => item.bookingRefNumber !== refNumber)
      );
    },
    [setOrderMapDtos]
  );

  useEffect(() => {
    const bookingDataByRoomNo = bookingDetailsRes?.data?.data;
    if (isSplit && bookingDataByRoomNo?.bookingRefNumber) {
      setOrderMapDtos((prev) => {
        const exists = prev.some(
          (item) =>
            item.bookingRefNumber === bookingDataByRoomNo?.bookingRefNumber
        );

        return exists ? prev : [...prev, bookingDataByRoomNo];
      });
      setFormData((prevData) => ({
        ...prevData,
        roomNumber: "",
      }));
    } else if (!isSplit) {
      setOrderMapDtos([]);
    }
  }, [bookingDetailsRes, isSplit, setFormData, setOrderMapDtos]);

  useEffect(() => {
    const totalPrice = orderDetailsDialog?.totalAmount ?? 0;
    const gstPrice = orderDetailsDialog?.gstPrice ?? 0;
    const totalAmount = totalPrice + gstPrice;

    const updatedOrderDtos =
      Array.isArray(orderMapDtos) && orderMapDtos.length > 0
        ? orderMapDtos.map((item) => ({
            ...item,
            payableAmount: totalAmount / orderMapDtos.length,
          }))
        : [];
    setCustomOrderMapDtos(updatedOrderDtos);
  }, [orderMapDtos, orderDetailsDialog, setCustomOrderMapDtos]);

  return (
    <>
      <BootstrapDialog
        open={Boolean(orderDetailsDialog)}
        onClose={() => {
          handleCloseOrderDetailsDialog();
          setIsSplit(false);
        }}
        aria-labelledby="password-change-dialog-title"
        maxWidth="md"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            // px: 5,
            // py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "1.9rem",
                fontFamily: "'Times New Roman', Times, serif",
                color: (theme) => theme.palette.primary.main,
              }}
            >
              Order Details
            </Typography>{" "}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    Order Id:
                  </Typography>
                  <Typography>{orderDetailsDialog?.orderId}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    Table No:
                  </Typography>
                  <Typography>{orderDetailsDialog?.tableNo}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Order Date:
                  </Typography>
                  <Typography>
                    {moment(orderDetailsDialog?.bookedOn).format(
                      "DD/MM/YYYY hh:mma"
                    )}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold", color: "secondary" }}>
                    Order Status:
                  </Typography>
                  <Typography>
                    {orderDetailsDialog?.foodBookingStatus
                      ?.split("_")
                      .join(" ")}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    Order Sub-total:
                  </Typography>
                  <Typography>
                    ₹{" "}
                    {orderDetailsDialog?.totalAmount +
                      orderDetailsDialog?.gstPrice}
                  </Typography>
                </Box>
              </Box>
              {Boolean(orderDetailsDialog?.orderStatus === "Delivered") && (
                <Box>
                  <Tooltip title="Download Invoice" arrow>
                    <IconButton
                      onClick={() => handleDownloadInvoice(orderDetailsDialog)}
                    >
                      <ReceiptIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            <Box sx={{ py: 2 }}>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        ".MuiTableCell-root": {
                          fontWeight: "bold",
                          fontSize: "1rem",
                          letterSpacing: 1,
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell>Sl. No.</TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Delivered</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetailsDialog?.trailData?.map((item, index) => {
                      return (
                        <>
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item?.name}</TableCell>
                            <TableCell>{item?.quantity}</TableCell>
                            <TableCell>
                              {Boolean(item?.isDelivered) ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box>
              <Box sx={{ display: "flex" }}>
                <FormGroup sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isAssosciateWithRoom}
                        name="isAssosciateWithRoom"
                        onChange={handleChange}
                      />
                    }
                    label="Is Assosciate With Room"
                  />
                </FormGroup>
                <FormGroup sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isProceedToPayment}
                        name="isProceedToPayment"
                        onChange={handleChange}
                      />
                    }
                    label="Proceed to Payment"
                  />
                </FormGroup>
              </Box>

              {formData?.isAssosciateWithRoom && (
                <Box sx={{ display: "flex" }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSplit}
                          name="split"
                          onChange={() => setIsSplit((prev) => !prev)}
                        />
                      }
                      label="Split"
                    />
                  </FormGroup>
                </Box>
              )}

              {formData.isAssosciateWithRoom && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label={
                      <React.Fragment>
                        Room Number
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.error.main,
                          }}
                        >
                          *
                        </Box>
                      </React.Fragment>
                    }
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    variant="standard"
                  />

                  <Button
                    color="secondary"
                    variant="contained"
                    size="small"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    onClick={handleGetBookingDetails}
                  >
                    Check
                  </Button>
                </Box>
              )}

              {Boolean(formData.isProceedToPayment) && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      ".MuiTextField-root": {
                        width: "100%",
                        backgroundColor: "transparent",
                        ".MuiInputBase-root": {
                          color: "#B4B4B4",
                          background: "rgba(255, 255, 255, 0.25)",
                        },
                      },
                      ".MuiFormLabel-root": {
                        color: (theme) => theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: 14,
                      },
                      ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.primary.main}`,
                      },
                      ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.primary.main}`,
                      },
                      "& .MuiOutlinedInput-root": {
                        height: "35px",
                        minHeight: "35px",
                      },
                      "& .MuiInputBase-input": {
                        padding: "13px",
                        height: "100%",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      },
                    }}
                  >
                    <Autocomplete
                      options={paymentOptions}
                      fullWidth
                      getOptionLabel={(option) => option.type || ""}
                      clearOnEscape
                      disablePortal
                      value={formData.paymentType}
                      onChange={handleChange}
                      // inputValue={
                      //   customFormDrawerData?.paymentMethodInputValue || ""
                      // }
                      // onInputChange={(e, newVal) =>
                      //   handleChangeCustomFormDrawerDataOnChange(
                      //     "paymentMethodInputValue",
                      //     newVal
                      //   )
                      // }
                      popupIcon={<KeyboardArrowDownIcon color="primary" />}
                      sx={{
                        ".MuiInputBase-root": {
                          color: "#fff",
                        },
                        "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover":
                          {
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
                      componentsProps={{
                        popper: {
                          sx: {
                            "& .MuiAutocomplete-listbox": {
                              maxHeight: "150px",
                              overflow: "auto",
                            },
                            "& .MuiAutocomplete-option": {
                              fontSize: "13px",
                            },
                          },
                        },
                      }}
                      size="small"
                      clearIcon={<ClearIcon color="primary" />}
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
                          label="Payment Type"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              width: 200,
                              height: 35,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                  <Button
                    color="secondary"
                    variant="contained"
                    size="small"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    disabled={!Boolean(formData.paymentType)}
                    // onClick={handleOpenPaymentDialog}
                    onClick={() => {
                      if (formData.paymentType.type === "Cash") {
                        handleMakePaymentWithCash();
                      } else {
                        handleOpenPaymentDialog();
                      }
                    }}
                  >
                    Proceed to Payment
                  </Button>
                </Box>
              )}
            </Box>
            {!Boolean(isSplit) &&
              Boolean(bookingDetailsRes.isSuccess) &&
              Boolean(formData.isAssosciateWithRoom) && (
                <Paper
                  elevation={4}
                  sx={{
                    p: 2,
                    mt: 1,
                    // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      Name:
                    </Typography>
                    <Typography>
                      {bookingDetailsRes?.data?.data?.firstName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      Booking Ref. Number:
                    </Typography>
                    <Typography>
                      {bookingDetailsRes?.data?.data?.bookingRefNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      Phone Number:
                    </Typography>
                    <Typography>
                      {bookingDetailsRes?.data?.data?.phoneNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: (theme) => theme.palette.primary.main,
                      }}
                    >
                      Booking Status:
                    </Typography>
                    <Typography>
                      {bookingDetailsRes?.data?.data?.bookingStatus
                        .split("_")
                        .join(" ")}
                    </Typography>
                  </Box>
                </Paper>
              )}

            {/* - - - - - - SOMYA  - - - - - -  */}

            {Boolean(isSplit) && Boolean(customOrderMapDtos?.length > 0) && (
              <>
                {customOrderMapDtos?.map((item, index) => {
                  return (
                    <Paper
                      key={`orderMapDtos-${index}`}
                      elevation={4}
                      sx={{
                        p: 2,
                        mt: 1,
                        // boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          minWidth: "100%",
                          position: "relative",
                        }}
                      >
                        <Tooltip
                          title="Remove"
                          arrow
                          sx={{ position: "inherit" }}
                        >
                          <IconButton
                            onClick={() =>
                              removeBookingByRefNumber(item?.bookingRefNumber)
                            }
                            size="small"
                            sx={{
                              bgcolor: "red",
                              color: "white",
                              position: "absolute",
                              top: -12,
                              right: -12,
                              "&:hover": {
                                bgcolor: "#ffcccc", // Slight red tint on hover
                                color: "red",
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          Name:
                        </Typography>
                        <Typography>{item?.firstName}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          Room No.:
                        </Typography>
                        <Typography>{item?.roomDto?.roomNo}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          Booking Ref. Number:
                        </Typography>
                        <Typography>{item?.bookingRefNumber}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          Phone Number:
                        </Typography>
                        <Typography>{item?.phoneNumber}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: (theme) => theme.palette.primary.main,
                          }}
                        >
                          Booking Status:
                        </Typography>
                        <Typography>
                          {item?.bookingStatus.split("_").join(" ")}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#9fe6ff",
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: "7px",
                          }}
                        >
                          <Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: "bold",
                                color: (theme) => theme.palette.primary.main,
                              }}
                            >
                              Payable Amount:
                            </Typography>
                            <Typography component="span">
                              {item?.payableAmount || 0}
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </>
            )}

            {/* - - - - - - SOMYA  - - - - - -  */}
            {Boolean(formData.isAssosciateWithRoom) &&
              Boolean(bookingDetailsRes.isSuccess) && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Button
                    color="secondary"
                    variant="contained"
                    size="small"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    // disabled={!Boolean(formData.roomNumber)}
                    onClick={handleAssosciateWithRoom}
                  >
                    Assosciate with Room
                  </Button>
                </Box>
              )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};
export default BarDineIn;
