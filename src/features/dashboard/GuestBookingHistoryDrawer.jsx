import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Divider, IconButton, Typography } from "@mui/material";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";

const GuestBookingHistoryDrawer = ({ open, setOpen, bookingDetails }) => {
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  // Function to get status color
  const getStatusColour = (status) => {
    switch (status) {
      case "Booked":
        return "orange";
      case "Checked_In":
        return "green";
      case "Checked_Out":
        return "blue";
      case "Cancelled":
        return "red";
      default:
        return "gray";
    }
  };
  const DrawerList = (
    <Box
      sx={{ width: 600, p: 2 }}
      role="presentation"
      // onClick={toggleDrawer(false)}
    >
      <Box
        sx={{
          // backgroundColor: "red",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            // backgroundColor: "yellow",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Booking History
          </Typography>
        </Box>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {bookingDetails && bookingDetails?.data?.length > 0 ? (
          bookingDetails?.data?.map((booking, index) => (
            <TimelineItem key={booking.id}>
              <TimelineSeparator>
                <TimelineDot />
                {index < bookingDetails.data.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Box
                  sx={{
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    height: "10rem",
                    p: 0.8,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      height: "100%",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ width: "40%", height: "100%" }}>
                      <img
                        src={
                          booking.roomType?.images?.[0] ||
                          "http://192.168.12.41:9000/download/1.jpg"
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                        alt="Room"
                      />
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Hotel Name :
                        </Typography>
                        <Typography>{booking.hotel?.name || "N/A"}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Person Name :
                        </Typography>
                        <Typography>
                          {`${booking.firstName || ""} ${
                            booking.middleName || ""
                          } ${booking.lastName || ""}`.trim()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Booking Date :
                        </Typography>
                        <Typography>
                          {booking?.bookedOn
                            ? moment(booking.bookedOn).format("DD/MM/YYYY")
                            : "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          No. of people:
                        </Typography>
                        <Typography>{booking.noOfPeoples || 0}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Status:
                        </Typography>
                        <Typography
                          sx={{
                            color: getStatusColour(booking.bookingStatus),
                            fontWeight: "bold",
                          }}
                        >
                          {booking.bookingStatus || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </TimelineContent>
            </TimelineItem>
          ))
        ) : (
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Typography>No booking history found</Typography>
          </Box>
        )}
      </Timeline>
    </Box>
  );

  return (
    <div>
      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default GuestBookingHistoryDrawer;
