import {
  Autocomplete,
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  AVAILABLE,
  BEING_SERVICED,
  NOT_AVAILABLE,
  OCCUPIED,
  RESERVED,
} from "../../helper/constants";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { styled } from "@mui/system";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TbBed } from "react-icons/tb";
import { PiBedFill } from "react-icons/pi";
import { MdOutlineDisabledByDefault } from "react-icons/md";
import { MdBookmarkAdded } from "react-icons/md";
import { MdCleaningServices } from "react-icons/md";
import { BsFillBuildingFill } from "react-icons/bs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useCancelHotelRoomMutation,
  useFinalRoomCheckOutMutation,
  useGetAllGovtIdsQuery,
  useGetAllPaymentMethodsQuery,
  useGetAllRoomListByHotelIdQuery,
  useGetTodayCheckoutRoomsByHotelIdQuery,
  useRequestRoomCheckoutMutation,
  useRoomCleanRequestMutation,
  useRoomtypeByHotelIdQuery,
  useSaveCustomerCheckInMutation,
} from "../../services/dashboard";
import { checkRoomStatusType } from "../../helper/helperFunctions";
import moment from "moment";
import { BootstrapDialog } from "../header/Header";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOM from "react-dom";
import dayjs from "dayjs";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import Swal from "sweetalert2";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useNavigate } from "react-router-dom";

export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

const tempInventoryData = Array.from({ length: 4 }, (_, index) => {
  return {
    id: index + 1,
    date: `${14 + index}th-Nov-2024`,
    items: [
      {
        productName: "Tooth Brush",
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        productName: "Soap",
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        productName: "Sugar Sachet",
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        productName: "Water Bottle",
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
    ],
  };
});

// const tempFoodData = Array.from({ length: 4 }, (_, index) => {
//   return {
//     id: index + 1,
//     date: `${14 + index}th-Nov-2024`,
//     items: [
//       {
//         foodName: "Coffee",
//         price: 110.0,
//         quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
//       },
//       {
//         foodName: "Pasta",
//         price: 250.0,
//         quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
//       },
//       {
//         foodName: "Kabab",
//         price: 359.0,
//         quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
//       },
//       {
//         foodName: "Fruit Salad",
//         price: 190.0,
//         quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
//       },
//       {
//         foodName: "Sweets",
//         price: 120.0,
//         quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
//       },
//     ],
//   };
// });

const tempRoomFilterVisibleButtonData = [
  { id: 6, icon: <BsFillBuildingFill />, name: "All" },
  { id: 2, icon: <PiBedFill />, name: AVAILABLE?.key },
  { id: 3, icon: <MdBookmarkAdded />, name: RESERVED?.key },
  { id: 4, icon: <TbBed />, name: OCCUPIED?.key },
  { id: 5, icon: <MdCleaningServices />, name: BEING_SERVICED?.key },
  { id: 6, icon: <MdOutlineDisabledByDefault />, name: NOT_AVAILABLE?.key },
];

const CustomInventoryTable = memo(function ({ inventoryData }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        position: "relative",
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              position: "sticky",
              top: 0,
              background: "#e8e8e8",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Sl No.
            </Typography>
          </th>
          <th
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "#e8e8e8",
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Product
            </Typography>
          </th>
          <th
            style={{
              position: "sticky",
              top: 0,
              background: "#e8e8e8",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Quantity
            </Typography>
          </th>
          <th
            style={{
              position: "sticky",
              top: 0,
              background: "#e8e8e8",
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Price
            </Typography>
          </th>
        </tr>
      </thead>
      <tbody>
        {inventoryData?.map((item, index) => {
          return (
            <tr key={`tr-${index}`}>
              <td>
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "14.4px",
                  }}
                >
                  {index + 1}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "14.4px",
                  }}
                >
                  {item?.itemName || ""}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "14.4px",
                  }}
                >
                  {item?.noOfItems || 0}
                </Typography>
              </td>
              <td>
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "14.4px",
                  }}
                >
                  {item?.totalPrice || 0}
                </Typography>
              </td>
            </tr>
          );
        })}
        <tr>
          <td
            colSpan={2}
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              background: "white",
              minHeight: "100%",
            }}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 600,
                borderTop: "1px solid #ccc",
                minHeight: "24.9px",
              }}
            >
              {" "}
            </Typography>
          </td>
          <td
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              background: "white",
            }}
            colSpan={1}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 600,
                borderTop: "1px solid #ccc",
              }}
            >
              Total
            </Typography>
          </td>
          <td
            style={{
              position: "sticky",
              bottom: 0,
              zIndex: 1,
              background: "white",
            }}
            colSpan={1}
          >
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "16px",
                borderTop: "1px solid #ccc",
              }}
            >
              {inventoryData?.reduce(
                (sum, item) => sum + (item?.totalPrice || 0),
                0
              )}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
});

