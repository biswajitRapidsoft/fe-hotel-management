import React, { memo, useCallback } from "react";
import Grid from "@mui/material/Grid2";
import Drawer from "@mui/material/Drawer";
import dayjs from "dayjs";
import MasterCard from "../../img/masterCard.png";
import Visa from "../../img/visa.png";
import Maestro from "../../img/maestro.png";
import roomServices from "../../img/roomservices.png";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
// import Confetti from "react-confetti";
import Swal from "sweetalert2";
import SportsGymnasticsIcon from "@mui/icons-material/SportsGymnastics";
import WeekendIcon from "@mui/icons-material/Weekend";
import LiquorIcon from "@mui/icons-material/Liquor";
// import RoomServiceOutlinedIcon from "@mui/icons-material/RoomServiceOutlined";
import { PiWarningCircleLight } from "react-icons/pi";

import PaymentIcon from "@mui/icons-material/Payment";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import SpaIcon from "@mui/icons-material/Spa";

// import { getStatusColour } from "./GuestBookingHistoryDrawer";
import {
  Rating,
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
  DialogTitle,
  Tooltip,
  DialogActions,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import { timelineItemClasses } from "@mui/lab/TimelineItem";

import CloseIcon from "@mui/icons-material/Close";
import {
  useGetAllHotelsQuery,
  useReserveHotelRoomMutation,
  useGetAllBookingDetailsQuery,
  useGetUserDetailsForBookingQuery,
  useGetAllFiltersDataQuery,
  useMakePaymentMutation,
  useRoomCleanRequestMutation,
  useRequestRoomCheckoutMutation,
  useCancelHotelRoomMutation,
  useLazyGetParkingDataForGuestQuery,
  useMakePartialPaymentMutation,
  useAddRatingMutation,
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
import {
  // TimelineConnector,
  TimelineContent,
  // TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
// import moment from "moment";
import { useNavigate } from "react-router-dom";

export const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [bookingHistoryDrawerOpen, setBookingHistoryDrawerOpen] =
    React.useState(false);
  const [selectedBookingRefNumber, setSelectedBookingRefNumber] =
    React.useState(null);

  const [cancelBookingOpen, setCancelBookingOpen] = React.useState(false);
  const [reviewDialog, setReviewDialog] = React.useState(null);
  const [roomCleanRequest, roomCleanRequestRes] = useRoomCleanRequestMutation();

  const [makePartialPayment, makePartialPaymentRes] =
    useMakePartialPaymentMutation();
  const [requestRoomCheckout, requestRoomCheckoutRes] =
    useRequestRoomCheckoutMutation();

  const [rateStay, rateStayRes] = useAddRatingMutation();

  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);

  const [openVehicleParkingDialog, setOpenVehicleParkingDialog] =
    React.useState(false);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [filters, setFilters] = React.useState({
    hotel: null,
    roomType: null,
    priceRange: null,
  });

  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  const handleOpenBar = React.useCallback(
    (bookingRefNumber, hotelId) => {
      sessionStorage.setItem("bookingRefNumber", bookingRefNumber);
      sessionStorage.setItem("hotelId", hotelId);
      navigate("/bar");
    },
    [navigate]
  );

  const handleOpenSpa = React.useCallback(
    (bookingRefNumber, hotelId) => {
      sessionStorage.setItem("bookingRefNumber", bookingRefNumber);
      sessionStorage.setItem("hotelId", hotelId);
      navigate("/spa");
    },
    [navigate]
  );

  const toggleBookingHistoryDrawer = (open) => () => {
    setBookingHistoryDrawerOpen(open);
  };

  const handleMakePayment = React.useCallback((booking) => {
    console.log("bookinggg", booking);
    const totalDebit = booking?.transactionDetails
      ?.filter((item) => !item.isCredit)
      ?.reduce((sum, item) => sum + item.amount, 0);

    const totalCredit = booking?.transactionDetails
      ?.filter((item) => item.isCredit)
      ?.reduce((sum, item) => sum + item.amount, 0);

    const difference = totalDebit - totalCredit;

    console.log("difference", difference);
    if (Boolean(difference <= 0)) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: "You don't have any outstanding amount to pay",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      const payload = {
        transactionReferenceNo: booking?.transactionReferenceNo,
        bookingRefNumber: booking?.bookingRefNumber,
        paidAmount: difference,
      };
      setMakePartialPaymentPayload(payload);
      setOpenPaymentDialog(true);
    }
  }, []);
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

  const handleCancelClick = (bookingRefNumber) => {
    setSelectedBookingRefNumber(bookingRefNumber);
    setCancelBookingOpen(true);
  };

  // api call for room cleaning
  const handleRoomCleanRequest = React.useCallback(
    (roomId, hotelId) => {
      const payload = {
        id: roomId,
        hotelId: hotelId,
      };
      roomCleanRequest(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Room clean request submitted",
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message:
              err?.data?.message ||
              err?.data ||
              "Unable to submit room clean request",
            severity: "error",
          });
        });
    },
    [roomCleanRequest]
  );

  // api call for room checkout
  const handleRequestRoomCheckout = React.useCallback(
    (bookingRefNumber) => {
      const payload = {
        bookingRefNumber: bookingRefNumber,
      };
      requestRoomCheckout(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Check-out Request applied",
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message:
              err?.data?.message ||
              err?.data ||
              "Unable to submit checkout request",
            severity: "error",
          });
        });
    },
    [requestRoomCheckout]
  );

  const handleOpenVehicleParkingModal = React.useCallback(() => {
    setOpenVehicleParkingDialog(true);
  }, []);

  const getOrdinalSuffix = (num) => {
    if (!num) return "";
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${num}th floor`;

    switch (lastDigit) {
      case 1:
        return `${num}st floor`;
      case 2:
        return `${num}nd floor`;
      case 3:
        return `${num}rd floor`;
      default:
        return `${num}th floor`;
    }
  };

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
        <Grid container size={12} spacing={1}>
          <Grid size={{ xs: 8 }}>
            <Box
              sx={{
                width: "100%",
                // backgroundColor: "#fff",
                // height: "700px",
                height: {
                  xs: "calc(100vh - 220px)",
                  xl: "calc(100vh - 220px)",
                },
                // "&::-webkit-scrollbar": {
                //   width: "8px",
                // },
                // "&::-webkit-scrollbar-track": {
                //   backgroundColor: "gray",
                // },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#D3D3D3	",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#818589	",
                },
                p: 2,
                overflowY: "auto",
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                borderRadius: "1rem",
                // box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
              }}
            >
              <Grid container size={12} spacing={2}>
                {hotelList?.data?.map((item, index) => {
                  return (
                    <Grid
                      key={`hotel${index}`}
                      size={{ xs: 12, sm: 12, md: 12, lg: 4, xl: 3 }}
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
          <Grid size={{ xs: 4 }}>
            <Box
              sx={{
                // border: "1px solid black",
                // height: "700px",
                height: {
                  xs: "calc(100vh - 220px)",
                  xl: "calc(100vh - 220px)",
                },
                // backgroundColor: "white",
                overflowY: "auto",
                boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                borderRadius: "1rem",
                // py: 2,
                position: "relative",

                // "&::-webkit-scrollbar": {
                //   width: "8px",
                // },
                // "&::-webkit-scrollbar-track": {
                //   backgroundColor: "transparent",
                // },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#D3D3D3	",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#818589	",
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                  width: "97%",
                  margin: "0 auto",
                  backgroundColor: "#fff",
                  // backgroundColor: {
                  //   xs: "red",
                  //   sm: "yelow",
                  //   md: "black",
                  //   xl: "pink",
                  //   lg: "green",
                  // },
                  p: 1,
                  borderRadius: "0.65rem",
                  display: "flex",
                  justifyContent: "center",
                  position: "sticky",
                  top: 0,
                  zIndex: 100,
                  marginBottom: 2,
                }}
              >
                <Typography
                  sx={{
                    // fontFamily: "'Times New Roman', Times, serif",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    // letterSpacing: 0.8,
                  }}
                >
                  Current Booking
                </Typography>
              </Box>
              <Timeline
                sx={{
                  [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0,
                  },
                }}
              >
                {bookingDetails && bookingDetails?.data?.length > 0 ? (
                  bookingDetails?.data
                    ?.filter(
                      (booking) =>
                        booking.bookingStatus !== "Cancelled" &&
                        booking.bookingStatus !== "Checked_Out"
                    )
                    ?.map((booking, index) => (
                      <TimelineItem key={booking.id}>
                        <TimelineSeparator>
                          {/* <TimelineDot /> */}
                          {/* {index < bookingDetails?.data?.length - 1 && (
                            <TimelineConnector />
                          )} */}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Box
                            sx={{
                              position: "absolute",
                              top: "50%",
                              transform: "translateY(-50%)",
                              left: 1,
                              width: 75,
                              height: 75,
                              backgroundColor: "#0079C2",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "9px",
                              zIndex: 2,
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <Box
                              sx={{
                                backgroundColor: "#AFDBF5",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "30%",
                                borderTopLeftRadius: "9px",
                                borderTopRightRadius: "9px",
                              }}
                            >
                              {Boolean(booking?.roomDto?.floorNo) && (
                                <Typography
                                  sx={{
                                    color: "#fff",
                                    // fontWeight: "bold",
                                    // fontSize: "1.5rem",
                                  }}
                                >
                                  {getOrdinalSuffix(booking?.roomDto?.floorNo)}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                // backgroundColor: "#AFDBF5",
                                height: "70%",
                                borderBottomLeftRadius: "9px",
                                borderBottomRightRadius: "9px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontWeight: "bold",
                                  // fontSize: "1.5rem",
                                }}
                              >
                                {booking?.roomDto?.roomNo || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                              backgroundColor: "#fff",
                              py: 1,
                              // px: 9,
                              pl: 9,
                              borderRadius: "1rem",
                              // px: {
                              //   xl: 7,
                              //   lg: 10,
                              // },
                            }}
                          >
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 12 }}>
                                <Box
                                  sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography sx={{ fontWeight: "bold" }}>
                                      Hotel Name :
                                    </Typography>
                                    <Typography>
                                      {booking?.hotel?.name || "N/A"}
                                    </Typography>
                                  </Box>

                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        wordWrap: "break-word",
                                      }}
                                    >
                                      Ref Number:
                                    </Typography>
                                    <Typography>
                                      {booking?.bookingRefNumber || "N/A"}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        wordWrap: "break-word",
                                      }}
                                    >
                                      Booking Status:
                                    </Typography>
                                    <Typography>
                                      {booking?.bookingStatus
                                        ?.split("_")
                                        .join(" ") || "N/A"}
                                    </Typography>
                                  </Box>

                                  {/* {Boolean(booking?.roomDto?.roomNo) && (
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: "bold",
                                          wordWrap: "break-word",
                                        }}
                                      >
                                        Room Number:
                                      </Typography>
                                      <Typography>
                                        {booking?.roomDto?.roomNo || "N/A"} (
                                        {getOrdinalSuffix(
                                          booking?.roomDto?.floorNo
                                        )}{" "}
                                        floor)
                                      </Typography>
                                    </Box>
                                  )} */}

                                  {/* {Boolean(booking?.roomDto?.roomNo) && ( */}
                                  <>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "center",
                                        width: "100%",
                                        p: 1,
                                        borderRadius: "1rem",
                                        // backgroundColor: "#89CFF0",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", gap: 1 }}>
                                        {booking?.bookingStatus ===
                                          "Pending_Confirmation" && (
                                          <Button
                                            variant="contained"
                                            sx={{
                                              backgroundImage:
                                                "linear-gradient(to right, #ff512f 0%, #dd2476 100%)",
                                              color: "white",
                                              "&:hover": {
                                                backgroundImage:
                                                  "linear-gradient(to right, #ff512f 10%, #dd2476 90%)",
                                              },
                                              textTransform: "none",
                                            }}
                                            onClick={() => {
                                              handleCancelClick(
                                                booking?.bookingRefNumber
                                              );
                                              // handleBookingCancel(booking.bookingRefNumber);
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        )}

                                        {booking?.bookingStatus ===
                                          "Checked_Out" &&
                                          !Boolean(booking?.isRated) && (
                                            <Button
                                              variant="contained"
                                              sx={{
                                                backgroundImage:
                                                  "linear-gradient(to right, #ff512f 0%, #dd2476 100%)",
                                                color: "white",
                                                "&:hover": {
                                                  backgroundImage:
                                                    "linear-gradient(to right, #ff512f 10%, #dd2476 90%)",
                                                },
                                                textTransform: "none",
                                              }}
                                              onClick={() =>
                                                setReviewDialog(booking)
                                              }
                                            >
                                              Please Rate Us
                                            </Button>
                                          )}
                                        {booking?.bookingStatus ===
                                          "Checked_Out" &&
                                          Boolean(booking?.isRated) && (
                                            <Rating
                                              value={booking?.ratingPoints}
                                              disabled
                                              size="large"
                                            />
                                          )}

                                        {booking?.bookingStatus ===
                                          "Checked_In" && (
                                          <Box
                                            sx={{
                                              width: "100%",
                                            }}
                                          >
                                            <Grid
                                              container
                                              size={{ xs: 12 }}
                                              // sx={{ backgroundColor: "yellow" }}
                                              fullWidth
                                              spacing={1}
                                            >
                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    title="Order Food"
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                      }}
                                                      // startIcon={<RestaurantIcon />}
                                                      onClick={() => {
                                                        sessionStorage.setItem(
                                                          "bookingRefNumber",
                                                          booking?.bookingRefNumber
                                                        );
                                                        sessionStorage.setItem(
                                                          "hotelId",
                                                          booking?.hotel?.id
                                                        );
                                                        navigate("/resturant");
                                                      }}
                                                    >
                                                      {/* Order Food */}
                                                      <RestaurantIcon />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>
                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    // title="Room cleaning Request"
                                                    title={
                                                      booking?.roomDto
                                                        ?.isRoomCleaningRequested
                                                        ? "Room cleaning Request submitted"
                                                        : "Room cleaning Request"
                                                    }
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: "#1CAC78",
                                                      }}
                                                      disabled={Boolean(
                                                        booking?.roomDto
                                                          ?.isRoomCleaningRequested
                                                      )}
                                                      // startIcon={<CleaningServicesIcon />}
                                                      onClick={() =>
                                                        handleRoomCleanRequest(
                                                          booking.roomDto?.id,
                                                          booking.hotel?.id
                                                        )
                                                      }
                                                    >
                                                      <CleaningServicesIcon
                                                        sx={{
                                                          // color: "#1CAC78",
                                                          color: Boolean(
                                                            booking?.roomDto
                                                              ?.isRoomCleaningRequested
                                                          )
                                                            ? "gray"
                                                            : "#1CAC78",
                                                        }}
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    title="Request Checkout"
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: "#E60026",
                                                      }}
                                                      // startIcon={<ExitToAppIcon />}
                                                      onClick={() =>
                                                        handleRequestRoomCheckout(
                                                          booking.bookingRefNumber
                                                        )
                                                      }
                                                    >
                                                      <ExitToAppIcon
                                                        sx={{
                                                          color: "#E60026",
                                                        }}
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    title="Request Laundry"
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: "#3e4a61",
                                                      }}
                                                      // startIcon={<DryCleaningIcon />}
                                                      onClick={() =>
                                                        // handleRequestLaundryService(
                                                        //   booking.bookingRefNumber
                                                        // )
                                                        {
                                                          sessionStorage.setItem(
                                                            "bookingRefNumberForLaundry",
                                                            booking?.bookingRefNumber
                                                          );
                                                          navigate(
                                                            "/LaundryHistoryForGuest"
                                                          );
                                                        }
                                                      }
                                                    >
                                                      {/* Laundry */}
                                                      <DryCleaningIcon
                                                        sx={{
                                                          color: "#3e4a61",
                                                        }}
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    title="Make Payment"
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: "#D4AF37	",
                                                      }}
                                                    >
                                                      {/* Laundry */}
                                                      <PaymentIcon
                                                        onClick={() =>
                                                          handleMakePayment(
                                                            booking
                                                          )
                                                        }
                                                        sx={{
                                                          color: "#D4AF37	",
                                                        }}
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip
                                                    title="Vehicle Parking"
                                                    arrow
                                                  >
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: (theme) =>
                                                          theme.palette.warning
                                                            .main,
                                                      }}
                                                    >
                                                      {/* Laundry */}
                                                      <DirectionsCarIcon
                                                        onClick={
                                                          handleOpenVehicleParkingModal
                                                        }
                                                        // sx={{ color: "#D4AF37	" }}
                                                        color="warning"
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip title="Bar" arrow>
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: (theme) =>
                                                          theme.palette.info
                                                            .main,
                                                      }}
                                                    >
                                                      {/* Laundry */}
                                                      <LiquorIcon
                                                        onClick={() =>
                                                          handleOpenBar(
                                                            booking.bookingRefNumber,
                                                            booking.hotel.id
                                                          )
                                                        }
                                                        // sx={{ color: "#D4AF37	" }}
                                                        color="info"
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>

                                              <Grid
                                                size={{
                                                  xs: 1.5,
                                                  lg: 1.6,
                                                  xl: 1.5,
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    width: "100%",
                                                    justifyContent: "center",
                                                  }}
                                                >
                                                  <Tooltip title="Spa" arrow>
                                                    <Button
                                                      variant="outlined"
                                                      sx={{
                                                        minWidth: "unset",
                                                        width: "11px",
                                                        borderColor: (theme) =>
                                                          theme.palette
                                                            .secondary.main,
                                                      }}
                                                    >
                                                      {/* Laundry */}
                                                      <SpaIcon
                                                        onClick={() =>
                                                          handleOpenSpa(
                                                            booking.bookingRefNumber,
                                                            booking.hotel.id
                                                          )
                                                        }
                                                        // sx={{ color: "#D4AF37	" }}
                                                        color="secondary"
                                                      />
                                                    </Button>
                                                  </Tooltip>
                                                </Box>
                                              </Grid>
                                            </Grid>
                                          </Box>
                                        )}
                                      </Box>
                                    </Box>
                                  </>
                                  {/* )} */}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </TimelineContent>
                      </TimelineItem>
                    ))
                ) : (
                  <Typography>No data found</Typography>
                )}
              </Timeline>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <GuestBookingHistoryDrawer
        open={bookingHistoryDrawerOpen}
        setOpen={setBookingHistoryDrawerOpen}
        bookingDetails={bookingDetails}
      />

      <CancelRoomDialog
        open={cancelBookingOpen}
        onClose={() => setCancelBookingOpen(false)}
        selectedBookingRefNumber={selectedBookingRefNumber}
      />

      <VehicleParkingDialog
        open={openVehicleParkingDialog}
        handleClose={() => setOpenVehicleParkingDialog(false)}
        setSnack={setSnack}
      />

      <PaymentDialog
        // openPaymentDialog={openPaymentDialog}
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={makePartialPaymentPayload}
        reserveHotelRoom={makePartialPayment}
      />

      <ReviewDialog
        open={Boolean(reviewDialog)}
        handleClose={() => setReviewDialog(null)}
        setSnack={setSnack}
        rateStay={rateStay}
        orderObj={reviewDialog}
      />
      <LoadingComponent
        open={
          isLoading ||
          roomCleanRequestRes.isLoading ||
          makePartialPaymentRes.isLoading ||
          requestRoomCheckoutRes.isLoading ||
          rateStayRes.isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

// Dialog for rating
function ReviewDialog({ open, handleClose, rateStay, setSnack, orderObj }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState("");

  console.log("orderObj", orderObj);
  const handleSubmitReview = React.useCallback(
    (event) => {
      event.preventDefault();
      rateStay({
        // id: orderObj.id,
        bookingRefNumber: orderObj.bookingRefNumber,
        ratingPoints: rating,
        ratingMessage: review,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setRating(0);
          setReview("");
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
    [rateStay, setSnack, rating, review, handleClose, orderObj]
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
          onSubmit: handleSubmitReview,
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          Review Your Stay
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid size={12}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={rating}
                onChange={(e, newVal) => setRating(newVal)}
                size="large"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                autoFocus
                margin="dense"
                name="review"
                label="Review Message"
                fullWidth
                variant="standard"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            sx={{
              color: "#fff",
              display: "block",
              mx: "auto",
              letterSpacing: 1,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 18,
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            disabled={!Boolean(rating)}
            type="submit"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

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

  const [openHotelDetailsDialog, setOpenHotelDetailsDialog] =
    React.useState(false);
  const [hotelDetailsData, setHotelDetailsData] = React.useState(null);
  console.log("hotelDetails", hotelDetails);
  const handleHotelDetails = (item) => {
    setOpenHotelDetailsDialog(true);
    setHotelDetailsData(item);
  };
  const handleHotelDetailsDialogClose = () => {
    setOpenHotelDetailsDialog(false);
    setHotelDetailsData(null);
  };
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
    } else if (Boolean(formData.noOfPeoples > hotelDetails.capacity)) {
      return setSnack({
        open: true,
        message: `Maximum of ${hotelDetails?.capacity} people are allowed`,
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
      const sessionData = JSON.parse(sessionStorage.getItem("data"));

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
      } else if (Boolean(formData.noOfPeoples > hotelDetails.capacity)) {
        return setSnack({
          open: true,
          message: `Maximum of ${hotelDetails?.capacity} people are allowed`,
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
        // alternativePhoneNumber: formData.phoneNumber,
        alternativePhoneNumber: Boolean(sessionData.phoneNo)
          ? formData.phoneNumber
          : "",
        // phoneNumber: sessionData?.phoneNo || "",
        phoneNumber: sessionData?.phoneNo || formData?.phoneNumber || "",

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
        gstPrice: isClaimPoints
          ? (hotelDetails.basePrice * calculateNumberOfDays -
              userDetails?.data?.rewardsPointPrice) *
              0.18 || 0
          : calculateNumberOfDays * Number(hotelDetails?.basePrice) * 0.18,
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

  // const handleDateChange = (field) => (date) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [field]: date,
  //   }));
  // };

  const handleDateChange = (field) => (date) => {
    setFormData((prevData) => {
      const updatedData = { ...prevData, [field]: date };

      if (field === "fromDate" && date && prevData.toDate) {
        if (dayjs(date).isAfter(dayjs(prevData.toDate))) {
          updatedData.toDate = null;
        }
      }

      return updatedData;
    });
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
            height: "9rem",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => handleHotelDetails(hotelDetails)}
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
            flexDirection: "column",
            flexGrow: 1,
          }}
        >
          <Box>
            <Box>
              {/* <Rating value={hotelDetails?.averageRatingPoints} readOnly /> */}
              <Rating
                value={hotelDetails?.averageRatingPoints}
                readOnly
                precision={0.5}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>
                {hotelDetails?.hotelDto?.name}
              </Typography>
              <Typography sx={{ color: "gray" }}>
                {`${hotelDetails?.hotelDto?.address}
              , ${hotelDetails?.hotelDto?.state?.name
                ?.toLowerCase()
                ?.replace(/\b\w/g, (char) => char.toUpperCase())}`}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Blue box to stick to the bottom */}
        <Box sx={{ py: 1, px: 1 }}>
          <Box
            sx={{
              width: "100%",
              borderRadius: "1rem",
              display: "flex",
              py: 2,
              px: 1,
              backgroundColor: "#E5F5FF",
              justifyContent: "space-between",
              alignItems: "center",
              height: "auto",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={{ color: "gray" }}>
                {hotelDetails?.type}
              </Typography>
              <Typography>
                <strong>₹{hotelDetails?.basePrice}</strong> per night
              </Typography>
            </Box>
            <Box sx={{ display: "flex", marginY: "auto" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#0079C2",
                  textTransform: "none",
                  borderRadius: "0.6rem",
                }}
                onClick={toggleDrawer(true)}
              >
                Book Now
              </Button>
            </Box>
          </Box>
        </Box>
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
              {/* ({hotelDetailsData?.hotelDto?.name}) */}
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

              {/* <></> */}
              {Boolean(userDetails?.data?.noOfRewardsPointsAvailable) &&
                Boolean(calculateNumberOfDays) && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        display: "flex",
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
      <HotelDetailsDialog
        open={openHotelDetailsDialog}
        handleHotelDetailsDialogClose={handleHotelDetailsDialogClose}
        hotelDetailsData={hotelDetailsData}
        // onClick={toggleDrawer(true)}
        toggleDrawer={toggleDrawer}
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
  console.log("amount", reservationPayload);
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

const HotelDetailsDialog = memo(function ({
  open,
  handleHotelDetailsDialogClose,
  hotelDetailsData,
  toggleDrawer,
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? hotelDetailsData?.images?.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === hotelDetailsData?.images?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-slide effect
  // React.useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex === hotelDetailsData?.images?.length - 1 ? 0 : prevIndex + 1
  //     );
  //   }, 5000);

  //   return () => clearInterval(timer);
  // }, [hotelDetailsData?.images?.length]);

  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      onClose={handleHotelDetailsDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontSize: "1.7rem",
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: "bold",
              // color: "#606470",
              color: "#0f0f0f",
            }}
          >
            {hotelDetailsData?.hotelDto?.name}
          </Typography>

          <Rating
            value={hotelDetailsData?.averageRatingPoints}
            disabled
            // size="large"
            sx={{ color: "#0f0f0f", fontSize: "1.1rem" }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {hotelDetailsData?.images?.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                fontSize: "1.5rem",
                color: "#555",
                // margin: "20px 0",
              }}
            >
              No images found
            </Box>
          ) : (
            <Box
              sx={{
                height: "400px",
                overflow: "hidden",
                borderRadius: "8px",
                position: "relative",
                // border: "2px solid black",
                width: "100%",
              }}
            >
              {/* Main image slider */}
              <Box
                sx={{
                  display: "flex",
                  transform: `translateX(-${currentIndex * 100}%)`,
                  // transition: "transform 0.5s ease-in-out",
                }}
              >
                {hotelDetailsData?.images?.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: "0 0 100%",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`Image ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Navigation buttons */}
              <IconButton
                onClick={goToPrevious}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "16px",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={goToNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "16px",
                  transform: "translateY(-50%)",
                  width: "40px",
                  height: "40px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>

              {/* Dots navigation */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {hotelDetailsData?.images?.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToSlide(index)}
                    sx={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === currentIndex
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ py: 1 }}>
            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                Amenities :
              </Typography>
            </Box>
            {/* amenities box */}
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 1.4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: "1rem",
                      p: 1,
                      boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <SportsGymnasticsIcon sx={{ color: "gray" }} />
                    <Typography sx={{ color: "gray" }}>Spa</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 2.4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: "1rem",
                      p: 1,
                      boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <RestaurantIcon sx={{ color: "gray" }} />
                    <Typography sx={{ color: "gray" }}>Restaurant</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 1.9 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: "1rem",
                      p: 1,
                      boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <WeekendIcon sx={{ color: "gray" }} />
                    <Typography sx={{ color: "gray" }}>Lounge</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 1.7 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: "1rem",
                      p: 1,
                      boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <LiquorIcon sx={{ color: "gray" }} />
                    <Typography sx={{ color: "gray" }}>Bar</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      borderRadius: "1rem",
                      p: 1,
                      boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      justifyContent: "space-evenly",
                    }}
                  >
                    {/* <RoomServiceOutlinedIcon sx={{ color: "gray" }} /> */}
                    <img src={roomServices} alt="" height={23} width={23} />
                    <Typography sx={{ color: "gray" }}>Room Service</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* details box */}
            <Box>
              <Box sx={{ mt: 1 }}>
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  Details :
                </Typography>
              </Box>

              <Grid container>
                <Grid size={{ xs: 1 }}>
                  <Typography sx={{ fontWeight: "bold" }}>Capacity</Typography>
                </Grid>
                <Grid size={{ xs: 0.2 }}>:</Grid>
                <Grid size={{ xs: 1 }}>
                  <Typography>{hotelDetailsData?.capacity}</Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  sx={{
                    // backgroundImage:
                    //   "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                    // color: "white",
                    // "&:hover": {
                    //   backgroundImage:
                    //     "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                    // },
                    backgroundColor: "#0079C2",
                    textTransform: "none",
                    borderRadius: "0.6rem",
                    fontWeight: "bold",
                  }}
                  onClick={toggleDrawer(true)}
                >
                  Book Now
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

