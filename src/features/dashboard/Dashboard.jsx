import { Box, Paper, Typography } from "@mui/material";
import React, { memo, useCallback, useEffect, useState } from "react";
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

export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

const tempRoomData = Array.from({ length: 80 }, (_, i) => {
  const floor = Math.floor(i / 20) + 1;
  const roomIndex = (i % 20) + 1;
  const roomNumber = floor * 100 + roomIndex;

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
    id: i + 1,
    floor,
    roomNumber,
    roomStatus,
    roomStyle,
    occupier,
  };
});

const tempFloorData = Array.from({ length: 4 }, (_, index) => {
  return {
    id: index + 1,
    floorNumber: index + 1,
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
}) {
  const handleChangeRoomFiltersOnChange = useCallback(
    (name, value) => {
      handleChangeRoomFilters(name, value);
    },
    [handleChangeRoomFilters]
  );
  return (
    <Box
      sx={{
        marginTop: "1rem",
        width: "100%",
      }}
    >
      <Grid container size={12}>
        <Grid size={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={roomFilters?.toDate}
              onChange={(newVal) =>
                handleChangeRoomFiltersOnChange("toDate", newVal)
              }
              slotProps={{
                textField: { variant: "standard", readOnly: true },
              }}
              slots={{
                openPickerIcon: StyledCalendarIcon,
              }}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>
        </Grid>
        <Grid size={9}>
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
          >
            {tempRoomFilterVisibleButtonData?.map((item, index) => {
              return (
                <>
                  <Box
                    sx={{
                      minHeight: "40px",
                      display: "flex",
                      fontWeight: 600,
                      userSelect: "none",
                      paddingX: "10px",
                      whiteSpace: "nowrap",
                      borderLeft: "1px solid #A9A9A9",
                      gap: "5px",
                    }}
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
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: "column",
                      }}
                    >
                      <Typography sx={{ fontSize: "13.5px" }}>
                        {item?.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "19px",
                          fontWeight: 550,
                          lineHeight: 0.7,
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
                        {index + 1}1111
                      </Typography>
                    </Box>
                  </Box>
                </>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

const CustomFloorSelectSection = memo(function ({
  floorDetails,
  isSelectedFloor,
  handleFloorSelect,
}) {
  const handleFloorSelectOnClick = useCallback(
    (floorValue) => {
      handleFloorSelect(floorValue);
    },
    [handleFloorSelect]
  );
  return (
    <>
      {Boolean(floorDetails?.id) ? (
        <Box
          id={floorDetails?.id}
          sx={{
            minHeight: "40px",
            // maxHeight: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 600,
            backgroundColor: isSelectedFloor ? "#accdee" : "#e2e6ff",
            color: isSelectedFloor ? "#00459D" : "#000000",
            userSelect: "none",
            cursor: "pointer",
            paddingX: "15px",
            // borderRight: "2px solid #A9A9A9",
            whiteSpace: "nowrap",
            boxShadow: isSelectedFloor
              ? "inset 0 -3px 0 hsla(221, 100%, 56%, 0.99)"
              : "none",
          }}
          onClick={() => handleFloorSelectOnClick(floorDetails)}
        >
          {`Floor ${floorDetails?.floorNumber}`}
        </Box>
      ) : (
        <Box
          id={floorDetails?.id}
          sx={{
            minHeight: "40px",
            // maxHeight: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 600,
            backgroundColor: isSelectedFloor ? "#accdee" : "#e2e6ff",
            color: isSelectedFloor ? "#00459D" : "#000000",
            userSelect: "none",
            cursor: "pointer",
            paddingX: "15px",
            // borderRight: "2px solid #A9A9A9",
            whiteSpace: "nowrap",
            boxShadow: isSelectedFloor
              ? "inset 0 -3px 0 hsla(221, 100%, 56%, 0.99)"
              : "none",
          }}
          onClick={() => handleFloorSelectOnClick(floorDetails)}
        >
          {"All"}
        </Box>
      )}
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
            roomDetails?.roomStatus === AVAILABLE.key
              ? "hsla(202, 100%, 73%, 0.99)"
              : roomDetails?.roomStatus === RESERVED.key
              ? "hsla(32, 98%, 65%, 0.99)"
              : roomDetails?.roomStatus === OCCUPIED.key
              ? "hsla(140, 100%, 36%, 0.99)"
              : roomDetails?.roomStatus === NOT_AVAILABLE.key
              ? "hsla(0, 100%, 65%, 0.99)"
              : roomDetails?.roomStatus === BEING_SERVICED.key
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
          {roomDetails?.roomNumber}
        </Typography>
        <Typography sx={{ fontSize: "17px" }}>
          {roomDetails?.roomStyle}
        </Typography>
        <Typography sx={{ fontWeight: 550 }}>
          {roomDetails?.occupier}
        </Typography>
      </Box>
    </Paper>
  );
});

const Dashboard = () => {
  const [roomData, setRoomData] = useState([]);
  console.log("roomData : ", roomData);
  const [floorData, setFloorData] = useState([]);
  console.log("floorData : ", floorData);
  const [isSelectedRoom, setIsSelectedRoom] = useState(null);
  console.log("isSelectedRoom : ", isSelectedRoom);
  const [isSelectedFloor, setIsSelectedFloor] = useState(null);
  console.log("isSelectedFloor : ", isSelectedFloor);
  const [roomFilters, setRoomFilters] = React.useState({
    roomStatus: null,
    searchKey: "",
    toDate: null,
    roomStyle: null,
  });
  console.log("roomFilters : ", roomFilters);

  const handleFloorSelect = useCallback((selectedFloor) => {
    setIsSelectedFloor(selectedFloor || null);
  }, []);
  const handleRoomSelect = useCallback((selectedRoom) => {
    setIsSelectedRoom(selectedRoom || null);
  }, []);

  const handleChangeRoomFilters = useCallback((name, value) => {
    setRoomFilters((prevData) => {
      return {
        ...prevData,
        [name]: value || null,
      };
    });
  }, []);

  useEffect(() => {
    setFloorData([
      { id: 0, floorNumer: null, key: "allFloor" },
      ...tempFloorData,
    ]);
  }, []);
  useEffect(() => {
    if (Boolean(isSelectedFloor?.id)) {
      setRoomData(
        tempRoomData?.filter(
          (room) => room.floor === isSelectedFloor.floorNumber
        )
      );
    } else {
      setRoomData(tempRoomData);
    }
  }, [isSelectedFloor]);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          py: "10px",
          px: "5px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              marginTop: "1rem",
            }}
          >
            <CustomRoomFilters
              roomFilters={roomFilters}
              handleChangeRoomFilters={handleChangeRoomFilters}
            />
          </Box>
          <Box
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
          </Box>
        </Box>

        <Grid container size={12}>
          <Grid size={{ md: 8, xs: 12 }}>
            <Box sx={{ width: "100%" }}>
              <Grid container size={12} spacing={2}>
                {roomData?.map((roomDetailsItem, index) => {
                  return (
                    <Grid
                      key={`room ${index}`}
                      size={{ xs: 6, sm: 4, md: 3, xl: 2.4 }}
                    >
                      <CustomRoomCard
                        roomDetails={roomDetailsItem}
                        isSelectedRoom={
                          isSelectedRoom?.roomNumber ===
                          roomDetailsItem?.roomNumber
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
          </Grid>
          <Grid size={{ md: 4, xs: 12 }}></Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Dashboard;