const CustomRoomFilters = memo(function ({
  roomFilters,
  handleChangeRoomFilters,
  floorData,
  roomTypes,
  roomData,
  handleOpenCustomFormDrawer,
}) {
  const navigate = useNavigate();
  const handleChangeRoomFiltersOnChange = useCallback(
    (name, value) => {
      handleChangeRoomFilters(name, value);
    },
    [handleChangeRoomFilters]
  );

  const checkStatusTypeRoomCount = useCallback(() => {
    const allRooms = roomData?.flatMap((floor) => floor?.roomDto) || [];

    const counts = {
      All: 0,
      [AVAILABLE?.key]: 0,
      [RESERVED?.key]: 0,
      [OCCUPIED?.key]: 0,
      [BEING_SERVICED?.key]: 0,
      [NOT_AVAILABLE?.key]: 0,
    };
    counts.All = allRooms?.length || 0;

    allRooms.forEach((room) => {
      const status = checkRoomStatusType(room);

      if (status && status.key) {
        counts[status.key] = (counts[status.key] || 0) + 1;
      }
    });

    return counts;
  }, [roomData]);

  const finalCount = checkStatusTypeRoomCount();

  return (
    <Box
      sx={{
        // marginTop: "1rem",
        width: "100%",
      }}
    >
      <Grid container size={12} spacing={1}>
        <Grid size={{ lg: 2, xl: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={roomFilters?.toDate}
              onChange={(newVal) =>
                handleChangeRoomFiltersOnChange("toDate", newVal)
              }
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  readOnly: true,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      color: "#B4B4B4",
                    },
                    "& .MuiTextField-root": {
                      width: "100%",
                      backgroundColor: "transparent",
                    },
                    "& .MuiFormLabel-root": {
                      color: (theme) => theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: 18,
                    },
                  },
                },
              }}
              slots={{
                openPickerIcon: StyledCalendarIcon,
              }}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ lg: 2, xl: 1.5 }}>
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
                fontSize: 18,
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
            <Autocomplete
              options={floorData || []}
              disableClearable
              fullWidth
              value={
                roomFilters.floor ||
                (floorData.length > 0 ? floorData[0] : null)
              }
              onChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("floor", newVal)
              }
              inputValue={roomFilters.floorInputVal}
              onInputChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("floorInputVal", newVal)
              }
              getOptionLabel={(option) =>
                option?.key === "all"
                  ? option?.name
                  : `Floor ${option?.floorNo}`
              }
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid size={{ lg: 2, xl: 1.5 }}>
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
                fontSize: 18,
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
            <Autocomplete
              options={roomTypes || []}
              // disableClearable
              fullWidth
              value={roomFilters?.roomType || null}
              onChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("roomType", newVal)
              }
              inputValue={roomFilters.roomTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("roomTypeInputVal", newVal)
              }
              getOptionLabel={(option) =>
                option?.type
                  ?.replace(/_/g, " ")
                  ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                  ?.replace(/\b\w/g, (char) => char.toUpperCase()) || ""
              }
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
                    },
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid size={{ lg: 2, xl: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/frontdeskBookingHistory")}
            sx={{ fontSize: "10px" }}
          >
            Booking History
          </Button>
        </Grid>
        <Grid size={{ xs: 0, xl: 1 }} />
        <Grid size={{ xs: 12, xl: 5 }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {tempRoomFilterVisibleButtonData?.map((item, index) => {
              return (
                <Box
                  key={`Floor Filter ${index}`}
                  sx={{
                    minHeight: "40px",
                    display: "flex",
                    fontWeight: 600,
                    userSelect: "none",
                    paddingX: "10px",
                    whiteSpace: "nowrap",
                    borderLeft: "1px solid #A9A9A9",
                    gap: "5px",
                    bgcolor:
                      item?.name === "All"
                        ? ""
                        : roomFilters?.selectedRoomStatus === item?.name
                        ? "#a6f0ff"
                        : "",
                    height: "100%",
                    "&:hover": {
                      cursor: "pointer",
                      bgcolor:
                        item?.name === "All"
                          ? "#c2f5ff"
                          : roomFilters?.selectedRoomStatus === item?.name
                          ? "#a6f0ff"
                          : "#c2f5ff",
                      userSelect: "none",
                    },
                  }}
                  onClick={() =>
                    handleChangeRoomFiltersOnChange(
                      "selectedRoomStatus",
                      item?.name
                    )
                  }
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      fontSize: "20px",
                      // bgcolor: "cyan",
                      justifyContent: "center",
                      alignItems: "center",
                      color:
                        item?.name === AVAILABLE.key
                          ? "hsla(202, 100%, 73%, 0.99)"
                          : item?.name === RESERVED.key
                          ? "hsla(32, 98%, 65%, 0.99)"
                          : item?.name === OCCUPIED.key
                          ? "hsla(140, 100%, 36%, 0.99)"
                          : item?.name === NOT_AVAILABLE.key
                          ? "hsla(0, 100%, 65%, 0.99)"
                          : item?.name === BEING_SERVICED.key
                          ? "hsla(281, 100%, 63%, 0.99)"
                          : "hsla(0, 0%, 17%, 0.99)",
                    }}
                  >
                    {item?.icon}
                  </Box>

                  <Box
                    sx={{
                      overflow: "hidden", // Prevents content from visually overflowing
                      maxWidth: "100%",
                      // bgcolor: "red",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        letterSpacing: 1,
                        fontSize: "15px",
                        // whiteSpace: "normal", // Ensures text wraps properly
                        // wordWrap: "break-word",
                        // wordBreak: "break-word",
                        // overflowWrap: "break-word",
                      }}
                    >
                      {item?.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 550,
                        // lineHeight: 0.7,
                        color:
                          item?.name === AVAILABLE.key
                            ? "hsla(202, 100%, 73%, 0.99)"
                            : item?.name === RESERVED.key
                            ? "hsla(32, 98%, 65%, 0.99)"
                            : item?.name === OCCUPIED.key
                            ? "hsla(140, 100%, 36%, 0.99)"
                            : item?.name === NOT_AVAILABLE.key
                            ? "hsla(0, 100%, 65%, 0.99)"
                            : item?.name === BEING_SERVICED.key
                            ? "hsla(281, 100%, 63%, 0.99)"
                            : "hsla(0, 0%, 17%, 0.99)",
                        letterSpacing: 1,
                      }}
                    >
                      {finalCount[item?.name] || 0}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

const CustomFloorAccordion = memo(function ({
  floorData,
  isSelectedRoom,
  handleRoomSelect,
  roomFilters,
}) {
  console.log("floor row Data : ", floorData);
  return (
    <>
      <Box sx={{ width: "100" }}>
        <Box
          sx={{
            borderBottom: "2px solid #ccc",
            bgcolor: "#e3e3e3",
            py: 0.5,
            px: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 550, letterSpacing: 1 }}>
            {`Floor ${floorData?.floorNo}`}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
          <Grid container size={12} spacing={2}>
            {Boolean(floorData?.roomDto?.length) &&
              floorData?.roomDto
                ?.filter((room) => {
                  console.log("somya room : ", room);
                  const matchesRoomStatus =
                    roomFilters?.selectedRoomStatus &&
                    !Boolean(roomFilters?.selectedRoomStatus === "All")
                      ? checkRoomStatusType(room)?.key ===
                        roomFilters?.selectedRoomStatus
                      : true;

                  const matchesRoomType = roomFilters?.roomType
                    ? room?.roomType?.id === roomFilters?.roomType?.id
                    : true;

                  const matchesSearchKey = roomFilters?.searchKey
                    ? room?.roomNumber
                        ?.toString()
                        ?.includes(roomFilters?.searchKey) ||
                      room?.occupier
                        ?.toLowerCase()
                        ?.includes(roomFilters?.searchKey?.toLowerCase())
                    : true;

                  const matchesDate = roomFilters?.toDate
                    ? new Date(room?.availableDate) <=
                      new Date(roomFilters?.toDate)
                    : true;

                  return (
                    matchesRoomStatus &&
                    matchesRoomType &&
                    matchesSearchKey &&
                    matchesDate
                  );
                })
                ?.map((roomDetailsItem, index) => {
                  return (
                    <Grid
                      key={`room ${index}`}
                      size={{ xs: 6, sm: 4, md: 3, xl: 2.4 }}
                    >
                      <CustomRoomCard
                        roomDetails={roomDetailsItem}
                        isSelectedRoom={
                          isSelectedRoom?.roomNo === roomDetailsItem?.roomNo
                            ? true
                            : false
                        }
                        handleRoomSelect={handleRoomSelect}
                      />
                    </Grid>
                  );
                })}
          </Grid>
        </Box>
      </Box>
    </>
  );
});

const CustomRoomCard = memo(function ({
  roomDetails,
  isSelectedRoom,
  handleRoomSelect,
}) {
  const handleRoomSelectOnClick = useCallback(
    (roomValue) => {
      handleRoomSelect(roomValue);
    },
    [handleRoomSelect]
  );
  return (
    <Paper
      id={`room-${roomDetails?.roomNo}`}
      elevation={1}
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: 170,
        position: "relative",
        overflow: "hidden",
        boxShadow: isSelectedRoom
          ? "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px"
          : "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          backgroundColor:
            checkRoomStatusType(roomDetails)?.key === AVAILABLE.key
              ? "hsla(202, 100%, 73%, 0.99)"
              : checkRoomStatusType(roomDetails)?.key === RESERVED.key
              ? "hsla(32, 98%, 65%, 0.99)"
              : checkRoomStatusType(roomDetails)?.key === OCCUPIED.key
              ? "hsla(140, 100%, 36%, 0.99)"
              : checkRoomStatusType(roomDetails)?.key === NOT_AVAILABLE.key
              ? "hsla(0, 100%, 65%, 0.99)"
              : checkRoomStatusType(roomDetails)?.key === BEING_SERVICED.key
              ? "hsla(281, 100%, 63%, 0.99)"
              : "#ccc",
          pointerEvents: "none",
        },
        "&:hover": {
          cursor: "pointer",
        },
      }}
      onClick={() => handleRoomSelectOnClick(roomDetails)}
    >
      <Box
        sx={{
          // backgroundColor: "hsla(180, 91%, 92%, 1)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          px: 2,
          pb: 1,
          pt: 3,
          gap: 0.5,
        }}
      >
        <Typography sx={{ fontSize: "19px", fontWeight: 550 }}>
          {roomDetails?.roomNo}
        </Typography>
        <Typography sx={{ fontSize: "17px", textAlign: "center" }}>
          {roomDetails?.roomType?.type
            ?.replace(/_/g, " ")
            ?.replace(/([a-z])([A-Z])/g, "$1 $2")
            ?.replace(/\b\w/g, (char) => char.toUpperCase()) || ""}
        </Typography>
        <Typography sx={{ fontWeight: 550 }}>
          {roomDetails?.occupier}
        </Typography>
      </Box>
    </Paper>
  );
});

// const KeyAllocationCard = memo(function ({ keyAllocationData }) {
//   return (
//     <>
//       <Box sx={{ width: "100" }}>
//         <Box
//           sx={{
//             borderBottom: "2px solid #ccc",
//             bgcolor: "#e3e3e3",
//             py: 0.5,
//             px: 1,
//           }}
//         >
//           <Typography variant="h6" sx={{ fontWeight: 550, letterSpacing: 1 }}>
//             {`Key Allocation`}
//           </Typography>
//         </Box>
//         <Box sx={{ width: "100%", mt: 2, height: "100px", overflowY: "auto" }}>
//           <Grid container size={12} rowSpacing={2}>
//             {Boolean(keyAllocationData?.length) &&
//               keyAllocationData?.map((keyItem, index) => {
//                 return (
//                   <Grid key={`Key-${index}`} size={3}>
//                     <Button variant="contained" size="small">
//                       {keyItem?.roomNo}
//                     </Button>
//                   </Grid>
//                 );
//               })}
//           </Grid>
//         </Box>
//       </Box>
//     </>
//   );
// });

const DayCheckoutCard = memo(function ({
  dayCheckoutData,
  handleChangeSelectedRoomForDayCheckout,
}) {
  const handleChangeSelectedRoomForDayCheckoutOnClick = useCallback(
    (checkoutRoomData) => {
      handleChangeSelectedRoomForDayCheckout(checkoutRoomData);
    },
    [handleChangeSelectedRoomForDayCheckout]
  );
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: "2px solid #ccc",
            bgcolor: "#e3e3e3",
            py: 0.5,
            px: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 550, letterSpacing: 1 }}>
            {`Checkout (Today)`}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mt: 2, height: "130px", overflowY: "auto" }}>
          <Grid container size={12} rowSpacing={1}>
            {Boolean(dayCheckoutData?.length) &&
              dayCheckoutData?.map((dayCheckoutItem, index) => {
                return (
                  <Grid key={`Day-Checkout-${index}`} size={2.4}>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      sx={{ minWidth: "unset", width: "37px" }}
                      onClick={() =>
                        handleChangeSelectedRoomForDayCheckoutOnClick(
                          dayCheckoutItem
                        )
                      }
                    >
                      {dayCheckoutItem?.roomDto?.roomNo}
                    </Button>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      </Box>
    </>
  );
});

const RoomServiceCard = memo(function ({
  handleOpenShowcaseModalForInventory,
  handleOpenShowcaseModalForFood,
  isSelectedRoom,
  handleOpenCustomFormDrawer,
  handleOpenShowcaseModalForCheckout,
  handleRequestRoomCheckout,
  handleRoomCleanRequest,
}) {
  console.log("RoomServiceCard isSelectedRoom : ", isSelectedRoom);
  const selectedRoomStatusType = checkRoomStatusType(isSelectedRoom);

  const flatMappedInventoryItems = tempInventoryData?.flatMap(
    (item) => item?.items
  );

  const displayedInventoryItems = flatMappedInventoryItems?.slice(0, 3);

  const remainingInventoryItemsCount =
    flatMappedInventoryItems?.length - displayedInventoryItems?.length || 0;

  // const flatMappedFoodItems = tempFoodData?.flatMap((item) => item?.items);

  // const displayedFoodItems = flatMappedFoodItems?.slice(0, 3);

  // const remainingFoodItemsCount =
  //   flatMappedFoodItems?.length - displayedFoodItems?.length || 0;

  const handleOpenShowcaseModalForInventoryOnClick = useCallback(() => {
    handleOpenShowcaseModalForInventory(tempInventoryData);
  }, [handleOpenShowcaseModalForInventory]);

  // const handleOpenShowcaseModalForFoodOnClick = useCallback(() => {
  //   handleOpenShowcaseModalForFood(tempFoodData);
  // }, [handleOpenShowcaseModalForFood]);

  const handleOpenCustomFormDrawerOnClick = useCallback(
    (open = true, title = "", type = null) => {
      handleOpenCustomFormDrawer(open, title, type);
    },
    [handleOpenCustomFormDrawer]
  );

  const handleOpenShowcaseModalForCheckoutOnClick = useCallback(() => {
    handleOpenShowcaseModalForCheckout();
  }, [handleOpenShowcaseModalForCheckout]);

  const handleRequestRoomCheckoutOnClick = useCallback(() => {
    handleRequestRoomCheckout();
  }, [handleRequestRoomCheckout]);

  const handleRoomCleanRequestOnClick = useCallback(
    (roomId) => {
      handleRoomCleanRequest(roomId);
    },
    [handleRoomCleanRequest]
  );

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            borderBottom: "2px solid #ccc",
            bgcolor: "#e3e3e3",
            py: 0.5,
            px: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 550, letterSpacing: 1 }}>
            {`Room Details`}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100",
            overflowY: "auto",
            height: "310px",
          }}
        >
          {/* OCCUPIED ROOM CASE */}
          {selectedRoomStatusType?.key === OCCUPIED?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* GUEST DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Guest Details :
                      </Typography>
                    </Grid>
                    <Grid size={9}>
                      <Grid container size={12}>
                        {/* NAME */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {Boolean(isSelectedRoom?.bookingDto?.firstName) &&
                                `${isSelectedRoom?.bookingDto?.firstName}`}
                              {Boolean(
                                isSelectedRoom?.bookingDto?.middleName
                              ) && ` ${isSelectedRoom?.bookingDto?.middleName}`}
                              {Boolean(isSelectedRoom?.bookingDto?.lastName) &&
                                ` ${isSelectedRoom?.bookingDto?.lastName}`}{" "}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* BOOKING DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Booking Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.bookedOn &&
                                moment(
                                  isSelectedRoom?.bookingDto?.bookedOn
                                ).format("DD-MM-YYYY hh:mm A")}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* FROM DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            From
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.fromDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* TO DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            To
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.toDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CHECK-IN DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Check-In Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.checkInDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CHECK-OUT DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Check-Out Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.checkOutDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* Occupancy */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Occupancy
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.noOfPeoples || "0"}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={3}>
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXp3DxP80ArpRzsB0XWBG9Ow5GeuefbLrUHw&s"
                        alt="person"
                        style={{
                          width: "100%",
                          height: "130px",
                          objectFit: "cover",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ROOM OPERATIONS */}
                <Box sx={{ width: "100%", mt: 1 }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Room Operations :
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Grid container size={12}>
                        {/* Services */}
                        <Grid size={3.8}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Services
                          </Typography>
                        </Grid>
                        <Grid size={8.2}>
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Tooltip title={"Request Room Cleaning"} arrow>
                              <Button
                                variant="contained"
                                sx={{ minWidth: "unset", width: "15px" }}
                                onClick={() =>
                                  handleRoomCleanRequestOnClick(
                                    isSelectedRoom?.id
                                  )
                                }
                              >
                                <CleaningServicesIcon
                                  sx={{ fontSize: "17px" }}
                                />
                              </Button>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>

                {/* INVENTORY DETAILS */}
                <Box sx={{ width: "100%", mt: 1 }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Inventory Details :
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Grid container size={12}>
                        {/* Used Items */}
                        <Grid size={3.8}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Used Items
                          </Typography>
                        </Grid>
                        <Grid size={8.2}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {displayedInventoryItems?.map((item, index) => (
                                <React.Fragment key={`inventory-${index}`}>
                                  <span>{item?.productName}</span>
                                  {index !==
                                    displayedInventoryItems?.length - 1 && (
                                    <span>, </span>
                                  )}
                                </React.Fragment>
                              ))}

                              {remainingInventoryItemsCount > 0 && (
                                <>
                                  &nbsp; &
                                  <span
                                    style={{
                                      cursor: "pointer",
                                      marginLeft: "8px",
                                      background: "#cbcbcb",
                                      lineHeight: 1.7,
                                      borderRadius: "5px",
                                    }}
                                    onClick={() =>
                                      handleOpenShowcaseModalForInventoryOnClick()
                                    }
                                  >
                                    &nbsp; +{remainingInventoryItemsCount} more
                                    &nbsp;
                                  </span>
                                </>
                              )}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>

                {/* FOOD DETAILS */}
                {/* <Box sx={{ width: "100%", mt: 1 }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Food Details :
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Grid container size={12}>
                   
                        <Grid size={3.8}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Food Items
                          </Typography>
                        </Grid>
                        <Grid size={8.2}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                              }}
                            >
                              {displayedFoodItems?.map((item, index) => (
                                <React.Fragment key={`inventory-${index}`}>
                                  <span>{item?.foodName}</span>
                                  {index !== displayedFoodItems?.length - 1 && (
                                    <span>, </span>
                                  )}
                                </React.Fragment>
                              ))}

                              {remainingFoodItemsCount > 0 && (
                                <>
                                  &nbsp; &
                                  <span
                                    style={{
                                      cursor: "pointer",
                                      marginLeft: "8px",
                                      background: "#cbcbcb",
                                      lineHeight: 1.7,
                                      borderRadius: "5px",
                                    }}
                                    onClick={() =>
                                      handleOpenShowcaseModalForFoodOnClick()
                                    }
                                  >
                                    &nbsp; +{remainingFoodItemsCount} more
                                    &nbsp;
                                  </span>
                                </>
                              )}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box> */}
              </Box>
            </>
          )}

          {/* RESERVED ROOM CASE */}
          {selectedRoomStatusType?.key === RESERVED?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* GUEST DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Guest Details :
                      </Typography>
                    </Grid>
                    <Grid size={9}>
                      <Grid container size={12}>
                        {/* NAME */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {Boolean(isSelectedRoom?.bookingDto?.firstName) &&
                                `${isSelectedRoom?.bookingDto?.firstName}`}
                              {Boolean(
                                isSelectedRoom?.bookingDto?.middleName
                              ) && ` ${isSelectedRoom?.bookingDto?.middleName}`}
                              {Boolean(isSelectedRoom?.bookingDto?.lastName) &&
                                ` ${isSelectedRoom?.bookingDto?.lastName}`}{" "}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* BOOKING DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Booking Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.bookedOn &&
                                moment(
                                  isSelectedRoom?.bookingDto?.bookedOn
                                ).format("DD-MM-YYYY hh:mm A")}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* FROM DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            From
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.fromDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* TO DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            To
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.toDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* STAYERS */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Stayers
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.noOfPeoples || "0"}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={3}>
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXp3DxP80ArpRzsB0XWBG9Ow5GeuefbLrUHw&s"
                        alt="person"
                        style={{
                          width: "100%",
                          height: "130px",
                          objectFit: "cover",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </>
          )}

          {/* AVAILABLE ROOM CASE */}
          {selectedRoomStatusType?.key === AVAILABLE?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* ROOM DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Grid container size={12}>
                        {/* ROOM NO */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room No
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomNo || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* FLOOR NO */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Floor No
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.floorNo || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM STATUS */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Status
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "18px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {checkRoomStatusType(isSelectedRoom)?.key}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* <Grid size={12}></Grid> */}
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",

            justifyContent: "center",
            width: "100%",
            // bgcolor: "white",
            bottom: 0,
            gap: 2,
          }}
        >
          {/* AVAILABLE ROOM CASE */}
          {selectedRoomStatusType?.key === AVAILABLE?.key && (
            <Button variant="contained" size="small">
              BOOK NOW
            </Button>
          )}

          {/* RESERVED ROOM CASE */}
          {selectedRoomStatusType?.key === RESERVED?.key && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  handleOpenCustomFormDrawerOnClick(true, "Check-In", "checkIn")
                }
              >
                CHECK-IN
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  handleOpenCustomFormDrawerOnClick(
                    true,
                    "Cancel Booking",
                    "cancelBooking"
                  )
                }
                sx={{
                  backgroundImage:
                    "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                  color: "white",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                  },
                }}
              >
                CANCEL BOOKING
              </Button>
            </>
          )}

          {/* OCCUPIED ROOM CASE */}
          {selectedRoomStatusType?.key === OCCUPIED?.key && (
            <>
              <Button
                variant="contained"
                size="small"
                color="error"
                disabled={Boolean(
                  Boolean(
                    isSelectedRoom?.bookingDto?.isCheckoutProceed === true
                  ) &&
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                        false
                    )
                )}
                // onClick={() => handleOpenShowcaseModalForCheckoutOnClick()}
                onClick={() => {
                  if (
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckoutProceed === false &&
                        isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                          null
                    )
                  ) {
                    handleRequestRoomCheckoutOnClick();
                  } else if (
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckoutProceed === false &&
                        isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                          true
                    )
                  ) {
                    handleOpenShowcaseModalForCheckoutOnClick();
                  }
                }}
              >
                {Boolean(
                  Boolean(
                    isSelectedRoom?.bookingDto?.isCheckoutProceed === false
                  ) &&
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                        null
                    )
                )
                  ? "Request CHECK-OUT"
                  : Boolean(
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckoutProceed === false
                      ) &&
                        Boolean(
                          isSelectedRoom?.bookingDto
                            ?.isCheckedByKeepingStaff === true
                        )
                    )
                  ? "CHECK-OUT"
                  : Boolean(
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckoutProceed === true
                      ) &&
                        Boolean(
                          isSelectedRoom?.bookingDto
                            ?.isCheckedByKeepingStaff === false
                        )
                    )
                  ? "Checkout Requsted"
                  : ""}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
});