const CancelRoomDialog = ({ open, onClose, selectedBookingRefNumber }) => {
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [cancelBooking, cancelBookingRes] = useCancelHotelRoomMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleDialogClose = () => {
    setRejectionReason("");
    onClose();
  };
  const handleSubmit = () => {
    if (Boolean(!rejectionReason || rejectionReason.trim() === "")) {
      return setSnack({
        open: true,
        message: "Please provide reason for booking cancellation",
        severity: "error",
      });
    }
    cancelBooking({
      bookingRefNumber: selectedBookingRefNumber,
      rejectionReason: rejectionReason,
    })
      .unwrap()
      .then((res) => {
        handleDialogClose();
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        setRejectionReason("");
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  };
  // console.log("hello");
  return (
    <>
      <Dialog
        TransitionComponent={Transition}
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "430px" } }}
      >
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              // backgroundColor: "red",
              display: "flex",
              gap: 1,
              flexDirection: "column",
            }}
          >
            <Box sx={{ margin: "auto", mt: 3 }}>
              <PiWarningCircleLight
                style={{ fontSize: "6.9rem", color: "#FAD5A5" }}
              />
            </Box>
            <Box sx={{ margin: "auto" }}>
              <Typography
                sx={{
                  fontSize: "2.3rem",
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: "bold",
                  color: "#606470",
                }}
              >
                Cancel Booking!
              </Typography>
            </Box>
            <Box sx={{ margin: "auto" }}>
              <Typography
                sx={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: "1.2rem",
                  color: "#606470",
                }}
              >
                Are you sure you want to cancel booking ?
              </Typography>
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <TextField
                id="outlined-basic"
                name="firstName"
                placeholder="Enter a remark for cancellation"
                variant="outlined"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                inputProps={{ maxLength: 25 }}
                required
                size="small"
                sx={{ mb: 2, width: 500 }}
                InputProps={{
                  style: { height: "45px" },
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 1.7,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ backgroundColor: "#318CE7", textTransform: "none" }}
                // disabled={Boolean(rejectionReason) ? "" : true}
              >
                Yes
              </Button>
              <Button
                variant="contained"
                // onClick={onClose}
                onClick={handleDialogClose}
                sx={{ backgroundColor: "#E31837", textTransform: "none" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <LoadingComponent open={cancelBookingRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

function VehicleParkingDialog({ open, handleClose, setSnack }) {
  const [vehicleParkingDetails, setVehicleParkingDetails] =
    React.useState(null);
  const [vehicleNumber, setVehicleNumber] = React.useState("");
  const [getParkingDetails, getParkingDetailsRes] =
    useLazyGetParkingDataForGuestQuery();
  const handleGetSetParkingRes = React.useCallback(() => {
    getParkingDetails(vehicleNumber)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        setVehicleParkingDetails(res.data);
      })
      .catch((err) => {
        setVehicleParkingDetails(null);
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [getParkingDetails, vehicleNumber, setSnack]);

  const handlePrintReceipt = () => {
    const prtContent = document.getElementById("bookingReceiptCustomer");
    var WinPrint = window.open(
      "",
      "",
      "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WinPrint.document.write(prtContent.innerHTML);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  React.useEffect(() => {
    setVehicleParkingDetails(null);
    setVehicleNumber("");
  }, [open]);
  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      sx={{
        ".MuiDialogTitle-root": {
          px: 5,
          py: 3,
        },
      }}
      PaperProps={{
        sx: { borderRadius: 4 },
      }}
    >
      <DialogTitle sx={{ fontSize: 24 }}>Vehicle Parking Details</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 30,
          top: 16,
          color: "#280071",
        }}
      >
        <CloseIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            ".MuiTextField-root": {
              backgroundColor: "transparent",
              ".MuiInputBase-root": {
                // color: "#B4B4B4",
              },
            },
            ".MuiFormLabel-root": {
              color: (theme) => theme.palette.primary.main,
              // fontWeight: 600,
              // fontSize: 18,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main}`,
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          <TextField
            size="small"
            name="vehicleNumber"
            // onChange={(e) => handleChange(e.target.name, e.target.value)}
            label="Vehicle Number *"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            fullWidth
          />
          <Button
            sx={{
              display: "block",
              // margin: "1rem auto",
              color: "#fff",
              textTransform: "none",
              // fontSize: 18,
              px: 6,
              // py: 1,
              borderRadius: 2,
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            onClick={handleGetSetParkingRes}
            variant="contained"
            color="secondary"
            disabled={!Boolean(vehicleNumber.trim())}
          >
            Submit
          </Button>
        </Box>
        {Boolean(vehicleParkingDetails) && (
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 10 }}
            id="bookingReceiptCustomer"
          >
            <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
            <div style={{ textAlign: "center" }}>
              <h3>BOOKING RECEIPT</h3>
            </div>
            <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
            <div
              style={{
                width: "550px",
                margin: "auto",
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  Vehicle Number :
                </div>
                <div>
                  {
                    vehicleParkingDetails.parkingSlotData.parkingVehicleData
                      .vehicleNo
                  }
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  Area Name :
                </div>
                <div>{vehicleParkingDetails.areaName}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  Slot Number :
                </div>
                <div>{vehicleParkingDetails.parkingSlotData.slotNumber}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  From Date:
                </div>
                <div>
                  {
                    vehicleParkingDetails.parkingSlotData.parkingVehicleData
                      .fromDate
                  }
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  To Date:
                </div>
                <div>
                  {
                    vehicleParkingDetails.parkingSlotData.parkingVehicleData
                      .toDate
                  }
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  Token No.
                </div>
                <div>
                  {
                    vehicleParkingDetails.parkingSlotData.parkingVehicleData
                      .digitalTokenNo
                  }
                </div>
              </div>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    fontWeight: "bold",
                  }}
                >
                  Paid Amount
                </div>
                <div>
                  ₹{" "}
                  {
                    vehicleParkingDetails.parkingSlotData.parkingVehicleData
                      .paidAmount
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        {Boolean(vehicleParkingDetails) && (
          <Button
            variant="contained"
            color="secondary"
            sx={{
              color: "#fff",
              display: "block",
              mx: "auto",
              mt: 2,
            }}
            onClick={handlePrintReceipt}
          >
            Print Receipt
          </Button>
        )}
      </DialogContent>
      <LoadingComponent open={getParkingDetailsRes.isLoading} />
    </Dialog>
  );
}

export default GuestDashboard;
