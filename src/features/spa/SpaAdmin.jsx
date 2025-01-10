import React, { memo } from "react";

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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Grid2 as Grid,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import InfoIcon from "@mui/icons-material/Info";
import ClearIcon from "@mui/icons-material/Clear";

import { IoCardOutline } from "react-icons/io5";
import { RiSecurePaymentLine } from "react-icons/ri";

import { Transition } from "../dashboard/GuestDashboard";
import MasterCard from "../../img/masterCard.png";
import Visa from "../../img/visa.png";
import Maestro from "../../img/maestro.png";
import { useMakePaymentMutation } from "../../services/dashboard";

import {
  useGetSpaBookingHistoryAdminQuery,
  useGetSpaBookingStatusTypeQuery,
  useUpdateSpaBookingStatusMutation,
} from "../../services/spa";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  ACTIVE_SPA,
  CANCELLATION_REQUESTED_SPA,
  CANCELLED_SPA,
  DONE_SPA,
} from "../../helper/constants";

const Row = ({ booking, index, setUpdateStatusDialog }) => {
  const [showFullText, setShowFullText] = React.useState(false);
  const handleToggle = () => setShowFullText((prev) => !prev);
  const truncatedText =
    booking?.remarks?.length > 20
      ? `${booking?.remarks.substring(0, 20)}`
      : booking?.remarks;

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
        <TableCell>{booking.bookingSpaRefNumber}</TableCell>
        <TableCell>{booking.spaTypeName}</TableCell>
        <TableCell>{`${booking.customerFirstName || ""} ${
          booking.customerMiddleName || ""
        } ${booking.customerLastName || ""}`}</TableCell>
        <TableCell>{booking.bookingDate}</TableCell>
        <TableCell>{`${booking.startTime
          .split(" ")[1]
          .slice(0, 5)}-${booking.endTime
          .split(" ")[1]
          .slice(0, 5)}`}</TableCell>
        <TableCell align="center">
          {booking?.roomDto?.roomNo ? (
            <>
              {booking?.roomDto?.roomNo} (floor-{booking?.roomDto?.floorNo})
            </>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell>{booking?.basePrice}</TableCell>
        {/* <TableCell>{booking?.remarks}</TableCell> */}
        <TableCell>
          {!showFullText ? (
            <>
              {truncatedText}{" "}
              {booking?.remarks?.length > 20 && (
                <IconButton size="small" onClick={handleToggle}>
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              )}
            </>
          ) : (
            <Typography onClick={handleToggle} style={{ cursor: "pointer" }}>
              {booking?.remarks}
            </Typography>
          )}
        </TableCell>
        <TableCell
          sx={{
            color: (theme) =>
              [CANCELLED_SPA].includes(booking.status)
                ? theme.palette.error.dark
                : [CANCELLATION_REQUESTED_SPA].includes(booking.status)
                ? theme.palette.error.light
                : [DONE_SPA].includes(booking.status)
                ? theme.palette.success.dark
                : [ACTIVE_SPA].includes(booking.status)
                ? theme.palette.success.light
                : theme.palette.warning.main,
          }}
        >
          {booking.status.replace("_", " ")}
        </TableCell>
        <TableCell>
          <IconButton
            onClick={() => setUpdateStatusDialog(booking)}
            color="secondary"
            disabled={[CANCELLED_SPA, DONE_SPA].includes(booking.status)}
          >
            <InfoIcon />
          </IconButton>
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
  // setOpenPaymentDialog,
  // setBookingPayload,
}) {
  const [remark, setRemark] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const [selectedStatusInputVal, setSelectedStatusInputVal] =
    React.useState("");
  // const [selectedPaymentMethod, setSelectedPaymentMethod] =
  //   React.useState("Cash");
  // const [selectedPaymentMethodInputVal, setSelectedPaymentMethodInputVal] =
  //   React.useState("Cash");
  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      // if (
      //   Boolean(order?.paidAmount) &&
      //   order.status === ACTIVE_SPA &&
      //   selectedStatus === DONE_SPA &&
      //   selectedPaymentMethod === "Online"
      // ) {
      //   setBookingPayload({
      //     bookingSpaRefNumber: order.bookingSpaRefNumber,
      //     remarks: remark,
      //     status: selectedStatus,
      //     paymentMethod: selectedPaymentMethod,
      //   });
      //   setOpenPaymentDialog(order?.paidAmount || null);
      // } else {
      updateStatus({
        bookingSpaRefNumber: order.bookingSpaRefNumber,
        remarks: remark,
        status: selectedStatus,
        // paymentMethod: selectedPaymentMethod,
        paidAmount: order.paidAmount,
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
      // }
    },
    [
      updateStatus,
      selectedStatus,
      remark,
      order,
      setSnack,
      handleClose,
      // setOpenPaymentDialog,
      // setBookingPayload,
      // selectedPaymentMethod,
    ]
  );

  React.useEffect(() => {
    setRemark("");
    setSelectedStatus(order?.status || null);
    setSelectedStatusInputVal(order?.status || "");
  }, [open, order]);

  const isStatusDisabled = React.useCallback(
    (option) => {
      const statusSequence = [
        "BOOKED",
        "CONFIRMED",
        "FOOD_PREPARING",
        "ORDER_PLACED",
        "DONE",
        "CANCELLED",
      ];
      const currentStatusIndex = statusSequence.indexOf(order?.status);
      const optionIndex = statusSequence.indexOf(option);

      return optionIndex < currentStatusIndex;
    },
    [order]
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
          Update Spa Status
          <Typography sx={{ fontWeight: 600, color: "#7A7A7A" }}>
            {order?.bookingDetails?.orderId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container rowSpacing={2}>
            <Grid size={12}>
              <Autocomplete
                options={statusList}
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
            {/* {Boolean(order?.paidAmount) &&
              order.status === ACTIVE_SPA &&
              selectedStatus === DONE_SPA && (
                <Grid size={12}>
                  <Grid container>
                    <Grid size={6}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {`Amount To Pay: ${(order.paidAmount || 0).toFixed(2)}`}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Autocomplete
                        size="small"
                        options={["Online", "Cash"]}
                        value={selectedPaymentMethod}
                        onChange={(e, newVal) =>
                          setSelectedPaymentMethod(newVal)
                        }
                        inputValue={selectedPaymentMethodInputVal}
                        onInputChange={(e, newVal) =>
                          setSelectedPaymentMethodInputVal(newVal)
                        }
                        clearOnEscape
                        popupIcon={<KeyboardArrowDownIcon color="primary" />}
                        sx={{
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
                              <React.Fragment>
                                Select Payment Method{" "}
                                <Box
                                  component="span"
                                  sx={{
                                    color: (theme) =>
                                      theme.palette.secondary.main,
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
                  </Grid>
                </Grid>
              )} */}
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
            {/* {Boolean(order?.paidAmount) &&
            order.status === ACTIVE_SPA &&
            selectedStatus === DONE_SPA
              ? "Pay And Update"
              : "Update Status"} */}
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const SpaAdmin = () => {
  // const [bookingPayload, setBookingPayload] = React.useState({});
  // const [openPaymentDialog, setOpenPaymentDialog] = React.useState(null);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatus, updateStatusRes] = useUpdateSpaBookingStatusMutation();
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();
  const {
    data: bookingList = {
      data: {
        data: [],
      },
    },
    isLoading,
  } = useGetSpaBookingHistoryAdminQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
  });
  const {
    data: statusList = {
      data: [],
    },
  } = useGetSpaBookingStatusTypeQuery();
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
            Spa Booking List
          </Typography>
        </Toolbar>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
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
                <TableCell>Spa Booking Ref No.</TableCell>
                <TableCell>Spa Type</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Room No.</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingList.data.data.map((booking, index) => {
                return (
                  <Row
                    key={booking.id}
                    booking={booking}
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
        // setOpenPaymentDialog={setOpenPaymentDialog}
        // setBookingPayload={setBookingPayload}
      />
      {/* <PaymentDialog
        openPaymentDialog={Boolean(openPaymentDialog)}
        amountToPay={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(null)}
        setSnack={setSnack}
        fetchApi={updateStatus}
        apiPayload={bookingPayload}
        handleReset={() => setUpdateStatusDialog(null)}
      /> */}
      <LoadingComponent open={isLoading || updateStatusRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export const PaymentDialog = memo(function ({
  openPaymentDialog,
  handlePaymentDialogClose,
  amountToPay,
  setSnack,
  fetchApi,
  apiPayload,
  handleReset,
}) {
  const [paymentMethod, setPaymentMethod] = React.useState("card");
  const [cardNumber, setCardNumber] = React.useState("");
  const [upiNumber, setUpiNumber] = React.useState("");
  const [cvv, setCvv] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [isDebitCard, setIsDebitCard] = React.useState(true);
  // const [showConfetti, setShowConfetti] = React.useState(false); // For confetti

  const [makePayment, makePaymentRes] = useMakePaymentMutation();

  const isPayButtonDisabled =
    (paymentMethod === "card" && cardNumber.trim() === "") ||
    (paymentMethod === "upi" && upiNumber.trim() === "");

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setCardNumber("");
    setUpiNumber("");
    setCvv("");
  };
  const handleChangeInputForPayment = (e) => {
    const { name, value } = e.target;
    const numericRegex = /^[0-9]*$/;

    if (name === "cardNumber") {
      if (numericRegex.test(value) && value.length <= 16) {
        setCardNumber(value);
      }
    } else if (name === "cvv") {
      if (numericRegex.test(value) && value.length <= 3) {
        setCvv(value);
      }
    } else if (name === "upiNumber") {
      // const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      // if (value.trim() === "" || upiRegex.test(value)) {
      setUpiNumber(value);
      // }
    }
  };

  const handleSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      // const paymentDetail = paymentMethod === "card" ? cardNumber : upiNumber;

      // const finalPayload = {
      //   ...reservationPayload,
      //   paymentDetail,
      // };

      const paymentPayload = {
        paidAmount: amountToPay,
        // paymentMethod: isDebitCard ? "Debit_Card" : "Credit_Card",
        paymentMethod:
          paymentMethod === "card"
            ? isDebitCard
              ? "Debit_Card"
              : "Credit_Card"
            : "UPI",
        // cardNumber: paymentDetail,
        cardNumber: paymentMethod === "card" ? cardNumber : null,
        upiAddress: upiNumber,
      };

      try {
        const paymentResponse = await makePayment(paymentPayload).unwrap();
        fetchApi({
          ...apiPayload,
          transactionReferenceNo: paymentResponse.data,
          paidAmount: amountToPay,
        })
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res.message,
              severity: "success",
            });
            handleReset();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: err.data?.message || err.data,
              severity: "error",
            });
          });
      } catch (err) {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      } finally {
        setCardNumber("");
        setUpiNumber("");
        setCvv("");
        handlePaymentDialogClose();
      }
    },
    [
      cardNumber,
      upiNumber,
      paymentMethod,
      handlePaymentDialogClose,
      isDebitCard,
      makePayment,
      setSnack,
      amountToPay,
      fetchApi,
      apiPayload,
      handleReset,
    ]
  );

  return (
    <>
      {/* {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )} */}

      <Dialog
        TransitionComponent={Transition}
        open={openPaymentDialog}
        onClose={handlePaymentDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
        sx={{ "& .MuiDialog-paper": { height: "450px" } }}
      >
        <DialogContent>
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                py: 2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontWeight: "bold", fontSize: "1.6rem", mb: 1 }}
              >
                Cashfree Payment Methods
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <img
                  src={MasterCard}
                  alt="MasterCard Logo"
                  height={45}
                  width={45}
                />
                <img src={Visa} alt="MasterCard Logo" height={45} width={45} />
                <img
                  src={Maestro}
                  alt="MasterCard Logo"
                  height={45}
                  width={45}
                />
              </Box>
            </Box>
            <Grid container columnSpacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    cursor: "pointer",
                  }}
                >
                  {/* box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px; */}
                  <Box
                    onClick={() => handlePaymentMethodChange("card")}
                    sx={{
                      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                      p: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      borderRadius: "1rem",
                      backgroundColor:
                        paymentMethod === "card" ? "#f0f8ff" : "#fff",
                    }}
                  >
                    <IoCardOutline
                      style={{ fontSize: "2rem", color: "#0039a6" }}
                    />
                    <Typography>Card</Typography>
                  </Box>
                  <Box
                    onClick={() => handlePaymentMethodChange("upi")}
                    sx={{
                      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                      p: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      borderRadius: "1rem",
                      backgroundColor:
                        paymentMethod === "upi" ? "#f0f8ff" : "#fff",
                    }}
                  >
                    <RiSecurePaymentLine
                      style={{ fontSize: "2rem", color: "#0039a6" }}
                    />
                    <Typography>UPI</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      height: "280px",
                      borderRadius: "0.7rem",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          // alignItems: "center",
                          justifyContent: "space-between",
                          flexDirection: "column",
                        }}
                      >
                        {paymentMethod === "card" && (
                          <Box>
                            <RadioGroup
                              row
                              value={isDebitCard ? "debit" : "credit"}
                              onChange={(e) =>
                                setIsDebitCard(e.target.value === "debit")
                              }
                            >
                              <FormControlLabel
                                value="debit"
                                control={<Radio />}
                                label="Debit Card"
                                // onChange={() => setIsDebitCard(true)}
                              />
                              <FormControlLabel
                                value="credit"
                                control={<Radio />}
                                label="Credit Card"
                                // onChange={() => setIsDebitCard(false)}
                              />
                            </RadioGroup>
                          </Box>
                        )}

                        <Typography sx={{ fontSize: "1.3rem" }}>
                          {paymentMethod === "card"
                            ? isDebitCard
                              ? "Debit Card Details"
                              : "Credit Card Details"
                            : "Enter UPI Id:"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      {paymentMethod === "card" && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              size="small"
                              id="cardNumber"
                              label="Card Number"
                              name="cardNumber"
                              variant="outlined"
                              value={cardNumber}
                              // onChange={(e) => setCardNumber(e.target.value)}
                              onChange={handleChangeInputForPayment}
                              sx={{
                                // bgcolor: "#F9F4FF",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              id="cvv"
                              label="CVV"
                              name="cvv"
                              variant="outlined"
                              value={cvv}
                              // onChange={(e) => setCvv(e.target.value)}
                              onChange={handleChangeInputForPayment}
                              sx={{
                                // bgcolor: "#F9F4FF",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Expiry Date"
                              disablePast
                              format="DD-MM-YYYY"
                              // value={formData.fromDate}
                              // onChange={handleDateChange("fromDate")}
                              slotProps={{
                                textField: {
                                  readOnly: true,
                                  size: "small",
                                },
                              }}
                            />
                          </LocalizationProvider> */}
                            <TextField
                              label="Expiry Date"
                              name="expiryDate"
                              placeholder="MM/YY"
                              variant="outlined"
                              inputProps={{
                                maxLength: 5,
                              }}
                              size="small"
                              value={expiryDate}
                              sx={{
                                // bgcolor: "#F9F4FF",
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                },
                              }}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Auto-format input to MM/YY
                                if (
                                  value.length === 2 &&
                                  !value.includes("/")
                                ) {
                                  e.target.value = value + "/";
                                }

                                // Validate input
                                const formattedValue = value.replace(
                                  /[^0-9/]/g,
                                  ""
                                );
                                setExpiryDate(formattedValue);
                              }}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {paymentMethod === "upi" && (
                        <TextField
                          fullWidth
                          size="small"
                          id="upiNumber"
                          label="Enter UPI Id"
                          name="upiNumber"
                          variant="outlined"
                          value={upiNumber}
                          // onChange={(e) => setUpiNumber(e.target.value)}
                          onChange={handleChangeInputForPayment}
                          sx={{
                            // bgcolor: "#F9F4FF",
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ width: "100%" }}>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "#2a52be" }}
                        disabled={isPayButtonDisabled}
                        // onClick={handlePayNow}
                        type="submit"
                      >
                        Pay ₹{amountToPay}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
      <LoadingComponent open={makePaymentRes.isLoading} />
    </>
  );
});

export default SpaAdmin;
