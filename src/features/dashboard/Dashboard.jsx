import {
  Autocomplete,
  Box,
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  AVAILABLE,
  BEING_SERVICED,
  BUSINESS_SUITE_ROOM,
  DELUXE_ROOM,
  FAMILY_SUITE_ROOM,
  KING_ROOM,
  NOT_AVAILABLE,
  OCCUPIED,
  RESERVED,
  STANDARD_ROOM,
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
import { useGetAllRoomListByHotelIdQuery } from "../../services/dashboard";
import { checkRoomStatusType } from "../../helper/helperFunctions";
import moment from "moment";
import { BootstrapDialog } from "../header/Header";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOM from "react-dom";

export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

// const tempRoomData = Array.from({ length: 4 }, (_, floorIndex) => {
//   const floorNumber = floorIndex + 1;
//   const rooms = Array.from({ length: 20 }, (_, roomIndex) => {
//     const roomNumber = floorNumber * 100 + roomIndex + 1;

//     const roomStatus =
//       roomNumber % 3 === 0
//         ? "Reserved"
//         : roomNumber % 5 === 0
//         ? "Occupied"
//         : roomNumber % 7 === 0
//         ? "Not Available"
//         : roomNumber % 11 === 0
//         ? "Being Serviced"
//         : roomNumber % 13 === 0
//         ? "Available"
//         : "Available";

//     const roomStyle =
//       roomNumber % 3 === 0
//         ? "Standard"
//         : roomNumber % 5 === 0
//         ? "Delux"
//         : roomNumber % 7 === 0
//         ? "Business Suite"
//         : roomNumber % 11 === 0
//         ? "Family Suite"
//         : roomNumber % 13 === 0
//         ? "Delux"
//         : "Delux";

//     const occupier =
//       roomNumber % 3 === 0
//         ? "John Doe"
//         : roomNumber % 5 === 0
//         ? "Martis Louis"
//         : "";

//     return {
//       id: floorIndex * 20 + roomIndex + 1, // Unique ID for each room
//       roomNumber,
//       roomStatus,
//       roomStyle,
//       occupier,
//     };
//   });

//   return {
//     floorId: floorNumber,
//     floorNumber,
//     rooms,
//   };
// });

// const tempFloorData = Array.from({ length: 4 }, (_, index) => {
//   return {
//     id: index + 1,
//     floorNumber: index + 1,
//   };
// });

const tempKeyAlocationData = Array.from({ length: 130 }, (_, index) => ({
  id: index + 1,
  roomNo: index + 1,
}));

const tempDayCheckoutData = Array.from({ length: 130 }, (_, index) => ({
  id: index + 1,
  roomNo: index + 1,
}));

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

const tempFoodData = Array.from({ length: 4 }, (_, index) => {
  return {
    id: index + 1,
    date: `${14 + index}th-Nov-2024`,
    items: [
      {
        foodName: "Coffee",
        price: 110.0,
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        foodName: "Pasta",
        price: 250.0,
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        foodName: "Kabab",
        price: 359.0,
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        foodName: "Fruit Salad",
        price: 190.0,
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
      {
        foodName: "Sweets",
        price: 120.0,
        quantity: Math.floor(Math.random() * (9 - 1 + 1)) + 1,
      },
    ],
  };
});

const tempRoomFilterVisibleButtonData = [
  { id: 6, icon: <BsFillBuildingFill />, name: "All" },
  { id: 2, icon: <PiBedFill />, name: AVAILABLE?.key },
  { id: 3, icon: <MdBookmarkAdded />, name: RESERVED?.key },
  { id: 4, icon: <TbBed />, name: OCCUPIED?.key },
  { id: 5, icon: <MdCleaningServices />, name: BEING_SERVICED?.key },
  { id: 6, icon: <MdOutlineDisabledByDefault />, name: NOT_AVAILABLE?.key },
];

const CustomRoomFilters = memo(function ({
  roomFilters,
  handleChangeRoomFilters,
  floorData,
  roomData,
}) {
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
        <Grid size={{ lg: 2 }}>
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
                width: 200,
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
        <Grid size={{ xs: 0, xl: 2 }} />
        <Grid size={{ xs: 12, xl: 6.5 }}>
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
                      fontSize: "35px",
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
                        fontSize: "19px",
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

// const CustomFloorSelectSection = memo(function ({
//   floorDetails,
//   isSelectedFloor,
//   handleFloorSelect,
// }) {
//   const handleFloorSelectOnClick = useCallback(
//     (floorValue) => {
//       handleFloorSelect(floorValue);
//     },
//     [handleFloorSelect]
//   );
//   return (
//     <>
//       {Boolean(floorDetails?.id) ? (
//         <Box
//           id={floorDetails?.id}
//           sx={{
//             minHeight: "40px",
//             // maxHeight: "60px",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             fontWeight: 600,
//             backgroundColor: isSelectedFloor ? "#accdee" : "#e2e6ff",
//             color: isSelectedFloor ? "#00459D" : "#000000",
//             userSelect: "none",
//             cursor: "pointer",
//             paddingX: "15px",
//             // borderRight: "2px solid #A9A9A9",
//             whiteSpace: "nowrap",
//             boxShadow: isSelectedFloor
//               ? "inset 0 -3px 0 hsla(221, 100%, 56%, 0.99)"
//               : "none",
//           }}
//           onClick={() => handleFloorSelectOnClick(floorDetails)}
//         >
//           {`Floor ${floorDetails?.floorNumber}`}
//         </Box>
//       ) : (
//         <Box
//           id={floorDetails?.id}
//           sx={{
//             minHeight: "40px",
//             // maxHeight: "60px",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             fontWeight: 600,
//             backgroundColor: isSelectedFloor ? "#accdee" : "#e2e6ff",
//             color: isSelectedFloor ? "#00459D" : "#000000",
//             userSelect: "none",
//             cursor: "pointer",
//             paddingX: "15px",
//             // borderRight: "2px solid #A9A9A9",
//             whiteSpace: "nowrap",
//             boxShadow: isSelectedFloor
//               ? "inset 0 -3px 0 hsla(221, 100%, 56%, 0.99)"
//               : "none",
//           }}
//           onClick={() => handleFloorSelectOnClick(floorDetails)}
//         >
//           {"All"}
//         </Box>
//       )}
//     </>
//   );
// });

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

                  const matchesRoomStyle = roomFilters?.roomStyle
                    ? room?.roomStyle === roomFilters?.roomStyle
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
                    matchesRoomStyle &&
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
      elevation={1}
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: 170,
        position: "relative",
        overflow: "hidden",
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
        <Typography sx={{ fontSize: "17px" }}>
          {[
            STANDARD_ROOM,
            DELUXE_ROOM,
            FAMILY_SUITE_ROOM,
            BUSINESS_SUITE_ROOM,
            KING_ROOM,
          ]?.find((type) => type?.key === roomDetails?.roomType?.type)?.key ||
            "NA"}
        </Typography>
        <Typography sx={{ fontWeight: 550 }}>
          {roomDetails?.occupier}
        </Typography>
      </Box>
    </Paper>
  );
});

const KeyAllocationCard = memo(function ({ keyAllocationData }) {
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
            {`Key Allocation`}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mt: 2, height: "100px", overflowY: "auto" }}>
          <Grid container size={12} rowSpacing={2}>
            {Boolean(keyAllocationData?.length) &&
              keyAllocationData?.map((keyItem, index) => {
                return (
                  <Grid key={`Key-${index}`} size={3}>
                    <Button variant="contained" size="small">
                      {keyItem?.roomNo}
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

const DayCheckoutCard = memo(function ({ dayCheckoutData }) {
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
            {`Checkout (Today)`}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", mt: 2, height: "100px", overflowY: "auto" }}>
          <Grid container size={12} rowSpacing={2}>
            {Boolean(dayCheckoutData?.length) &&
              dayCheckoutData?.map((dayCheckoutItem, index) => {
                return (
                  <Grid key={`Day-Checkout-${index}`} size={3}>
                    <Button variant="contained" size="small" color="error">
                      {dayCheckoutItem?.roomNo}
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
}) {
  const isRoomBooked = true;

  const flatMappedInventoryItems = tempInventoryData?.flatMap(
    (item) => item?.items
  );

  const displayedInventoryItems = flatMappedInventoryItems?.slice(0, 3);

  const remainingInventoryItemsCount =
    flatMappedInventoryItems?.length - displayedInventoryItems?.length || 0;

  const flatMappedFoodItems = tempFoodData?.flatMap((item) => item?.items);

  const displayedFoodItems = flatMappedFoodItems?.slice(0, 3);

  const remainingFoodItemsCount =
    flatMappedFoodItems?.length - displayedFoodItems?.length || 0;

  const handleOpenShowcaseModalForInventoryOnClick = useCallback(() => {
    handleOpenShowcaseModalForInventory(tempInventoryData);
  }, [handleOpenShowcaseModalForInventory]);

  const handleOpenShowcaseModalForFoodOnClick = useCallback(() => {
    handleOpenShowcaseModalForFood(tempFoodData);
  }, [handleOpenShowcaseModalForFood]);

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
            height: "330px",
          }}
        >
          {isRoomBooked ? (
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
                              Sanjay Singhania
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
                              Business Suite
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
                              12th-Nov-2024 12:34 PM
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
                              12th-Nov-2024 12:34 PM
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CHECK-IOUTDATE */}
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
                              12th-Nov-2024 12:34 PM
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
                              3
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
                        Food Details :
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
                                // color: "#707070",
                                // fontWeight: 600,
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
                </Box>
              </Box>
            </>
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </>
  );
});

const ShowcaseDialog = memo(function ({
  openShowcaseDialog,
  handleCloseShowcaseDialog,
  title = "",
  inventoryData = [],
  foodData = [],
}) {
  const handleCloseShowcaseDialogOnClose = useCallback(() => {
    handleCloseShowcaseDialog();
  }, [handleCloseShowcaseDialog]);
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
            py: 3,
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
    roomStyle: null,
    floor: null,
    floorInputVal: "",
    selectedRoomStatus: null,
  });
  console.log("roomFilters : ", roomFilters);
  const {
    data: apiRoomData = {
      data: {
        name: "",
        floorRoomMapData: [],
      },
    },
    // isLoading: isApiRoomDataLoading,
    // isSuccess: isApiRoomDataSuccess,
  } = useGetAllRoomListByHotelIdQuery(
    {
      hotelId: 2,
      dateFilterKey:
        roomFilters?.toDate &&
        moment(roomFilters.toDate.$d).format("YYYY-MM-DD"),
    },
    { refetchOnMountOrArgChange: true, skip: false }
  );
  console.log("apiRoomData : ", apiRoomData);

  // console.log("tempRoomData", tempRoomData);
  const [roomData, setRoomData] = useState([]);
  console.log("roomData : ", roomData);
  const [isSelectedRoom, setIsSelectedRoom] = useState(null);
  console.log("isSelectedRoom : ", isSelectedRoom);
  // const [isSelectedFloor, setIsSelectedFloor] = useState(null);
  // console.log("isSelectedFloor : ", isSelectedFloor);

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
      inventoryData: [],
      foodData: [],
    }),
    []
  );

  const [showcaseDialogData, setShowcaseDialogData] = useState(
    initialShowcaseDialogData
  );
  console.log("showcaseDialogData : ", showcaseDialogData);

  // const handleFloorSelect = useCallback((selectedFloor) => {
  //   setIsSelectedFloor(selectedFloor || null);
  // }, []);
  const handleRoomSelect = useCallback((selectedRoom) => {
    setIsSelectedRoom(selectedRoom || null);
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
        // ?.map((floor) => {
        //   const filteredRooms = floor?.roomDto?.filter((room) => {
        //     console.log("somya room : ", room);
        //     const matchesRoomStatus =
        //       roomFilters?.selectedRoomStatus &&
        //       !Boolean(roomFilters?.selectedRoomStatus === "All")
        //         ? checkRoomStatusType(room)?.key ===
        //           roomFilters?.selectedRoomStatus
        //         : true;

        //     const matchesRoomStyle = roomFilters?.roomStyle
        //       ? room?.roomStyle === roomFilters?.roomStyle
        //       : true;

        //     const matchesSearchKey = roomFilters?.searchKey
        //       ? room?.roomNumber
        //           ?.toString()
        //           ?.includes(roomFilters?.searchKey) ||
        //         room?.occupier
        //           ?.toLowerCase()
        //           ?.includes(roomFilters?.searchKey?.toLowerCase())
        //       : true;

        //     const matchesDate = roomFilters?.toDate
        //       ? new Date(room?.availableDate) <= new Date(roomFilters?.toDate)
        //       : true;

        //     return (
        //       matchesRoomStatus &&
        //       matchesRoomStyle &&
        //       matchesSearchKey &&
        //       matchesDate
        //     );
        //   });

        //   return {
        //     ...floor,
        //     roomDto: filteredRooms,
        //   };
        // })
        // ?.filter((floor) => floor?.roomDto?.length > 0); // Exclude floors with no matching rooms
      });
    },
    [apiRoomData?.data?.floorRoomMapData]
  );

  const handleOpenShowcaseModalForInventory = useCallback((inventoryData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Inventory",
      inventoryData: inventoryData,
    }));
  }, []);

  const handleOpenShowcaseModalForFood = useCallback((foodData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Foods",
      foodData: foodData,
    }));
  }, []);

  const handleCloseShowcaseDialog = useCallback(() => {
    setShowcaseDialogData(initialShowcaseDialogData);
  }, [initialShowcaseDialogData]);

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
              roomData={roomData}
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
                <Grid size={12}>
                  <KeyAllocationCard keyAllocationData={tempKeyAlocationData} />
                </Grid>
                <Grid size={12}>
                  <DayCheckoutCard dayCheckoutData={tempDayCheckoutData} />
                </Grid>
                <Grid size={12}>
                  <RoomServiceCard
                    handleOpenShowcaseModalForInventory={
                      handleOpenShowcaseModalForInventory
                    }
                    handleOpenShowcaseModalForFood={
                      handleOpenShowcaseModalForFood
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <ShowcaseDialog
        openShowcaseDialog={showcaseDialogData?.open}
        title={showcaseDialogData?.title}
        inventoryData={showcaseDialogData?.inventoryData}
        foodData={showcaseDialogData?.foodData}
        handleCloseShowcaseDialog={handleCloseShowcaseDialog}
      />
    </>
  );
};

export default Dashboard;
