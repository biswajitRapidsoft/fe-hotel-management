import React from "react";
import {
  Box,
  Button,
  IconButton,
  DialogTitle,
  DialogContent,
  Typography,
  Grid2 as Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Paper,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import { jsPDF } from "jspdf";

import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReceiptIcon from "@mui/icons-material/Receipt";

import { BootstrapDialog } from "../header/Header";
import ChairIcon from "@mui/icons-material/Chair";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import moment from "moment";
import { PaymentDialog } from "../dashboard/GuestDashboard";
import {
  useGetAllTablesForCounterQuery,
  useGetBookingDetailsFromRoomNumberMutation,
  useAssosciateOrderWithRoomMutation,
  useCompleteFoodOrderMutation,
} from "../../services/restaurant";

const CounterStaffDashboard = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(null);

  const handleOpenPaymentDialog = React.useCallback(() => {
    const totalPrice = orderDetailsDialog?.bookingRequestDto?.totalPrice || 0;
    const gstPrice = orderDetailsDialog?.bookingRequestDto?.gstPrice || 0;

    const payload = {
      paidAmount: totalPrice + gstPrice,
      orderId: orderDetailsDialog?.bookingRequestDto?.orderId,
    };

    setMakePartialPaymentPayload(payload);
    setOpenPaymentDialog(true);
  }, [orderDetailsDialog]);
  const {
    data: tableListForCounterStaff = { data: [] },
    isLoading,
    isFetching,
  } = useGetAllTablesForCounterQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
      userId: JSON.parse(sessionStorage.getItem("data")).id,
    },
    {
      pollingInterval: 10000,
    }
  );

  const [bookingDetails, bookingDetailsRes] =
    useGetBookingDetailsFromRoomNumberMutation();

  const [assosciateWithRoom, assosciateWithRoomRes] =
    useAssosciateOrderWithRoomMutation();
  const [completeOrder, completeOrderRes] = useCompleteFoodOrderMutation();
  const handleCloseOrderDetailsDialog = React.useCallback(() => {
    setOrderDetailsDialog(null);
  }, []);

  return (
    <>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#EE82EE",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Ready to serve
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#007FFF",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Recieved By Waiter
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#00CED1",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Delivered
              </Typography>
            </Box>
          </Box>
        </Box>
        <TableCardsForCounterStaff
          tableListForCounterStaff={tableListForCounterStaff}
          setOrderDetailsDialog={setOrderDetailsDialog}
        />
      </Box>

      <OrderDetailsDialog
        orderDetailsDialog={orderDetailsDialog}
        handleCloseOrderDetailsDialog={handleCloseOrderDetailsDialog}
        setSnack={setSnack}
        bookingDetails={bookingDetails}
        bookingDetailsRes={bookingDetailsRes}
        assosciateWithRoom={assosciateWithRoom}
        handleOpenPaymentDialog={handleOpenPaymentDialog}
        completeOrder={completeOrder}
      />
      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        setSnack={setSnack}
        reserveHotelRoom={completeOrder}
        // handleAfterSuccessFunction={() => {
        //   onClose();
        // }}
      />

      <LoadingComponent
        open={
          bookingDetailsRes.isLoading ||
          assosciateWithRoomRes.isLoading ||
          completeOrderRes.isLoading ||
          isLoading
          // isFetching
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const TableCardsForCounterStaff = ({
  tableListForCounterStaff,
  setOrderDetailsDialog,
}) => {
  const getChairDistribution = (capacity) => {
    if (capacity === 4) {
      return { top: 2, right: 0, bottom: 2, left: 0 };
    } else if (capacity === 8) {
      return { top: 4, right: 0, bottom: 4, left: 0 };
    } else if (capacity === 2) {
      return { top: 1, right: 0, bottom: 1, left: 0 };
    } else if (capacity === 6) {
      return { top: 3, right: 0, bottom: 3, left: 0 };
    } else if (capacity === 3) {
      return { top: 2, right: 0, bottom: 1, left: 0 };
    } else if (capacity === 5) {
      return { top: 3, right: 0, bottom: 2, left: 0 };
    } else if (capacity === 7) {
      return { top: 4, right: 0, bottom: 3, left: 0 };
    } else {
      // Default for other capacities
      const half = Math.floor(capacity / 2);
      const remainder = capacity % 2;
      return {
        top: half + remainder,
        right: 0,
        bottom: half,
        left: 0,
      };
    }
  };

  const calculateGridSize = (capacity) => {
    const sizeMappings = {
      1: 1.2,
      2: { xs: 12, sm: 6, md: 4, lg: 1.2, xl: 1.2 },
      3: 1.3,
      4: 1.3,
      5: 1.4,
      6: 1.4,
      7: 1.5,
      8: 1.8,
      9: 1.8,
      10: 2,
      11: 2.4,
      12: 2.4,
      13: 2.6,
      14: 2.6,
      15: 2.8,
      16: 2.8,
      17: 3,
      18: 3,
      19: 3.1,
      20: 3.2,
    };

    if (sizeMappings[capacity]) {
      return sizeMappings[capacity];
    }

    const calculatedSize = 1.0 + (capacity - 2) * 0.05;
    return Math.min(calculatedSize, 3.2);
  };

  const generateChairs = (count, rotation) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <ChairIcon
          key={index}
          sx={{
            transform: `rotate(${rotation}deg)`,
            color: "#888",
            mx: 1,
            fontSize: "1.6rem",
          }}
        />
      ));
  };

  return (
    <>
      <Grid container spacing={2}>
        {tableListForCounterStaff?.data?.map((item, index) => {
          const noOfSeats = item?.noOfSeats;
          const distribution = getChairDistribution(noOfSeats);
          const gridSize = calculateGridSize(noOfSeats);
          return (
            <Grid size={gridSize} key={index}>
              <Box
                sx={{
                  position: "relative",
                  padding: "25px",
                  marginY: "10px",
                }}
              >
                {/* Top chairs */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {generateChairs(distribution.top, 0)}
                </Box>
                <Box
                  sx={{
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)",
                    minHeight: "7rem",
                    transition: "background-color 0.3s ease",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    fontSize: "18px",
                    fontWeight: "600",
                    backgroundColor: Boolean(
                      item?.bookingRequestDto?.foodBookingStatus ===
                        "Ready_to_serve"
                    )
                      ? "#EE82EE"
                      : item?.bookingRequestDto?.foodBookingStatus ===
                        "Received_by_Waiter"
                      ? "#007FFF"
                      : item?.bookingRequestDto?.foodBookingStatus ===
                        "Delivered"
                      ? "#00CED1"
                      : Boolean(item?.bookingRequestDto)
                      ? "#FFAC1C"
                      : "#17B169",
                    opacity: 0.7,
                    cursor: "pointer",
                    mt: 1,
                    mb: 1,
                  }}
                  onClick={() => {
                    if (Boolean(item?.bookingRequestDto)) {
                      setOrderDetailsDialog(item);
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                      }}
                    >
                      {item?.tableNo}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{
                        color: "#fff",
                        // fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      Capacity:
                    </Typography>
                    <Typography sx={{ color: "#fff" }}>
                      {item?.noOfSeats}
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom chairs */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {generateChairs(distribution.bottom, 180)}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
export default CounterStaffDashboard;

const OrderDetailsDialog = ({
  orderDetailsDialog,
  handleCloseOrderDetailsDialog,
  bookingDetails,
  setSnack,
  bookingDetailsRes,
  assosciateWithRoom,
  handleOpenPaymentDialog,
  completeOrder,
}) => {
  console.log("orderDetailsDialog", orderDetailsDialog);
  const [formData, setFormData] = React.useState({
    isAssosciateWithRoom: false,
    isProceedToPayment: false,
    roomNumber: "",
    paymentType: null,
  });
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
  }, [bookingDetails, formData]);

  const handleAssosciateWithRoom = React.useCallback(() => {
    assosciateWithRoom({
      orderId: orderDetailsDialog?.bookingRequestDto?.orderId,
      bookingRefNo: bookingDetailsRes?.data?.data?.bookingRefNumber,
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
  }, [assosciateWithRoom, orderDetailsDialog, bookingDetailsRes]);

  const handleMakePaymentWithCash = React.useCallback(() => {
    const totalPrice = orderDetailsDialog?.bookingRequestDto?.totalPrice || 0;
    const gstPrice = orderDetailsDialog?.bookingRequestDto?.gstPrice || 0;

    completeOrder({
      orderId: orderDetailsDialog?.bookingRequestDto.orderId,
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
  }, [completeOrder, orderDetailsDialog]);

  const handleChange = React.useCallback((e, newValue, reason, details) => {
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
  }, []);
  const handleDownloadInvoice = React.useCallback((orderDetailsDialog) => {
    // console.log("order", order);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Restaurant Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(orderDetailsDialog.bookingRequestDto.address, 20, 30);

    doc.setFontSize(12);
    doc.text(
      `Customer Name: ${orderDetailsDialog.bookingRequestDto.firstName} ${
        orderDetailsDialog.bookingRequestDto.middleName || ""
      } ${orderDetailsDialog.bookingRequestDto.lastName || ""}`,
      20,
      50
    );
    doc.text(
      `Order Status: ${orderDetailsDialog.bookingRequestDto.foodBookingStatus.replace(
        "_",
        " "
      )}`,
      20,
      55
    );
    doc.text(
      `Invoice Date: ${moment(
        orderDetailsDialog.bookingRequestDto.bookedOn
      ).format("DD/MM/YYYY hh:mma")}`,
      20,
      60
    );
    doc.text(
      `Invoice Number: ${orderDetailsDialog.bookingRequestDto.orderId}`,
      20,
      65
    );

    const tableTop = 80;
    doc.text("Items", 20, tableTop);
    doc.text("Quantity", 120, tableTop);
    doc.text("Price", 180, tableTop);

    let yPosition = tableTop + 10;
    orderDetailsDialog?.bookingRequestDto?.trailData?.forEach((item) => {
      doc.text(item.itemName, 20, yPosition);
      doc.text(item.noOfItems.toString(), 120, yPosition);
      doc.text(item.price.toString(), 180, yPosition);
      yPosition += 10;
    });

    const total = orderDetailsDialog.bookingRequestDto.totalPrice;
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
    <>
      <BootstrapDialog
        open={Boolean(orderDetailsDialog)}
        onClose={handleCloseOrderDetailsDialog}
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
                  <Typography>
                    {orderDetailsDialog?.bookingRequestDto?.orderId}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Order Date:
                  </Typography>
                  <Typography>
                    {moment(
                      orderDetailsDialog?.bookingRequestDto?.bookedOn
                    ).format("DD/MM/YYYY hh:mma")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Typography sx={{ fontWeight: "bold", color: "secondary" }}>
                    Order Status:
                  </Typography>
                  <Typography>
                    {orderDetailsDialog?.bookingRequestDto?.foodBookingStatus
                      .split("_")
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
                    {orderDetailsDialog?.bookingRequestDto?.totalPrice +
                      orderDetailsDialog?.bookingRequestDto?.gstPrice}
                  </Typography>
                </Box>
              </Box>
              {Boolean(
                orderDetailsDialog?.bookingRequestDto?.foodBookingStatus ===
                  "Delivered"
              ) && (
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
                    {orderDetailsDialog?.bookingRequestDto?.trailData?.map(
                      (item, index) => {
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
                      }
                    )}
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
            {Boolean(bookingDetailsRes.isSuccess) &&
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