const CustomFormDrawer = memo(function ({
  customDrawerOpen,
  title,
  type,
  handleToggleCustomFormDrawer,
  customFormDrawerData,
  handleChangeCustomFormDrawerData,
  isSelectedRoom,
  allGovtIdsData,
  allPaymentMethods,
  handleSubmitRoomCheckIn,
  handleSubmitRoomBookingCanelation,
}) {
  console.log("CustomFormDrawer customDrawerOpen : ", customDrawerOpen, type);
  const handleToggleCustomFormDrawerOnChange = useCallback(() => {
    handleToggleCustomFormDrawer();
  }, [handleToggleCustomFormDrawer]);

  const handleChangeCustomFormDrawerDataOnChange = useCallback(
    (name, value, subIndex) => {
      handleChangeCustomFormDrawerData(name, value, subIndex);
    },
    [handleChangeCustomFormDrawerData]
  );
  const handleChangeCustomFormDrawerDataOnOpen = useCallback(() => {
    handleChangeCustomFormDrawerData("fullCheckIn", isSelectedRoom);
  }, [handleChangeCustomFormDrawerData, isSelectedRoom]);

  const handleSubmitRoomCheckInOnClick = useCallback(() => {
    handleSubmitRoomCheckIn();
  }, [handleSubmitRoomCheckIn]);

  const handleSubmitRoomBookingCanelationOnClick = useCallback(() => {
    handleSubmitRoomBookingCanelation();
  }, [handleSubmitRoomBookingCanelation]);

  useEffect(() => {
    if (customDrawerOpen && isSelectedRoom) {
      handleChangeCustomFormDrawerDataOnOpen();
    }
  }, [
    isSelectedRoom,
    handleChangeCustomFormDrawerDataOnOpen,
    customDrawerOpen,
  ]);

  return (
    <Drawer
      anchor="right"
      open={customDrawerOpen}
      onClose={() => handleToggleCustomFormDrawerOnChange()}
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
            {title}
          </Typography>
          <IconButton onClick={() => handleToggleCustomFormDrawerOnChange()}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* <Divider /> */}
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ px: 2 }}>
          {type === "checkIn" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12}>
                  {/* STAYERS */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Stayers
                    </Typography>
                  </Grid>
                  <Grid size={10}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.noOfPeoples || 0}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      From
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.fromDate || ""}
                      </Typography>
                    </Typography>
                  </Grid>

                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      To
                    </Typography>
                  </Grid>

                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.toDate || ""}
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="noOfPeoples"
                  label="Stayer"
                  name="noOfPeoples"
                  // autoComplete="noOfPeoples"
                  variant="standard"
                  value={customFormDrawerData?.noOfPeoples || ""}
                  onChange={(e) =>
                    handleChangeCustomFormDrawerDataOnChange(
                      "noOfPeoples",
                      e?.target?.value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{ width: "100%", height: "100%", position: "relative" }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      disablePast
                      value={customFormDrawerData?.checkOutDate || null}
                      onChange={(newVal) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "checkOutDate",
                          newVal
                        )
                      }
                      slotProps={{
                        textField: {
                          variant: "standard",
                          size: "small",
                          readOnly: true,
                          label: "Check-Out Date",
                          sx: {
                            position: "absolute",
                            bottom: 7,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.25)",
                              color: "#B4B4B4",
                            },
                            "& .MuiTextField-root": {
                              width: "100%",
                              backgroundColor: "transparent",
                            },
                            // "& .MuiFormLabel-root": {
                            //   color: (theme) => theme.palette.primary.main,
                            //   fontWeight: 600,
                            //   fontSize: 18,
                            // },
                          },
                        },
                      }}
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      format="DD-MM-YYYY"
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>

              <Grid size={12}>
                <Grid container size={12}>
                  {/* STAYERS */}
                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Guests Details :
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    width: "100%",
                    maxHeight: "calc(100vh - 600px)",
                    overflowX: "hidden",
                    overflowY: "auto",
                  }}
                >
                  {customFormDrawerData?.bookingMapDatas?.map((item, index) => {
                    return (
                      <Box
                        key={`verification-${index}`}
                        sx={{ width: "100%", marginBottom: "10px" }}
                      >
                        <Grid container size={12} spacing={2}>
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "16px",
                                // color: "#707070",
                                fontWeight: 600,
                                width: "100%",
                                bgcolor: "#e8e8e8",
                              }}
                            >
                              Customer {index + 1} :
                            </Typography>
                          </Grid>
                          <Grid size={6}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id={`customerName${index}`}
                              label="Guest Name"
                              name="customerName"
                              // autoComplete="noOfPeoples"
                              variant="standard"
                              value={item?.customerName || ""}
                              onChange={(e) =>
                                handleChangeCustomFormDrawerDataOnChange(
                                  "customerName",
                                  e?.target?.value,
                                  index
                                )
                              }
                            />
                          </Grid>
                          <Grid size={6}>
                            <Box
                              sx={{
                                height: "100%",
                                position: "relative",
                                ".MuiTextField-root": {
                                  width: "100%",
                                  backgroundColor: "transparent",
                                  ".MuiInputBase-root": {
                                    color: "#B4B4B4",
                                    background: "rgba(255, 255, 255, 0.25)",
                                  },
                                },
                                // ".MuiFormLabel-root": {
                                //   color: (theme) => theme.palette.primary.main,
                                //   fontWeight: 600,
                                //   fontSize: 18,
                                // },
                                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                              }}
                            >
                              <Autocomplete
                                fullWidth
                                options={
                                  allGovtIdsData?.data?.map((item) => ({
                                    key: item,
                                    name: item.replace(/_/g, " "),
                                  })) || []
                                }
                                disableClearable
                                value={item?.govtIdType || null}
                                onChange={(e, newVal) =>
                                  handleChangeCustomFormDrawerDataOnChange(
                                    "govtIdType",
                                    newVal,
                                    index
                                  )
                                }
                                inputValue={item?.govtIdTypeInputValue}
                                onInputChange={(e, newVal) =>
                                  handleChangeCustomFormDrawerDataOnChange(
                                    "govtIdTypeInputValue",
                                    newVal,
                                    index
                                  )
                                }
                                getOptionLabel={(option) => option?.name}
                                clearOnEscape
                                disablePortal
                                popupIcon={
                                  <KeyboardArrowDownIcon color="primary" />
                                }
                                sx={{
                                  // width: 200,
                                  position: "absolute",
                                  bottom: 7,
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
                                size="small"
                                clearIcon={<ClearIcon color="primary" />}
                                PaperComponent={(props) => (
                                  <Paper
                                    sx={{
                                      background: "#fff",
                                      color: "#B4B4B4",
                                      // borderRadius: "10px",
                                    }}
                                    {...props}
                                  />
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Govt. ID Type"
                                    variant="standard"
                                    // sx={{
                                    //   "& .MuiOutlinedInput-root": {
                                    //     borderRadius: 2,
                                    //   },
                                    // }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid size={6}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              disabled={!Boolean(item?.govtIdType)}
                              id={`govtIdNo${index}`}
                              label="Govt. Id"
                              name="govtIdNo"
                              autoComplete="govtIdNo"
                              variant="standard"
                              value={item?.govtIdNo || ""}
                              onChange={(e) =>
                                handleChangeCustomFormDrawerDataOnChange(
                                  "govtIdNo",
                                  e?.target?.value,
                                  index
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })}
                  {/* <Grid size={{ xs: 12 }}></Grid> */}
                </Box>
              </Grid>

              {/* PAYMENTS */}
              <Grid size={12}>
                <Grid container size={12}>
                  {/* STAYERS */}
                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontSize: "18px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Payment Details :
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Advance Paid
                    </Typography>
                  </Grid>

                  <Grid size={8}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.transactionDetails?.reduce(
                          (sum, item) => sum + (item?.amount || 0),
                          0
                        )}
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Grid container size={12} spacing={2}>
                  <Grid size={6}>
                    <Box
                      sx={{
                        height: "100%",
                        position: "relative",
                        ".MuiTextField-root": {
                          width: "100%",
                          backgroundColor: "transparent",
                          ".MuiInputBase-root": {
                            color: "#B4B4B4",
                            background: "rgba(255, 255, 255, 0.25)",
                          },
                        },
                        // ".MuiFormLabel-root": {
                        //   color: (theme) => theme.palette.primary.main,
                        //   fontWeight: 600,
                        //   fontSize: 18,
                        // },
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
                      <Autocomplete
                        fullWidth
                        options={
                          allPaymentMethods?.data?.map((item) => ({
                            key: item,
                            name: item.replace(/_/g, " "),
                          })) || []
                        }
                        disableClearable
                        value={customFormDrawerData?.paymentMethod || null}
                        onChange={(e, newVal) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "paymentMethod",
                            newVal
                          )
                        }
                        inputValue={
                          customFormDrawerData?.paymentMethodInputValue || ""
                        }
                        onInputChange={(e, newVal) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "paymentMethodInputValue",
                            newVal
                          )
                        }
                        getOptionLabel={(option) => option?.name}
                        clearOnEscape
                        disablePortal
                        popupIcon={<KeyboardArrowDownIcon color="primary" />}
                        sx={{
                          // width: 200,
                          position: "absolute",
                          bottom: 7,
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
                        size="small"
                        clearIcon={<ClearIcon color="primary" />}
                        PaperComponent={(props) => (
                          <Paper
                            sx={{
                              background: "#fff",
                              color: "#B4B4B4",
                              // borderRadius: "10px",
                            }}
                            {...props}
                          />
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Payment Method"
                            variant="standard"
                            // sx={{
                            //   "& .MuiOutlinedInput-root": {
                            //     borderRadius: 2,
                            //   },
                            // }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  {customFormDrawerData?.paymentMethod &&
                    !(customFormDrawerData?.paymentMethod?.key === "Cash") && (
                      <Grid size={6}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id={`transactionReferenceNo`}
                          label="Transaction ref. No."
                          name="transactionReferenceNo"
                          autoComplete="transactionReferenceNo"
                          variant="standard"
                          value={
                            customFormDrawerData?.transactionReferenceNo || ""
                          }
                          onChange={(e) =>
                            handleChangeCustomFormDrawerDataOnChange(
                              "transactionReferenceNo",
                              e?.target?.value
                            )
                          }
                        />
                      </Grid>
                    )}

                  <Grid size={6}>
                    <TextField
                      margin="normal"
                      fullWidth
                      disabled={!Boolean(customFormDrawerData?.paymentMethod)}
                      id={`paidAmount`}
                      label="Amount"
                      name="paidAmount"
                      autoComplete="paidAmount"
                      variant="standard"
                      value={customFormDrawerData?.paidAmount || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "paidAmount",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>

                  <Grid size={6}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id={`remarks`}
                      label="Remarks"
                      name="remarks"
                      autoComplete="remarks"
                      variant="standard"
                      value={customFormDrawerData?.remarks || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "remarks",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundImage:
                      "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                    color: "white",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(to right, #0acffe 10%, #495aff 90%)", // Optional hover adjustment
                    },
                  }}
                  onClick={() => handleSubmitRoomCheckInOnClick()}
                >
                  Check-In
                </Button>
              </Grid>
            </Grid>
          )}

          {type === "cancelBooking" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12} spacing={2}>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Booking Ref. No.
                    </Typography>
                  </Grid>
                  <Grid size={8}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.bookingRefNumber || ""}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      inputProps={{ maxLength: 150 }}
                      id="cancelBookingReason"
                      label="Reason"
                      name="cancelBookingReason"
                      // autoComplete="noOfPeoples"
                      variant="standard"
                      value={customFormDrawerData?.cancelBookingReason || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "cancelBookingReason",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                        color: "white",
                        "&:hover": {
                          backgroundImage:
                            "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                        },
                      }}
                      onClick={() => handleSubmitRoomBookingCanelationOnClick()}
                    >
                      Cancel Booking
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Drawer>
  );
});

