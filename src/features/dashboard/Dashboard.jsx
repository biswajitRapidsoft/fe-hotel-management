import { Autocomplete, Box, Paper, TextField, Typography } from "@mui/material";
import React, { memo, useCallback, useEffect, useState } from "react";
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
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

const tempRoomData = Array.from({ length: 4 }, (_, floorIndex) => {
  const floorNumber = floorIndex + 1;
  const rooms = Array.from({ length: 20 }, (_, roomIndex) => {
    const roomNumber = floorNumber * 100 + roomIndex + 1;

    const roomStatus =
      roomNumber % 3 === 0
        ? "Reserved"
        : roomNumber % 5 === 0
        ? "Occupied"
        : roomNumber % 7 === 0
        ? "Not Available"
        : roomNumber % 11 === 0
        ? "Being Serviced"
        : roomNumber % 13 === 0
        ? "Available"
        : "Available";

    const roomStyle =
      roomNumber % 3 === 0
        ? "Standard"
        : roomNumber % 5 === 0
        ? "Delux"
        : roomNumber % 7 === 0
        ? "Business Suite"
        : roomNumber % 11 === 0
        ? "Family Suite"
        : roomNumber % 13 === 0
        ? "Delux"
        : "Delux";

    const occupier =
      roomNumber % 3 === 0
        ? "John Doe"
        : roomNumber % 5 === 0
        ? "Martis Louis"
        : "";

    return {
      id: floorIndex * 20 + roomIndex + 1, // Unique ID for each room
      roomNumber,
      roomStatus,
      roomStyle,
      occupier,
    };
  });

  return {
    floorId: floorNumber,
    floorNumber,
    rooms,
  };
});

console.log(tempRoomData);

// const tempFloorData = Array.from({ length: 4 }, (_, index) => {
//   return {
//     id: index + 1,
//     floorNumber: index + 1,
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

  console.log("tempRoomData", tempRoomData);
  const [roomData, setRoomData] = useState([]);
  console.log("roomData : ", roomData);
  const [isSelectedRoom, setIsSelectedRoom] = useState(null);
  console.log("isSelectedRoom : ", isSelectedRoom);
  // const [isSelectedFloor, setIsSelectedFloor] = useState(null);
  // console.log("isSelectedFloor : ", isSelectedFloor);

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

  useEffect(() => {
    handleUpdateRoomDataByFloor(roomFilters);
  }, [roomFilters, handleUpdateRoomDataByFloor]);
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

        <Grid container size={12}>
          <Grid size={{ md: 8, xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: "calc(100vh - 260px)",
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
          <Grid size={{ md: 4, xs: 12 }}></Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
