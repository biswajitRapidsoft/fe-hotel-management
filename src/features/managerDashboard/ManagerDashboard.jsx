import React from "react";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import KingBedOutlinedIcon from "@mui/icons-material/KingBedOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
const ManagerDashboard = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          Yellow star hotel
        </Typography>
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
                <EventAvailableIcon sx={{ color: "gray" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>New Booking</Typography>
                <Typography sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                  172
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
                  32
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
                  57
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
                  21
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        {/* <Grid size={{ xs: 4 }} /> */}
        <Grid size={{ xs: 3.4 }}>
          <Box
            sx={{
              width: "100%",
              height: "300px",
              boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              px: 1.3,
            }}
          >
            <Box
              sx={{
                width: "100%",
                py: 1,
                // backgroundColor: "yellow",
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
                background: `linear-gradient(
                                    to right, 
                                    #e3f1e7 0%, 
                                    #e3f1e7 60%, 
                                    blue 60%, 
                                    blue 80%, 
                                    green 80%, 
                                    green 95%, 
                                    yellow 95%, 
                                    yellow 100%
                                  )`,
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
                      <Typography sx={{ color: "gray" }}>Occupied</Typography>
                      <Typography
                        sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                      >
                        286
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ height: "70%", display: "flex" }}>
                    <Box
                      sx={{
                        height: "100%",
                        backgroundColor: "green",
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
                      <Typography sx={{ color: "gray" }}>Reserved</Typography>
                      <Typography
                        sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                      >
                        286
                      </Typography>
                    </Box>
                  </Box>{" "}
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ height: "70%", display: "flex" }}>
                    <Box
                      sx={{
                        height: "100%",
                        backgroundColor: "green",
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
                      <Typography sx={{ color: "gray" }}>Available</Typography>
                      <Typography
                        sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                      >
                        286
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
                        backgroundColor: "#b7b7b7",
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
                      <Typography sx={{ color: "gray" }}>Not Ready</Typography>
                      <Typography
                        sx={{ fontSize: "1.9rem", fontWeight: "bold" }}
                      >
                        286
                      </Typography>
                    </Box>
                  </Box>{" "}
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
