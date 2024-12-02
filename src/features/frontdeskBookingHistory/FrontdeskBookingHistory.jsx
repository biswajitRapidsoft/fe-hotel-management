import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import Swal from "sweetalert2";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Paper,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ClearIcon from "@mui/icons-material/Clear";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import {
  useGetAllBookingStatusTypeQuery,
  useRoomBookingHistoryByHotelIdQuery,
  useConFirmBookingMutation,
  useGetRoomsByRoomTypeQuery,
} from "../../services/frontdeskBookingHistory";
import moment from "moment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
  useCancelHotelRoomMutation,
  useRoomtypeByHotelIdQuery,
} from "../../services/dashboard";
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const filterBookingRooms = (
  bookingRoomsTableData,
  bookingConfirmationFormData
) => {
  // console.log(
  //   "filterBookingRooms bookingRoomsTableData; ",
  //   bookingRoomsTableData
  // );
  // If no date filters are set, return all data
  if (!bookingConfirmationFormData?.from || !bookingConfirmationFormData?.to) {
    return bookingRoomsTableData;
  }

  // Convert date filters to Date objects for comparison
  const startDate = dayjs(bookingConfirmationFormData.from).startOf("day");
  const endDate = dayjs(bookingConfirmationFormData.to).startOf("day");

  console.log("filterBookingRooms startDate; ", startDate);

  return bookingRoomsTableData.filter((item) => {
    // If no bookingList, skip this item
    if (!item?.bookingList || item.bookingList.length === 0) {
      return false;
    }

    // Filter relevant bookings (Booked or Checked_In)
    const relevantBookings = item.bookingList.filter(
      (booking) =>
        booking.bookingStatus === "Booked" ||
        booking.bookingStatus === "Checked_In"
    );
    // console.log("filterBookingRooms relevantBookings; ", relevantBookings);

    // If no relevant bookings, skip this item
    if (relevantBookings.length === 0) {
      return false;
    }

    // Parse dates for each booking
    const bookingDates = relevantBookings.map((booking) => ({
      startDate: dayjs(
        booking.bookingStatus === "Booked"
          ? booking.fromDate
          : booking.checkInDate,
        "DD-MM-YYYY"
      ).startOf("day"),
      endDate: dayjs(
        booking.bookingStatus === "Booked"
          ? booking.toDate
          : booking.checkOutDate,
        "DD-MM-YYYY"
      ).startOf("day"),
    }));

    // console.log("filterBookingRooms bookingDates; ", bookingDates);

    // Sort booking dates by endDate
    bookingDates.sort((a, b) => a.endDate.diff(b.endDate));

    console.log("filterBookingRooms bookingDates; ", bookingDates);

    // Check if startDate is less than or equal to ANY endDate
    const isStartDateBeforeOrEqualAnyEndDate = bookingDates.some((date) =>
      startDate.isSameOrBefore(date.endDate)
    );

    // Check if startDate is greater than ALL endDates
    const isStartDateAfterAllEndDates = bookingDates.every((date) =>
      startDate.isSameOrAfter(date.endDate)
    );
    // const isStartDateAfterAllEndDates = startDate.isSameOrAfter(
    //   bookingDates[bookingDates.length - 1].endDate
    // );

    // console.log(
    //   "filterBookingRooms isStartDateBeforeOrEqualAnyEndDate & ; ",
    //   isStartDateBeforeOrEqualAnyEndDate,
    //   isStartDateAfterAllEndDates
    // );

    if (isStartDateAfterAllEndDates) {
      return true; // Include the item if startDate is after all booking end dates
    }

    if (isStartDateBeforeOrEqualAnyEndDate) {
      // Find the closest endDate where startDate is less than or equal
      const closestEndDateBooking = bookingDates.find((date) =>
        startDate.isSameOrBefore(date.endDate)
      );

      // console.log(
      //   "filterBookingRooms closestEndDateBooking ; ",
      //   closestEndDateBooking
      // );

      if (closestEndDateBooking) {
        // Find the next booking's start date after the closest end date
        const nextBookingStartDate = bookingDates
          .filter((date) =>
            date.startDate.isAfter(closestEndDateBooking.endDate)
          )
          .sort((a, b) => a.startDate.diff(b.startDate))[0]?.startDate;

        // console.log(
        //   "filterBookingRooms nextBookingStartDate ; ",
        //   nextBookingStartDate
        // );
        // Check if the next booking's start date exists and is greater than or equal to endDate
        if (
          nextBookingStartDate &&
          nextBookingStartDate.isSameOrAfter(endDate)
        ) {
          return true;
        }

        // Alternative check: look for a start date where endDate is less than or equal
        const compatibleStartDate = bookingDates.find((date) =>
          endDate.isSameOrBefore(date.startDate)
        );

        // console.log(
        //   "filterBookingRooms compatibleStartDate ; ",
        //   compatibleStartDate,
        //   !!compatibleStartDate
        // );

        return !!compatibleStartDate;
      }
    }

    return false;
  });
};

// function generateBookingHistoryResponse(totalRecords, rowsPerPage, pageNo) {
//   const startIndex = pageNo * rowsPerPage;
//   const endIndex = startIndex + rowsPerPage;

//   const totalPages = Math.ceil(totalRecords / rowsPerPage);

