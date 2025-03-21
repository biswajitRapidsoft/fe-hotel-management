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
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from "@mui/icons-material/Clear";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  useGetAllDineInRequestFromRoomQuery,
  useGetAllTablesForCounterQuery,
  useGetAllWaitersQuery,
  useAssignTableToWaiterMutation,
} from "../../services/restaurant";
import moment from "moment";
import {
  CANCELLED,
  DELIVERED,
  // KITCHENSTAFF,
  // ORDER_PLACED,
  REJECTED,
} from "../../helper/constants";
const RoomDineIn = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();
  const [assignTableToWaiter, assignTableToWaiterRes] =
    useAssignTableToWaiterMutation();

  const {
    data: roomDineInTableList = { data: [] },
    isLoading: isroomDineInTableListLoading,
    isFetching: isRoomDineInTableListFetching,
  } = useGetAllDineInRequestFromRoomQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    date: moment().format("YYYY-MM-DD"),
  });

  const {
    data: tableListForCounterStaff = { data: [] },
    isLoading: istableListForCounterStaffLoading,
  } = useGetAllTablesForCounterQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    userId: JSON.parse(sessionStorage.getItem("data")).id,
  });

  const { data: waiterList = { data: [] } } = useGetAllWaitersQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
  });

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
          {" "}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Room Dine-In List
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
                <TableCell>Order Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {roomDineInTableList?.data?.map((item, index) => {
                return (
                  <Row
                    key={item.id}
                    item={item}
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
        order={updateStatusDialog}
        setSnack={setSnack}
        tableListForCounterStaff={tableListForCounterStaff}
        waiterList={waiterList}
        assignTableToWaiter={assignTableToWaiter}
      />

      <LoadingComponent
        open={
          // isLoading ||
          isroomDineInTableListLoading ||
          isRoomDineInTableListFetching ||
          istableListForCounterStaffLoading ||
          assignTableToWaiterRes.isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const Row = ({ item, index, setUpdateStatusDialog }) => {
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
        <TableCell sx={{ minWidth: 150 }}>{`${item.firstName} ${
          item.middleName || ""
        } ${item.lastName || ""}`}</TableCell>
        <TableCell>{item.phoneNo}</TableCell>
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
            CREATED
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
              {item.bookingDetails.isRated && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Box>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                      size="large"
                      value={item.bookingDetails.ratingPoints}
                      disabled
                    />
                  </Box>
                  <Typography>{item.bookingDetails.ratingMessage}</Typography>
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
              {![DELIVERED, CANCELLED, REJECTED].includes(
                item.bookingDetails.foodBookingStatus
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
                  onClick={() => setUpdateStatusDialog(item)}
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

export default RoomDineIn;
