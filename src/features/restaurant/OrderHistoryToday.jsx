import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  Typography,
  TableContainer,
  TableBody,
  Toolbar,
  IconButton,
  Collapse,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
  TextField,
  Autocomplete,
} from "@mui/material";
import React from "react";
import { useGetAllTodayOrderForCounterStaffQuery } from "../../services/restaurant";
import ClearIcon from "@mui/icons-material/Clear";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  CANCELLED,
  DELIVERED,
  ORDER_PLACED,
  READY_TO_SERVE,
  REJECTED,
} from "../../helper/constants";
import {
  useGetAllTablesForCounterQuery,
  useGetAllWaitersQuery,
  useAssignTableToWaiterMutation,
  useCompleteFoodOrderMutation,
  useGetAllKitchenStaffQuery,
  useAssignServiceStaffMutation,
} from "../../services/restaurant";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { PaymentDialog } from "../dashboard/GuestDashboard";

const OrderHistoryToday = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();
  const [assignStaffDialog, setAssignStaffDialog] = React.useState();
  const [assignTableToWaiter, assignTableToWaiterRes] =
    useAssignTableToWaiterMutation();
  const [assignServiceStaff, assignServiceStaffRes] =
    useAssignServiceStaffMutation();
  const [completeOrder, completeOrderRes] = useCompleteFoodOrderMutation();

  const {
    data: orderList = { data: [] },
    isLoading: isGetAllTodayOrderForCounterStaff,
  } = useGetAllTodayOrderForCounterStaffQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId
  );

  const {
    data: tableListForCounterStaff = { data: [] },
    isLoading: istableListForCounterStaffLoading,
  } = useGetAllTablesForCounterQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    userId: JSON.parse(sessionStorage.getItem("data")).id,
  });

  const { data: serviceStaffList = { data: [] } } = useGetAllKitchenStaffQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
  });

  const { data: waiterList = { data: [] } } = useGetAllWaitersQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
  });
  const handlePayment = React.useCallback((item) => {
    const totalPrice = item?.bookingDetails?.totalPrice || 0;
    const gstPrice = item?.bookingDetails?.gstPrice || 0;

    const payload = {
      paidAmount: totalPrice + gstPrice,
      orderId: item?.orderId,
    };
    setMakePartialPaymentPayload(payload);
    setOpenPaymentDialog(true);
  }, []);
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
              Today Order History
            </Typography>
          </Toolbar>
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
                <TableCell>Order Taken By</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>

            <TableBody>
              {orderList?.data?.map((item, index) => {
                return (
                  <Row
                    key={item.id}
                    item={item}
                    index={index}
                    handlePayment={handlePayment}
                    setUpdateStatusDialog={setUpdateStatusDialog}
                    setMakePartialPaymentPayload={setMakePartialPaymentPayload}
                    setOpenPaymentDialog={setOpenPaymentDialog}
                    setAssignStaffDialog={setAssignStaffDialog}
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
        tableListForCounterStaff={tableListForCounterStaff}
        waiterList={waiterList}
        assignTableToWaiter={assignTableToWaiter}
      />
      <AssignStaffDialog
        assignStaffDialog={assignStaffDialog}
        setAssignStaffDialog={setAssignStaffDialog}
        serviceStaffList={serviceStaffList}
        handleClose={() => setAssignStaffDialog(null)}
        assignServiceStaff={assignServiceStaff}
        setSnack={setSnack}
      />
      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        setSnack={setSnack}
        reserveHotelRoom={completeOrder}
      />
      <LoadingComponent
        open={
          isGetAllTodayOrderForCounterStaff ||
          istableListForCounterStaffLoading ||
          assignTableToWaiterRes.isLoading ||
          completeOrderRes.isLoading ||
          assignServiceStaffRes.isLoading
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
  handlePayment,
  setAssignStaffDialog,
}) => {
  console.log("item", item);
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
        <TableCell>{item?.bookingDetails?.orderId}</TableCell>
        <TableCell sx={{ minWidth: 150 }}>{`${item.bookingDetails.firstName} ${
          item.bookingDetails.middleName || ""
        } ${item.bookingDetails.lastName || ""}`}</TableCell>
        <TableCell>{item.bookingDetails.phoneNo}</TableCell>
        <TableCell>
          {item.bookingDetails.dinningType.replace("_", " ")}
        </TableCell>
        <TableCell>
          {item?.bookingDetails?.roomDto
            ? `${item?.bookingDetails?.roomDto?.roomNo}(${item?.bookingDetails?.roomDto?.floorNo})`
            : "--"}
        </TableCell>
        <TableCell>{item?.orderTakenBy?.name}</TableCell>

        <TableCell>
          <Typography
            sx={{
              color: (theme) => theme.palette.warning.main,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            {item?.bookingDetails?.foodBookingStatus}
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
                  {item?.itemsList?.map((orderItem, orderItemIndex) => {
                    return (
                      <TableRow
                        sx={{
                          ".MuiTableCell-root": {
                            letterSpacing: 1,
                            fontSize: 16,
                          },
                          "& > *": { borderBottom: "unset" },
                        }}
                        key={`${item.id}-${orderItem.itemName}`}
                      >
                        <TableCell>{orderItemIndex + 1}</TableCell>
                        <TableCell>{orderItem.itemName}</TableCell>
                        <TableCell>{orderItem.noOfItems}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {[DELIVERED, CANCELLED, REJECTED, ORDER_PLACED].includes(
                item?.bookingDetails?.foodBookingStatus
              ) &&
                item?.bookingDetails?.dinningType !== "Room_Delivery" &&
                item?.dinningType === "Take_Away" && (
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

              {item?.bookingDetails?.foodBookingStatus === READY_TO_SERVE && (
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
                  onClick={() => handlePayment(item)}
                >
                  Proceed to Payment
                </Button>
              )}
              {item?.bookingDetails?.dinningType === "Room_Delivery" &&
                !Boolean(item?.orderTakenBy) && (
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
  tableListForCounterStaff,
  waiterList,
  order,
  setSnack,
  assignTableToWaiter,
}) {
  console.log("order", order);
  const [remark, setRemark] = React.useState("");
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [selectedWaiter, setSelectedWaiter] = React.useState(null);
  const [selectedTableInputVal, setSelectedTableInputVal] = React.useState("");
  const [selectedWaiterInputVal, setSelectedWaiterInputVal] =
    React.useState("");

  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      assignTableToWaiter({
        orderId: order?.bookingDetails?.orderId,
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
      remark,
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
    setRemark("");
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
                options={tableListForCounterStaff?.data.filter((item) =>
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
  serviceStaffList,
  handleClose,
  assignServiceStaff,
  setSnack,
}) {
  console.log("assignStaffDialog", assignStaffDialog);
  const [selectedServiceStaff, setSelectedServiceStaff] = React.useState(null);
  const [selectedServiceStaffInputVal, setSelectedServiceStaffInputVal] =
    React.useState("");

  const handleSubmitAssignStaffForm = React.useCallback(
    (e) => {
      e.preventDefault();
      assignServiceStaff({
        orderId: assignStaffDialog?.bookingDetails?.orderId,
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
            {assignStaffDialog?.bookingDetails?.orderId}
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
                  {assignStaffDialog?.itemsList?.map((item, index) => {
                    return (
                      <>
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item?.itemName}</TableCell>
                          <TableCell>{item?.noOfItems}</TableCell>
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
export default OrderHistoryToday;
