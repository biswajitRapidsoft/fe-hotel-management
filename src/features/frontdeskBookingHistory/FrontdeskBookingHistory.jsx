import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import Swal from "sweetalert2";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Rating,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { RiRefund2Line } from "react-icons/ri";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ClearIcon from "@mui/icons-material/Clear";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { saveAs } from "file-saver";

import {
  useGetAllBookingStatusTypeQuery,
  useRoomBookingHistoryByHotelIdQuery,
  useConFirmBookingMutation,
  useGetRoomsByRoomTypeQuery,
  useGetRoomBookingChartQuery,
  useApproveBookingCancelRequestMutation,
  useCancelRoomBookingFromBookingHistoryMutation,
  useExportBookingHistoryMutation,
} from "../../services/frontdeskBookingHistory";
// import moment from "moment";
import moment from "moment-timezone";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
// import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useRoomtypeByHotelIdQuery } from "../../services/dashboard";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import BookingHistoryChartComponent from "./BookingHistoryChartComponent";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { BootstrapDialog } from "../header/Header";
import ReactDOM from "react-dom";
import { PaymentDialog } from "../dashboard/GuestDashboard";
import { FRONTDESK } from "../../helper/constants";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import {
  useAssignHouseKeepingRequestMutation,
  useGetAllHouseKeepingStaffQuery,
} from "../../services/houseKeepingHistory";

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
  if (!bookingConfirmationFormData?.from || !bookingConfirmationFormData?.to) {
    // return bookingRoomsTableData;
    return [];
  }

  const startDate = dayjs(bookingConfirmationFormData.from).startOf("day");
  const endDate = dayjs(bookingConfirmationFormData.to).startOf("day");

  console.log("filterBookingRooms startDate; ", startDate);

  return bookingRoomsTableData.filter((item) => {
    if (!item?.bookingList || item.bookingList.length === 0) {
      return true;
    }

    const relevantBookings = item.bookingList.filter(
      (booking) =>
        booking.bookingStatus === "Booked" ||
        booking.bookingStatus === "Checked_In"
    );
    // console.log("filterBookingRooms relevantBookings; ", relevantBookings);

    if (relevantBookings.length === 0) {
      return false;
    }

    // :moment(booking.checkInDate).format("DD/MM/YYYY").utc(),

    const bookingDates = relevantBookings.map((booking) => ({
      startDate: dayjs(
        booking.bookingStatus === "Booked"
          ? booking.fromDate
          : // : booking.checkInDate,
            moment(booking.checkInDateInUtc).tz("Asia/Kolkata"),
        "DD-MM-YYYY"
      ).startOf("day"),
      endDate: dayjs(
        booking.bookingStatus === "Booked"
          ? booking.toDate
          : // : booking.checkOutDate,
            moment(booking.checkOutDateInUtc).tz("Asia/Kolkata"),

        "DD-MM-YYYY"
      ).startOf("day"),
    }));

    // console.log("filterBookingRooms bookingDates; ", bookingDates);

    bookingDates.sort((a, b) => a.endDate.diff(b.endDate));

    console.log("filterBookingRooms bookingDates; ", bookingDates);

    const isStartDateBeforeOrEqualAnyEndDate = bookingDates.some((date) =>
      startDate.isBefore(date.endDate)
    );

    const isStartDateAfterAllEndDates = bookingDates.every((date) =>
      startDate.isAfter(date.endDate)
    );
    // const isStartDateAfterAllEndDates = startDate.isAfter(
    //   bookingDates[bookingDates.length - 1].endDate
    // );

    // console.log(
    //   "filterBookingRooms isStartDateBeforeOrEqualAnyEndDate & ; ",
    //   isStartDateBeforeOrEqualAnyEndDate,
    //   isStartDateAfterAllEndDates
    // );

    if (isStartDateAfterAllEndDates) {
      return true;
    }

    if (isStartDateBeforeOrEqualAnyEndDate) {
      const closestEndDateBooking = bookingDates.find((date) =>
        startDate.isBefore(date.endDate)
      );

      // console.log(
      //   "filterBookingRooms closestEndDateBooking ; ",
      //   closestEndDateBooking
      // );

      if (closestEndDateBooking) {
        const nextBookingStartDate = bookingDates
          .filter((date) =>
            date.startDate.isAfter(closestEndDateBooking.endDate)
          )
          .sort((a, b) => a.startDate.diff(b.startDate))[0]?.startDate;

        // console.log(
        //   "filterBookingRooms nextBookingStartDate ; ",
        //   nextBookingStartDate
        // );
        if (nextBookingStartDate && nextBookingStartDate.isAfter(endDate)) {
          return true;
        }

        const compatibleStartDate = bookingDates.find((date) =>
          endDate.isBefore(date.startDate)
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

function getRoomServiceStatusColor(key) {
  switch (key) {
    case "Request_Submitted":
      return { color: "#cd5000", bgcolor: "#ffe3d1" };
    case "Staff_Asssigned":
      return { color: "#0068b7", bgcolor: "#d3ecff" };
    case "Completed":
      return { color: "#01a837", bgcolor: "#c7ffd9" };
    default:
      return { color: "#4b4b4b", bgcolor: "#dedede" };
  }
}

export const CustomHeader = memo(function ({
  backNavigate = false,
  headerText,
  exportExcel = false,
  handlerFunction,
}) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
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
      {exportExcel && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<FileDownloadIcon />}
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "none",
            letterSpacing: 1,
          }}
          onClick={handlerFunction}
        >
          Export Excel
        </Button>
      )}
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
        {/* <Grid size={{ xs: 4, lg: 1.7, xl: 1.5 }}>
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
                  // readOnly: true,
                  clearable: true,
                  onKeyDown: (e) => {
                    e.preventDefault();
                  },
                  label: "From",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      width: 200,
                      height: 35,
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
                      fontSize: 14,
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
        </Grid> */}

        {/* <Grid size={{ xs: 4, lg: 1.7, xl: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={bookingHistoryTableFilters?.toDate}
              shouldDisableDate={(date) => {
                if (bookingHistoryTableFilters?.fromDate) {
                  return date.isBefore(
                    dayjs(bookingHistoryTableFilters.fromDate).startOf("day")
                  );
                }
                return false;
              }}
              onChange={(newVal) =>
                handleChangeBookingHistoryTableFiltersOnChange("toDate", newVal)
              }
              slotProps={{
                field: {
                  variant: "outlined",
                  size: "small",
                  label: "To",
                  clearable: true,
                  onKeyDown: (e) => {
                    e.preventDefault();
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      color: "#B4B4B4",
                      width: 200,
                      height: 35,
                    },
                    "& .MuiFormLabel-root": {
                      color: (theme) => theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: 14,
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
        </Grid> */}
        <Grid size={{ xs: 4, lg: 1.7, xl: 1.5 }}>
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
            inputProps={{
              maxLength: 120,
              style: {
                fontSize: "14px",
              },
            }}
            InputLabelProps={{
              style: {
                fontSize: "13px",
              },
            }}
            sx={{
              bgcolor: "#F9F4FF",
              "& .MuiInputBase-root": {
                height: "35px",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
              "& .MuiTextField-root": {
                maxHeight: "35px",
                backgroundColor: "transparent",
              },
            }}
          />
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
                fontSize: 14,
              },
              ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              "& .MuiOutlinedInput-root": {
                height: "35px",
                minHeight: "35px",
              },
              "& .MuiInputBase-input": {
                padding: "13px",
                height: "100%",
                boxSizing: "border-box",
                fontSize: "13px",
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
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      maxHeight: "150px",
                      overflow: "auto",
                    },
                    "& .MuiAutocomplete-option": {
                      fontSize: "13px",
                    },
                  },
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

const HouseKeepingRequestDialog = memo(function ({
  open,
  onClose,
  selectedStaffForService,
  houseKeepingStaffList,
  handleChangeSelectedStaffForService,
  handleAssignRequest,
}) {
  const handleCloseOnClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleChangeSelectedStaffForServiceOnChange = useCallback(
    (selectedStaff) => {
      handleChangeSelectedStaffForService(selectedStaff);
    },
    [handleChangeSelectedStaffForService]
  );

  const handleAssignRequestOnAccept = useCallback(() => {
    handleAssignRequest();
  }, [handleAssignRequest]);

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleCloseOnClose}
        // maxWidth="md"
        // fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "450px", minWidth: "700px" } }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.4rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Assign HouseKeeping Request
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
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
                options={houseKeepingStaffList || []}
                value={selectedStaffForService || null}
                onChange={(event, newValue) =>
                  handleChangeSelectedStaffForServiceOnChange(newValue)
                }
                fullWidth
                getOptionLabel={(option) => option?.name}
                clearOnEscape
                disablePortal
                // isOptionDisabled={(option) => isOptionDisabled(option.key)}
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
                    label="HouseKeeping Staff"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const serviceCount = option?.servicesList?.length || 0;
                  let color = "#FFBF00";
                  if (serviceCount >= 3) {
                    color = "#AA0000";
                  } else if (serviceCount <= 1) {
                    color = "#018749";
                  } else if (serviceCount === 2) {
                    color = "#FFBF00	";
                  }

                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        // backgroundColor,
                        color: color,
                        fontWeight: 600,
                        // "&:hover": {
                        //   backgroundColor: backgroundColor,
                        //   opacity: 0.8,
                        // },
                      }}
                    >
                      {option.name}
                    </Box>
                  );
                }}
              />
            </Box>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleCloseOnClose()}
          >
            cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAssignRequestOnAccept()}
          >
            yes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
});

