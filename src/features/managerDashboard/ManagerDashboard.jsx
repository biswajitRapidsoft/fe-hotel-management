import React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Button, Typography } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import { useGetAllDashboardDataForManagerQuery } from "../../services/managerDashboard";
import LoadingComponent from "../../components/LoadingComponent";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import BookingGroupedBarChart from "./BookingGroupedBarChart";

import { useNavigate } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData = {
      data: [],
    },
    isLoading,
  } = useGetAllDashboardDataForManagerQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId,
    {
      skip: !Boolean(JSON.parse(sessionStorage.getItem("data")).hotelId),
    }
  );
  console.log("dashboardData", dashboardData?.data);

  const chartData = React.useMemo(() => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const outSourcingData = months.map(
      (month) => dashboardData?.data?.outSourcingMap?.[month] || 0
    );

    const inSourcingData = months.map(
      (month) => dashboardData?.data?.inSourcingMap?.[month] || 0
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(75, 192, 192, 0.4)");
    gradient.addColorStop(1, "rgba(75, 192, 192, 0.1)");

    const redGradient = ctx.createLinearGradient(0, 0, 0, 400);
    redGradient.addColorStop(0, "rgba(255, 99, 132, 0.4)");
    redGradient.addColorStop(1, "rgba(255, 99, 132, 0.1)");
    return {
      labels: months,
      datasets: [
        {
          label: "InSourcing",
          data: outSourcingData,
          borderColor: "rgb(75, 192, 192)",
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
        },
        {
          label: "OutSourcing",
          data: inSourcingData,
          borderColor: "rgb(255, 99, 132)",
          fill: true,
          backgroundColor: redGradient,
          tension: 0.4,
        },
      ],
    };
  }, [dashboardData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },

    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    hover: {
      mode: "nearest",
      intersect: false,
    },
  };

  const gradientPercentages = React.useMemo(() => {
    const {
      noOfOccupiedRoomsCount = 0,
      noOfReservedRoomsCount = 0,
      noOfAvailableRoomsCount = 0,
      noOfNotReadyRoomsCount = 0,
    } = dashboardData?.data?.chartDto || {};

    const totalRooms =
      noOfOccupiedRoomsCount +
      noOfReservedRoomsCount +
      noOfAvailableRoomsCount +
      noOfNotReadyRoomsCount;

    if (totalRooms === 0) return "to right, #e3f1e7 0%, #e3f1e7 100%";

    const occupiedPercent = (noOfOccupiedRoomsCount / totalRooms) * 100;
    const reservedPercent =
      occupiedPercent + (noOfReservedRoomsCount / totalRooms) * 100;
    const availablePercent =
      reservedPercent + (noOfAvailableRoomsCount / totalRooms) * 100;
    const notReadyPercent = 100;

    return `to right, 
      #e3f1e7 0%, 
      #e3f1e7 ${occupiedPercent}%, 
      #FFFFCC ${occupiedPercent}%, 
      #FFFFCC ${reservedPercent}%, 
      #E4D00A ${reservedPercent}%, 
      #E4D00A ${availablePercent}%, 
      #8B8000 ${availablePercent}%, 
      #8B8000 ${notReadyPercent}%`;
  }, [dashboardData]);

  //   Occupied: #e3f1e7 (light green)
  // Reserved: #FFFFCC (pale yellow)
  // Available: #E4D00A (golden yellow)
  // Not Ready: #8B8000 (dark olive green)
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "1.6rem",
              fontWeight: "bold",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {JSON.parse(sessionStorage.getItem("data")).hotelName}
          </Typography>
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
            onClick={() => navigate("/inventoryManagement")}
          >
            Inventory Management
          </Button>
        </Box>
        <Grid container size={12} spacing={2}>
          <Grid size={{ xs: 3 }}>
            <Box
              sx={{
                boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                height: "130px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#e3f1e7",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#F0F8FF",
                    height: "2.7rem",
                    width: "2.7rem",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <EventAvailableIcon sx={{ color: "gray" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: "bold" }}>
                    New Booking
                  </Typography>
                  <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {dashboardData?.data?.chartDto?.noOfBookingRequestCount ||
                      0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Box
              sx={{
                boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                height: "130px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  // backgroundColor: "red",
                  // height: "150px",
                  // borderRadius: "14px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#F0F8FF",
                    height: "2.7rem",
                    width: "2.7rem",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <KingBedOutlinedIcon sx={{ color: "gray" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Available Room
                  </Typography>
                  <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {/* noOfAvailableRoomsCount */}
                    {dashboardData?.data?.chartDto?.noOfAvailableRoomsCount ||
                      0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Box
              sx={{
                boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                height: "130px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  // backgroundColor: "red",
                  // height: "150px",
                  // borderRadius: "14px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#F0F8FF",
                    height: "2.7rem",
                    width: "2.7rem",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ExitToAppOutlinedIcon sx={{ color: "gray" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: "bold" }}>Check In</Typography>
                  <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {dashboardData?.data?.chartDto?.noOfCheckedInCounts || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Box
              sx={{
                boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                height: "130px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  // backgroundColor: "red",
                  // height: "150px",
                  // borderRadius: "14px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#F0F8FF",
                    height: "2.7rem",
                    width: "2.7rem",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ExitToAppOutlinedIcon sx={{ color: "gray" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: "bold" }}>Check Out</Typography>
                  <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                    {dashboardData?.data?.chartDto?.noOfCheckedOutCounts || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          {/* <Grid size={{ xs: 4 }} /> */}
          <Grid size={{ xs: 4 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "300px",
                    boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    px: 1.3,
                    backgroundColor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      py: 1,
                      borderRadius: "14px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Times New Roman', Times, serif",
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                      }}
                    >
                      Room Availability
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      height: "5.9rem",
                      borderRadius: "7px",
                      // backgroundColor: "red",
                      mb: 1,
                      background: `linear-gradient(${gradientPercentages})`,
                    }}
                  ></Box>
                  <Box sx={{ height: "100%" }}>
                    <Grid
                      container
                      sx={{ height: "100%", width: "100%" }}
                      // spacing={2}
                    >
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ height: "70%", display: "flex" }}>
                          <Box
                            sx={{
                              height: "100%",
                              backgroundColor: "#e3f1e7",
                              width: "4%",
                              borderRadius: "2px",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              // alignItems: "center",
                              // backgroundColor: "yellow",
                              width: "100%",
                              px: 2,
                            }}
                          >
                            <Typography sx={{ color: "gray" }}>
                              Occupied
                            </Typography>
                            <Typography
                              sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                            >
                              {dashboardData?.data?.chartDto
                                ?.noOfOccupiedRoomsCount || 0}{" "}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ height: "70%", display: "flex" }}>
                          <Box
                            sx={{
                              height: "100%",
                              backgroundColor: "#FFFFCC",
                              width: "4%",
                              borderRadius: "2px",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              // alignItems: "center",
                              // backgroundColor: "yellow",
                              width: "100%",
                              px: 2,
                            }}
                          >
                            <Typography sx={{ color: "gray" }}>
                              Reserved
                            </Typography>
                            <Typography
                              sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                            >
                              {dashboardData?.data?.chartDto
                                ?.noOfReservedRoomsCount || 0}
                            </Typography>
                          </Box>
                        </Box>{" "}
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ height: "70%", display: "flex" }}>
                          <Box
                            sx={{
                              height: "100%",
                              backgroundColor: "#E4D00A",
                              width: "4%",
                              borderRadius: "2px",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              // alignItems: "center",
                              // backgroundColor: "yellow",
                              width: "100%",
                              px: 2,
                            }}
                          >
                            <Typography sx={{ color: "gray" }}>
                              Available
                            </Typography>
                            <Typography
                              sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                            >
                              {dashboardData?.data?.chartDto
                                ?.noOfAvailableRoomsCount || 0}{" "}
                            </Typography>
                          </Box>
                        </Box>{" "}
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{
                            height: "80%",
                            display: "flex",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              backgroundColor: "#8B8000",
                              width: "4%",
                              borderRadius: "2px",
                            }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              width: "100%",
                              px: 2,
                            }}
                          >
                            <Typography sx={{ color: "gray" }}>
                              Not Ready
                            </Typography>
                            <Typography
                              sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                            >
                              {dashboardData?.data?.chartDto
                                ?.noOfNotReadyRoomsCount || 0}
                            </Typography>
                          </Box>
                        </Box>{" "}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "300px",
                    boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    px: 1.3,
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      px: 2,
                      mb: 2,
                    }}
                  >
                    Weekly Booking Status
                  </Typography>
                  <Box sx={{ height: "100%", width: "100%", px: 2 }}>
                    <BookingGroupedBarChart
                      bookingData={dashboardData?.data?.bookingData || {}}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 8 }}>
            <Box
              sx={{
                width: "100%",
                height: "620px",
                // height: "300px",

                // height: "calc(100vh - 280px)",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                borderRadius: "14px",
                display: "flex",
                flexDirection: "column",
                px: 1.3,
                py: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: "bold",
                  fontSize: "1.3rem",
                  px: 2,
                  mb: 2,
                }}
              >
                Monthly Performance
              </Typography>
              <Box sx={{ height: "100%", width: "100%", px: 2 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <LoadingComponent open={isLoading} />
    </>
  );
};

export default ManagerDashboard;