//   const data = Array.from({ length: totalRecords }, (_, i) => ({
//     roomTypeId: null,
//     firstName: `FirstName${i + 1}`,
//     middleName: `MiddleName${i + 1}`,
//     lastName: `LastName${i + 1}`,
//     phoneNumber: `900000000${i}`,
//     email: `user${i + 1}@example.com`,
//     address: `Address${i + 1}`,
//     fromDate: "27-11-2024",
//     toDate: "30-11-2024",
//     noOfPeoples: Math.floor(Math.random() * 5) + 1,
//     hotelId: null,
//     bookingStatus: [
//       "Pending_Confirmation",
//       "Booked",
//       "Checked_In",
//       "Checked_Out",
//       "Cancelled",
//     ][Math.floor(Math.random() * 5)],
//     bookedOn: new Date().toISOString(),
//     id: i + 1,
//     roomType: {
//       id: i + 1,
//       type: `RoomType${i + 1}`,
//       description: null,
//       capacity: Math.floor(Math.random() * 5) + 1,
//       basePrice: 5500 + i * 100,
//       images: [
//         `http://example.com/image${i + 1}-1.jpg`,
//         `http://example.com/image${i + 1}-2.jpg`,
//       ],
//       roomTypeData: null,
//       hotelId: null,
//       companyId: null,
//       hotelDto: null,
//       extraItemsList: null,
//       imageUrl: null,
//       isAdvanceRequired: true,
//       advanceAmount: 2000,
//       extraItem: null,
//     },
//     hotel: {
//       id: i + 2,
//       name: `Hotel${i + 1}`,
//       city: {
//         id: 800 + i,
//         name: `City${i + 1}`,
//         state: {
//           id: 20 + i,
//           name: `State${i + 1}`,
//         },
//       },
//       state: {
//         id: 20 + i,
//         name: `State${i + 1}`,
//       },
//       isActive: true,
//       createdAt: new Date().toISOString(),
//       createdBy: `User${i + 1}`,
//       address: `HotelAddress${i + 1}`,
//       noOfFloors: null,
//       floorRoomMapData: null,
//       company: null,
//       createdByUser: null,
//       logoUrl: null,
//       email: `hotel${i + 1}@example.com`,
//       contactNo: null,
//       contactNos: [`180037600${i}`, `98776000${i}`],
//     },
//     bookingAmount: null,
//     bookingRefNumber: `REF-2024-${i + 1}`,
//     rejectionReason: null,
//     bookingMapDatas: null,
//     checkOutDate: "29-11-2024",
//     paidAmount: null,
//     paymentMethod: null,
//     transactionReferenceNo: null,
//     remarks: null,
//     transactionDetails: null,
//     isCheckoutProceed: null,
//     isCheckedByKeepingStaff: null,
//     isRoomCleaningRequested: null,
//     roomDto: {
//       id: i + 1,
//       floorNo: Math.floor(Math.random() * 10) + 1,
//       roomNo: `Room${i + 1}`,
//       isActive: true,
//       isAvailable: Math.random() > 0.5,
//       roomType: {
//         id: i + 1,
//         type: `RoomType${i + 1}`,
//         description: null,
//         capacity: Math.floor(Math.random() * 5) + 1,
//         basePrice: 5500 + i * 100,
//         images: [
//           `http://example.com/image${i + 1}-1.jpg`,
//           `http://example.com/image${i + 1}-2.jpg`,
//         ],
//         roomTypeData: null,
//         hotelId: null,
//         companyId: null,
//         hotelDto: null,
//         extraItemsList: null,
//         imageUrl: null,
//         isAdvanceRequired: true,
//         advanceAmount: 2000,
//         extraItem: null,
//       },
//       createdAt: new Date().toISOString(),
//       createdBy: `Creator${i + 1}`,
//       createdUserName: `User${i + 1}`,
//       isBooked: true,
//       isServiceGoingOn: Math.random() > 0.5,
//       bookingDto: null,
//       isCheckoutProceed: null,
//       isCheckedByKeepingStaff: null,
//       isRoomCleaningRequested: Math.random() > 0.5,
//       serviceTypeStatus: null,
//       extraItemsList: null,
//       hotelId: null,
//       keyData: null,
//       bookingList: null,
//     },
//     isForCheckoutRequest: null,
//     extraItemsList: null,
//     checkInDate: "27-11-2024",
//     amountPaidVia: null,
//     isBookingForToday: null,
//     groupBookingList: null,
//     isBookingConfirmed: Math.random() > 0.5,
//     pageSize: rowsPerPage,
//   }));

//   console.log("generateBookingHistoryResponse inline data : ", data);

//   return {
//     responseCode: 200,
//     paginationData: {
//       totalPages,
//       numberOfElements: rowsPerPage,
//       totalElements: totalRecords,
//       data: data.slice(startIndex, endIndex),
//     },
//   };
// }

export const CustomHeader = memo(function ({
  backNavigate = false,
  headerText,
}) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      {backNavigate && (
        <FaArrowAltCircleLeft
          style={{
            color: "#164e80",
            marginRight: "5px",
            cursor: "pointer",
            fontSize: "20px",
          }}
          onClick={() => {
            navigate(-1);
          }}
        />
      )}
      <Typography
        variant="h5"
        display="inline-block"
        fontWeight="500"
        marginX="0"
      >
        {headerText}
      </Typography>
    </Box>
  );
});