const ShowcaseDialog = memo(function ({
  openShowcaseDialog,
  handleCloseShowcaseDialog,
  title = "",
  type,
  inventoryData = [],
  foodData = [],
  checkOutRoomData,
  showcaseDialogFormData,
  allPaymentMethods,
  handleChangeShowcaseDialogFormData,
  handleConfirmFinalCheckout,
}) {
  console.log("type : ", type);

  const handleCloseShowcaseDialogOnClose = useCallback(() => {
    handleCloseShowcaseDialog();
  }, [handleCloseShowcaseDialog]);

  const handleChangeShowcaseDialogFormDataOnChange = useCallback(
    (name, value) => {
      handleChangeShowcaseDialogFormData(name, value);
    },
    [handleChangeShowcaseDialogFormData]
  );

  const handleConfirmFinalCheckoutOnClick = useCallback(() => {
    handleConfirmFinalCheckout();
  }, [handleConfirmFinalCheckout]);

  useEffect(() => {
    if (openShowcaseDialog && checkOutRoomData && type === "checkout") {
      handleChangeShowcaseDialogFormDataOnChange(
        "fullChange",
        checkOutRoomData
      );
    }
  }, [
    openShowcaseDialog,
    checkOutRoomData,
    type,
    handleChangeShowcaseDialogFormDataOnChange,
  ]);
  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={openShowcaseDialog}
        onClose={handleCloseShowcaseDialogOnClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="sm"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 5,
            py: 2,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="password-change-dialog-title" sx={{ fontSize: 24 }}>
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseShowcaseDialogOnClose}
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
          <Box sx={{ width: "100%", pl: 3 }}>
            {type === "inventory" && (
              <>
                {Boolean(inventoryData?.length) && (
                  <Grid container size={12} rowSpacing={2}>
                    {inventoryData?.map((inventoryItem, index) => {
                      return (
                        <React.Fragment key={`inv-${index}`}>
                          {/* DATE */}
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "20.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                width: "100%",
                                borderBottom: "2px solid #ccc",
                                marginBottom: "5px",
                              }}
                            >
                              Date : {inventoryItem?.date}
                            </Typography>
                          </Grid>
                          {inventoryItem?.items?.map((invItems, invIndex) => {
                            return (
                              <React.Fragment key={`InvItem-${invIndex}`}>
                                {/* INV NAME */}
                                <Grid size={3}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Product Name
                                  </Typography>
                                </Grid>
                                <Grid size={9}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        fontWeight: 600,
                                        marginRight: "5px",
                                      }}
                                    >
                                      :
                                    </Typography>
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        // fontWeight: 600,
                                      }}
                                    >
                                      {invItems?.productName}
                                    </Typography>
                                  </Typography>
                                </Grid>

                                {/* QUANTITY */}
                                <Grid size={3}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Quantity
                                  </Typography>
                                </Grid>
                                <Grid size={9}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        fontWeight: 600,
                                        marginRight: "5px",
                                      }}
                                    >
                                      :
                                    </Typography>
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        // fontWeight: 600,
                                      }}
                                    >
                                      {invItems?.quantity}
                                    </Typography>
                                  </Typography>
                                </Grid>
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
            {type === "food" && (
              <>
                {Boolean(foodData?.length) && (
                  <Grid container size={12} rowSpacing={2}>
                    {foodData?.map((foodDataItems, index) => {
                      return (
                        <React.Fragment key={`inv-${index}`}>
                          {/* DATE */}
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "20.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                width: "100%",
                                borderBottom: "2px solid #ccc",
                                marginBottom: "5px",
                              }}
                            >
                              Date : {foodDataItems?.date}
                            </Typography>
                          </Grid>
                          {foodDataItems?.items?.map((foodItem, foodIndex) => {
                            return (
                              <React.Fragment key={`foodItem-${foodIndex}`}>
                                {/* FOOD NAME */}
                                <Grid size={3}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Product Name
                                  </Typography>
                                </Grid>
                                <Grid size={9}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        fontWeight: 600,
                                        marginRight: "5px",
                                      }}
                                    >
                                      :
                                    </Typography>
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        // fontWeight: 600,
                                      }}
                                    >
                                      {foodItem?.foodName}
                                    </Typography>
                                  </Typography>
                                </Grid>

                                {/* FOOD PRICE */}
                                <Grid size={3}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Price
                                  </Typography>
                                </Grid>
                                <Grid size={9}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        fontWeight: 600,
                                        marginRight: "5px",
                                      }}
                                    >
                                      :
                                    </Typography>
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        // fontWeight: 600,
                                      }}
                                    >
                                      {foodItem?.price}
                                    </Typography>
                                  </Typography>
                                </Grid>

                                {/* QUANTITY */}
                                <Grid size={3}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Quantity
                                  </Typography>
                                </Grid>
                                <Grid size={9}>
                                  <Typography
                                    sx={{
                                      fontSize: "18px",
                                      // color: "#707070",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        fontWeight: 600,
                                        marginRight: "5px",
                                      }}
                                    >
                                      :
                                    </Typography>
                                    <Typography
                                      component="span"
                                      sx={{
                                        fontSize: "18px",
                                        // color: "#707070",
                                        // fontWeight: 600,
                                      }}
                                    >
                                      {foodItem?.quantity}
                                    </Typography>
                                  </Typography>
                                </Grid>
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}

            {type === "checkout" && (
              <>
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12} spacing={2}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Inventory Details :
                      </Typography>
                      <Box
                        sx={{
                          width: "100%",
                          maxHeight: "130px",
                          overflow: "auto",
                        }}
                      >
                        <CustomInventoryTable
                          inventoryData={
                            checkOutRoomData?.bookingDto?.extraItemsList || []
                          }
                        />
                      </Box>
                    </Grid>
                    <Grid size={12}>
                      <Grid container size={12} spacing={1}>
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "16.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Subtotal Expense
                          </Typography>
                        </Grid>
                        <Grid size={2.5}>
                          <Typography
                            sx={{
                              fontSize: "16.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "16.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "16.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {showcaseDialogFormData?.subTotalExpense}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid size={1.5}>
                          <Typography
                            sx={{
                              fontSize: "16.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Paid
                          </Typography>
                        </Grid>
                        <Grid size={4.5}>
                          <Typography
                            sx={{
                              fontSize: "16.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "16.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "16.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {showcaseDialogFormData?.subTotalAmountPaid}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid size={12}>
                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining > 0
                      ) && (
                        <Grid container size={12} spacing={2}>
                          <Grid size={6}>
                            <Box
                              sx={{
                                height: "100%",
                                position: "relative",
                                ".MuiTextField-root": {
                                  width: "100%",
                                  backgroundColor: "transparent",
                                  ".MuiInputBase-root": {
                                    color: "#B4B4B4",
                                    background: "rgba(255, 255, 255, 0.25)",
                                  },
                                },
                                // ".MuiFormLabel-root": {
                                //   color: (theme) => theme.palette.primary.main,
                                //   fontWeight: 600,
                                //   fontSize: 18,
                                // },
                                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                              }}
                            >
                              <Autocomplete
                                fullWidth
                                options={
                                  allPaymentMethods?.data?.map((item) => ({
                                    key: item,
                                    name: item.replace(/_/g, " "),
                                  })) || []
                                }
                                disableClearable
                                value={
                                  showcaseDialogFormData?.paymentMethod || null
                                }
                                onChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethod",
                                    newVal
                                  )
                                }
                                inputValue={
                                  showcaseDialogFormData?.paymentMethodInputValue ||
                                  ""
                                }
                                onInputChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethodInputValue",
                                    newVal
                                  )
                                }
                                getOptionLabel={(option) => option?.name}
                                clearOnEscape
                                disablePortal
                                popupIcon={
                                  <KeyboardArrowDownIcon color="primary" />
                                }
                                sx={{
                                  // width: 200,
                                  position: "absolute",
                                  bottom: 7,
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
                                size="small"
                                clearIcon={<ClearIcon color="primary" />}
                                PaperComponent={(props) => (
                                  <Paper
                                    sx={{
                                      background: "#fff",
                                      color: "#B4B4B4",
                                      // borderRadius: "10px",
                                    }}
                                    {...props}
                                  />
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Payment Method"
                                    variant="standard"
                                    // sx={{
                                    //   "& .MuiOutlinedInput-root": {
                                    //     borderRadius: 2,
                                    //   },
                                    // }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          {showcaseDialogFormData?.paymentMethod &&
                            !(
                              showcaseDialogFormData?.paymentMethod?.key ===
                              "Cash"
                            ) && (
                              <Grid size={6}>
                                <TextField
                                  margin="normal"
                                  required
                                  fullWidth
                                  id={`transactionReferenceNo`}
                                  label="Transaction ref. No."
                                  name="transactionReferenceNo"
                                  autoComplete="transactionReferenceNo"
                                  variant="standard"
                                  value={
                                    showcaseDialogFormData?.transactionReferenceNo ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleChangeShowcaseDialogFormDataOnChange(
                                      "transactionReferenceNo",
                                      e?.target?.value
                                    )
                                  }
                                />
                              </Grid>
                            )}

                          <Grid size={6}>
                            <TextField
                              margin="normal"
                              fullWidth
                              disabled={
                                !Boolean(showcaseDialogFormData?.paymentMethod)
                              }
                              id={`paidAmount`}
                              label="Amount"
                              name="paidAmount"
                              autoComplete="paidAmount"
                              variant="standard"
                              value={showcaseDialogFormData?.paidAmount || ""}
                              onChange={(e) =>
                                handleChangeShowcaseDialogFormDataOnChange(
                                  "paidAmount",
                                  e?.target?.value
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      )}

                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining === 0
                      ) && <Typography>Bills Are Cleared Till Now</Typography>}

                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining < 0
                      ) && (
                        <Typography>
                          An Amount Of {"911"} Has To Be Paid To Customer.
                        </Typography>
                      )}
                    </Grid>

                    {/* <Grid size={12}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id={`remarks`}
                        label="Remarks"
                        name="remarks"
                        autoComplete="remarks"
                        variant="standard"
                        value={showcaseDialogFormData?.remarks || ""}
                        onChange={(e) =>
                          handleChangeShowcaseDialogFormDataOnChange(
                            "remarks",
                            e?.target?.value
                          )
                        }
                      />
                    </Grid> */}
                    <Grid size={12}>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            backgroundImage:
                              "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                            color: "white",
                            "&:hover": {
                              backgroundImage:
                                "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                            },
                          }}
                          onClick={() => handleConfirmFinalCheckoutOnClick()}
                        >
                          Confirm Check-Out
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
      {/* <LoadingComponent open={changePasswordRes.isLoading} /> */}
    </React.Fragment>,
    document.getElementById("portal")
  );
});

const Dashboard = () => {
  const [roomFilters, setRoomFilters] = React.useState({
    roomStatus: null,
    searchKey: "",
    toDate: null,
    floor: null,
    floorInputVal: "",
    roomType: null,
    roomTypeInputVal: "",
    selectedRoomStatus: null,
  });
  console.log("roomFilters : ", roomFilters);
  const [saveCustomerCheckIn, saveCustomerCheckInRes] =
    useSaveCustomerCheckInMutation();
  const [cancelReservation, cancelReservtionRes] = useCancelHotelRoomMutation();
  const [requestRoomCheckout, requestRoomCheckoutRes] =
    useRequestRoomCheckoutMutation();
  const [finalRoomCheckOut, finalRoomCheckOutRes] =
    useFinalRoomCheckOutMutation();
  const [roomCleanRequest, roomCleanRequestRes] = useRoomCleanRequestMutation();
  const [roomListCacheBuster, setRoomListCacheBuster] = useState(false);
  const {
    data: apiTodayCheckoutRoomData = {
      data: [],
    },
    isFetching: isApiTodayCheckoutRoomDataFetching,
  } = useGetTodayCheckoutRoomsByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      cacheBuster: roomListCacheBuster,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId),
    }
  );
  console.log("apiTodayCheckoutRoomData : ", apiTodayCheckoutRoomData);

  const {
    data: apiRoomData = {
      data: {
        name: "",
        floorRoomMapData: [],
      },
    },
    // isLoading: isApiRoomDataLoading,
    // isSuccess: isApiRoomDataSuccess,
    isFetching: isApiRoomDataFetching,
  } = useGetAllRoomListByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      dateFilterKey:
        roomFilters?.toDate &&
        moment(roomFilters.toDate.$d).format("DD-MM-YYYY"),
      cacheBuster: roomListCacheBuster,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId),
    }
  );
  console.log("apiRoomData : ", apiRoomData);

  const {
    data: allGovtIdsData = { data: [] },
    isFetching: isAllGovtIdsDataFetching,
  } = useGetAllGovtIdsQuery();
  console.log("allGovtIdsData : ", allGovtIdsData);

  const {
    data: allPaymentMethods = { data: [] },
    isFetching: isAllPaymentMethodsFetching,
  } = useGetAllPaymentMethodsQuery();
  console.log("allPaymentMethods : ", allPaymentMethods);

  const {
    data: roomtypeByHotelIdData = {
      data: [],
    },
    isFetching: isRoomtypeByHotelIdDataFetching,
  } = useRoomtypeByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId),
    }
  );
  console.log("roomtypeByHotelIdData : ", roomtypeByHotelIdData);

  const floorOptions = React.useMemo(
    () =>
      apiRoomData.data.floorRoomMapData.map((item) => {
        return {
          floorNo: item?.floorNo,
          noOfRooms: item?.noOfRooms,
        };
      }),
    [apiRoomData.data.floorRoomMapData]
  );

  const initialShowcaseDialogData = useMemo(
    () => ({
      open: false,
      title: "",
      type: null,
      inventoryData: [],
      foodData: [],
    }),
    []
  );

  const initialCustomFormDrawerData = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      checkOutDate: null,
      noOfPeoples: null,
      bookingRefNumber: "",
      bookingMapDatas: [],
      paymentMethod: null,
      paymentMethodInputValue: "",
      transactionReferenceNo: "",
      paidAmount: "",
      remarks: "",
      cancelBookingReason: "",
    }),
    []
  );

  const initialShowcaseDialogFormData = useMemo(
    () => ({
      bookingRefNumber: "",
      subTotalExpense: 0,
      subTotalAmountPaid: 0,
      subTotalAmountRemaining: 0,
      paymentMethod: null,
      paymentMethodInputValue: "",
      transactionReferenceNo: "",
      paidAmount: "",
      remarks: "",
    }),
    []
  );

  // console.log("tempRoomData", tempRoomData);
  const [roomData, setRoomData] = useState([]);
  console.log("roomData : ", roomData);
  const [isSelectedRoom, setIsSelectedRoom] = useState(null);
  console.log("isSelectedRoom : ", isSelectedRoom);
  // const [isSelectedFloor, setIsSelectedFloor] = useState(null);
  // console.log("isSelectedFloor : ", isSelectedFloor);
  // const [isBookNowSelected, setIsBookNowSelected] = useState(false);
  const [customFormDrawerOpen, setCustomFormDrawerOpen] = useState({
    open: false,
    title: "",
    type: null,
  });

  console.log("customFormDrawerOpen : ", customFormDrawerOpen);
  const [customFormDrawerData, setCustomFormDrawerData] = useState(
    initialCustomFormDrawerData
  );

  console.log("customFormDrawerData : ", customFormDrawerData);
  const [showcaseDialogData, setShowcaseDialogData] = useState(
    initialShowcaseDialogData
  );
  console.log("showcaseDialogData : ", showcaseDialogData);
  const [showcaseDialogFormData, setShowcaseDialogFormData] = useState(
    initialShowcaseDialogFormData
  );
  console.log("showcaseDialogFormData : ", showcaseDialogFormData);

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  // const handleFloorSelect = useCallback((selectedFloor) => {
  //   setIsSelectedFloor(selectedFloor || null);
  // }, []);

  const handleChangeRoomListCacheBuster = useCallback(() => {
    setRoomListCacheBuster((prev) => !prev);
  }, []);
  const handleRoomSelect = useCallback((selectedRoom) => {
    setIsSelectedRoom((prevState) => {
      if (!selectedRoom || prevState?.id === selectedRoom?.id) {
        return null;
      }
      return selectedRoom;
    });
  }, []);

  const handleChangeRoomFilters = useCallback((name, value) => {
    console.log("handleChangeRoomFilters value : ", value);
    if (name === "floor") {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value,
        };
      });
    } else if (name === "selectedRoomStatus") {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value !== prevData?.selectedRoomStatus ? value : null,
        };
      });
    } else {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value,
        };
      });
    }
  }, []);

  const handleUpdateRoomDataByFloor = useCallback(
    (roomFilters) => {
      setRoomData(() => {
        return apiRoomData?.data?.floorRoomMapData?.filter((floor) => {
          const filteredFloors =
            roomFilters?.floor && !Boolean(roomFilters?.floor?.key)
              ? floor?.floorNo === roomFilters?.floor?.floorNo
              : true;

          console.log("filteredFloorsss : ", filteredFloors);
          return filteredFloors;
        });
      });
    },
    [apiRoomData?.data?.floorRoomMapData]
  );

  const handleOpenShowcaseModalForInventory = useCallback((inventoryData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Inventory",
      type: "inventory",
      inventoryData: inventoryData,
    }));
  }, []);

  const handleOpenShowcaseModalForFood = useCallback((foodData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Foods",
      type: "food",
      foodData: foodData,
    }));
  }, []);

  const handleOpenShowcaseModalForCheckout = useCallback(() => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Confirm Checkout",
      type: "checkout",
      inventoryData: [],
      foodData: [],
    }));
  }, []);

  const handleCloseShowcaseDialog = useCallback(() => {
    setShowcaseDialogData(initialShowcaseDialogData);
  }, [initialShowcaseDialogData]);

  const handleChangeCustomFormDrawerData = useCallback(
    (name, inputValue, subIndex) => {
      console.log(
        "handleChangeCustomFormDrawerData inputValue : ",
        name,
        inputValue,
        subIndex
      );

      if (name) {
        if (name === "noOfPeoples") {
          const numericRegex = /^[0-9]*$/;

          if (numericRegex.test(inputValue)) {
            // const modifiedInputValue =
            //   inputValue === "" ? "" : Number(inputValue);
            const modifiedInputValue = Math.min(
              inputValue === "" ? 0 : Number(inputValue),
              10 // Cap at 10 people
            );

            setCustomFormDrawerData((prevData) => {
              const currentLength = prevData.bookingMapDatas.length;

              let updatedBookingMapDatas = [...prevData.bookingMapDatas];
              if (modifiedInputValue > currentLength) {
                // Add only the required number of items lazily
                updatedBookingMapDatas.push(
                  ...Array.from(
                    { length: modifiedInputValue - currentLength },
                    () => ({
                      customerName: "",
                      govtIdType: null,
                      govtIdTypeInputValue: "",
                      govtIdNo: "",
                    })
                  )
                );
              } else if (modifiedInputValue < currentLength) {
                // Trim the array
                updatedBookingMapDatas = updatedBookingMapDatas.slice(
                  0,
                  modifiedInputValue
                );
              }

              return {
                ...prevData,
                noOfPeoples: modifiedInputValue,
                bookingMapDatas: updatedBookingMapDatas,
              };
            });
          }
        } else if (name === "customerName") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    return {
                      ...subItem,
                      customerName: inputValue,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "govtIdType") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    const shouldClearGovtId =
                      !inputValue ||
                      inputValue?.key !==
                        prevData?.bookingMapDatas[index]?.govtIdType?.key;
                    return {
                      ...subItem,
                      govtIdType: inputValue,
                      govtIdNo: shouldClearGovtId ? "" : subItem?.govtIdNo,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "govtIdTypeInputValue") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    return {
                      ...subItem,
                      govtIdTypeInputValue: inputValue,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "govtIdNo") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    return {
                      ...subItem,
                      govtIdNo: inputValue,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "paymentMethod") {
          setCustomFormDrawerData((prevData) => {
            const shouldClearPaymentAmount =
              !inputValue || inputValue?.key !== prevData?.paymentMethod?.key;
            return {
              ...prevData,
              paymentMethod: inputValue,
              paidAmount: shouldClearPaymentAmount ? "" : prevData?.paidAmount,
            };
          });
        } else if (name === "paymentMethodInputValue") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              paymentMethodInputValue: inputValue,
            };
          });
        } else if (name === "transactionReferenceNo") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              transactionReferenceNo: inputValue,
            };
          });
        } else if (name === "paidAmount") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              paidAmount: inputValue,
            };
          });
        } else if (name === "remarks") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              remarks: inputValue,
            };
          });
        } else if (name === "fullCheckIn") {
          if (inputValue) {
            setCustomFormDrawerData((prevData) => ({
              ...prevData,
              fromDate: inputValue?.bookingDto?.fromDate,
              toDate: inputValue?.bookingDto?.toDate,
              checkOutDate: inputValue?.bookingDto?.toDate
                ? dayjs(inputValue?.bookingDto?.toDate, "DD-MM-YYYY")
                : null,
              noOfPeoples: inputValue?.bookingDto?.noOfPeoples || 0,
              bookingRefNumber: inputValue?.bookingDto?.bookingRefNumber || "",
              bookingMapDatas: inputValue?.bookingDto?.noOfPeoples
                ? Array.from(
                    { length: inputValue?.bookingDto?.noOfPeoples },
                    () => ({
                      customerName: "",
                      govtIdType: null,
                      govtIdTypeInputValue: "",
                      govtIdNo: "",
                    })
                  )
                : [],
              paymentMethod: null,
              paymentMethodInputValue: "",
              transactionReferenceNo: "",
              paidAmount: "",
              remarks: "",
            }));
          }

          // else if (name === "clearUp") {
          //   setCustomFormDrawerData(initialCustomFormDrawerData);
          // } else {
          //   setCustomFormDrawerData((prevData) => ({
          //     ...prevData,
          //     [name]: inputValue,
          //   }));
          // }
        } else {
          setCustomFormDrawerData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setCustomFormDrawerData(initialCustomFormDrawerData);
      }
    },
    [initialCustomFormDrawerData]
  );

  const handleOpenCustomFormDrawer = useCallback(
    (open = false, title = "", type = "") => {
      setCustomFormDrawerOpen({
        open: open || false,
        title: title || "",
        type: type || null,
      });
      // handleChangeCustomFormDrawerData();
    },
    [
      // handleChangeCustomFormDrawerData
    ]
  );

  const handleChangeSelectedRoomForDayCheckout = useCallback(
    (checkOutRoomData) => {
      console.log(
        "handleChangeSelectedRoomForDayCheckout checkOutRoomData : ",
        checkOutRoomData
      );
      const flatMappedRoomData =
        apiRoomData?.data?.floorRoomMapData?.flatMap((item) =>
          Array.isArray(item?.roomDto) ? item.roomDto : []
        ) ?? [];

      console.log("flatMappedRoomData : ", flatMappedRoomData);
      const foundCheckoutRoom =
        flatMappedRoomData?.find(
          (item) =>
            item?.bookingDto?.bookingRefNumber &&
            item?.bookingDto?.bookingRefNumber ===
              checkOutRoomData?.bookingRefNumber
        ) || null;

      console.log("foundCheckoutRoom : ", foundCheckoutRoom);
      handleRoomSelect(foundCheckoutRoom);
      let targetedRoomCard = document.getElementById(
        `room-${foundCheckoutRoom?.roomNo}`
      );
      if (targetedRoomCard)
        targetedRoomCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    },
    [handleRoomSelect, apiRoomData]
  );

  const handleSubmitRoomCheckIn = useCallback(() => {
    if (!Boolean(customFormDrawerData?.noOfPeoples)) {
      setSnack({
        open: true,
        message: "Atleat 1 guest is required to Check-In",
        severity: "warning",
      });
      return;
    } else if (
      customFormDrawerData?.bookingMapDatas?.some(
        (item) =>
          !item?.customerName?.trim() ||
          !item?.govtIdType?.key ||
          !item?.govtIdNo?.trim()
      )
    ) {
      setSnack({
        open: true,
        message: "Guest Verification Details are required",
        severity: "warning",
      });
      return;
    } else if (!Boolean(customFormDrawerData?.remarks?.trim())) {
      setSnack({
        open: true,
        message: "Please add a remark",
        severity: "warning",
      });
      return;
    }

    const payload = {
      bookingRefNumber: customFormDrawerData?.bookingRefNumber || "",
      noOfPeoples: !Boolean(customFormDrawerData?.noOfPeoples)
        ? 0
        : Number(customFormDrawerData?.noOfPeoples),
      paidAmount: !Boolean(customFormDrawerData?.paidAmount)
        ? 0
        : Number(customFormDrawerData?.paidAmount),
      paymentMethod: customFormDrawerData?.paymentMethod?.key,
      transactionReferenceNo: customFormDrawerData?.transactionReferenceNo,
      remarks: customFormDrawerData?.remarks,
      checkOutDate: customFormDrawerData?.checkOutDate
        ? moment(customFormDrawerData?.checkOutDate.$d).format("DD-MM-YYYY")
        : null,
      bookingMapDatas: customFormDrawerData?.bookingMapDatas?.map((item) => {
        return {
          customerName: item?.customerName,
          govtIdType: item?.govtIdType?.key,
          govtIdNo: item?.govtIdNo,
        };
      }),
    };

    console.log("handleSubmitRoomCheckIn payload : ", payload);

    saveCustomerCheckIn(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res?.message || "Check-In Success",
          severity: "success",
        });
        handleOpenCustomFormDrawer();
        handleChangeCustomFormDrawerData();
        handleChangeRoomListCacheBuster();
        handleRoomSelect();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err?.data?.message || err?.data || "Check-In Failed",
          severity: "error",
        });
      });
  }, [
    customFormDrawerData,
    saveCustomerCheckIn,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleChangeRoomListCacheBuster,
    handleRoomSelect,
  ]);

  const handleSubmitRoomBookingCanelation = useCallback(() => {
    if (!Boolean(customFormDrawerData?.cancelBookingReason?.trim())) {
      setSnack({
        open: true,
        message: "Please give a valid Reason",
        severity: "warning",
      });
      return;
    }
    const payload = {
      bookingRefNumber: customFormDrawerData?.bookingRefNumber,
      rejectionReason: customFormDrawerData?.cancelBookingReason,
    };

    cancelReservation(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res?.message || "Check-In Success",
          severity: "success",
        });
        handleOpenCustomFormDrawer();
        handleChangeCustomFormDrawerData();
        handleChangeRoomListCacheBuster();
        handleRoomSelect();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err?.data?.message || err?.data || "Check-In Failed",
          severity: "error",
        });
      });
  }, [
    customFormDrawerData,
    cancelReservation,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleChangeRoomListCacheBuster,
    handleRoomSelect,
  ]);

  const handleRequestRoomCheckout = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          bookingRefNumber: isSelectedRoom?.bookingDto?.bookingRefNumber,
        };
        requestRoomCheckout(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res?.message || "Check-Out Request Success",
              severity: "success",
            });
            handleOpenCustomFormDrawer();
            handleChangeCustomFormDrawerData();
            handleChangeRoomListCacheBuster();
            handleRoomSelect();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message:
                err?.data?.message || err?.data || "Check-Out Request Failed",
              severity: "error",
            });
          });
      }
    });
  }, [
    requestRoomCheckout,
    isSelectedRoom,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleChangeRoomListCacheBuster,
    handleRoomSelect,
  ]);

  const handleChangeShowcaseDialogFormData = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "fullChange") {
          setShowcaseDialogFormData((prevData) => {
            const totalExpense = inputValue?.bookingDto?.transactionDetails
              ?.filter((item) => !Boolean(item?.isCredit))
              ?.reduce((sum, item) => sum + (item.amount || 0), 0);
            const totalAmountPaid = inputValue?.bookingDto?.transactionDetails
              ?.filter((item) => Boolean(item?.isCredit))
              ?.reduce((sum, item) => sum + (item.amount || 0), 0);

            const remainingAmount = totalExpense - totalAmountPaid;

            return {
              ...prevData,
              bookingRefNumber: inputValue?.bookingDto?.bookingRefNumber,
              subTotalExpense: totalExpense,
              subTotalAmountPaid: totalAmountPaid,
              subTotalAmountRemaining: remainingAmount,
              paymentMethod: null,
              paymentMethodInputValue: "",
              transactionReferenceNo: "",
              paidAmount: remainingAmount > 0 ? remainingAmount : 0,
              remarks: "",
            };
          });
        } else {
          setShowcaseDialogFormData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setShowcaseDialogFormData(initialShowcaseDialogFormData);
      }
    },
    [initialShowcaseDialogFormData]
  );

  const handleConfirmFinalCheckout = useCallback(() => {
    if (
      Boolean(showcaseDialogFormData?.subTotalAmountRemaining > 0) &&
      !showcaseDialogFormData?.paymentMethod?.key
    ) {
      setSnack({
        open: true,
        message: "Please Select A Payment Method",
        severity: "warning",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          bookingRefNumber: showcaseDialogFormData?.bookingRefNumber,
          paidAmount: showcaseDialogFormData?.paidAmount,
          paymentMethod: showcaseDialogFormData?.paymentMethod?.key,
        };
        finalRoomCheckOut(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res?.message || "Final Check-Out Success",
              severity: "success",
            });
            handleCloseShowcaseDialog();
            handleChangeShowcaseDialogFormData();
            handleChangeRoomListCacheBuster();
            handleRoomSelect();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message:
                err?.data?.message ||
                err?.data ||
                "Final Check-Out Request Failed",
              severity: "error",
            });
          });
      }
    });
  }, [
    finalRoomCheckOut,
    showcaseDialogFormData,
    handleCloseShowcaseDialog,
    handleChangeShowcaseDialogFormData,
    handleChangeRoomListCacheBuster,
    handleRoomSelect,
  ]);

  const handleRoomCleanRequest = useCallback(
    (roomId) => {
      Swal.fire({
        title: "Send Request For Room Cleaning?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            id: roomId,
            hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
          };
          roomCleanRequest(payload)
            .unwrap()
            .then((res) => {
              setSnack({
                open: true,
                message: res?.message || "Room Clean Request Success",
                severity: "success",
              });
              handleOpenCustomFormDrawer();
              handleChangeCustomFormDrawerData();
              handleChangeRoomListCacheBuster();
              handleRoomSelect();
            })
            .catch((err) => {
              setSnack({
                open: true,
                message:
                  err?.data?.message || err?.data || "Check-Out Request Failed",
                severity: "error",
              });
            });
        }
      });
    },
    [
      roomCleanRequest,
      handleOpenCustomFormDrawer,
      handleChangeCustomFormDrawerData,
      handleChangeRoomListCacheBuster,
      handleRoomSelect,
    ]
  );

  useEffect(() => {
    if (Boolean(apiRoomData?.data?.floorRoomMapData?.length)) {
      handleUpdateRoomDataByFloor(roomFilters);
    }
  }, [
    roomFilters,
    handleUpdateRoomDataByFloor,
    apiRoomData?.data?.floorRoomMapData,
  ]);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              // marginTop: "1rem",
            }}
          >
            <CustomRoomFilters
              roomFilters={roomFilters}
              handleChangeRoomFilters={handleChangeRoomFilters}
              floorData={[
                { id: 0, floorNumber: null, key: "all", name: "All Floors" },
                ...floorOptions,
              ]}
              roomTypes={roomtypeByHotelIdData?.data || []}
              roomData={roomData}
              handleOpenCustomFormDrawer={handleOpenCustomFormDrawer}
            />
          </Box>
          {/* <Box
            sx={{
              display: "flex",
              overflow: "auto",
              bgcolor: "#e2e6ff",
            }}
          >
            {floorData?.map((floorDetailsItem, index) => {
              return (
                <CustomFloorSelectSection
                  key={`Floor ${index}`}
                  floorDetails={floorDetailsItem}
                  isSelectedFloor={
                    isSelectedFloor?.floorNumber ===
                    floorDetailsItem?.floorNumber
                      ? true
                      : false
                  }
                  handleFloorSelect={handleFloorSelect}
                />
              );
            })}
          </Box> */}
        </Box>

        <Grid container size={12} columnSpacing={1.5} rowSpacing={2}>
          {/* ROOM LIST  */}

          <Grid size={{ md: 9, xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 220px)",
                  xl: "calc(100vh - 180px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <Grid container size={12} spacing={2}>
                {roomData?.map((floorDetailsItem, index) => {
                  return (
                    <Grid key={`Floor ${index}`} size={12}>
                      <CustomFloorAccordion
                        floorData={floorDetailsItem}
                        isSelectedRoom={isSelectedRoom}
                        handleRoomSelect={handleRoomSelect}
                        roomFilters={roomFilters}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>

          {/* EXTRA DETAILS COLUMN */}

          <Grid size={{ md: 3, xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 220px)",
                  xl: "calc(100vh - 180px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <Grid container size={12} spacing={1.5}>
                {/* <Grid size={12}>
                  <KeyAllocationCard keyAllocationData={tempKeyAlocationData} />
                </Grid> */}
                <Grid size={12}>
                  <DayCheckoutCard
                    dayCheckoutData={apiTodayCheckoutRoomData?.data}
                    handleChangeSelectedRoomForDayCheckout={
                      handleChangeSelectedRoomForDayCheckout
                    }
                  />
                </Grid>
                {isSelectedRoom && (
                  <Grid size={12}>
                    <RoomServiceCard
                      handleOpenShowcaseModalForInventory={
                        handleOpenShowcaseModalForInventory
                      }
                      handleOpenShowcaseModalForFood={
                        handleOpenShowcaseModalForFood
                      }
                      isSelectedRoom={isSelectedRoom}
                      handleOpenCustomFormDrawer={handleOpenCustomFormDrawer}
                      handleOpenShowcaseModalForCheckout={
                        handleOpenShowcaseModalForCheckout
                      }
                      handleRequestRoomCheckout={handleRequestRoomCheckout}
                      handleRoomCleanRequest={handleRoomCleanRequest}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <ShowcaseDialog
        openShowcaseDialog={showcaseDialogData?.open}
        title={showcaseDialogData?.title}
        type={showcaseDialogData?.type}
        inventoryData={showcaseDialogData?.inventoryData}
        foodData={showcaseDialogData?.foodData}
        checkOutRoomData={isSelectedRoom}
        handleCloseShowcaseDialog={handleCloseShowcaseDialog}
        showcaseDialogFormData={showcaseDialogFormData}
        allPaymentMethods={allPaymentMethods}
        handleChangeShowcaseDialogFormData={handleChangeShowcaseDialogFormData}
        handleConfirmFinalCheckout={handleConfirmFinalCheckout}
      />
      <CustomFormDrawer
        customDrawerOpen={customFormDrawerOpen?.open}
        title={customFormDrawerOpen?.title}
        type={customFormDrawerOpen?.type}
        handleToggleCustomFormDrawer={handleOpenCustomFormDrawer}
        customFormDrawerData={customFormDrawerData}
        handleChangeCustomFormDrawerData={handleChangeCustomFormDrawerData}
        isSelectedRoom={isSelectedRoom}
        allGovtIdsData={allGovtIdsData}
        allPaymentMethods={allPaymentMethods}
        handleSubmitRoomCheckIn={handleSubmitRoomCheckIn}
        handleSubmitRoomBookingCanelation={handleSubmitRoomBookingCanelation}
      />
      <LoadingComponent
        open={
          isApiRoomDataFetching ||
          saveCustomerCheckInRes?.isLoading ||
          cancelReservtionRes?.isLoading ||
          isApiTodayCheckoutRoomDataFetching ||
          requestRoomCheckoutRes?.isLoading ||
          finalRoomCheckOutRes?.isLoading ||
          roomCleanRequestRes?.isLoading ||
          isRoomtypeByHotelIdDataFetching ||
          isAllGovtIdsDataFetching ||
          isAllPaymentMethodsFetching ||
          false
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default Dashboard;
