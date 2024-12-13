import React, { memo, useCallback } from "react";
import Grid from "@mui/material/Grid2";
import Drawer from "@mui/material/Drawer";
import dayjs from "dayjs";
import MasterCard from "../../img/masterCard.png";
import Visa from "../../img/visa.png";
import Maestro from "../../img/maestro.png";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
// import Confetti from "react-confetti";
import Swal from "sweetalert2";

// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Slide,
  Typography,
  Paper,
  FormGroup,
  Checkbox,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
  useGetUserDetailsForBookingQuery,
  useGetAllFiltersDataQuery,
  useMakePaymentMutation,
} from "../../services/dashboard";
import TextField from "@mui/material/TextField";
import { CUSTOMER } from "../../helper/constants";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
import GuestBookingHistoryDrawer from "./GuestBookingHistoryDrawer";
import { IoCardOutline } from "react-icons/io5";
import { RiSecurePaymentLine } from "react-icons/ri";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GuestDashboard = () => {
  const [bookingHistoryDrawerOpen, setBookingHistoryDrawerOpen] =
    React.useState(false);
  const [filters, setFilters] = React.useState({
    hotel: null,
    roomType: null,
    priceRange: null,
  });

  const toggleBookingHistoryDrawer = (open) => () => {
    setBookingHistoryDrawerOpen(open);
  };
  const {
    data: hotelList = {
      data: [],
    },
    isLoading,
  } = useGetAllHotelsQuery(
    {
      hotelId: filters?.hotel?.id,
      roomTypeId: filters?.roomType?.id,
      priceRange: filters?.priceRange?.type,
    },
    {
      refetchOnMountOrArgChange: true,

      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.email) &&
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.phoneNo),
    }
  );

  const {
    data: filterList = {
      data: [],
    },
  } = useGetAllFiltersDataQuery();

  const {
    data: bookingDetails = {
      data: [],
    },
  } = useGetAllBookingDetailsQuery(
    JSON.parse(sessionStorage.getItem("data"))?.email ||
      JSON.parse(sessionStorage.getItem("data"))?.phoneNo,
    {
      skip: !JSON.parse(sessionStorage.getItem("data"))?.roleType === CUSTOMER,
    }
  );
  const {
    data: userDetails = {
      data: [],
    },
  } = useGetUserDetailsForBookingQuery(
    JSON.parse(sessionStorage.getItem("data"))?.email ||
      JSON.parse(sessionStorage.getItem("data"))?.phoneNo,
    {
      skip: !JSON.parse(sessionStorage.getItem("data"))?.roleType === CUSTOMER,
    }
  );

  return (
    <>
      <Box
        sx={{
          width: "100%",
          //  px: 2,
          py: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            // backgroundColor: "red",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <CustomRoomFilters
              filterOptions={filterList?.data}
              setFilters={setFilters}
              filters={filters}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
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
                      // size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 4 }}
                      size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}
                    >
                      <CustomHotelCard
                        hotelDetails={item}
                        userDetails={userDetails}
                      />
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

const CustomRoomFilters = memo(function ({
  filterOptions,
  setFilters,
  filters,
}) {
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Grid container size={12} columnSpacing={1} rowSpacing={1}>
          {/* <Grid size={{ xs: 3 }}> */}
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
              options={filterOptions?.hotelList || []}
              // disableClearable
              fullWidth
              // value={roomFilters?.roomType || null}
              // onChange={(e, newVal) =>
              //   handleChangeRoomFiltersOnChange("roomType", newVal)
              // }
              // inputValue={roomFilters.roomTypeInputVal}
              // onInputChange={(e, newVal) =>
              //   handleChangeRoomFiltersOnChange("roomTypeInputVal", newVal)
              // }
              value={filters.hotel}
              onChange={(e, newVal) =>
                setFilters((prev) => ({ ...prev, hotel: newVal }))
              }
              getOptionLabel={(option) => option.name || ""}
              clearOnEscape
              disablePortal
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
                // width: 200,
                ".MuiInputBase-root": {
                  color: "#fff",
                },
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
                  label="Hotel"
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
              options={filterOptions?.roomTypeList || []}
              fullWidth
              getOptionLabel={(option) => option.type || ""}
              clearOnEscape
              disablePortal
              value={filters.roomType}
              onChange={(e, newVal) =>
                setFilters((prev) => ({ ...prev, roomType: newVal }))
              }
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
                ".MuiInputBase-root": {
                  color: "#fff",
                },
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
                  label="Room Type"
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
              options={filterOptions?.priceRangeList || []}
              // disableClearable
              fullWidth
              value={filters.priceRange}
              onChange={(e, newVal) =>
                setFilters((prev) => ({ ...prev, priceRange: newVal }))
              }
              getOptionLabel={(option) => option.type || ""}
              clearOnEscape
              disablePortal
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
                // width: 200,
                ".MuiInputBase-root": {
                  color: "#fff",
                },
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
                  label="Price Range"
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

          {/* <Box>
            <Button variant="contained">Submit</Button>
          </Box> */}
          {/* </Grid> */}
        </Grid>
      </Box>
    </>
  );
});
const CustomHotelCard = memo(function ({ hotelDetails, userDetails }) {
  const [isClaimPoints, setIsClaimPoints] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [reservationPayload, setReservationPayload] = React.useState(null);

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
      // if (sessionStorage.getItem("paymentDetail")) {
      //   sessionStorage.removeItem("paymentDetail");
      // }
    }
    setDrawerOpen(open);
  };

  // reset formdata function
  // const handleResetForm = React.useCallback(() => {
  //   setFormData((prevData) => ({
  //     firstName: "",
  //     middleName: "",
  //     lastName: "",
  //     email: "",
  //     address: "",
  //     fromDate: null,
  //     toDate: null,
  //     noOfPeoples: "",
  //     advancePayment: "",
  //     phoneNumber: prevData.phoneNumber,
  //   }));
  // }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData((prevData) => ({
      firstName: prevData.firstName,
      middleName: prevData.middleName,
      lastName: prevData.lastName,
      email: prevData.email,
      address: prevData.address,
      fromDate: null,
      toDate: null,
      noOfPeoples: "",
      advancePayment: "",
      phoneNumber: prevData.phoneNumber,
    }));
  }, []);

  const calculateNumberOfDays = React.useMemo(() => {
    if (formData.fromDate && formData.toDate) {
      const startDate = dayjs(formData.fromDate);
      const endDate = dayjs(formData.toDate);
      return endDate.diff(startDate, "day") + 1;
    }
    return 0;
  }, [formData.fromDate, formData.toDate]);

  // Function to validate the form and open payment dialog
  const validateAndOpenPaymentDialog = () => {
    const isAdvanceValid =
      !hotelDetails?.isAdvanceRequired ||
      (formData.advancePayment &&
        Number(formData.advancePayment) >=
          Number(hotelDetails.advanceAmount) * calculateNumberOfDays &&
        Number(formData.advancePayment) <=
          Number(hotelDetails.basePrice) * calculateNumberOfDays);

    if (!Boolean(formData.noOfPeoples)) {
      return setSnack({
        open: true,
        message: "Please provide number of people",
        severity: "error",
      });
    } else if (!Boolean(formData.firstName)) {
      return setSnack({
        open: true,
        message: "Please provide first name",
        severity: "error",
      });
    } else if (!Boolean(formData.email)) {
      return setSnack({
        open: true,
        message: "Please provide email",
        severity: "error",
      });
    } else if (!Boolean(formData.address)) {
      return setSnack({
        open: true,
        message: "Please provide address",
        severity: "error",
      });
    } else if (!Boolean(formData.fromDate)) {
      return setSnack({
        open: true,
        message: "Please provide fromDate",
        severity: "error",
      });
    } else if (!Boolean(formData.toDate)) {
      return setSnack({
        open: true,
        message: "Please provide toDate",
        severity: "error",
      });
    } else if (!Boolean(formData.noOfPeoples)) {
      return setSnack({
        open: true,
        message: "Please provide number of people",
        severity: "error",
      });
    } else if (!isAdvanceValid) {
      return setSnack({
        open: true,
        message:
          calculateNumberOfDays > 0
            ? Number(formData.advancePayment) <
              Number(hotelDetails.advanceAmount) * calculateNumberOfDays
              ? `Please pay ₹${
                  hotelDetails.advanceAmount * calculateNumberOfDays
                } in advance`
              : `Advance amount cannot exceed ₹${
                  hotelDetails.basePrice * calculateNumberOfDays
                }`
            : "Invalid advance payment",
        severity: "error",
      });
    }
    // Create payload
    const payload = {
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
      bookingAmount: isClaimPoints
        ? hotelDetails.basePrice * calculateNumberOfDays -
            userDetails?.data?.rewardsPointPrice || 0
        : calculateNumberOfDays * Number(hotelDetails?.basePrice),
      isRewardsPointsUsed: isClaimPoints,
      noOfRewardsPointsUsed: userDetails?.data?.noOfRewardsPointsAvailable,
      rewardsPointPrice: userDetails?.data?.rewardsPointPrice,
    };

    setReservationPayload(payload);
    setOpenPaymentDialog(true);
  };
  // add reservation function
  const handleSubmitReserve = React.useCallback(
    (e) => {
      e.preventDefault();

      const isAdvanceValid =
        !hotelDetails?.isAdvanceRequired ||
        (formData.advancePayment &&
          Number(formData.advancePayment) >=
            Number(hotelDetails.advanceAmount) * calculateNumberOfDays &&
          Number(formData.advancePayment) <=
            Number(hotelDetails.basePrice) * calculateNumberOfDays);

      if (!Boolean(formData.noOfPeoples)) {
        return setSnack({
          open: true,
          message: "Please provide number of people",
          severity: "error",
        });
      } else if (!Boolean(formData.firstName)) {
        return setSnack({
          open: true,
          message: "Please provide first name",
          severity: "error",
        });
      } else if (!Boolean(formData.email)) {
        return setSnack({
          open: true,
          message: "Please provide email",
          severity: "error",
        });
      } else if (!Boolean(formData.address)) {
        return setSnack({
          open: true,
          message: "Please provide address",
          severity: "error",
        });
      } else if (!Boolean(formData.fromDate)) {
        return setSnack({
          open: true,
          message: "Please provide fromDate",
          severity: "error",
        });
      } else if (!Boolean(formData.toDate)) {
        return setSnack({
          open: true,
          message: "Please provide toDate",
          severity: "error",
        });
      } else if (!Boolean(formData.noOfPeoples)) {
        return setSnack({
          open: true,
          message: "Please provide number of people",
          severity: "error",
        });
      } else if (!isAdvanceValid) {
        return setSnack({
          open: true,
          message:
            calculateNumberOfDays > 0
              ? Number(formData.advancePayment) <
                Number(hotelDetails.advanceAmount) * calculateNumberOfDays
                ? `Please pay ₹${
                    hotelDetails.advanceAmount * calculateNumberOfDays
                  } in advance`
                : `Advance amount cannot exceed ₹${
                    hotelDetails.basePrice * calculateNumberOfDays
                  }`
              : "Invalid advance payment",
          severity: "error",
        });
      }

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
        bookingAmount: isClaimPoints
          ? hotelDetails.basePrice * calculateNumberOfDays -
              userDetails?.data?.rewardsPointPrice || 0
          : calculateNumberOfDays * Number(hotelDetails?.basePrice),
        isRewardsPointsUsed: isClaimPoints,
        noOfRewardsPointsUsed: userDetails?.data?.noOfRewardsPointsAvailable,
        rewardsPointPrice: userDetails?.data?.rewardsPointPrice,
        // paymentDetails: Boolean(sessionStorage.getItem("paymentDetail"))
        //   ? sessionStorage.getItem("paymentDetail")
        //   : "",
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          if (sessionStorage.getItem("paymentDetail")) {
            sessionStorage.removeItem("paymentDetail");
          }

          setDrawerOpen(false);
          handleResetForm();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data || "Something Went Wrong",
            severity: "error",
          });

          if (sessionStorage.getItem("paymentDetail")) {
            sessionStorage.removeItem("paymentDetail");
          }
        });
    },
    [
      formData,
      hotelDetails,
      reserveHotelRoom,
      handleResetForm,
      calculateNumberOfDays,
      isClaimPoints,
      userDetails.data,
    ]
  );

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

    if (userDetails?.data) {
      setFormData((prevData) => ({
        ...prevData,
        firstName: userDetails?.data?.firstName || "",
        middleName: userDetails?.data?.middleName || "",
        lastName: userDetails?.data?.lastName || "",
        email: userDetails?.data?.email || "",
        address: userDetails?.data?.address || "",
        phoneNumber:
          sessionData?.phoneNo || userDetails?.data?.phoneNumber || "",
      }));
    } else if (sessionData && sessionData?.phoneNo) {
      setFormData((prevData) => ({
        ...prevData,
        phoneNumber: sessionData?.phoneNo,
      }));
    }
  }, [userDetails]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          backgroundColor: "#fff",
          height: "100%",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        {/* ---image box--- */}
        <Box
          sx={{
            width: "100%",
            height: "15rem",
            borderRadius: "8px",
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
        {/* ------- */}

        {/* hotel details box */}
        <Box
          sx={{
            px: 1,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Box for hotel details */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              // border: "1px solid black",
              // width: "70%",
            }}
          >
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

          {/* -------- */}

          {/* Box for book now button */}
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
          {/* -------- */}
        </Box>

        {/* ---------- */}
      </Box>

      {/* Drawer for booking details */}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ zIndex: 1300 }}
      >
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
          <Box
            component="form"
            onSubmit={handleSubmitReserve}
            sx={{ px: 2, py: 2 }}
          >
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
                  required
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
                  // required
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
                  // required
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
                  required
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
                  inputProps={{ maxLength: 50 }}
                  required
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
                  required
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
                    slotProps={{
                      textField: {
                        readOnly: true,
                      },
                    }}
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
                        ? dayjs(formData.fromDate)
                        : // .add(1, "day")
                          undefined
                    }
                    slotProps={{
                      textField: {
                        readOnly: true,
                      },
                    }}
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
                  inputProps={{ maxLength: 50 }}
                  required
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
                      calculateNumberOfDays > 0
                        ? Number(formData.advancePayment) <
                          Number(hotelDetails.advanceAmount) *
                            calculateNumberOfDays
                          ? `Please pay ₹${
                              hotelDetails.advanceAmount * calculateNumberOfDays
                            } in advance`
                          : Number(formData.advancePayment) >
                            Number(hotelDetails.basePrice) *
                              calculateNumberOfDays
                          ? `Advance amount cannot exceed ₹${
                              hotelDetails.basePrice * calculateNumberOfDays
                            }`
                          : ""
                        : ""
                    }
                  />
                </Grid>
              )}

              {Boolean(userDetails?.data?.noOfRewardsPointsAvailable) &&
                Boolean(calculateNumberOfDays) && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="h6">Total Price: </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        {isClaimPoints && (
                          <Typography variant="h6">
                            Rs.{" "}
                            {(
                              hotelDetails.basePrice * calculateNumberOfDays -
                                userDetails?.data?.rewardsPointPrice || 0
                            ).toFixed(2)}
                          </Typography>
                        )}
                        <Typography
                          variant={isClaimPoints ? "body2" : "h6"}
                          sx={{
                            textDecoration: isClaimPoints
                              ? "line-through"
                              : "none",
                          }}
                        >
                          Rs.{" "}
                          {(
                            calculateNumberOfDays * hotelDetails.basePrice
                          ).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              defaultChecked
                              size="small"
                              checked={isClaimPoints}
                              onChange={(e) =>
                                setIsClaimPoints(e.target.checked)
                              }
                            />
                          }
                          label="Claim Points"
                        />
                      </FormGroup>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body1">
                        Available Points:{" "}
                      </Typography>
                      <Typography variant="body1">
                        {`${
                          userDetails?.data?.noOfRewardsPointsAvailable || 0
                        } (Rs. ${(
                          userDetails?.data?.rewardsPointPrice || 0
                        ).toFixed(2)})`}
                      </Typography>
                    </Box>
                  </Grid>
                )}

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  {!Boolean(hotelDetails?.isAdvanceRequired) && (
                    <Button
                      variant="contained"
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                        backgroundColor: "inherit",
                        color: "white",
                        "&:hover": {
                          backgroundImage:
                            "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                        },
                      }}
                      type="submit"
                    >
                      Reserve
                    </Button>
                  )}
                  {Boolean(hotelDetails?.isAdvanceRequired) && (
                    <Button
                      variant="contained"
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                        backgroundColor: "inherit",
                        color: "white",
                        "&:hover": {
                          backgroundImage:
                            "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                        },
                      }}
                      onClick={validateAndOpenPaymentDialog}
                    >
                      Pay and Reserve
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Drawer>
      <LoadingComponent open={reserveHotelRoomRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={reservationPayload}
        handleResetForm={handleResetForm}
        setSnack={setSnack}
        setDrawerOpen={setDrawerOpen}
        reserveHotelRoom={reserveHotelRoom}
      />
    </>
  );
});

