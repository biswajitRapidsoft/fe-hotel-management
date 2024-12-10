// import React, { useState, useMemo, useCallback } from "react";
// import { Box, IconButton, Typography, Grid, Button } from "@mui/material";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import dayjs from "dayjs";

// const CustomCalenderCard = React.memo(({ onDateSelect, warnDates = [] }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());

//   const daysInMonth = useMemo(
//     () => dayjs(currentDate).daysInMonth(),
//     [currentDate]
//   );

//   const firstDayOfMonth = useMemo(
//     () => dayjs(currentDate).startOf("month").day(),
//     [currentDate]
//   );

//   const months = useMemo(
//     () => [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ],
//     []
//   );

//   const weekDays = useMemo(
//     () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
//     []
//   );

//   const handlePrevMonth = useCallback(() => {
//     setCurrentDate((prev) => dayjs(prev).subtract(1, "month").toDate());
//   }, []);

//   const handleNextMonth = useCallback(() => {
//     setCurrentDate((prev) => dayjs(prev).add(1, "month").toDate());
//   }, []);

//   const handleDateClick = useCallback(
//     (day) => {
//       const selectedDate = dayjs(currentDate).date(day).toDate();
//       onDateSelect?.(selectedDate);
//     },
//     [currentDate, onDateSelect]
//   );

//   const currentMonthYear = useMemo(
//     () => dayjs(currentDate).startOf("month"),
//     [currentDate]
//   );

//   const getDateColor = useCallback(
//     (day) => {
//       const formattedDate = dayjs(currentMonthYear)
//         .date(day)
//         .format("YYYY-MM-DD");

//       if (warnDates.includes(formattedDate)) {
//         return {
//           color: "#fff",
//           backgroundColor: "#f57c00", // Warn color (orange)
//           "&:hover": {
//             backgroundColor: "#ef6c00",
//           },
//         };
//       }
//       return {};
//     },
//     [currentMonthYear, warnDates]
//   );

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
//           const isToday = dayjs(currentDate).date(day).isSame(dayjs(), "day");

//           return (
//             <Grid item xs={12 / 7} key={day}>
//               <Button
//                 fullWidth
//                 onClick={() => handleDateClick(day)}
//                 sx={{
//                   minWidth: 0,
//                   minHeight: "unset",
//                   height: "27px",
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
//     </Box>
//   );
// });

// export default CustomCalenderCard;

import React, { useState, useMemo, useCallback, memo } from "react";
import { Box, IconButton, Typography, Grid, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";

const CustomDateButton = memo(function ({
  handleDateClick,
  day,
  getDateColor,
  isToday,
  isSelected,
}) {
  const handleDateClickOnClick = useCallback(
    (selectedDay) => {
      handleDateClick(selectedDay);
    },
    [handleDateClick]
  );

  const handleGetDateColorOnRender = useCallback(
    (selectedDay) => {
      return getDateColor(selectedDay);
    },
    [getDateColor]
  );

  return (
    <Grid item xs={12 / 7}>
      <Button
        fullWidth
        onClick={() => handleDateClickOnClick(day)}
        sx={{
          minWidth: 0,
          minHeight: "unset",
          height: "27px",
          borderRadius: 1,
          ...handleGetDateColorOnRender(day),
          ...(isToday &&
            !handleGetDateColorOnRender(day).backgroundColor && {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }),
          ...(!isToday &&
            !handleGetDateColorOnRender(day).backgroundColor && {
              color: "text.primary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }),
          ...(isSelected && {
            backgroundColor: "#0fb7ec", // Selected date color
            color: "#fff",
            "&:hover": {
              backgroundColor: "#0a98b5 !important", // Lighter hover color
            },
          }),
        }}
      >
        {day}
      </Button>
    </Grid>
  );
});

const CustomCalenderCard = React.memo(({ onDateSelect, warnDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // Track the selected date

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
      const newSelectedDate = dayjs(currentDate).date(day).toDate();

      // Toggle selection: If the same date is clicked again, unselect it
      if (selectedDate && dayjs(newSelectedDate).isSame(selectedDate, "day")) {
        setSelectedDate(null);
      } else {
        setSelectedDate(newSelectedDate);
      }

      // Optionally, notify the parent component (if required)
      onDateSelect?.(newSelectedDate);
    },
    [currentDate, selectedDate, onDateSelect]
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
          const isSelected =
            selectedDate &&
            dayjs(selectedDate).date(day).isSame(dayjs(selectedDate), "day");

          // return (
          //   <Grid item xs={12 / 7} key={day}>
          //     <Button
          //       fullWidth
          //       onClick={() => handleDateClick(day)}
          //       sx={{
          //         minWidth: 0,
          //         minHeight: "unset",
          //         height: "27px",
          //         borderRadius: 1,
          //         ...getDateColor(day),
          //         ...(isToday &&
          //           !getDateColor(day).backgroundColor && {
          //             backgroundColor: "primary.main",
          //             color: "primary.contrastText",
          //             "&:hover": {
          //               backgroundColor: "primary.dark",
          //             },
          //           }),
          //         ...(!isToday &&
          //           !getDateColor(day).backgroundColor && {
          //             color: "text.primary",
          //             "&:hover": {
          //               backgroundColor: "action.hover",
          //             },
          //           }),
          //         ...(isSelected && {
          //           backgroundColor: "#0fb7ec", // Selected date color
          //           color: "#fff",
          //           "&:hover": {
          //             backgroundColor: "#0a98b5 !important", // Lighter hover color
          //           },
          //         }),
          //       }}
          //     >
          //       {day}
          //     </Button>
          //   </Grid>
          // );

          return (
            <CustomDateButton
              key={`mini-date-button-${index}`}
              day={day}
              getDateColor={getDateColor}
              handleDateClick={handleDateClick}
              isToday={isToday ? true : false}
              isSelected={isSelected ? true : false}
            />
          );
        })}
      </Grid>
    </Box>
  );
});

export default CustomCalenderCard;
