import React from "react";
import {
  Box,
  Paper,
  Grid2 as Grid,
  Typography,
  TextField,
  Button,
  Drawer,
  Divider,
  Autocomplete,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import HistoryIcon from "@mui/icons-material/History";
import { DrawerHeader } from "../restaurant/Restaurant";
import SearchIcon from "@mui/icons-material/Search";
import {
  useGetSpaTypeReceptionistQuery,
  useGetRoomBySpaTypeReceptionistQuery,
  useBookSpaByReceptionistMutation,
  useGetSpaBookingReceptionistQuery,
  useUpdateSpaBookingStatusMutation,
} from "../../services/spa";
import { useLazyGetGuestDetilsFromBookingRefQuery } from "../../services/parking";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { PaymentDialogV2 } from "./SpaAdmin";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const drawerWidth = 450;

const SpaFrontdeskDashboard = () => {
  const {
    data: spaTypeList = {
      data: [],
    },
    isLoading,
  } = useGetSpaTypeReceptionistQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId
  );
  const {
    data: bookings = {
      data: {
        spaRoomDtos: [],
      },
    },
  } = useGetSpaBookingReceptionistQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId
  );
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(null);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatus, updateStatusRes] = useUpdateSpaBookingStatusMutation();
  const [searchInput, setSearchInput] = React.useState("");
  const [spaToBook, setSpaToBook] = React.useState(null);
  const [bookSpa, bookSpaRes] = useBookSpaByReceptionistMutation();
  const [bookingPayload, setBookingPayload] = React.useState({});
  const [fetchApi, setFetchApi] = React.useState(() => {});
  const [selectedBookingRoom, setSelectedBookingRoom] = React.useState(null);

  const navigate = useNavigate();

  const handleReserveSpa = React.useCallback(
    (guestData) => {
      const {
        selectedDate,
        selectedTherapist,
        selectedRoom,
        bookingRefNumber,
        firstName,
        middleName,
        lastName,
        phoneNo,
        email,
        address,
      } = guestData;
      const payload = {
        customerFirstName: firstName,
        customerMiddleName: middleName,
        customerLastName: lastName,
        customerPhoneNo: phoneNo,
        customerEmail: email,
        customerAddress: address,
        spaTypeId: spaToBook.id,
        spaTypeList: [{ id: spaToBook.id }],
        hotelBookingReferenceNumber: bookingRefNumber.trim() || null,
        bookingDate: moment(selectedDate.$d).format("DD-MM-YYYY HH:mm:ss"),
        gstPrice: spaToBook.price * 0.18,
        transactionReferenceNo: null,
        paymentMethod: "Online",
        totalPrice: spaToBook.price.toFixed(2),
        paidAmount: null,
        hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
        therapist: {
          id: selectedTherapist.id,
        },
        spaRoomDto: {
          id: selectedRoom.id,
        },
      };
      if (spaToBook.isAdvanceNeeded) {
        setOpenPaymentDialog((spaToBook.price * 0.2).toFixed(2));
        setBookingPayload(payload);
        setFetchApi(() => bookSpa);
      } else {
        bookSpa(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res.message,
              severity: "success",
            });
            setSpaToBook(null);
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: err.data?.message || err.data,
              severity: "error",
            });
          });
      }
    },
    [bookSpa, spaToBook]
  );

  const handlePayAndComplete = React.useCallback(() => {
    const amountToPay =
      (selectedBookingRoom?.spaBookingDetails?.totalPrice || 0) +
      (selectedBookingRoom?.spaBookingDetails?.gstPrice || 0) -
      (selectedBookingRoom?.spaBookingDetails?.paidAmount || 0);
    setOpenPaymentDialog(amountToPay);
    setBookingPayload({
      bookingSpaRefNumber:
        selectedBookingRoom?.spaBookingDetails?.bookingSpaRefNumber,
      remarks: null,
      status: "COMPLETED",
      paymentMethod: "Online",
    });
    setFetchApi(() => updateStatus);
  }, [selectedBookingRoom, updateStatus]);

  const handleBookingHistoryNavigation = React.useCallback(() => {
    navigate("/spa-frontdesk-booking-history");
  }, [navigate]);

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 6.5, md: 8, xl: 9 }}>
          <Box sx={{ mb: 5 }}>
            <Grid container>
              <Grid
                size={{
                  xs: 6,
                  md: 3,
                }}
              >
                <TextField
                  label={<React.Fragment>Search </React.Fragment>}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid
                size={{
                  xs: 6,
                  md: 9,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    color="primary"
                    variant="contained"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      // fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    startIcon={<HistoryIcon />}
                    onClick={handleBookingHistoryNavigation}
                  >
                    Booking History
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Grid container spacing={2}>
            {spaTypeList.data.map((spaType) => {
              if (
                !spaType.name.toLowerCase().includes(searchInput.toLowerCase())
              ) {
                return null;
              }
              return (
                <Grid
                  size={{
                    lg: 2.4,
                    md: 3,
                    sm: 4,
                    xs: 6,
                  }}
                  key={spaType.name}
                >
                  <Paper
                    sx={{
                      p: 1,
                      minHeight: 100,
                      // backgroundColor:
                      //   selectedSpaType?.name === spa.name
                      //     ? "#c8e6c9"
                      //     : "#e8f5e9",
                      backgroundColor: (theme) =>
                        spaToBook?.name === spaType.name
                          ? theme.palette.warning.main
                          : theme.palette.warning.light,
                      transform:
                        spaToBook?.name === spaType.name
                          ? "translateY(-10px)"
                          : "translateY(0px)",
                      transition: "all 0.25s ease-out",
                      boxShadow: (theme) =>
                        spaToBook?.name === spaType.name
                          ? theme.shadows[5]
                          : theme.shadows[1],
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setSpaToBook(
                        spaToBook?.name === spaType.name ? null : spaType
                      )
                    }
                  >
                    <Typography
                      variant="body1"
                      align="center"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        letterSpacing: 1,
                      }}
                    >
                      {spaType.name}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 5.5, md: 4, xl: 3 }}>
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                borderBottom: "2px solid #1976d2",
                paddingBottom: "4px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              Today's SPA Status
            </Typography>
            <Box
              sx={{
                // display: "flex",
                // flexWrap: "wrap",
                // gap: "5px",
                mt: 2,
                // justifyContent: "space-between",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "5px",
              }}
            >
              {bookings.data.spaRoomDtos.map((spaRoom) => {
                return (
                  <Box
                    key={spaRoom}
                    sx={{
                      backgroundColor:
                        spaRoom.spaBookingDetails.status === "DONE"
                          ? "#81c784"
                          : spaRoom.spaBookingDetails.status === "STARTED"
                          ? "#ffeb3b"
                          : "#f5f5f5",
                      border: "1px solid #ccc",
                      borderRadius: "9px",
                      padding: "8px 8px",
                      transform:
                        selectedBookingRoom?.spaBookingDetails
                          ?.bookingSpaRefNumber ===
                        spaRoom?.spaBookingDetails?.bookingSpaRefNumber
                          ? "translateY(-10px)"
                          : "translateY(0px)",
                      transition: "all 0.25s ease-out",
                      boxShadow: (theme) =>
                        selectedBookingRoom?.spaBookingDetails
                          ?.bookingSpaRefNumber ===
                        spaRoom?.spaBookingDetails?.bookingSpaRefNumber
                          ? theme.shadows[5]
                          : "0 4px 6px rgba(0, 0, 0, 0.1)",
                      // margin: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      flexGrow: 1,
                    }}
                    onClick={() => setSelectedBookingRoom(spaRoom)}
                  >
                    <Typography
                      // variant="h6"
                      sx={{
                        fontWeight: 600,
                        color:
                          spaRoom.spaBookingDetails.status === "DONE"
                            ? "#fff"
                            : spaRoom.spaBookingDetails.status === "STARTED"
                            ? "#333"
                            : "#1976d2",
                      }}
                    >
                      {spaRoom.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
          {selectedBookingRoom && (
            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  borderBottom: "2px solid #1976d2",
                  paddingBottom: "4px",
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                {selectedBookingRoom?.name}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Grid container rowSpacing={1}>
                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#1976d2",
                        textDecoration: "underline",
                      }}
                      align="left"
                    >
                      Guest Details :{" "}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <Grid container>
                      <Grid size={12}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Spa Booking Ref. :{" "}
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails
                            ?.bookingSpaRefNumber || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={12}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Hotel Booking Ref. :{" "}
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails
                            ?.hotelBookingReferenceNumber || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          First Name :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {`${
                            selectedBookingRoom?.spaBookingDetails
                              ?.customerFirstName || "--"
                          } 
                        ${
                          selectedBookingRoom?.spaBookingDetails
                            ?.customerMiddleName || "--"
                        }
                         ${
                           selectedBookingRoom?.spaBookingDetails
                             ?.customerLastName || "--"
                         }`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Phone No :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails
                            ?.customerPhoneNo || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Email :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails
                            ?.customerEmail || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Address :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails
                            ?.customerAddress || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#1976d2",
                        textDecoration: "underline",
                      }}
                      align="left"
                    >
                      Payment Details :{" "}
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Total Amount :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails?.totalPrice ||
                            "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          GST (18%):{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails?.gstPrice ||
                            "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <Divider />
                  </Grid>
                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Total (Inc. GST) :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {(selectedBookingRoom?.spaBookingDetails
                            ?.totalPrice || 0) +
                            (selectedBookingRoom?.spaBookingDetails?.gstPrice ||
                              0) || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Paid Amount :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {selectedBookingRoom?.spaBookingDetails?.paidAmount ||
                            0 ||
                            "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={12}>
                    <Divider />
                  </Grid>

                  <Grid size={12}>
                    <Grid container>
                      <Grid size={6}>
                        <Typography align="left" sx={{ fontWeight: "bold" }}>
                          Amount To Pay :{" "}
                        </Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography align="left">
                          {(selectedBookingRoom?.spaBookingDetails
                            ?.totalPrice || 0) +
                            (selectedBookingRoom?.spaBookingDetails?.gstPrice ||
                              0) -
                            (selectedBookingRoom?.spaBookingDetails
                              ?.paidAmount || 0) || "--"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  {selectedBookingRoom?.spaBookingDetails?.status ===
                    "DONE" && (
                    <Grid size={12}>
                      <Button
                        color="secondary"
                        variant="contained"
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
                        fullWidth
                        size="small"
                        onClick={handlePayAndComplete}
                      >
                        Pay & Complete
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      <BookingDrawer
        open={Boolean(spaToBook)}
        onClose={() => setSpaToBook(null)}
        spaToBook={spaToBook}
        key={spaToBook && spaToBook.id}
        handleReserveSpa={handleReserveSpa}
        setSnack={setSnack}
      />
      <PaymentDialogV2
        openPaymentDialog={Boolean(openPaymentDialog)}
        amountToPay={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(null)}
        setSnack={setSnack}
        fetchApi={fetchApi}
        apiPayload={bookingPayload}
        handleReset={() => {
          setSpaToBook(null);
          setSelectedBookingRoom(null);
        }}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <LoadingComponent
        open={isLoading || bookSpaRes.isLoading || updateStatusRes.isLoading}
      />
    </Box>
  );
};

const BookingDrawer = React.memo(function ({
  open,
  onClose,
  spaToBook,
  handleReserveSpa,
  setSnack,
}) {
  const [getGuestDetails, getGuestDetailsRes] =
    useLazyGetGuestDetilsFromBookingRefQuery();
  const [formData, setFormData] = React.useState({
    selectedDate: dayjs(moment()),
    selectedTherapist: null,
    selectedRoom: null,
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    address: "",
    bookingRefNumber: "",
  });
  const totalSpaDuration = React.useMemo(
    () =>
      spaToBook?.spaTypeDetailsList?.reduce(
        (prev, curr) => prev + curr.durationMinutes,
        0
      ) || 0,
    [spaToBook]
  );

  const {
    data: spaRoomList = {
      data: {
        spaRoomDtoList: [],
      },
    },
  } = useGetRoomBySpaTypeReceptionistQuery(
    {
      spaTypeId: spaToBook && spaToBook.id,
      startTime: moment(formData.selectedDate.$d).format("DD-MM-YYYY HH:mm:ss"),
      endTime: moment(formData.selectedDate.$d)
        .add(totalSpaDuration, "minutes")
        .format("DD-MM-YYYY HH:mm:ss"),
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    },
    { skip: !Boolean(spaToBook) }
  );

  const handleChange = React.useCallback((name, value) => {
    if (name === "selectedDate") {
      setFormData((prevData) => ({
        ...prevData,
        selectedTherapist: null,
        selectedRoom: null,
        [name]: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.selectedTherapist &&
        formData.selectedDate &&
        formData.selectedRoom &&
        formData.firstName &&
        formData.phoneNo &&
        (formData.email ? formData.email.includes("@") : true) &&
        formData.address
    );
  }, [formData]);

  const handleResetBookingDetails = React.useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNo: "",
      email: "",
      address: "",
    }));
  }, []);

  console.log(formData, "formDataaaa");

  const handleSearchDetailsFromBookingRef = React.useCallback(() => {
    getGuestDetails(formData.bookingRefNumber)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        setFormData((prevData) => ({
          ...prevData,
          firstName: res.data.firstName,
          middleName: res.data.middleName || "",
          lastName: res.datalastName || "",
          phoneNo: res.data.phoneNumber,
          email: res.data.email || "",
          address: res.data.address,
        }));
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
        handleResetBookingDetails();
      });
  }, [
    formData.bookingRefNumber,
    getGuestDetails,
    setSnack,
    handleResetBookingDetails,
  ]);

  const handleSubmitForm = React.useCallback(() => {
    if (formData.bookingRefNumber && !getGuestDetailsRes.isSuccess) {
      return setSnack({
        open: true,
        severity: "error",
        message: "Booking Ref. Number is not valid",
      });
    }
    handleReserveSpa(formData);
  }, [handleReserveSpa, formData, setSnack, getGuestDetailsRes]);

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
      onClose={onClose}
    >
      {/* <DrawerHeader>
        <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
          Reserve a Spa Time
        </Typography>
      </DrawerHeader> */}
      <Divider />
      <Box
        sx={{
          p: 2,
          // backgroundColor: "#f0f0f0",
          // // height: 390,
          // // overflow: "auto",
        }}
      >
        <Grid container spacing={1}>
          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {spaToBook?.name}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 600,
                  letterSpacing: 1,
                  color: (theme) => theme.palette.warning.main,
                  border: (theme) => `1px solid ${theme.palette.warning.main}`,
                  width: "fit-content",
                  px: 0.5,
                  borderRadius: 2,
                }}
              >{`${totalSpaDuration} Min`}</Typography>
            </Box>
          </Grid>
          {/* <Grid size={12}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  borderBottom: (theme) =>
                    `3px solid ${theme.palette.primary.main}`,
                  fontWeight: "bold",
                  letterSpacing: 1,
                }}
              >
                Spa Service Details
              </Typography>

              <Box sx={{ mt: 2 }}>
                {spaToBook?.spaTypeDetailsList?.map((spaTypeDetail) => {
                  return (
                    <Box
                      key={spaTypeDetail.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{ fontWeight: "bold", letterSpacing: 1 }}
                        >
                          {spaTypeDetail.serviceName}
                        </Typography>
                        <Typography sx={{ letterSpacing: 1 }} variant="caption">
                          {spaTypeDetail.serviceDescription}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          letterSpacing: 1,
                          color: (theme) => theme.palette.warning.light,
                          border: (theme) =>
                            `1px solid ${theme.palette.warning.light}`,
                          width: "fit-content",
                          px: 0.5,
                          borderRadius: 2,
                        }}
                      >
                        {`${spaTypeDetail.durationMinutes} Min`}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Grid> */}
          <Grid size={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                disablePast
                label={
                  <React.Fragment>
                    Booking Date{" "}
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
                value={formData.selectedDate}
                onChange={(newVal) => handleChange("selectedDate", newVal)}
                slotProps={{
                  textField: {
                    variant: "standard",
                    readOnly: true,
                    size: "small",
                    fullWidth: true,
                  },
                }}
                slots={{
                  openPickerIcon: StyledCalendarIcon,
                }}
                format="DD/MM/YYYY hh:mm A"
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={6}>
            <Autocomplete
              size="small"
              options={spaRoomList?.data?.therapistUserList || []}
              getOptionLabel={(option) => option.name}
              value={formData.selectedTherapist}
              onChange={(e, newVal) =>
                handleChange("selectedTherapist", newVal)
              }
              clearOnEscape
              disablePortal
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
                      Select Therapist{" "}
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
                  variant="standard"
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            <Box>
              <Grid container spacing={1}>
                {spaRoomList.data.spaRoomDtoList?.map((room) => {
                  return (
                    <Grid size={3} key={room}>
                      <Box
                        sx={{
                          border: (theme) =>
                            `1px solid ${theme.palette.success.main}`,
                          borderRadius: 0.5,
                          color: (theme) =>
                            formData.selectedRoom?.id === room.id
                              ? "#fff"
                              : theme.palette.success.main,
                          p: 0.5,
                          backgroundColor: (theme) =>
                            formData.selectedRoom?.id === room.id
                              ? theme.palette.success.main
                              : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => handleChange("selectedRoom", room)}
                      >
                        <Typography align="center" sx={{ letterSpacing: 1 }}>
                          {room.name}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>
          <Grid size={12}>
            <Typography
              sx={{
                fontWeight: 600,
                borderBottom: "3px solid #222",
                letterSpacing: 1,
              }}
            >
              Guest Details
            </Typography>
          </Grid>
          <Grid size={12}>
            <TextField
              disabled={getGuestDetailsRes.isSuccess}
              size="small"
              label={
                <React.Fragment>
                  Booking Ref. Number{" "}
                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.error.main,
                    }}
                  ></Box>
                </React.Fragment>
              }
              name="bookingRefNumber"
              value={formData.bookingRefNumber}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {false ? (
                        <CircularProgress size={30} />
                      ) : (
                        <IconButton onClick={handleSearchDetailsFromBookingRef}>
                          <SearchIcon />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  First Name{" "}
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
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  Middle Name{" "}
                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.error.main,
                    }}
                  ></Box>
                </React.Fragment>
              }
              name="middleName"
              value={formData.middleName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  Last Name{" "}
                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.error.main,
                    }}
                  ></Box>
                </React.Fragment>
              }
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  Phone No{" "}
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
              name="phoneNo"
              value={formData.phoneNo}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  Email{" "}
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
              name="email"
              value={formData.email}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <TextField
              size="small"
              label={
                <React.Fragment>
                  Address{" "}
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
              name="address"
              value={formData.address}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
              disabled={getGuestDetailsRes.isSuccess}
              fullWidth
            />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          left: 0,
          right: 0,
          bottom: 0,
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Total
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            {`Rs. ${(spaToBook?.price || 0).toFixed(2)}`}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            GST (18%)
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            {`Rs. ${((spaToBook?.price || 0) * 0.18).toFixed(2)}`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            mb: 3,
            width: "100%",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Total <span style={{ fontSize: "10px" }}>(Including GST)</span>
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            {`Rs. ${(
              (spaToBook?.price || 0) +
              (spaToBook?.price || 0) * 0.18
            ).toFixed(2)}`}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mb: 1 }}>
          {Boolean(spaToBook?.isAdvanceNeeded) && (
            <Typography sx={{ color: "gray" }}>
              You need to pay ₹{(spaToBook?.price * 0.2).toFixed(2)} in advance
            </Typography>
          )}
        </Box>

        <Button
          color="secondary"
          variant="contained"
          sx={{
            color: "#fff",
            display: "block",
            width: "100%",

            fontWeight: 600,
            textTransform: "none",
            fontSize: 18,
            "&.Mui-disabled": {
              background: "#B2E5F6",
              color: "#FFFFFF",
            },
          }}
          disabled={!isFormValid()}
          onClick={handleSubmitForm}
        >
          {spaToBook?.isAdvanceNeeded ? "Pay And Book" : "Book"}
        </Button>
      </Box>
    </Drawer>
  );
});

export default SpaFrontdeskDashboard;
