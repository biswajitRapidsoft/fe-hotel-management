import { Box, Typography } from "@mui/material";
import React, { memo } from "react";
import Grid from "@mui/material/Grid2";
import Slider from "@mui/material/Slider";
import { useGetAllParkingDataQuery } from "../../services/parking";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { FaCarSide } from "react-icons/fa6";
// import { parkingDataArray } from "./parkingData";
// parent card

const CustomParentCard = memo(({ parkingDataArray }) => {
  return (
    <Box>
      <Grid container size={12} columnSpacing={4}>
        {parkingDataArray?.map((item, index) => {
          const occupiedPercentage =
            (item.noOfOccupiedSlots / item.noOfSlots) * 100;

          return (
            <>
              <Grid key={`parking${index}`} size={{ xs: 3 }}>
                <Box
                  sx={{
                    minHeight: "12rem",
                    boxShadow:
                      "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
                    borderRadius: "0.7rem",
                    backgroundColor: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    p: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#606470",
                        fontWeight: "bold",
                        letterSpacing: "0.75",
                      }}
                    >
                      {item?.areaName}
                    </Typography>
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <Slider
                      value={occupiedPercentage}
                      aria-label="Disabled slider"
                      sx={{
                        "& .MuiSlider-thumb": {
                          display: "none",
                        },
                        "& .MuiSlider-track": {
                          height: 8,
                        },
                        "& .MuiSlider-rail": {
                          height: 8,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Occupied</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfOccupiedSlots}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Available Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfAvailableSlots}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Total Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfSlots}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </>
          );
        })}
      </Grid>
    </Box>
  );
});

// parking slots

const CustomParkingSlots = memo(({ parkingDataArray }) => {
  return (
    <Box elevation={2} sx={{ p: 2, backgroundColor: "#fff" }}>
      <Grid container spacing={2}>
        {parkingDataArray?.map((parkingData) =>
          parkingData?.parkingSlotData?.map((slot, index) => (
            <Grid
              key={index}
              item
              xs={1}
              sm={1}
              lg={0.7}
              xl={0.7}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{
                  boxShadow:
                    "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
                  height: "4rem",
                  width: "100%",
                  borderRadius: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: slot.isOccupied ? "#E8F5E9" : "#FFF",
                }}
              >
                {slot.parkingVehicleData?.vehicleType === "Bick" ? (
                  <TwoWheelerIcon
                    style={{ fontSize: "2.4rem", color: "#00A9E0" }}
                  />
                ) : (
                  <FaCarSide style={{ fontSize: "2.4rem", color: "#280071" }} />
                )}
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
});

// parent parking
const Parking = () => {
  const {
    data: parkingData = {
      data: [],
    },
  } = useGetAllParkingDataQuery(
    JSON.parse(sessionStorage.getItem("data"))?.hotelId
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header Box */}
      <Box>
        <Typography
          sx={{
            fontFamily: "'Times New Roman', Times, serif",
            fontWeight: "bold",
            color: "#606470",
            fontSize: "1.6rem",
          }}
        >
          PARKING MAP
        </Typography>
      </Box>

      {/* cards */}
      <CustomParentCard parkingDataArray={parkingData?.data} />
      <CustomParkingSlots parkingDataArray={parkingData?.data} />
    </Box>
  );
};

export default Parking;
