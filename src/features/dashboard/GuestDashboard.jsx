import React, { memo } from "react";
import Grid from "@mui/material/Grid2";
import Drawer from "@mui/material/Drawer";
import dayjs from "dayjs";

import {
  Box,
  Button,
  // Dialog,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
} from "../../services/dashboard";
import TextField from "@mui/material/TextField";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";

import GuestBookingHistoryDrawer from "./GuestBookingHistoryDrawer";

const GuestDashboard = () => {
  const [bookingHistoryDrawerOpen, setBookingHistoryDrawerOpen] =
    React.useState(false);

  const toggleBookingHistoryDrawer = (open) => () => {
    setBookingHistoryDrawerOpen(open);
  };
  const {
    data: hotelList = {
      data: [],
    },
    isLoading,
  } = useGetAllHotelsQuery();

  const {
    data: bookingDetails = {
      data: [],
    },
  } = useGetAllBookingDetailsQuery(9668537293);

  return (
    <>
      <Box sx={{ width: "100%", px: 2, py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundImage:
                "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
              color: "white",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
              },
            }}
            onClick={toggleBookingHistoryDrawer(true)}
          >
            Booking History
          </Button>
        </Box>
        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
              }}
            >
              <Grid container size={12} spacing={2}>
                {hotelList?.data?.map((item, index) => {
                  return (
                    <Grid
                      key={`hotel${index}`}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}
                    >
                      <CustomHotelCard hotelDetails={item} />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <GuestBookingHistoryDrawer
        open={bookingHistoryDrawerOpen}
        setOpen={setBookingHistoryDrawerOpen}
        bookingDetails={bookingDetails}
      />
      <LoadingComponent open={isLoading} />
    </>
  );
};

const CustomHotelCard = memo(function ({ hotelDetails }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    fromDate: null,
    toDate: null,
    noOfPeoples: "",
    advancePayment: "",
  });

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [reserveHotelRoom, reserveHotelRoomRes] = useReserveHotelRoomMutation();

  const toggleDrawer = (open) => () => {
    if (!open) {
      handleResetForm();
    }
    setDrawerOpen(open);
  };

  // reset formdata function
  const handleResetForm = React.useCallback(() => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      address: "",
      fromDate: null,
      toDate: null,
      noOfPeoples: "",
      advancePayment: "",
    });
  }, []);
  const isFormValid = React.useCallback(() => {
    const isAdvanceValid =
      !hotelDetails?.isAdvanceRequired ||
      (formData.advancePayment &&
        Number(formData.advancePayment) >= Number(hotelDetails.advanceAmount) &&
        Number(formData.advancePayment) <= Number(hotelDetails.basePrice));

    return Boolean(
      formData.firstName.trim() &&
        formData.phoneNumber.length === 10 &&
        formData.fromDate &&
        formData.toDate &&
        formData.noOfPeoples &&
        isAdvanceValid
    );
  }, [formData, hotelDetails]);

  // add reservation function
  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      reserveHotelRoom({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        fromDate: formData.fromDate
          ? dayjs(formData.fromDate).format("DD-MM-YYYY")
          : null,
        toDate: formData.toDate
          ? dayjs(formData.toDate).format("DD-MM-YYYY")
          : null,
        noOfPeoples: Number(formData.noOfPeoples),
        roomTypeId: hotelDetails?.id,
        hotelId: hotelDetails?.hotelDto?.id,
        paidAmount: formData.advancePayment,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setDrawerOpen(false);
          handleResetForm();
          // Reset form data
          setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            address: "",
            fromDate: null,
            toDate: null,
            noOfPeoples: "",
            advancePayment: "",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data || "Something Went Wrong",
            severity: "error",
          });
        });
    },
    [formData, hotelDetails, reserveHotelRoom, handleResetForm]
  );

  // const handleChangeInput = (e) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [e.target.name]: e.target.value,
  //   }));
  // };
  const handleChangeInput = (e) => {
    const { name, value } = e.target;

    if (name === "noOfPeoples") {
      const numericRegex = /^[0-9]*$/;
      if (numericRegex.test(value)) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else if (name === "phoneNumber" || name === "advancePayment") {
      const numericRegex = /^[0-9]*$/;
      if (numericRegex.test(value) && value.length <= 10) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };

  React.useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem("data"));
    if (sessionData && sessionData.phoneNo) {
      setFormData((prevData) => ({
        ...prevData,
        phoneNumber: sessionData.phoneNo,
      }));
    }
  }, []);
  return (
    <Box
      sx={{
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        backgroundColor: "#fff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "15rem",
            // maxHeight: "15rem",
            // minHeight: "15rem",
          }}
        >
          {hotelDetails?.images?.[0] && (
            <img
              src={hotelDetails.images[0]}
              alt={hotelDetails?.hotelDto?.name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            px: 1,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: "bold" }}>
              {hotelDetails?.hotelDto?.name}
            </Typography>
            <Typography sx={{ fontWeight: "bold", color: "#929aab" }}>
              {hotelDetails?.type}
            </Typography>
            <Typography sx={{ color: "gray" }}>
              {`${hotelDetails?.hotelDto?.address}
              , ${hotelDetails?.hotelDto?.state?.name
                ?.toLowerCase()
                ?.replace(/\b\w/g, (char) => char.toUpperCase())}`}
            </Typography>

            <Typography>₹{hotelDetails?.basePrice}</Typography>
          </Box>
          <Box sx={{ display: "flex", marginY: "auto" }}>
            <Button
              variant="contained"
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                color: "white",
                "&:hover": {
                  backgroundImage:
                    "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                },
              }}
              onClick={toggleDrawer(true)}
            >
              Book Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Drawer for booking details */}

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 500 }} role="presentation">
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 550, fontSize: "1.5em" }}>
              Booking Details
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box component="form" onSubmit={handleSubmit} sx={{ px: 2, py: 2 }}>
            <Grid container size={12} spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="firstName"
                  label="First Name"
                  variant="outlined"
                  value={formData.firstName}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="middleName"
                  label="Middle Name"
                  variant="outlined"
                  value={formData.middleName}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="lastName"
                  label="Last Name"
                  variant="outlined"
                  value={formData.lastName}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="phoneNumber"
                  label="Phone No."
                  variant="outlined"
                  value={formData.phoneNumber}
                  onChange={handleChangeInput}
                  // disabled
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="email"
                  label="Email"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="noOfPeoples"
                  label="No. of people"
                  variant="outlined"
                  value={formData.noOfPeoples}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="From Date"
                    disablePast
                    format="DD-MM-YYYY"
                    value={formData.fromDate}
                    onChange={handleDateChange("fromDate")}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To Date"
                    format="DD-MM-YYYY"
                    value={formData.toDate}
                    onChange={handleDateChange("toDate")}
                    minDate={
                      formData.fromDate
                        ? dayjs(formData.fromDate).add(1, "day")
                        : undefined
                    }
                  />
                </LocalizationProvider>
              </Grid>
              <Grid
                size={{
                  xs: hotelDetails?.isAdvanceRequired ? 6 : 12,
                }}
              >
                <TextField
                  id="outlined-basic"
                  name="address"
                  label="Address"
                  variant="outlined"
                  value={formData.address}
                  onChange={handleChangeInput}
                  fullWidth
                  inputProps={{ maxLength: 30 }}
                />
              </Grid>

              {hotelDetails?.isAdvanceRequired && (
                <Grid size={{ xs: 6 }}>
                  <TextField
                    id="outlined-basic"
                    name="advancePayment"
                    label="Advance Payment "
                    variant="outlined"
                    value={formData.advancePayment}
                    onChange={handleChangeInput}
                    fullWidth
                    helperText={
                      hotelDetails?.isAdvanceRequired &&
                      Number(formData.advancePayment) <
                        Number(hotelDetails.advanceAmount)
                        ? `Please pay  ₹${hotelDetails.advanceAmount} in advance`
                        : // `Advance must be at least ₹${hotelDetails.advanceAmount}`
                        hotelDetails?.isAdvanceRequired &&
                          Number(formData.advancePayment) >
                            Number(hotelDetails.basePrice)
                        ? `Advance amount cannot exceed ₹${hotelDetails.basePrice}`
                        : ""
                    }
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundImage: isFormValid()
                        ? "linear-gradient(to right, #0acffe 0%, #495aff 100%)"
                        : "none",
                      backgroundColor: isFormValid() ? "inherit" : "gray",
                      color: isFormValid() ? "white" : "black",
                      "&:hover": isFormValid()
                        ? {
                            backgroundImage:
                              "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                          }
                        : {},
                    }}
                    type="submit"
                    disabled={!isFormValid()}
                  >
                    Reserve
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Drawer>
      <LoadingComponent open={reserveHotelRoomRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Box>
  );
});

// const HotelDetailsDialog = ({ open, onClose }) => {
//   <Dialog
//     TransitionComponent={Transition}
//     open={open}
//     onClose={handleDialogClose}
//     maxWidth="sm"
//     fullWidth
//   >
//     <DialogContent>
//       <Typography>hello</Typography>
//     </DialogContent>
//   </Dialog>;
// };

export default GuestDashboard;