const CustomBookingHistoryTableFIlters = memo(function ({
  bookingHistoryTableFilters,
  handleChangeBookingHistoryTableFilters,
  bookingStatuses,
}) {
  const handleChangeBookingHistoryTableFiltersOnChange = useCallback(
    (name, inputValue) => {
      handleChangeBookingHistoryTableFilters(name, inputValue);
    },
    [handleChangeBookingHistoryTableFilters]
  );
  return (
    <Box
      sx={{
        // marginTop: "1rem",
        width: "100%",
      }}
    >
      <Grid container size={12} spacing={1}>
        <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={bookingHistoryTableFilters?.fromDate}
              onChange={(newVal) =>
                handleChangeBookingHistoryTableFiltersOnChange(
                  "fromDate",
                  newVal
                )
              }
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  readOnly: true,
                  label: "From",
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

        <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={bookingHistoryTableFilters?.toDate}
              onChange={(newVal) =>
                handleChangeBookingHistoryTableFiltersOnChange("toDate", newVal)
              }
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  readOnly: true,
                  label: "To",
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
        <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
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
              options={
                bookingStatuses?.map((item) => ({
                  key: item,
                  name: item.replace(/_/g, " "),
                })) || []
              }
              fullWidth
              value={bookingHistoryTableFilters?.bookingStatus || null}
              onChange={(e, newVal) =>
                handleChangeBookingHistoryTableFiltersOnChange(
                  "bookingStatus",
                  newVal
                )
              }
              inputValue={bookingHistoryTableFilters?.bookingStatusInputVal}
              onInputChange={(e, newVal) =>
                handleChangeBookingHistoryTableFiltersOnChange(
                  "bookingStatusInputVal",
                  newVal
                )
              }
              getOptionLabel={(option) => option?.name}
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
                  label="Booking Status"
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
        <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            id="bookingRefNumber"
            label="Booking Ref. No."
            name="bookingRefNumber"
            variant="outlined"
            value={bookingHistoryTableFilters?.bookingRefNumber || ""}
            onChange={(e) =>
              handleChangeBookingHistoryTableFiltersOnChange(
                "bookingRefNumber",
                e?.target?.value
              )
            }
            sx={{
              bgcolor: "#F9F4FF",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

function calculateSerialNumber(index, pageNumber, rowsPerPage) {
  index = index ?? 0;
  pageNumber = pageNumber ?? 0;
  rowsPerPage = rowsPerPage ?? 10;

  index = Number(index);
  pageNumber = Number(pageNumber);
  rowsPerPage = Number(rowsPerPage);

  return pageNumber * rowsPerPage + index + 1;
}

const getCellValue = (obj, key, fallback = "") => {
  if (!key) return undefined;
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
      obj
    );
};

const CustomRow = memo(function ({
  tableHeaders,
  rowSerialNumber,
  row,
  handleChangeBookingConfirmation,
  handleOpenCustomBookingHistoryDrawer,
  handleChangeSelectedBookingHistory,
}) {
  const handleChangeBookingConfirmationOnConfirm = useCallback(
    (name, rowDate) => {
      handleChangeBookingConfirmation(name, rowDate);
    },
    [handleChangeBookingConfirmation]
  );

  const handleChangeSelectedBookingHistoryOnClick = useCallback(
    (rowData) => {
      handleChangeSelectedBookingHistory(rowData);
      handleOpenCustomBookingHistoryDrawer(
        true,
        "Check Availability",
        "confirmBooking"
      );
    },
    [handleChangeSelectedBookingHistory, handleOpenCustomBookingHistoryDrawer]
  );
  return (
    <TableRow
      hover
      key={row?.id}
      sx={{
        cursor: "pointer",
        height: 60,
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: "inherit",
        },
      }}
    >
      {tableHeaders?.map((subitem, subIndex) => {
        return (
          <TableCell key={`table-body-cell=${subIndex}`} align="center">
            <Typography sx={{ fontSize: "13px" }}>
              {subitem?.key === "sno" ? (
                <Typography sx={{ fontSize: "13px" }}>
                  {rowSerialNumber}
                </Typography>
              ) : subitem?.key === "guestName" ? (
                <Typography sx={{ fontSize: "13px" }}>
                  {[row?.firstName, row?.middleName, row?.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </Typography>
              ) : subitem?.key === "bookedOn" ? (
                <Typography sx={{ fontSize: "13px" }}>
                  {row?.bookedOn &&
                    moment(row?.bookedOn).format("DD-MM-YYYY hh:mm A")}
                </Typography>
              ) : subitem?.key === "bookingStatus" ? (
                // <Typography
                //   sx={{
                //     fontSize: "13px",
                //     border: "1px solid red",
                //     paddingX: "5px",
                //     paddingY: "3px",
                //     borderRadius: "7px",
                //     whiteSpace: "none",
                //   }}
                // >
                <Box
                  sx={{
                    color: getBookingStatusColor(row?.bookingStatus)?.color,
                    backgroundColor: getBookingStatusColor(row?.bookingStatus)
                      ?.bgcolor,
                    fontWeight: "600",
                    border: `0.5px solid ${
                      getBookingStatusColor(row?.bookingStatus)?.color
                    }`,
                    py: 0.7,
                    textAlign: "center",
                    width: "178px",
                    borderRadius: 2,
                  }}
                >
                  {row?.bookingStatus?.replace(/_/g, " ")}
                </Box>
              ) : // </Typography>
              subitem?.key === "bookingAction" ? (
                <>
                  {row?.bookingStatus === "Pending_Confirmation" && (
                    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                      <Button
                        variant="outlined"
                        // color="success"
                        sx={{ minWidth: "unset", width: "11px" }}
                        // onClick={() =>
                        //   handleChangeBookingConfirmationOnConfirm(
                        //     "confirmBooking",
                        //     row
                        //   )
                        // }

                        onClick={() =>
                          handleChangeSelectedBookingHistoryOnClick(row)
                        }
                      >
                        <EventAvailableIcon
                          sx={{ fontSize: "14px", fontWeight: 600 }}
                        />
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ minWidth: "unset", width: "11px" }}
                        onClick={() =>
                          handleChangeBookingConfirmationOnConfirm(
                            "cancelBooking",
                            row
                          )
                        }
                      >
                        <CloseIcon sx={{ fontSize: "14px", fontWeight: 600 }} />
                      </Button>
                    </Box>
                  )}
                </>
              ) : (
                <Typography sx={{ fontSize: "13px" }}>
                  {getCellValue(row, subitem?.key)}
                </Typography>
              )}
            </Typography>
          </TableCell>
        );
      })}
    </TableRow>
  );
});

const CustomBookingHistoryTableContainer = memo(function ({
  tableHeaders,
  tableData,
  pageNo,
  pageSize,
  handlePageChange,
  handleChangeRowsPerPage,
  handleChangeBookingConfirmation,
  handleChangeSelectedBookingHistory,
  handleOpenCustomBookingHistoryDrawer,
}) {
  console.log("CustomBookingHistoryTableContainer tableData : ", tableData);
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: "calc(100vh - 310px)",
            xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {
              // height: "14px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#ffffff00",
              width: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#280071",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3b0b92",
            },
          },
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {tableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      paddingY: item?.key === "sno" ? "15px" : "auto",

                      fontSize: "14px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(tableData?.data?.length > 0) ? (
              tableData?.data?.map((row, index) => (
                <CustomRow
                  tableHeaders={tableHeaders}
                  rowSerialNumber={calculateSerialNumber(
                    index,
                    pageNo,
                    pageSize
                  )}
                  key={row.id}
                  row={row}
                  handleChangeBookingConfirmation={
                    handleChangeBookingConfirmation
                  }
                  handleChangeSelectedBookingHistory={
                    handleChangeSelectedBookingHistory
                  }
                  handleOpenCustomBookingHistoryDrawer={
                    handleOpenCustomBookingHistoryDrawer
                  }
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(tableHeaders?.length) ? tableHeaders?.length : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={tableData?.totalElements || 0}
        rowsPerPage={pageSize}
        page={pageNo}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleChangeRowsPerPage}
        // rowsPerPageOptions={[5, 10, 20, 50, 100]}
      />
    </React.Fragment>
  );
});

const CustomParentCollapseTableRow = memo(function ({
  bookingRoomsTableHeaders,
  rowSerialNumber,
  bookingRoomsChildTableHeaders,
  key,
  row,
  handleChangeBookingConfirmationFormData,
}) {
  const [openCollapseTable, setOpenCollapseTable] = useState(false);

  const handleChangeOpenCollapseTable = useCallback(() => {
    setOpenCollapseTable((prev) => !prev);
  }, []);

  const handleChangeBookingConfirmationFormDataOnRowClick = useCallback(
    (name, value) => {
      handleChangeBookingConfirmationFormData(name, value);
    },
    [handleChangeBookingConfirmationFormData]
  );

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 35,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
        onClick={() =>
          handleChangeBookingConfirmationFormDataOnRowClick("selectedRoom", row)
        }
      >
        {bookingRoomsTableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell key={`table-body-cell=${subIndex}`} align="center">
              <Typography sx={{ fontSize: "13px" }}>
                {subitem?.key === "sno" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "roomAction" ? (
                  // <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <IconButton
                    sx={{
                      width: "20px",
                      height: "20px",
                      transition: "transform 0.3s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeOpenCollapseTable();
                    }}
                  >
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        transform: openCollapseTable
                          ? "rotate(180deg)" // Rotated when true
                          : "rotate(0deg)", // Default position when false
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                ) : (
                  // </Box>
                  <Typography sx={{ fontSize: "13px" }}>
                    {getCellValue(row, subitem?.key)}
                  </Typography>
                )}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{
            paddingBottom: 0,
            paddingTop: 0,
            padding: "0 !important",
          }}
          colSpan={
            Boolean(bookingRoomsTableHeaders?.length)
              ? bookingRoomsTableHeaders?.length
              : 1
          }
        >
          <Collapse in={openCollapseTable} timeout="auto">
            <Box
              sx={{
                marginY: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 2,
                flexWrap: "wrap",
                paddingRight: "5px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "11px",
                      height: "11px",
                      borderRadius: "50%",
                      backgroundColor: `#cd5000`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      fontWeight: "550",
                    }}
                  >
                    Reservation
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "11px",
                      height: "11px",
                      borderRadius: "50%",
                      backgroundColor: `#01a837`,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      fontWeight: "550",
                    }}
                  >
                    Occupied
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Table size="small" aria-label="bookedGuests">
              <TableHead>
                <TableRow>
                  {bookingRoomsChildTableHeaders?.map((item, index) => {
                    return (
                      <TableCell
                        key={`child-table-head-${index}`}
                        align="center"
                        sx={{
                          color: "white",
                          backgroundColor: "#454545",
                          fontWeight: "bold",
                          // paddingY: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {item?.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Boolean(row?.bookingList?.length) ? (
                  row?.bookingList?.map((childItem, childIndex) => (
                    <TableRow
                      key={`child-row-${childIndex}`}
                      sx={{
                        bgcolor:
                          childItem?.bookingStatus === "Booked"
                            ? "#ffe3d1"
                            : childItem?.bookingStatus === "Checked_In" &&
                              "#c7ffd9",
                      }}
                    >
                      {bookingRoomsChildTableHeaders?.map(
                        (subHeaderitem, subIndex) => {
                          return (
                            <TableCell
                              key={`table-body-cell=${subIndex}`}
                              align="center"
                            >
                              <Typography sx={{ fontSize: "13px" }}>
                                {subHeaderitem?.key === "sno" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childIndex + 1}
                                  </Typography>
                                ) : subHeaderitem?.key === "guestName" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {[
                                      childItem?.firstName,
                                      childItem?.middleName,
                                      childItem?.lastName,
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                  </Typography>
                                ) : subHeaderitem?.key === "from" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childItem?.bookingStatus === "Booked"
                                      ? childItem?.fromDate
                                      : childItem?.bookingStatus ===
                                          "Checked_In" &&
                                        childItem?.checkInDate}
                                  </Typography>
                                ) : subHeaderitem?.key === "to" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childItem?.bookingStatus === "Booked"
                                      ? childItem?.toDate
                                      : childItem?.bookingStatus ===
                                          "Checked_In" &&
                                        childItem?.checkOutDate}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {getCellValue(row, childItem?.key)}
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={
                        Boolean(bookingRoomsChildTableHeaders?.length)
                          ? bookingRoomsChildTableHeaders?.length
                          : 1
                      }
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const CustomAvailableRoomsTableContainer = memo(function ({
  bookingRoomsTableHeaders,
  bookingRoomsTableData,
  bookingRoomsChildTableHeaders,
  handleChangeBookingConfirmationFormData,
}) {
  console.log(
    "CustomBookingHistoryTableContainer bookingRoomsTableData : ",
    bookingRoomsTableData
  );
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: "310px",
            // xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {
              // height: "14px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#ffffff00",
              width: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#280071",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3b0b92",
            },
          },
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {bookingRoomsTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      paddingY: "10px",
                      fontSize: "14px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(bookingRoomsTableData?.length > 0) ? (
              bookingRoomsTableData?.map((row, index) => (
                <CustomParentCollapseTableRow
                  bookingRoomsTableHeaders={bookingRoomsTableHeaders}
                  rowSerialNumber={index + 1}
                  bookingRoomsChildTableHeaders={bookingRoomsChildTableHeaders}
                  key={row.id}
                  row={row}
                  handleChangeBookingConfirmationFormData={
                    handleChangeBookingConfirmationFormData
                  }
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(bookingRoomsTableHeaders?.length)
                      ? bookingRoomsTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

function getBookingStatusColor(key) {
  switch (key) {
    case "Pending_Confirmation":
      return { color: "#cd5000", bgcolor: "#ffe3d1" };
    case "Booked":
      return { color: "#0068b7", bgcolor: "#d3ecff" };
    case "Checked_In":
      return { color: "#01a837", bgcolor: "#c7ffd9" };
    case "Checked_Out":
      return { color: "#6101a8", bgcolor: "#f0ddff" };
    case "Cancelled":
      return { color: "#c60000", bgcolor: "#ffd6d6" };
    default:
      return { color: "inherit", bgcolor: "inherit" };
  }
}

const CustomBookingHistoryDrawer = memo(function ({
  customDrawerOpen,
  title,
  type,
  handleToggleCustomFormDrawer,
  bookingConfirmationFormData,
  handleChangeSelectedBookingHistory,
  roomtypeByHotelIdForBookingHistoryData,
  handleChangeBookingConfirmationFormData,
  selectedBookingHistory,
  bookingRoomsTableHeaders,
  bookingRoomsChildTableHeaders,
  bookingRoomsTableData,
  handleChangeBookingConfirmation,
}) {
  console.log("CustomFormDrawer customDrawerOpen : ", customDrawerOpen, type);
  const handleToggleCustomFormDrawerOnChange = useCallback(() => {
    handleToggleCustomFormDrawer();
    handleChangeSelectedBookingHistory();
  }, [handleToggleCustomFormDrawer, handleChangeSelectedBookingHistory]);

  const handleChangeBookingConfirmationFormDataOnChange = useCallback(
    (name, value) => {
      handleChangeBookingConfirmationFormData(name, value);
    },
    [handleChangeBookingConfirmationFormData]
  );

  const handleChangeBookingConfirmationOnClick = useCallback(
    (name, roomId) => {
      handleChangeBookingConfirmation(name, roomId);
    },
    [handleChangeBookingConfirmation]
  );

  useEffect(() => {
    if (customDrawerOpen && selectedBookingHistory) {
      handleChangeBookingConfirmationFormDataOnChange(
        "fullCheck",
        selectedBookingHistory
      );
    }
  }, [
    handleChangeBookingConfirmationFormDataOnChange,
    customDrawerOpen,
    selectedBookingHistory,
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
            px: 1.5,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 550, fontSize: "1.25em", mt: 0.8 }}>
            {title}
          </Typography>
          <IconButton onClick={() => handleToggleCustomFormDrawerOnChange()}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* <Divider /> */}
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ px: 2 }}>
          {type === "confirmBooking" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Box sx={{ width: "100%", marginY: "2px" }}>
                  <Grid container size={12} spacing={1}>
                    <Grid size={4}>
                      <Typography
                        sx={{
                          fontSize: "15px",
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
                          fontSize: "15px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "15px",
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
                            fontSize: "15px",
                            // color: "#707070",
                            // fontWeight: 600,
                          }}
                        >
                          {selectedBookingHistory?.bookingRefNumber || ""}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid size={12}>
                <Grid container size={12} spacing={1}>
                  <Grid size={5.5}>
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
                        ".MuiFormLabel-root": {
                          color: (theme) => theme.palette.primary.main,
                          fontWeight: 600,
                          fontSize: 15,
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
                        options={roomtypeByHotelIdForBookingHistoryData || []}
                        disableClearable
                        fullWidth
                        value={bookingConfirmationFormData?.roomType || null}
                        onChange={(e, newVal) =>
                          handleChangeBookingConfirmationFormDataOnChange(
                            "roomType",
                            newVal
                          )
                        }
                        inputValue={
                          bookingConfirmationFormData.roomTypeInputVal
                        }
                        onInputChange={(e, newVal) =>
                          handleChangeBookingConfirmationFormDataOnChange(
                            "roomTypeInputVal",
                            newVal
                          )
                        }
                        getOptionLabel={(option) =>
                          option?.type
                            ?.replace(/_/g, " ")
                            ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                            ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
                          ""
                        }
                        clearOnEscape
                        disablePortal
                        popupIcon={<KeyboardArrowDownIcon color="primary" />}
                        sx={{
                          // width: 200,
                          // position: "absolute",
                          // bottom: 7,
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
                            label="Room Type"
                            variant="standard"
                            sx={{
                              // "& .MuiOutlinedInput-root": {
                              //   borderRadius: 2,
                              // },
                              "& input": {
                                fontSize: "13px", // Date font size
                              },
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={3.25}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disablePast
                          value={bookingConfirmationFormData?.from}
                          onChange={(newVal) =>
                            handleChangeBookingConfirmationFormDataOnChange(
                              "from",
                              newVal
                            )
                          }
                          slotProps={{
                            textField: {
                              variant: "standard",
                              size: "small",
                              readOnly: true,
                              label: "From",
                              sx: {
                                position: "absolute",
                                bottom: 0,
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
                                  // color: (theme) => theme.palette.primary.main,
                                  // fontWeight: 600,
                                  fontSize: 15,
                                  mt: 0.5,
                                },
                                "& input": {
                                  fontSize: "13px", // Date font size
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
                    </Box>
                  </Grid>
                  <Grid size={3.25}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disabled={!bookingConfirmationFormData?.from}
                          disablePast={!bookingConfirmationFormData?.from}
                          shouldDisableDate={(date) => {
                            // Disable dates before 'from' date if it exists
                            if (bookingConfirmationFormData?.from) {
                              return date.isBefore(
                                dayjs(bookingConfirmationFormData.from).startOf(
                                  "day"
                                )
                              );
                            }
                            return false; // Allow all dates if 'from' is not set
                          }}
                          value={bookingConfirmationFormData?.to}
                          onChange={(newVal) =>
                            handleChangeBookingConfirmationFormDataOnChange(
                              "to",
                              newVal
                            )
                          }
                          slotProps={{
                            textField: {
                              variant: "standard",
                              size: "small",
                              readOnly: true,
                              label: "To",
                              sx: {
                                position: "absolute",
                                bottom: 0,
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
                                  // color: (theme) => theme.palette.primary.main,
                                  // fontWeight: 600,
                                  fontSize: 15,
                                  mt: 0.5,
                                },
                                "& input": {
                                  fontSize: "13px", // Date font size
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
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {" "}
                  Rooms:{" "}
                </Typography>
              </Grid>

              <Grid size={12}>
                <CustomAvailableRoomsTableContainer
                  bookingRoomsTableHeaders={bookingRoomsTableHeaders}
                  bookingRoomsChildTableHeaders={bookingRoomsChildTableHeaders}
                  bookingRoomsTableData={bookingRoomsTableData}
                  handleChangeBookingConfirmationFormData={
                    handleChangeBookingConfirmationFormData
                  }
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ width: "100%", marginY: "2px" }}>
                  <Grid container size={12} spacing={1}>
                    <Grid size={3}>
                      <Typography
                        sx={{
                          fontSize: "15px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        Selected Room
                      </Typography>
                    </Grid>
                    <Grid size={8}>
                      <Typography
                        sx={{
                          fontSize: "15px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "15px",
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
                            fontSize: "15px",
                            // color: "#707070",
                            // fontWeight: 600,
                          }}
                        >
                          {Boolean(bookingConfirmationFormData?.roomDto?.roomNo)
                            ? bookingConfirmationFormData?.roomDto?.roomNo
                            : "No Room Selected"}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid size={12}>
                <Box sx={{ width: "100%", marginY: "2px" }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={!bookingConfirmationFormData?.roomDto?.id}
                    sx={{ fontSize: "11px" }}
                    onClick={() =>
                      handleChangeBookingConfirmationOnClick(
                        "confirmBooking",
                        bookingConfirmationFormData
                      )
                    }
                  >
                    Confirm Booking
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Drawer>
  );
});

const FrontdeskBookingHistory = () => {
  const initialBookingHistoryTableFilters = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      bookingStatus: null,
      bookingStatusInputVal: "",
      bookingRefNumber: "",
      pageNo: 0,
      pageSize: 10,
    }),
    []
  );
  const bookingHistoryTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Guest Name", key: "guestName" },
      { label: "Phone No.", key: "phoneNumber" },
      { label: "Booking Ref. No.", key: "bookingRefNumber" },
      { label: "Booked On", key: "bookedOn" },
      { label: "From", key: "fromDate" },
      { label: "To", key: "toDate" },
      { label: "Stayers", key: "noOfPeoples" },
      { label: "Room Type", key: "roomType.type" },
      { label: "Booking Status", key: "bookingStatus" },
      { label: "Action", key: "bookingAction" },
    ],
    []
  );
  const bookingRoomsTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Room No", key: "roomNo" },
      { label: "Capacity", key: "roomType.capacity" },
      { label: "Action", key: "roomAction" },
    ],
    []
  );

  const bookingRoomsChildTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Guest Name", key: "guestName" },
      { label: "From", key: "from" },
      { label: "To", key: "to" },
    ],
    []
  );
  const initialBookingConfirmationFormData = useMemo(
    () => ({
      roomType: null,
      roomTypeInputVal: "",
      from: null,
      to: null,
      bookingRefNumber: "",
      roomDto: null,
    }),
    []
  );
  const [bookingHistoryTableFilters, setBookingHistoryTableFilters] = useState(
    initialBookingHistoryTableFilters
  );
  const [bookingConfirmationFormData, setBookingConfirmationFormData] =
    useState(initialBookingConfirmationFormData);

  console.log("bookingConfirmationFormData : ", bookingConfirmationFormData);

  const {
    data: allBookingStatusTypeData = { data: [] },
    isFetching: isAllBookingStatusTypeDataFetching,
  } = useGetAllBookingStatusTypeQuery();

  console.log("allBookingStatusTypeData : ", allBookingStatusTypeData);

  const {
    data: roomBookingHistoryByHotelIdData = {
      paginationData: {
        numberOfElements: 0,
        totalElements: 0,
        totalPages: 0,
        data: [],
      },
    },
    isLoading: isRoomBookingHistoryByHotelIdLoading,
    isSuccess: isRoomBookingHistoryByHotelIdSuccess,
  } = useRoomBookingHistoryByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      bookingRefNumber: bookingHistoryTableFilters?.bookingRefNumber || null,
      bookingStatus: bookingHistoryTableFilters?.bookingStatus?.key || null,
      fromDate: bookingHistoryTableFilters?.fromDate
        ? moment(bookingHistoryTableFilters?.fromDate?.$d).format("DD-MM-YYYY")
        : null,
      toDate: bookingHistoryTableFilters?.toDate
        ? moment(bookingHistoryTableFilters?.toDate?.$d).format("DD-MM-YYYY")
        : null,
      pageNo: bookingHistoryTableFilters?.pageNo,
      pageSize: bookingHistoryTableFilters?.pageSize,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    }
  );

  console.log(
    "roomBookingHistoryByHotelIdData : ",
    roomBookingHistoryByHotelIdData
  );

  const {
    data: roomtypeByHotelIdForBookingHistoryData = {
      data: [],
    },
    isFetching: isRoomtypeByHotelIdForBookingHistoryDataFetching,
  } = useRoomtypeByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId),
    }
  );
  console.log(
    "roomtypeByHotelIdForBookingHistoryData : ",
    roomtypeByHotelIdForBookingHistoryData
  );

  const {
    data: getRoomsByRoomTypeData = { data: [] },
    isFetching: isGetRoomsByRoomTypeDataFetching,
  } = useGetRoomsByRoomTypeQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      roomTypeId: bookingConfirmationFormData?.roomType?.id,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data"))?.hotelId ||
        !bookingConfirmationFormData?.roomType?.id,
    }
  );

  console.log("getRoomsByRoomTypeData : ", getRoomsByRoomTypeData);

  const filteredRooms = useMemo(() => {
    return filterBookingRooms(
      getRoomsByRoomTypeData?.data,
      bookingConfirmationFormData
    );
  }, [getRoomsByRoomTypeData?.data, bookingConfirmationFormData]);

  const [confirmBookingByFrontDesk, confirmBookingByFrontDeskRes] =
    useConFirmBookingMutation();

  const [cancelBookingByFrontDesk, cancelBookingByFrontDeskRes] =
    useCancelHotelRoomMutation();

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [bookingHistoryTableData, setBookingHistoryTableData] = useState({
    numberOfElements: 0,
    totalElements: 0,
    totalPages: 0,
    data: [],
  });
  console.log("bookingHistoryTableData : ", bookingHistoryTableData);
  const [bookingHistoryTablePageNo, setBookingHistoryTablePageNo] = useState(0);
  console.log(" bookingHistoryTablePageNo : ", bookingHistoryTablePageNo);
  const [bookingHistoryTableRowsPerPage, setBookingHistoryTableRowsPerPage] =
    useState(10);
  console.log(
    " bookingHistoryTableRowsPerPage : ",
    bookingHistoryTableRowsPerPage
  );

  const [customBookingHistoryDrawerOpen, setCustomBookingHistoryDrawerOpen] =
    useState({
      open: false,
      title: "",
      type: null,
    });

  const [selectedBookingHistory, setSelectedBookingHistory] = useState(null);
  console.log("selectedBookingHistory : ", selectedBookingHistory);

  const handleChangeBookingHistoryTableFilters = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "temp") {
        } else {
          setBookingHistoryTableFilters((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setBookingHistoryTableFilters(initialBookingHistoryTableFilters);
      }
    },
    [initialBookingHistoryTableFilters]
  );

  const handleChangeBookingHistoryTablePageNo = useCallback(
    (event, newpage) => {
      setBookingHistoryTablePageNo(newpage);
    },
    []
  );

  const handleChangeBookingHistoryTableRowsPerPage = useCallback((event) => {
    setBookingHistoryTableRowsPerPage(parseInt(event.target.value, 10));
    setBookingHistoryTablePageNo(0);
  }, []);

  const handleChangeSelectedBookingHistory = useCallback((value) => {
    setSelectedBookingHistory(value || null);
  }, []);

  const handleChangeBookingConfirmationFormData = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "fullCheck") {
          setBookingConfirmationFormData((prevData) => ({
            ...prevData,
            roomType: inputValue?.roomType || null,
            roomTypeInputVal: inputValue?.roomType?.type || "",
            from: inputValue?.fromDate
              ? dayjs(inputValue?.fromDate, "DD-MM-YYYY")
              : null,
            to: inputValue?.toDate
              ? dayjs(inputValue?.toDate, "DD-MM-YYYY")
              : null,
            bookingRefNumber: inputValue?.bookingRefNumber || "",
          }));
        } else if (name === "selectedRoom") {
          setBookingConfirmationFormData((prevData) => ({
            ...prevData,
            roomDto:
              inputValue?.id === prevData?.roomDto?.id ? null : inputValue,
          }));
        } else {
          setBookingConfirmationFormData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setBookingConfirmationFormData(initialBookingConfirmationFormData);
      }
    },
    [initialBookingConfirmationFormData]
  );

  const handleOpenCustomBookingHistoryDrawer = useCallback(
    (open = false, title = "", type = null) => {
      setCustomBookingHistoryDrawerOpen({
        open: open || false,
        title: title || "",
        type: type || null,
      });

      if (!open) {
        handleChangeBookingConfirmationFormData();
        handleChangeSelectedBookingHistory();
      }
    },
    [
      handleChangeBookingConfirmationFormData,
      handleChangeSelectedBookingHistory,
    ]
  );

  const handleChangeBookingConfirmation = useCallback(
    (name, bookingData) => {
      if (name === "confirmBooking") {
        Swal.fire({
          title: "Confirm Booking!",
          text: "Are you Sure To CONFIRM The Booking?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
        }).then((result) => {
          if (result.isConfirmed) {
            const payload = {
              bookingRefNumber: bookingData?.bookingRefNumber || null,
              roomDto: {
                id: bookingData?.roomDto?.id || null,
              },
            };
            confirmBookingByFrontDesk(payload)
              .unwrap()
              .then((res) => {
                setSnack({
                  open: true,
                  message: res?.message || "Booking Confirmation Success",
                  severity: "success",
                });
                handleOpenCustomBookingHistoryDrawer();
              })
              .catch((err) => {
                setSnack({
                  open: true,
                  message:
                    err?.data?.message ||
                    err?.data ||
                    "Booking Confirmation Failed",
                  severity: "error",
                });
              });
          }
        });
      } else if (name === "cancelBooking") {
        Swal.fire({
          title: "Cancel Booking!",
          text: "Are You Sure To CANCEL The Booking?",
          icon: "warning",
          input: "text",
          inputPlaceholder: "Enter a remark for cancellation",
          inputValidator: (value) => {
            if (!value || value.trim() === "") {
              return "You need to provide a valid remark!";
            }
            return null;
          },
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
        }).then((result) => {
          if (result.isConfirmed) {
            const remark = result.value ? result?.value?.trim() : "";
            console.log("Remark provided:", remark);

            const payload = {
              bookingRefNumber: bookingData?.bookingRefNumber || null,
              rejectionReason: remark,
            };

            cancelBookingByFrontDesk(payload)
              .unwrap()
              .then((res) => {
                setSnack({
                  open: true,
                  message: res?.message || "Booking Confirmation Success",
                  severity: "success",
                });
              })
              .catch((err) => {
                setSnack({
                  open: true,
                  message:
                    err?.data?.message ||
                    err?.data ||
                    "Booking Confirmation Failed",
                  severity: "error",
                });
              });
          }
        });
      }
    },
    [
      cancelBookingByFrontDesk,
      confirmBookingByFrontDesk,
      handleOpenCustomBookingHistoryDrawer,
    ]
  );

  useEffect(() => {
    if (isRoomBookingHistoryByHotelIdSuccess) {
      setBookingHistoryTableData(
        roomBookingHistoryByHotelIdData?.paginationData?.data || []
      );
    }
  }, [isRoomBookingHistoryByHotelIdSuccess, roomBookingHistoryByHotelIdData]);

  // useEffect(() => {
  //   const response = generateBookingHistoryResponse(
  //     50,
  //     bookingHistoryTableRowsPerPage,
  //     bookingHistoryTablePageNo
  //   );

  //   console.log("generateBookingHistoryResponse response : ", response);
  //   setBookingHistoryTableData(response?.paginationData);
  // }, [bookingHistoryTableRowsPerPage, bookingHistoryTablePageNo]);
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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CustomHeader backNavigate={true} headerText={"Booking History"} />
          <CustomBookingHistoryTableFIlters
            bookingHistoryTableFilters={bookingHistoryTableFilters}
            handleChangeBookingHistoryTableFilters={
              handleChangeBookingHistoryTableFilters
            }
            bookingStatuses={allBookingStatusTypeData?.data || []}
          />
        </Box>

        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 250px)",
                  xl: "calc(100vh - 200px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <CustomBookingHistoryTableContainer
                tableHeaders={bookingHistoryTableHeaders}
                tableData={roomBookingHistoryByHotelIdData?.paginationData}
                pageNo={bookingHistoryTablePageNo}
                pageSize={bookingHistoryTableRowsPerPage}
                handlePageChange={handleChangeBookingHistoryTablePageNo}
                handleChangeRowsPerPage={
                  handleChangeBookingHistoryTableRowsPerPage
                }
                handleChangeBookingConfirmation={
                  handleChangeBookingConfirmation
                }
                handleChangeSelectedBookingHistory={
                  handleChangeSelectedBookingHistory
                }
                handleOpenCustomBookingHistoryDrawer={
                  handleOpenCustomBookingHistoryDrawer
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* <ShowcaseDialog
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
          /> */}
      <CustomBookingHistoryDrawer
        customDrawerOpen={customBookingHistoryDrawerOpen?.open}
        title={customBookingHistoryDrawerOpen?.title}
        type={customBookingHistoryDrawerOpen?.type}
        handleToggleCustomFormDrawer={handleOpenCustomBookingHistoryDrawer}
        customFormDrawerData={null}
        handleChangeSelectedBookingHistory={handleChangeSelectedBookingHistory}
        roomtypeByHotelIdForBookingHistoryData={
          roomtypeByHotelIdForBookingHistoryData?.data || []
        }
        bookingConfirmationFormData={bookingConfirmationFormData}
        handleChangeBookingConfirmationFormData={
          handleChangeBookingConfirmationFormData
        }
        selectedBookingHistory={selectedBookingHistory}
        bookingRoomsTableHeaders={bookingRoomsTableHeaders}
        bookingRoomsChildTableHeaders={bookingRoomsChildTableHeaders}
        // bookingRoomsTableData={getRoomsByRoomTypeData?.data || []}
        bookingRoomsTableData={filteredRooms || []}
        handleChangeBookingConfirmation={handleChangeBookingConfirmation}
      />
      <LoadingComponent
        open={
          isRoomBookingHistoryByHotelIdLoading ||
          isAllBookingStatusTypeDataFetching ||
          confirmBookingByFrontDeskRes?.isLoading ||
          cancelBookingByFrontDeskRes?.isLoading ||
          isRoomtypeByHotelIdForBookingHistoryDataFetching ||
          isGetRoomsByRoomTypeDataFetching ||
          false
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default FrontdeskBookingHistory;