const CustomServiceHistoryTableRow = memo(function ({
  tableHeaders,
  rowSerialNumber,
  row,
  handleOpenAssignServiceDialog,
}) {
  const handleOpenAssignServiceDialogOnClick = useCallback(
    (selectedRow) => {
      handleOpenAssignServiceDialog(selectedRow);
    },
    [handleOpenAssignServiceDialog]
  );
  return (
    <TableRow
      hover
      key={row?.id}
      sx={{
        // cursor: "pointer",
        height: 30,
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: "inherit",
        },
      }}
    >
      {tableHeaders?.map((subitem, subIndex) => {
        return (
          <TableCell key={`table-body-cell=${subIndex}`} align="center">
            {subitem?.key === "sno" ? (
              <Typography sx={{ fontSize: "12.5px" }}>
                {rowSerialNumber}
              </Typography>
            ) : subitem?.key === "createdAt" || subitem?.key === "updatedAt" ? (
              <Typography sx={{ fontSize: "12.5px", whiteSpace: "nowrap" }}>
                {row?.[subitem?.key] &&
                  moment(row?.[subitem?.key]).format("DD-MM-YYYY hh:mm A")}
              </Typography>
            ) : subitem?.key === "serviceTypeStatus" ? (
              <Typography sx={{ fontSize: "12.5px", whiteSpace: "nowrap" }}>
                {row?.serviceTypeStatus?.replace(/_/g, " ")}
              </Typography>
            ) : subitem?.key === "serviceRequestStatus" ? (
              <Box
                sx={{
                  color: getRoomServiceStatusColor(row?.serviceRequestStatus)
                    ?.color,
                  backgroundColor: getRoomServiceStatusColor(
                    row?.serviceRequestStatus
                  )?.bgcolor,
                  fontWeight: 600,
                  border: `0.5px solid ${
                    getRoomServiceStatusColor(row?.serviceRequestStatus)?.color
                  }`,
                  py: 0.2,
                  px: "5px",
                  textAlign: "center",
                  // width: "178px",
                  width: "auto",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  fontSize: "12.7px",
                }}
              >
                {row?.serviceRequestStatus?.replace(/_/g, " ")}
              </Box>
            ) : // </Typography>
            subitem?.key === "serviceHistoryAction" ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                {!Boolean(row?.assignedPerson) && (
                  <Tooltip title={"Assign"} arrow>
                    <Button
                      variant="outlined"
                      // color="success"
                      sx={{ minWidth: "unset", width: "7px" }}
                      onClick={() => handleOpenAssignServiceDialogOnClick(row)}
                    >
                      <AssignmentLateIcon
                        sx={{ fontSize: "12px", fontWeight: 600 }}
                      />
                    </Button>
                  </Tooltip>
                )}
              </Box>
            ) : (
              <Typography sx={{ fontSize: "12.5px", whiteSpace: "nowrap" }}>
                {getCellValue(row, subitem?.key)}
              </Typography>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
});

const CustomServiceHistoryTableContainer = memo(function ({
  tableHeaders,
  tableData,
  handleOpenAssignServiceDialog,
}) {
  console.log("CustomServiceHistoryTableContainer tableData : ", tableData);

  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: "165px",

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
                      paddingY: "5px",

                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      py: { xs: "6px", lg: "6px" },
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(tableData?.length > 0) ? (
              tableData?.map((row, index) => (
                <CustomServiceHistoryTableRow
                  tableHeaders={tableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                  handleOpenAssignServiceDialog={handleOpenAssignServiceDialog}
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
    </React.Fragment>
  );
});

const ShowcaseBookingDialog = memo(function ({
  openShowcaseBookingDialog,
  handleCloseShowcaseBookingDialog,
  title = "",
  type,
  bookingDetailsData,
  serviceHistoryTableHeaders,
  handleOpenAssignServiceDialog,
}) {
  console.log("type : ", type);
  console.log(
    "ShowcaseBookingDialog bookingDetailsData : ",
    bookingDetailsData
  );

  const totalExpense = useMemo(
    () =>
      bookingDetailsData?.transactionDetails
        ?.filter((item) => !Boolean(item?.isCredit))
        ?.reduce((sum, item) => sum + (item.amount || 0), 0),
    [bookingDetailsData]
  );
  const totalAmountPaid = useMemo(
    () =>
      bookingDetailsData?.transactionDetails
        ?.filter((item) => Boolean(item?.isCredit))
        ?.reduce((sum, item) => sum + (item.amount || 0), 0),
    [bookingDetailsData]
  );

  const handleCloseShowcaseBookingDialogOnClose = useCallback(() => {
    handleCloseShowcaseBookingDialog();
  }, [handleCloseShowcaseBookingDialog]);

  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={openShowcaseBookingDialog}
        onClose={handleCloseShowcaseBookingDialogOnClose}
        aria-labelledby="booking-details-dialog-title"
        // maxWidth="sm"
        // fullWidth
        maxWidth=""
        sx={{
          ".MuiDialogTitle-root": {
            px: 2,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle
          id="password-change-dialog-title"
          sx={{
            fontSize: "20px",
            lineHeight: "0.4",
            fontWeight: 600,
            letterSpacing: 0.7,
          }}
        >
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseShowcaseBookingDialogOnClose}
          sx={{
            position: "absolute",
            right: 5,
            top: 1,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 27 }} />
        </IconButton>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            {type === "bookingDetails" && (
              <>
                <Typography>
                  <Typography
                    component="span"
                    sx={{ fontSize: "16px", fontWeight: 550 }}
                  >
                    Booking ID :
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      marginLeft: "5px",
                      fontSize: "16px",
                      fontWeight: 550,
                    }}
                  >
                    {bookingDetailsData?.bookingRefNumber}
                  </Typography>
                </Typography>
                <Typography
                  sx={{ fontSize: "13px", color: "#717171", lineHeight: "0.7" }}
                >
                  {`Booked on ${moment(bookingDetailsData?.bookedOn)?.format(
                    "DD-MM-YYYY hh:mm A"
                  )}`}
                </Typography>
                <Divider sx={{ mt: 1.5, mb: 1 }} />

                <Paper
                  elevation={1}
                  sx={{
                    width: "100%",
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    borderRadius: "10px",
                    paddingY: "5px",
                    paddingX: "10px",
                    mb: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "14px", fontWeight: 550 }}>
                    Customer Details :
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Grid container size={12} rowSpacing={1.5}>
                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Name
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px" }}
                        >
                          {[
                            bookingDetailsData?.firstName,
                            bookingDetailsData?.middleName,
                            bookingDetailsData?.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Phone No.
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px" }}
                        >
                          {bookingDetailsData?.phoneNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Alternative Phone No.
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px" }}
                        >
                          {bookingDetailsData?.alternativePhoneNumber}
                        </Typography>
                      </Box>
                    </Grid>

                    {Boolean(bookingDetailsData?.email?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Email
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.email}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.address?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Address
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.address}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.fromDate?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            From
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.fromDate}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.toDate?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            To
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.toDate}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.checkInDate?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Check-In Date
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.checkInDate}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.checkOutDate?.trim()) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Check-Out Date
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.checkOutDate}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.noOfPeoples) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Stayers
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.noOfPeoples}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Room Type
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                        >
                          {bookingDetailsData?.roomType?.type
                            ?.replace(/_/g, " ")
                            ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                            ?.replace(/\b\w/g, (char) => char.toUpperCase()) ||
                            ""}
                        </Typography>
                      </Box>
                    </Grid>

                    {Boolean(bookingDetailsData?.roomDto?.id) && (
                      <Grid size={4}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Room No.
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.roomDto?.roomNo || ""}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                <Paper
                  elevation={1}
                  sx={{
                    width: "100%",
                    boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    borderRadius: "10px",
                    paddingY: "5px",
                    paddingX: "10px",
                    mb: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "14px", fontWeight: 550 }}>
                    Payments & Actions :
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Grid container size={12} rowSpacing={1.5}>
                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Status
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            wordWrap: "break-word",
                            fontWeight: 550,
                            color: getBookingStatusColor(
                              bookingDetailsData?.bookingStatus
                            )?.color,
                          }}
                        >
                          {bookingDetailsData?.bookingStatus?.replace(
                            /_/g,
                            " "
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Expenses
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px" }}
                        >
                          {totalExpense}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={4}>
                      <Box sx={{ width: "100%" }}>
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 550,
                            lineHeight: "0.5",
                          }}
                        >
                          Paid
                        </Typography>
                        <Typography
                          component="span"
                          sx={{ fontSize: "14.5px" }}
                        >
                          {totalAmountPaid}
                        </Typography>
                      </Box>
                    </Grid>

                    {Boolean(bookingDetailsData?.remarks?.trim()) && (
                      <Grid size={6}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Remarks
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.remarks}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.isRated) && (
                      <Grid size={12}>
                        <Grid container size={12} spacing={1}>
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "12.5px",
                                fontWeight: 550,
                                lineHeight: "0.5",
                                marginBottom: "5px",
                              }}
                            >
                              Rating
                            </Typography>
                            <Divider />
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ width: "100%" }}>
                              <Rating
                                name="read-only"
                                value={bookingDetailsData?.ratingPoints}
                                precision={0.5}
                                readOnly
                              />
                            </Box>
                          </Grid>

                          <Grid size={8}>
                            <Box sx={{ width: "100%" }}>
                              <Typography
                                sx={{
                                  fontSize: "12.5px",
                                  fontWeight: 550,
                                  lineHeight: "0.5",
                                }}
                              >
                                Review
                              </Typography>
                              <Typography
                                component="span"
                                sx={{ fontSize: "14.5px" }}
                              >
                                {bookingDetailsData?.ratingMessage}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    )}

                    {Boolean(bookingDetailsData?.rejectionReason?.trim()) && (
                      <Grid size={7}>
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "12.5px",
                              fontWeight: 550,
                              lineHeight: "0.5",
                            }}
                          >
                            Rejection Reason
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "14.5px", wordWrap: "break-word" }}
                          >
                            {bookingDetailsData?.rejectionReason}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {Boolean(bookingDetailsData?.roomServiceDataList?.length) && (
                  <Paper
                    elevation={1}
                    sx={{
                      width: "100%",
                      boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                      borderRadius: "10px",
                      paddingY: "5px",
                      paddingX: "10px",
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: "14px", fontWeight: 550 }}>
                      Services :
                    </Typography>
                    <Divider sx={{ mb: 1.5 }} />
                    <Grid container size={12} rowSpacing={1.5}>
                      <Grid size={12}>
                        <Box sx={{ width: "100%" }}>
                          <CustomServiceHistoryTableContainer
                            tableHeaders={serviceHistoryTableHeaders}
                            tableData={bookingDetailsData?.roomServiceDataList}
                            handleOpenAssignServiceDialog={
                              handleOpenAssignServiceDialog
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>,
    document.getElementById("portal")
  );
});