export const PaymentDialog = memo(function ({
  openPaymentDialog,
  handlePaymentDialogClose,
  reservationPayload,
  reserveHotelRoom,
  handleResetForm = () => {},
  setSnack = () => {},
  setDrawerOpen = () => {},
  handleAfterSuccessFunction = () => {},
}) {
  // console.log("reserveHotelRoom", reserveHotelRoom);
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

  const handleAfterSuccessFunctionOnSuccess = useCallback(() => {
    handleAfterSuccessFunction();
  }, [handleAfterSuccessFunction]);

  const handleSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      const paymentDetail = paymentMethod === "card" ? cardNumber : upiNumber;

      // const finalPayload = {
      //   ...reservationPayload,
      //   paymentDetail,
      // };

      const paymentPayload = {
        paidAmount: reservationPayload?.paidAmount,
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

        if (paymentResponse && paymentResponse.data) {
          const finalPayload = {
            ...reservationPayload,
            paymentDetail,
            transactionReferenceNo: paymentResponse.data,
          };
          const reservationResponse = await reserveHotelRoom(
            finalPayload
          ).unwrap();

          setSnack({
            open: true,
            message: reservationResponse.message,
            severity: "success",
          });
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Payment success",
            showConfirmButton: false,
            timer: 3000,
          });
          handleAfterSuccessFunctionOnSuccess();
        } else {
          setSnack({
            open: true,
            message: "Payment failed. Please try again.",
            severity: "error",
          });
          return;
        }

        // setShowConfetti(true); // Trigger confetti
        // setTimeout(() => setShowConfetti(false), 5000);

        // handleAfterSuccessFunctionOnSuccess();
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
        handleResetForm();
        setDrawerOpen(false);
      }

      // makePayment(paymentPayload);

      // reserveHotelRoom(finalPayload)
      //   .unwrap()
      //   .then((res) => {
      //     setSnack({
      //       open: true,
      //       message: res.message,
      //       severity: "success",
      //     });
      //     handleResetForm();
      //     setDrawerOpen(false);
      //   })
      //   .catch((err) => {
      //     setSnack({
      //       open: true,
      //       message: err.data?.message || err.data || "Something Went Wrong",
      //       severity: "error",
      //     });
      //   });

      // setCardNumber("");
      // setUpiNumber("");
      // setCvv("");
      // handlePaymentDialogClose();
    },
    [
      cardNumber,
      upiNumber,
      paymentMethod,
      reservationPayload,
      handlePaymentDialogClose,
      handleResetForm,
      reserveHotelRoom,
      setDrawerOpen,
      setSnack,
      isDebitCard,
      makePayment,
      handleAfterSuccessFunctionOnSuccess,
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
                        Pay ₹{reservationPayload?.paidAmount}
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
