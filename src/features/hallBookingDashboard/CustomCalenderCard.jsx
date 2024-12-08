// import React, { useState } from "react";
// import { Box, IconButton, Typography, Grid, Button } from "@mui/material";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// function getDateColor(day) {
//   const currentDate = new Date();
//   if (currentDate.getMonth() !== 10) {
//     return {};
//   }

//   // November 1-2 green
//   if (day >= 1 && day <= 2) {
//     return {
//       color: "#fff",
//       backgroundColor: "#2e7d32",
//       "&:hover": {
//         backgroundColor: "#1b5e20",
//       },
//     };
//   }
//   // November 3-12 red
//   if (day >= 3 && day <= 12) {
//     return {
//       color: "#fff",
//       backgroundColor: "#c62828",
//       "&:hover": {
//         backgroundColor: "#b71c1c",
//       },
//     };
//   }
//   // November 13-25 green
//   if (day >= 13 && day <= 25) {
//     return {
//       color: "#fff",
//       backgroundColor: "#2e7d32",
//       "&:hover": {
//         backgroundColor: "#1b5e20",
//       },
//     };
//   }
//   return {};
// }

// const CustomCalenderCard = ({ onDateSelect }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());

//   const daysInMonth = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() + 1,
//     0
//   ).getDate();

//   const firstDayOfMonth = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     1
//   ).getDay();

//   const months = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   const handlePrevMonth = () => {
//     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
//   };

//   const handleNextMonth = () => {
//     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
//   };

//   const handleDateClick = (day) => {
//     const selectedDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth(),
//       day
//     );
//     onDateSelect?.(selectedDate);
//   };

//   return (
//     <Box sx={{ width: "100%" }}>
//       {/* Calendar Header */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <IconButton onClick={handlePrevMonth}>
//           <ChevronLeftIcon />
//         </IconButton>
//         <Typography variant="h7">
//           {`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
//         </Typography>
//         <IconButton onClick={handleNextMonth}>
//           <ChevronRightIcon />
//         </IconButton>
//       </Box>

//       {/* Week Days Header */}
//       <Grid container spacing={1}>
//         {weekDays.map((day) => (
//           <Grid item xs={12 / 7} key={day}>
//             <Typography
//               align="center"
//               sx={{
//                 color: "#898989",
//                 fontWeight: "medium",
//                 fontSize: "13px",
//               }}
//             >
//               {day}
//             </Typography>
//           </Grid>
//         ))}
//       </Grid>

//       {/* Calendar Days */}
//       <Grid container columnSpacing={0.6} rowSpacing={0.35}>
//         {[...Array(firstDayOfMonth)].map((_, index) => (
//           <Grid item xs={12 / 7} key={`calendar-date-${index}`}>
//             <Box sx={{ p: 1 }} />
//           </Grid>
//         ))}

//         {[...Array(daysInMonth)].map((_, index) => {
//           const day = index + 1;
//           const isToday =
//             day === new Date().getDate() &&
//             currentDate.getMonth() === new Date().getMonth() &&
//             currentDate.getFullYear() === new Date().getFullYear();

//           return (
//             <Grid item xs={12 / 7} key={day}>
//               <Button
//                 fullWidth
//                 onClick={() => handleDateClick(day)}
//                 sx={{
//                   minWidth: 0,
//                   minHeight: "unset",
//                   height: "27px",
//                   // px: 1,
//                   borderRadius: 1,
//                   ...getDateColor(day),
//                   ...(isToday &&
//                     !getDateColor(day).backgroundColor && {
//                       backgroundColor: "primary.main",
//                       color: "primary.contrastText",
//                       "&:hover": {
//                         backgroundColor: "primary.dark",
//                       },
//                     }),
//                   ...(!isToday &&
//                     !getDateColor(day).backgroundColor && {
//                       color: "text.primary",
//                       "&:hover": {
//                         backgroundColor: "action.hover",
//                       },
//                     }),
//                 }}
//               >
//                 {day}
//               </Button>
//             </Grid>
//           );
//         })}
//       </Grid>

//       {/* Legend */}
//       {/* <Box
//         sx={{
//           display: "flex",
//           gap: 2,
//           justifyContent: "center",
//           mt: 2,
//           alignItems: "center",
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//           <Box
//             sx={{
//               width: 12,
//               height: 12,
//               backgroundColor: "#2e7d32",
//               borderRadius: "50%",
//             }}
//           />
//           <Typography variant="caption">Data available</Typography>
//         </Box>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//           <Box
//             sx={{
//               width: 12,
//               height: 12,
//               backgroundColor: "#c62828",
//               borderRadius: "50%",
//             }}
//           />
//           <Typography variant="caption">No data available</Typography>
//         </Box>
//       </Box> */}
//     </Box>
//   );
// };

// export default CustomCalenderCard;
import React, { useState, useMemo, useCallback } from "react";
import { Box, IconButton, Typography, Grid, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";

const CustomCalenderCard = React.memo(({ onDateSelect, warnDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(
    () => dayjs(currentDate).daysInMonth(),
    [currentDate]
  );

  const firstDayOfMonth = useMemo(
    () => dayjs(currentDate).startOf("month").day(),
    [currentDate]
  );

  const months = useMemo(
    () => [
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
    ],
    []
  );

  const weekDays = useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    []
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => dayjs(prev).subtract(1, "month").toDate());
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => dayjs(prev).add(1, "month").toDate());
  }, []);

  const handleDateClick = useCallback(
    (day) => {
      const selectedDate = dayjs(currentDate).date(day).toDate();
      onDateSelect?.(selectedDate);
    },
    [currentDate, onDateSelect]
  );

  const currentMonthYear = useMemo(
    () => dayjs(currentDate).startOf("month"),
    [currentDate]
  );

  const getDateColor = useCallback(
    (day) => {
      const formattedDate = dayjs(currentMonthYear)
        .date(day)
        .format("YYYY-MM-DD");

      if (warnDates.includes(formattedDate)) {
        return {
          color: "#fff",
          backgroundColor: "#f57c00", // Warn color (orange)
          "&:hover": {
            backgroundColor: "#ef6c00",
          },
        };
      }
      return {};
    },
    [currentMonthYear, warnDates]
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Calendar Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h7">
          {`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Week Days Header */}
      <Grid container spacing={1}>
        {weekDays.map((day) => (
          <Grid item xs={12 / 7} key={day}>
            <Typography
              align="center"
              sx={{
                color: "#898989",
                fontWeight: "medium",
                fontSize: "13px",
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid container columnSpacing={0.6} rowSpacing={0.35}>
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <Grid item xs={12 / 7} key={`calendar-date-${index}`}>
            <Box sx={{ p: 1 }} />
          </Grid>
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const isToday = dayjs(currentDate).date(day).isSame(dayjs(), "day");

          return (
            <Grid item xs={12 / 7} key={day}>
              <Button
                fullWidth
                onClick={() => handleDateClick(day)}
                sx={{
                  minWidth: 0,
                  minHeight: "unset",
                  height: "27px",
                  borderRadius: 1,
                  ...getDateColor(day),
                  ...(isToday &&
                    !getDateColor(day).backgroundColor && {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }),
                  ...(!isToday &&
                    !getDateColor(day).backgroundColor && {
                      color: "text.primary",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }),
                }}
              >
                {day}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
});

export default CustomCalenderCard;