const CustomRow = memo(function ({
  tableHeaders,
  rowSerialNumber,
  row,
  handleChangeBookingConfirmation,
  handleOpenCustomBookingHistoryDrawer,
  handleChangeSelectedBookingHistory,
  handleApproveBookingCancelRequest,
  handleOpenShowcaseBookingDialogForDetails,
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
  const handleApproveBookingCancelRequestOnClick = useCallback(
    (selectedBookingData) => {
      handleApproveBookingCancelRequest(selectedBookingData);
    },
    [handleApproveBookingCancelRequest]
  );
  const handleOpenShowcaseBookingDialogForDetailsOnClick = useCallback(
    (bookingValue) => {
      handleOpenShowcaseBookingDialogForDetails(bookingValue);
    },
    [handleOpenShowcaseBookingDialogForDetails]
  );
  return (
    <TableRow
      hover
      key={row?.id}
      sx={{
        // cursor: "pointer",
        height: 45,
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: "inherit",
        },
      }}
    >
      {tableHeaders?.map((subitem, subIndex) => {
        return (
          <TableCell key={`table-body-cell=${subIndex}`} align="center">
            {subitem?.key === "sno" ? (
              <Typography sx={{ fontSize: "13px" }}>
                {rowSerialNumber}
              </Typography>
            ) : subitem?.key === "guestName" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {[row?.firstName, row?.middleName, row?.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </Typography>
            ) : subitem?.key === "bookedOn" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {row?.bookedOn &&
                  moment(row?.bookedOn).format("DD-MM-YYYY hh:mm A")}
              </Typography>
            ) : subitem?.key === "bookingStatus" ? (
              <Box
                sx={{
                  color: getBookingStatusColor(row?.bookingStatus)?.color,
                  backgroundColor: getBookingStatusColor(row?.bookingStatus)
                    ?.bgcolor,
                  fontWeight: 600,
                  border: `0.5px solid ${
                    getBookingStatusColor(row?.bookingStatus)?.color
                  }`,
                  py: 0.7,
                  px: "5px",
                  textAlign: "center",
                  // width: "178px",
                  width: "auto",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {row?.bookingStatus?.replace(/_/g, " ")}
              </Box>
            ) : // </Typography>
            subitem?.key === "bookingAction" ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <Tooltip title={"View Details"} arrow>
                  <Button
                    variant="outlined"
                    sx={{
                      minWidth: "unset",
                      width: "auto",
                      paddingY: "4.8px",
                      paddingX: "8px",
                      color: "#0cb2e7",
                      borderColor: "#0cb2e7",
                      "&:hover": {
                        borderColor: "#0a8db7",
                        backgroundColor: "#ddf7ff",
                      },
                    }}
                    onClick={() =>
                      handleOpenShowcaseBookingDialogForDetailsOnClick(row)
                    }
                  >
                    <IoMdInformationCircleOutline
                      style={{ fontSize: "14px", fontWeight: 600 }}
                    />
                  </Button>
                </Tooltip>
                {row?.bookingStatus === "Pending_Confirmation" && (
                  <>
                    <Tooltip title={"Check Availability"} arrow>
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
                    </Tooltip>

                    <Tooltip title={"Cancel Booking"} arrow>
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
                    </Tooltip>
                  </>
                )}
                {row?.bookingStatus === "Booking_Cancellation_Requested" && (
                  <Button
                    variant="outlined"
                    sx={{
                      minWidth: "unset",
                      width: "auto",
                      paddingY: "4.8px",
                      paddingX: "8px",
                      color: "#FF5722",
                      borderColor: "#FF5722",
                      "&:hover": {
                        borderColor: "#E64A19",
                        backgroundColor: "rgba(255, 87, 34, 0.1)",
                      },
                    }}
                    onClick={() =>
                      handleApproveBookingCancelRequestOnClick(row)
                    }
                  >
                    <RiRefund2Line
                      style={{ fontSize: "14px", fontWeight: 600 }}
                    />
                  </Button>
                )}
              </Box>
            ) : (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {getCellValue(row, subitem?.key)}
              </Typography>
            )}
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
  handleApproveBookingCancelRequest,
  handleOpenShowcaseBookingDialogForDetails,
}) {
  console.log("CustomBookingHistoryTableContainer tableData : ", tableData);

  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: "calc(100vh - 135px)",
            md: "calc(100vh - 290px)",
            lg: "calc(100vh - 290px)",
            xl: "calc(100vh - 495px)",
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
                      paddingY: "5px",

                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      py: { xs: "8px", md: "10px", lg: "15px" },
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
                  handleApproveBookingCancelRequest={
                    handleApproveBookingCancelRequest
                  }
                  handleOpenShowcaseBookingDialogForDetails={
                    handleOpenShowcaseBookingDialogForDetails
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
                                    {getCellValue(row, subHeaderitem?.key)}
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
    case "Booking_Cancellation_Requested":
      return { color: "#f72585", bgcolor: "#ffd6e8" };
    case "Room_Checkout_Requested":
      return { color: "#1b8b60", bgcolor: "#b9ffe5" };
    case "Room_Checkout_Request_Approved":
      return { color: "#648816", bgcolor: "#e8ffb4" };
    default:
      return { color: "#4b4b4b", bgcolor: "#dedede" };
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
                  <Grid size={4.5}>
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
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
                        disabled={true}
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
                        componentsProps={{
                          popper: {
                            sx: {
                              "& .MuiAutocomplete-listbox": {
                                maxHeight: "150px",
                                overflow: "auto",
                              },
                              "& .MuiAutocomplete-option": {
                                fontSize: "13px", // Specifically targeting individual options
                              },
                            },
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
                            disabled={true}
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
                  <Grid size={3.75}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
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
                              // clearable: true,
                              // onKeyDown: (e) => {
                              //   e.preventDefault();
                              // },
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
                          disabled
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>
                  <Grid size={3.75}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          // disabled={!bookingConfirmationFormData?.from}
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
                              // clearable: true,
                              // onKeyDown: (e) => {
                              //   e.preventDefault();
                              // },
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
                          disabled
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
      { label: "Room No.", key: "roomDto.roomNo" },
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

  const leftChartLabels = useMemo(
    () => [
      {
        name: "Total Booking",
        key: "totalBookings",
        color: "#26afeb",
        filterationKey: "",
      },
      {
        name: "Checked In",
        key: "noOfCheckedInCounts",
        color: "#0fd87c",
        filterationKey: "Checked_In",
      },
      {
        name: "Checkout Requested",
        key: "noOfCheckOutRequestSubmitted",
        color: "#6A9C89",
        filterationKey: "Room_Checkout_Requested",
      },
      {
        name: "Checkout Request Approved",
        key: "noOfCheckOutRequestApproved",
        color: "#648816",
        filterationKey: "Room_Checkout_Request_Approved",
      },
      {
        name: "Checked Out",
        key: "noOfCheckedOutCounts",
        color: "#a393eb",
        filterationKey: "Checked_Out",
      },
      {
        name: "Cancelled",
        key: "noOfCancelledCounts",
        color: "#f73859",
        filterationKey: "Cancelled",
      },
    ],
    []
  );

  const rightChartLabels = useMemo(
    () => [
      {
        name: "Pending",
        key: "noOfNotYetApprovedCounts",
        color: "#ea5455",
        filterationKey: "Pending_Confirmation",
      },
      {
        name: "Booked",
        key: "noOfApprovedButNotCheckedInCounts",
        color: "#0f4392",
        filterationKey: "Booked",
      },
      {
        name: "Cancel Request",
        key: "noOfCancelledRequestCount",
        color: "#f72585",
        filterationKey: "Booking_Cancellation_Requested",
      },
    ],
    []
  );

  const initialShowcaseBookingDialogData = useMemo(
    () => ({
      open: false,
      title: "",
      type: null,
      bookingDetailsData: null,
    }),
    []
  );

  const serviceHistoryTableHeaders = React.useMemo(() => {
    return [
      { label: "Sl. No.", key: "sno" },
      { label: "Service Type", key: "serviceTypeStatus" },
      { label: "Floor", key: "roomData.floorNo" },
      { label: "Room No.", key: "roomData.roomNo" },
      { label: "Created At", key: "createdAt" },
      { label: "Updated At", key: "updatedAt" },
      { label: "Assigned Person", key: "assignedPerson.name" },
      { label: "Status", key: "serviceRequestStatus" },
      { label: "Action", key: "serviceHistoryAction" },
    ];
  }, []);
  const [bookingHistoryTableFilters, setBookingHistoryTableFilters] = useState(
    initialBookingHistoryTableFilters
  );
  const [bookingHistoryTablePageNo, setBookingHistoryTablePageNo] = useState(0);
  const [bookingHistoryTableRowsPerPage, setBookingHistoryTableRowsPerPage] =
    useState(10);
  const [debouncedBookingRefNoSearch, setDebouncedBookingRefNoSearch] =
    useState("");
  const [bookingConfirmationFormData, setBookingConfirmationFormData] =
    useState(initialBookingConfirmationFormData);

  const {
    data: allBookingStatusTypeData = { data: [] },
    isFetching: isAllBookingStatusTypeDataFetching,
  } = useGetAllBookingStatusTypeQuery(
    {},
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

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
    isFetching: isRoomBookingHistoryByHotelIdFetching,
    isSuccess: isRoomBookingHistoryByHotelIdSuccess,
  } = useRoomBookingHistoryByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      bookingRefNumber: debouncedBookingRefNoSearch || null,
      bookingStatus: bookingHistoryTableFilters?.bookingStatus?.key || null,
      fromDate: bookingHistoryTableFilters?.fromDate
        ? moment(bookingHistoryTableFilters?.fromDate?.$d).format("DD-MM-YYYY")
        : null,
      toDate: bookingHistoryTableFilters?.toDate
        ? moment(bookingHistoryTableFilters?.toDate?.$d).format("DD-MM-YYYY")
        : null,
      // pageNo: bookingHistoryTableFilters?.pageNo,
      pageNo: bookingHistoryTablePageNo,
      // pageSize: bookingHistoryTableFilters?.pageSize,
      pageSize: bookingHistoryTableRowsPerPage,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data"))?.hotelId ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
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
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log(
    "roomtypeByHotelIdForBookingHistoryData : ",
    roomtypeByHotelIdForBookingHistoryData
  );

  const {
    data: roomBookingChartData = {
      data: {
        totalBookings: 0,
        noOfCheckedInCounts: 0,
        noOfCheckedOutCounts: 0,
        noOfCancelledCounts: 0,
        noOfNotYetApprovedCounts: 0,
        noOfApprovedButNotCheckedInCounts: 0,
      },
    },
    isLoading: isRoomBookingChartDataLoading,
  } = useGetRoomBookingChartQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

  console.log("roomBookingChartData : ", roomBookingChartData);

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
        !bookingConfirmationFormData?.roomType?.id ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

  console.log("getRoomsByRoomTypeData : ", getRoomsByRoomTypeData);

  const {
    data: houseKeepingStaffList = {
      data: [],
    },
  } = useGetAllHouseKeepingStaffQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
  });

  const [assignHouseKeepingRequest, assignHouseKeepingRequestRes] =
    useAssignHouseKeepingRequestMutation();

  const filteredRooms = useMemo(() => {
    return filterBookingRooms(
      getRoomsByRoomTypeData?.data,
      bookingConfirmationFormData
    );
  }, [getRoomsByRoomTypeData?.data, bookingConfirmationFormData]);

  const [confirmBookingByFrontDesk, confirmBookingByFrontDeskRes] =
    useConFirmBookingMutation();

  const [cancelBookingByFrontDesk, cancelBookingByFrontDeskRes] =
    useCancelRoomBookingFromBookingHistoryMutation();

  const [approveBookingCancelRequest, approveBookingCancelRequestRes] =
    useApproveBookingCancelRequestMutation();

  // export booking history api
  const [exportBookingHistory, exportBookingHistoryRes] =
    useExportBookingHistoryMutation();

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

  const [customBookingHistoryDrawerOpen, setCustomBookingHistoryDrawerOpen] =
    useState({
      open: false,
      title: "",
      type: null,
    });

  const [selectedFilterInChartComponent, setSelectedFilterInChartComponent] =
    useState(null);

  console.log(
    "selectedFilterInChartComponent : ",
    selectedFilterInChartComponent
  );

  console.log("bookingHistoryTableData : ", bookingHistoryTableData);
  const [selectedBookingHistory, setSelectedBookingHistory] = useState(null);
  console.log("selectedBookingHistory : ", selectedBookingHistory);

  const [showcaseBookingDialogData, setShowcaseBookingDialogData] = useState(
    initialShowcaseBookingDialogData
  );
  // console.log("showcaseBookingDialogData : ", showcaseBookingDialogData);

  const [openAssignServiceDialog, setOpenAssignServiceDialog] = useState(false);

  const [selectedServiceHistory, setSelectedServiceHistory] = useState(null);

  const [selectedStaffForService, setSelectedStaffForService] = useState(null);
  console.log("selectedStaffForService", selectedStaffForService);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const [paymentDialogFinalPayload, setPaymentDialogFinalPayload] =
    useState(null);

  const [paymentDialogMutationType, setPaymentDialogMutationType] =
    useState("");

  const handleChangeSetPaymentDialogFinalPayload = useCallback(
    ({ open = false, mutationType = "", payloadValue = null } = {}) => {
      setOpenPaymentDialog(open || false);
      setPaymentDialogFinalPayload(payloadValue || null);
      setPaymentDialogMutationType(mutationType || "");
    },
    []
  );

  const handleChangeBookingHistoryTableFilters = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "fromDate") {
          setBookingHistoryTableFilters((prevData) => ({
            ...prevData,
            [name]: inputValue,
            toDate: null,
          }));
        } else {
          setBookingHistoryTableFilters((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
          setBookingHistoryTablePageNo(0);
        }
      } else {
        setBookingHistoryTableFilters(initialBookingHistoryTableFilters);
      }
    },
    [initialBookingHistoryTableFilters]
  );

  const handleChangeBookingHistoryTablePageNo = useCallback(
    (event, newpage) => {
      console.log(
        "handleChangeBookingHistoryTablePageNo event & newPage : ",
        event,
        newpage
      );
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
        } else if (name === "from") {
          setBookingConfirmationFormData((prevData) => ({
            ...prevData,
            [name]: inputValue,
            to: null,
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

  const handleChangeSelectedFilterInChartComponent = useCallback(
    (filter) => {
      console.log(
        "handleChangeSelectedFilterInChartComponent filter : ",
        filter
      );
      setSelectedFilterInChartComponent((prevData) => {
        if (prevData !== filter) {
          const foundLeftChartComponentItem = [
            ...leftChartLabels,
            ...rightChartLabels,
          ]?.find((item) => item?.key === filter);
          const foundBookingStatusTypeData = foundLeftChartComponentItem
            ? allBookingStatusTypeData?.data?.find(
                (item) => item === foundLeftChartComponentItem?.filterationKey
              )
            : null;
          const foundBookingStatusTypeDataObj = foundBookingStatusTypeData
            ? {
                key: foundBookingStatusTypeData,
                name: foundBookingStatusTypeData.replace(/_/g, " "),
              }
            : null;

          handleChangeBookingHistoryTableFilters(
            "bookingStatus",
            foundBookingStatusTypeDataObj
          );
          return filter;
        } else {
          handleChangeBookingHistoryTableFilters("bookingStatus", null);
          return null;
        }
      });
    },
    [
      handleChangeBookingHistoryTableFilters,
      leftChartLabels,
      rightChartLabels,
      allBookingStatusTypeData,
    ]
  );

  const handleApproveBookingCancelRequest = useCallback(
    (selectedBookingData) => {
      Swal.fire({
        title: "Confirm Refund!",
        text: "Are you Sure To CONFIRM the Booking Cancellation?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            bookingRefNumber: selectedBookingData?.bookingRefNumber || null,
          };
          approveBookingCancelRequest(payload)
            .unwrap()
            .then((res) => {
              setSnack({
                open: true,
                message:
                  res?.message || "Cancellation Ruquest Approve Successfully",
                severity: "success",
              });
            })
            .catch((err) => {
              setSnack({
                open: true,
                message:
                  err?.data?.message ||
                  err?.data ||
                  "Cancellation Ruquest Approve Successfully Failed",
                severity: "error",
              });
            });
        }
      });
    },
    [approveBookingCancelRequest]
  );
  const handleExportBookingHistory = React.useCallback(
    (event) => {
      event.preventDefault();
      exportBookingHistory({
        hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      })
        .unwrap()
        .then((res) => {
          saveAs(res, "BookingHistory_report.xlsx");
          setSnack({
            open: true,
            message: "file downloaded successfully",
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [exportBookingHistory]
  );

  const handleOpenShowcaseBookingDialogForDetails = useCallback(
    (bookingDetails) => {
      setShowcaseBookingDialogData((prevData) => ({
        ...prevData,
        open: true,
        title: "Booking Details",
        type: "bookingDetails",
        bookingDetailsData: bookingDetails || null,
      }));
    },
    []
  );
  const handleCloseShowcaseBookingDialog = useCallback(() => {
    setShowcaseBookingDialogData(initialShowcaseBookingDialogData);
  }, [initialShowcaseBookingDialogData]);
  useEffect(() => {
    if (isRoomBookingHistoryByHotelIdSuccess) {
      setBookingHistoryTableData(
        roomBookingHistoryByHotelIdData?.paginationData?.data || []
      );
    }
  }, [isRoomBookingHistoryByHotelIdSuccess, roomBookingHistoryByHotelIdData]);

  const HandleDynamicFinalApiMutationForPaymentDialog = useCallback(
    (submitType = "") => {
      let mutationFunction = () => {};
      let afterMutationSuccessFunction = () => {};

      if (submitType === "saveCheckIn") {
        // mutationFunction = saveCustomerCheckIn;

        afterMutationSuccessFunction = () => {
          // handleOpenCustomFormDrawer();
          // handleChangeCustomFormDrawerData();
          // handleRoomSelect();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      }

      return {
        mutationFunction,
        afterMutationSuccessFunction,
      };
    },
    [handleChangeSetPaymentDialogFinalPayload]
  );

  const handleOpenAssignServiceDialog = useCallback((rowValue) => {
    setOpenAssignServiceDialog(true);
    setSelectedServiceHistory(rowValue);
  }, []);

  const handleCloseAssignServiceDialog = useCallback(() => {
    setOpenAssignServiceDialog(false);
    setSelectedServiceHistory(null);
    setSelectedStaffForService(null);
  }, []);

  const handleChangeSelectedStaffForService = useCallback((value) => {
    setSelectedStaffForService(value || null);
  }, []);

  const handleAssignRequest = useCallback(() => {
    if (!selectedStaffForService) {
      setSnack({
        open: true,
        message: "Please select staff",
        severity: "error",
      });
      return;
    }

    const payload = {
      id: selectedServiceHistory?.id,
      createdBy: selectedStaffForService?.id,
    };
    assignHouseKeepingRequest(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        handleCloseAssignServiceDialog();
        handleCloseShowcaseBookingDialog();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  }, [
    selectedStaffForService,
    assignHouseKeepingRequest,
    handleCloseAssignServiceDialog,
    selectedServiceHistory,
    handleCloseShowcaseBookingDialog,
  ]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedBookingRefNoSearch(
        bookingHistoryTableFilters?.bookingRefNumber
      );
    }, 700);

    return () => {
      clearTimeout(timerId);
    };
  }, [bookingHistoryTableFilters?.bookingRefNumber]);

  // useEffect(() => {
  //   const response = generateBookingHistoryResponse(
  //     50,
  //     bookingHistoryTableRowsPerPage,
  //     bookingHistoryTablePageNo
  //   );

  //   console.log("generateBookingHistoryResponse response : ", response);
  //   setBookingHistoryTableData(response?.paginationData);
  // }, [bookingHistoryTableRowsPerPage, bookingHistoryTablePageNo]);

  useEffect(() => {
    const customBookingHistoryAlertFilter = sessionStorage.getItem(
      "customBookingHistoryAlertFilter"
    )
      ? JSON.parse(sessionStorage.getItem("customBookingHistoryAlertFilter"))
      : null;
    if (customBookingHistoryAlertFilter) {
      const customBookingStatusTypeDataObj = {
        key: customBookingHistoryAlertFilter,
        name: customBookingHistoryAlertFilter.replace(/_/g, " "),
      };

      handleChangeBookingHistoryTableFilters(
        "bookingStatus",
        customBookingStatusTypeDataObj
      );
      sessionStorage.removeItem("customBookingHistoryAlertFilter");
    }
  }, [handleChangeBookingHistoryTableFilters]);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          // gap: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <CustomHeader
            backNavigate={true}
            headerText={"Booking History"}
            exportExcel={true}
            handlerFunction={handleExportBookingHistory}
          />
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
                width: { lg: "75%", md: "80%", xs: "91%" },
                margin: "auto",
              }}
            >
              <Grid container size={12}>
                <Grid size={6}>
                  <Box
                    sx={{
                      width: "100%",
                    }}
                  >
                    <BookingHistoryChartComponent
                      dataCount={roomBookingChartData?.data}
                      customLabels={leftChartLabels}
                      isActionable={true}
                      showTotal={true}
                      // totalLabel={"Total Bookings"}
                      customTotalKey={"totalBookings"}
                      // totalLabelFontSize={14}
                      pieSelectionFunction={
                        handleChangeSelectedFilterInChartComponent
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box
                    sx={{
                      width: "70%",
                    }}
                  >
                    <BookingHistoryChartComponent
                      dataCount={roomBookingChartData?.data}
                      customLabels={rightChartLabels}
                      showTotal={true}
                      isActionable={true}
                      pieSelectionFunction={
                        handleChangeSelectedFilterInChartComponent
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 80px)",
                  md: "calc(100vh - 235px)",
                  lg: "calc(100vh - 235px)",
                  xl: "calc(100vh - 440px)",
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
                handleApproveBookingCancelRequest={
                  handleApproveBookingCancelRequest
                }
                handleOpenShowcaseBookingDialogForDetails={
                  handleOpenShowcaseBookingDialogForDetails
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <CustomBookingHistoryDrawer
        customDrawerOpen={customBookingHistoryDrawerOpen?.open}
        title={customBookingHistoryDrawerOpen?.title}
        type={customBookingHistoryDrawerOpen?.type}
        handleToggleCustomFormDrawer={handleOpenCustomBookingHistoryDrawer}
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
      <ShowcaseBookingDialog
        openShowcaseBookingDialog={showcaseBookingDialogData?.open}
        handleCloseShowcaseBookingDialog={handleCloseShowcaseBookingDialog}
        title={showcaseBookingDialogData?.title}
        type={showcaseBookingDialogData?.type}
        bookingDetailsData={showcaseBookingDialogData?.bookingDetailsData}
        serviceHistoryTableHeaders={serviceHistoryTableHeaders}
        handleOpenAssignServiceDialog={handleOpenAssignServiceDialog}
      />
      <LoadingComponent
        open={
          isRoomBookingHistoryByHotelIdLoading ||
          isAllBookingStatusTypeDataFetching ||
          confirmBookingByFrontDeskRes?.isLoading ||
          cancelBookingByFrontDeskRes?.isLoading ||
          isRoomtypeByHotelIdForBookingHistoryDataFetching ||
          isGetRoomsByRoomTypeDataFetching ||
          isRoomBookingChartDataLoading ||
          isRoomBookingHistoryByHotelIdFetching ||
          approveBookingCancelRequestRes.isLoading ||
          exportBookingHistoryRes.isLoading ||
          assignHouseKeepingRequestRes?.isLoading ||
          false
        }
      />

      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={paymentDialogFinalPayload}
        setSnack={setSnack}
        reserveHotelRoom={
          HandleDynamicFinalApiMutationForPaymentDialog(
            paymentDialogMutationType
          )?.mutationFunction
        }
        handleAfterSuccessFunction={
          HandleDynamicFinalApiMutationForPaymentDialog(
            paymentDialogMutationType
          )?.afterMutationSuccessFunction
        }
      />
      <HouseKeepingRequestDialog
        open={openAssignServiceDialog}
        onClose={handleCloseAssignServiceDialog}
        selectedServiceHistory={selectedServiceHistory}
        houseKeepingStaffList={houseKeepingStaffList?.data || []}
        handleChangeSelectedStaffForService={
          handleChangeSelectedStaffForService
        }
        handleAssignRequest={handleAssignRequest}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default FrontdeskBookingHistory;
