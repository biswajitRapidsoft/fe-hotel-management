import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  useBookHallFromFrontdeskMutation,
  useChangeHallBookingStatusMutation,
  useGetAllBanquetsByHotelIdQuery,
  useGetAllHallBookingsQuery,
  useGetAllHallsByHotelIdForHallBookingQuery,
  useGetAllHallStatusQuery,
  useGetHallBookingChartQuery,
  useGetIndividualHallBookingDataByIdQuery,
  useCapacityFilterOptionsQuery,
} from "../../services/hallBookingDashboard";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Collapse,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import dayjs from "dayjs";
import {
  CustomPolygonHeader,
  StyledCalendarIcon,
} from "../dashboard/Dashboard";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomCalenderCard from "./CustomCalenderCard";
import HallBookingChartComponent from "./HallBookingChartComponent";
import HallBookingBarChartComponent from "./HallBookingBarChartComponent";

import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import { useGetAllPaymentMethodsQuery } from "../../services/dashboard";
import Swal from "sweetalert2";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { PaymentDialog } from "../dashboard/GuestDashboard";
import ReactDOM from "react-dom";
import { BootstrapDialog } from "../header/Header";
import { FRONTDESK } from "../../helper/constants";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const filterBySelectedDate = (sortedArray, selectedCalendarDate) => {
  if (!selectedCalendarDate) {
    return sortedArray;
  }

  const selectedDayjs = dayjs(selectedCalendarDate).startOf("day");

  if (!selectedDayjs.isValid()) return sortedArray;

  return sortedArray.filter((item) => {
    // Parse start and end times with a specific format to ensure correct parsing
    const start = dayjs(item.startTime, "DD-MM-YYYY HH:mm:ss").startOf("day");
    const end = dayjs(item.endTime, "DD-MM-YYYY HH:mm:ss").startOf("day");

    if (!start.isValid() || !end.isValid()) return false;

    // Check if the selected date is within the start and end dates (inclusive)
    return (
      selectedDayjs.isSameOrAfter(start, "day") &&
      selectedDayjs.isSameOrBefore(end, "day")
    );
  });
};

const sortAndExtractWarnDates = (dataArray) => {
  if (!Array.isArray(dataArray)) return { sortedArray: [], warnDates: [] };

  const dateFormat = "DD-MM-YYYY HH:mm:ss";

  // Sorting array based on `endTime`
  const sortedArray = [...dataArray].sort((a, b) => {
    const endA = dayjs(a?.endTime, dateFormat);
    const endB = dayjs(b?.endTime, dateFormat);

    if (!endA.isValid()) return 1;
    if (!endB.isValid()) return -1;
    return endA.diff(endB);
  });

  const warnDates = new Set();

  sortedArray.forEach((item) => {
    const start = dayjs(item?.startTime, dateFormat);
    const end = dayjs(item?.endTime, dateFormat);

    if (!start.isValid() || !end.isValid()) return;

    let current = start;
    while (current.isSameOrBefore(end, "day")) {
      warnDates.add(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }
  });

  return { sortedArray, warnDates: Array.from(warnDates) };
};

const checkEventConflict = (existingEvents, newEventStart, newEventEnd) => {
  // Convert input times to Day.js objects with specific parsing
  const start = dayjs(newEventStart, "YYYY-MM-DDTHH:mm:ss");
  const end = dayjs(newEventEnd, "YYYY-MM-DDTHH:mm:ss");

  // Validate input times
  if (!start.isValid() || !end.isValid()) return false;

  // Check for conflicts
  return existingEvents.some((event) => {
    const eventStart = dayjs(event.startTime, "DD-MM-YYYY HH:mm:ss");
    const eventEnd = dayjs(event.endTime, "DD-MM-YYYY HH:mm:ss");

    // Scenario 1: Complete overlap
    const completeOverlap =
      start.isSameOrBefore(eventStart) && end.isSameOrAfter(eventEnd);

    // Scenario 2: Partial overlap (new event starts during existing event)
    const startDuringExistingEvent =
      start.isAfter(eventStart) && start.isBefore(eventEnd);

    // Scenario 3: Partial overlap (new event ends during existing event)
    const endDuringExistingEvent =
      end.isAfter(eventStart) && end.isBefore(eventEnd);

    // Scenario 4: Edge case - exact same start time (as per your requirement)
    const exactStartTimeConflict = start.isSame(eventStart, "minute");

    return (
      completeOverlap ||
      startDuringExistingEvent ||
      endDuringExistingEvent ||
      exactStartTimeConflict
    );
  });
};

const CustomHallBookingTableFIlters = memo(function ({
  hallBookingTableFilters,
  handleChangeHallBookingTableFilters,
  hallStatuses,
  handleOpenCustomHallBookingDrawer,
  capacityFilters,
}) {
  console.log("capacityFilters", capacityFilters);
  const handleChangeHallBookingTableFiltersOnChange = useCallback(
    (name, inputValue) => {
      handleChangeHallBookingTableFilters(name, inputValue);
    },
    [handleChangeHallBookingTableFilters]
  );

  const handleOpenCustomHallBookingDrawerOnClick = useCallback(
    (open = false, title = "", type = "") => {
      handleOpenCustomHallBookingDrawer(open, title, type);
    },
    [handleOpenCustomHallBookingDrawer]
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
                value={hallBookingTableFilters?.fromDate}
                onChange={(newVal) =>
                  handleChangeHallBookingTableFiltersOnChange(
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
                value={hallBookingTableFilters?.toDate}
                shouldDisableDate={(date) => {
                  if (hallBookingTableFilters?.fromDate) {
                    return date.isBefore(
                      dayjs(hallBookingTableFilters.fromDate).startOf("day")
                    );
                  }
                  return false;
                }}
                onChange={(newVal) =>
                  handleChangeHallBookingTableFiltersOnChange("toDate", newVal)
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
                hallStatuses?.map((item) => ({
                  key: item,
                  name: item.replace(/_/g, " "),
                })) || []
              }
              fullWidth
              value={hallBookingTableFilters?.hallBookingStatus || null}
              onChange={(e, newVal) =>
                handleChangeHallBookingTableFiltersOnChange(
                  "hallBookingStatus",
                  newVal
                )
              }
              inputValue={hallBookingTableFilters?.hallBookingStatusInputVal}
              onInputChange={(e, newVal) =>
                handleChangeHallBookingTableFiltersOnChange(
                  "hallBookingStatusInputVal",
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
                capacityFilters?.map((item) => ({
                  key: item.id,
                  name: item.type,
                })) || []
              }
              fullWidth
              value={hallBookingTableFilters?.capacity || null}
              onChange={(e, newVal) =>
                handleChangeHallBookingTableFiltersOnChange("capacity", newVal)
              }
              inputValue={hallBookingTableFilters?.capacityInputVal}
              onInputChange={(e, newVal) =>
                handleChangeHallBookingTableFiltersOnChange(
                  "capacityInputVal",
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
                  label="Capacity"
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
        <Grid size={{ xs: 12, md: 2, lg: 5.1, xl: 8 }}></Grid>
        {/* <Grid size={{ xs: 4, md: 6, lg: 8.5, xl: 9.5 }}></Grid> */}
        <Grid size={{ xs: 4, md: 2, lg: 1.5, xl: 1 }}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleOpenCustomHallBookingDrawerOnClick(
                  true,
                  "Hall Booking",
                  "hallBooking"
                )
              }
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                color: "white",
                "&:hover": {
                  backgroundImage:
                    "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                },
              }}
            >
              ADD BOOKING
            </Button>
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
function getHallBookingStatusColor(key) {
  switch (key) {
    case "CONFIRMED":
      return { color: "#0068b7", bgcolor: "#d3ecff" };
    case "STARTED":
      return { color: "#01a837", bgcolor: "#c7ffd9" };
    case "COMPLETED":
      return { color: "#6101a8", bgcolor: "#f0ddff" };
    case "CANCELLED":
      return { color: "#c60000", bgcolor: "#ffd6d6" };
    default:
      return { color: "#4b4b4b", bgcolor: "#dedede" };
  }
}

const CustomHallBookingAlertSection = memo(function ({
  chipData,
  alertData,
  handleChangeHallBookingFilterFromAlertChip,
  filters,
}) {
  const handleChangeHallBookingFilterFromAlertChipOnClick = useCallback(
    (filterationKey) => {
      handleChangeHallBookingFilterFromAlertChip(filterationKey);
    },
    [handleChangeHallBookingFilterFromAlertChip]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "100%", height: "45px" }}>
        <CustomPolygonHeader text="ALERTS" />
      </Box>
      <Box
        sx={{
          width: "100%",
          mt: 2,
          height: "100px",
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
        }}
      >
        {chipData?.map((item, index) => {
          return (
            <Box
              key={`hall-booking-alert-${index}`}
              sx={{
                display: "flex",
                flexDirection: "row",
                boxShadow: filters[item?.filterationKey]
                  ? "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;"
                  : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                border: `2px solid ${item?.customColor}`,
                borderRadius: "5px",
                maxHeight: "35px",
                overflow: "hidden",
                userSelect: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  "& .leftBox": {
                    bgcolor: "#ffffff",
                    color: `${item?.customColor}`,
                  },
                  "& .rightBox": {
                    bgcolor: `${item?.customColor}`,
                    color: "#ffffff",
                  },
                  "& .rightBox .MuiTypography-root": {
                    color: "#ffffff",
                  },
                },
              }}
              onClick={() =>
                handleChangeHallBookingFilterFromAlertChipOnClick(
                  item?.filterationKey
                )
              }
            >
              <Box
                className="leftBox"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  paddingX: "3px",
                  bgcolor: filters[item?.filterationKey]
                    ? "#ffffff"
                    : `${item?.customColor}`,
                  color: filters[item?.filterationKey]
                    ? `${item?.customColor}`
                    : "#ffffff",
                  transition: "all 0.3s ease",
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                  {item?.label}
                </Typography>
              </Box>
              <Box
                className="rightBox"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingX: "12px",
                  minWidth: "40px",
                  bgcolor: filters[item?.filterationKey]
                    ? `${item?.customColor}`
                    : "#ffffff",
                  color: filters[item?.filterationKey]
                    ? "#ffffff"
                    : `${item?.customColor}`,
                  transition: "all 0.3s ease",
                }}
              >
                <Typography sx={{ fontWeight: 550 }}>
                  {alertData?.[item?.key] || "0"}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});

const ShowcaseHallBookingDialog = memo(function ({
  openShowcaseHallBookingDialog,
  handleCloseShowcaseHallBookingDialog,
  title = "",
  type,
  hallBookingDetailsData,
  hallBookingFormData,
  handleChangeHallBookingFormData,
  allPaymentMethods,
  handleChangeHallBookingStatusToComplete,
}) {
  console.log("type : ", type);
  console.log(
    "ShowcaseBookingDialog hallBookingDetailsData : ",
    hallBookingDetailsData
  );

  // const totalExpense = useMemo(
  //   () =>
  //     hallBookingDetailsData?.transactionDetails
  //       ?.filter((item) => !Boolean(item?.isCredit))
  //       ?.reduce((sum, item) => sum + (item.amount || 0), 0),
  //   [hallBookingDetailsData]
  // );
  // const totalAmountPaid = useMemo(
  //   () =>
  //     hallBookingDetailsData?.transactionDetails
  //       ?.filter((item) => Boolean(item?.isCredit))
  //       ?.reduce((sum, item) => sum + (item.amount || 0), 0),
  //   [hallBookingDetailsData]
  // );

  const remainingAmountToPay = useMemo(() => {
    return (
      (hallBookingDetailsData?.totalPrice || 0) +
      (hallBookingDetailsData?.totalBanquetPrice || 0) -
      (hallBookingDetailsData?.paidAmount || 0)
    );
  }, [hallBookingDetailsData]);

  const handleChangeHallBookingFormDataOnChange = useCallback(
    (name, value) => {
      handleChangeHallBookingFormData(name, value);
    },
    [handleChangeHallBookingFormData]
  );

  const handleCloseShowcaseHallBookingDialogOnClose = useCallback(() => {
    handleCloseShowcaseHallBookingDialog();
  }, [handleCloseShowcaseHallBookingDialog]);

  const handleChangeHallBookingStatusToCompleteOnClick = useCallback(
    (hallValue, remainingAmountToPayout) => {
      handleChangeHallBookingStatusToComplete(
        hallValue,
        remainingAmountToPayout
      );
    },
    [handleChangeHallBookingStatusToComplete]
  );

  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={openShowcaseHallBookingDialog}
        onClose={handleCloseShowcaseHallBookingDialogOnClose}
        aria-labelledby="booking-details-dialog-title"
        maxWidth="sm"
        fullWidth
        // maxWidth=""
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
          id="hall-booking-dialog-title"
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
          onClick={handleCloseShowcaseHallBookingDialogOnClose}
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
            <Grid container size={12} spacing={1}>
              <Grid size={3}>
                <Typography
                  sx={{
                    fontSize: "15.5px",
                    // color: "#707070",
                    // fontWeight: 600,
                  }}
                >
                  Hall Charges
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      // fontWeight: 600,
                      marginRight: "5px",
                    }}
                  >
                    :
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 550,
                    }}
                  >
                    {hallBookingDetailsData?.totalPrice || "0"}
                  </Typography>
                </Typography>
              </Grid>
              {hallBookingDetailsData?.isBanquetRequired && (
                <Grid size={3}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      // fontWeight: 600,
                    }}
                  >
                    Banquet Charges
                  </Typography>
                </Grid>
              )}
              {hallBookingDetailsData?.isBanquetRequired && (
                <Grid size={3}>
                  <Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        // fontWeight: 600,
                        marginRight: "5px",
                      }}
                    >
                      :
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 550,
                      }}
                    >
                      {hallBookingDetailsData?.totalBanquetPrice || "0"}
                    </Typography>
                  </Typography>
                </Grid>
              )}

              <Grid size={3}>
                <Typography
                  sx={{
                    fontSize: "15.5px",
                    // color: "#707070",
                    // fontWeight: 600,
                  }}
                >
                  Paid
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      // fontWeight: 600,
                      marginRight: "5px",
                    }}
                  >
                    :
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 550,
                    }}
                  >
                    {hallBookingDetailsData?.paidAmount || "0"}
                  </Typography>
                </Typography>
              </Grid>

              <Grid size={3}>
                <Typography
                  sx={{
                    fontSize: "15.5px",
                    // color: "#707070",
                    // fontWeight: 600,
                  }}
                >
                  Remaining
                </Typography>
              </Grid>
              <Grid size={3}>
                <Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      // fontWeight: 600,
                      marginRight: "5px",
                    }}
                  >
                    :
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 550,
                    }}
                  >
                    {remainingAmountToPay > 0 ? remainingAmountToPay : "0"}
                  </Typography>
                </Typography>
              </Grid>

              {Boolean(remainingAmountToPay > 0) && (
                <Grid size={12}>
                  <Grid container size={12} spacing={1}>
                    <Grid size={6}>
                      <Box
                        sx={{
                          paddingTop: "1.5px",
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
                          ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                            {
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                            },
                          ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                            {
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
                          fullWidth
                          options={
                            allPaymentMethods?.data
                              ?.filter((item) =>
                                ["Cash", "Online"].includes(item)
                              )
                              ?.map((item) => ({
                                key: item,
                                name: item.replace(/_/g, " "),
                              })) || []
                          }
                          disableClearable
                          value={hallBookingFormData?.paymentMethod || null}
                          onChange={(e, newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "paymentMethod",
                              newVal
                            )
                          }
                          inputValue={
                            hallBookingFormData?.paymentMethodInputValue || ""
                          }
                          onInputChange={(e, newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "paymentMethodInputValue",
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
                              label="Payment Method"
                              variant="standard"
                              // sx={{
                              //   "& .MuiOutlinedInput-root": {
                              //     borderRadius: 2,
                              //   },
                              // }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        fullWidth
                        disabled={!Boolean(hallBookingFormData?.paymentMethod)}
                        id={`paidAmount`}
                        label="Amount"
                        name="paidAmount"
                        autoComplete="paidAmount"
                        variant="standard"
                        inputProps={{
                          maxLength: 20,
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
                          "& .MuiInputBase-root": {
                            height: "23px",
                          },
                          "& .MuiTextField-root": {
                            maxHeight: "30px",
                            backgroundColor: "transparent",
                          },
                        }}
                        value={hallBookingFormData?.paidAmount || ""}
                        onChange={(e) =>
                          handleChangeHallBookingFormDataOnChange(
                            "paidAmount",
                            e?.target?.value
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {Boolean(remainingAmountToPay < 0) && (
                <Typography>{`An amount of Rs. ${Math.abs(
                  remainingAmountToPay
                )} to be paid to the customer`}</Typography>
              )}

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      backgroundImage:
                        "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                      color: "white",
                      "&:hover": {
                        backgroundImage:
                          "linear-gradient(to right, #0acffe 10%, #495aff 90%)", // Optional hover adjustment
                      },
                    }}
                    onClick={() =>
                      handleChangeHallBookingStatusToCompleteOnClick(
                        hallBookingDetailsData,
                        remainingAmountToPay
                      )
                    }
                  >
                    Complete Event
                  </Button>
                </Box>
              </Grid>
            </Grid>
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
  handleChangeHallBookingStatus,
  handleOpenShowcaseHallBookingDialogForDetails,
}) {
  const handleChangeHallBookingStatusOnClick = useCallback(
    (name, selectedHallBookingData) => {
      handleChangeHallBookingStatus(name, selectedHallBookingData);
    },
    [handleChangeHallBookingStatus]
  );

  const handleOpenShowcaseHallBookingDialogForDetailsOnClick = useCallback(
    (rowValue) => {
      handleOpenShowcaseHallBookingDialogForDetails(rowValue);
    },
    [handleOpenShowcaseHallBookingDialogForDetails]
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
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {rowSerialNumber}
              </Typography>
            ) : subitem?.key === "guestName" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {[row?.firstName, row?.middleName, row?.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </Typography>
            ) : subitem?.key === "hallName" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {row?.hallDetailsDto && row?.hallDetailsDto?.hallName}
              </Typography>
            ) : subitem?.key === "startTime" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {row?.startTime &&
                  moment(row?.startTime, "DD-MM-YYYY HH:mm:ss")
                    // .utc()
                    .format("DD-MM-YYYY hh:mm A")}
              </Typography>
            ) : subitem?.key === "endTime" ? (
              <Typography sx={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                {row?.endTime &&
                  moment(row?.endTime, "DD-MM-YYYY HH:mm:ss")
                    // .utc()
                    .format("DD-MM-YYYY hh:mm A")}
              </Typography>
            ) : subitem?.key === "hallStatus" ? (
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
                  color: getHallBookingStatusColor(row?.hallStatus)?.color,
                  backgroundColor: getHallBookingStatusColor(row?.hallStatus)
                    ?.bgcolor,
                  fontWeight: 600,
                  border: `0.5px solid ${
                    getHallBookingStatusColor(row?.hallStatus)?.color
                  }`,
                  py: 0.7,
                  px:
                    (
                      row?.hallStatus
                        ?.replace(/_/g, " ")
                        ?.toLowerCase()
                        ?.replace(/^\w/, (char) => char.toUpperCase()) || ""
                    ).length > 28
                      ? "10px"
                      : "33px",
                  textAlign: "center",
                  // width: "178px",
                  width: "auto",
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {row?.hallStatus
                  ?.replace(/_/g, " ")
                  ?.toLowerCase()
                  ?.replace(/^\w/, (char) => char.toUpperCase())}
              </Box>
            ) : // </Typography>
            subitem?.key === "hallBookingAction" ? (
              <>
                {row?.hallStatus === "CONFIRMED" && (
                  <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <Tooltip title={"Start Event"} arrow>
                      <Button
                        variant="outlined"
                        // color="success"
                        sx={{ minWidth: "unset", width: "11px" }}
                        onClick={() =>
                          handleChangeHallBookingStatusOnClick(
                            "startlHallEvent",
                            row
                          )
                        }
                      >
                        <PlayCircleOutlineIcon
                          sx={{ fontSize: "14px", fontWeight: 600 }}
                        />
                      </Button>
                    </Tooltip>

                    <Tooltip title={"Cancel Event"} arrow>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ minWidth: "unset", width: "11px" }}
                        onClick={() =>
                          handleChangeHallBookingStatusOnClick(
                            "cancelHallEvent",
                            row
                          )
                        }
                      >
                        <CloseIcon sx={{ fontSize: "14px", fontWeight: 600 }} />
                      </Button>
                    </Tooltip>
                  </Box>
                )}
                {row?.hallStatus === "STARTED" && (
                  <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <Tooltip title={"Complete Event"} arrow>
                      <Button
                        variant="outlined"
                        color="success"
                        sx={{ minWidth: "unset", width: "11px" }}
                        onClick={() =>
                          handleOpenShowcaseHallBookingDialogForDetailsOnClick(
                            row
                          )
                        }
                      >
                        <CheckIcon sx={{ fontSize: "14px", fontWeight: 600 }} />
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </>
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

const CustomHallBookingTableContainer = memo(function ({
  tableHeaders,
  tableData,
  pageNo,
  pageSize,
  handlePageChange,
  handleChangeRowsPerPage,
  handleChangeHallBookingStatus,
  handleOpenShowcaseHallBookingDialogForDetails,
}) {
  console.log("CustomHallBookingTableContainer tableData : ", tableData);
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            // xs: "calc(100vh - 465px)",
            // xl: "calc(100vh - 465px)",
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
                      paddingY: "10px",

                      fontSize: "14px",
                      whiteSpace: "nowrap",
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
                  handleChangeHallBookingStatus={handleChangeHallBookingStatus}
                  handleOpenShowcaseHallBookingDialogForDetails={
                    handleOpenShowcaseHallBookingDialogForDetails
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

const CustomChipTypeButton = memo(function ({
  data,
  isSelectedChip,
  handleChangeSelectedHallChip,
}) {
  const handleChangeSelectedHallChipOnClick = useCallback(
    (selectedHall) => {
      handleChangeSelectedHallChip(selectedHall);
    },
    [handleChangeSelectedHallChip]
  );

  return (
    <Button
      variant="contained"
      size="small"
      sx={{
        minWidth: "unset",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "12px",
        fontWeight: 550,
        paddingX: "5px",
        paddingY: "0px",
        backgroundImage: isSelectedChip
          ? "linear-gradient(to right, #66a1b8 0%, #457b9d 100%)"
          : "linear-gradient(to right, #56c0c6 0%, #0fa3b1 100%)", // Default gradient with light color on the left
        color: "white",
        "&:hover": {
          backgroundImage: isSelectedChip
            ? "linear-gradient(to right, #66a1b8 100%, #457b9d 0%)"
            : "linear-gradient(to right, #56c0c6 100%, #0fa3b1 0%)", // Reverse gradient with light color on the right on hover
        },
      }}
      onClick={() => handleChangeSelectedHallChipOnClick(data)}
    >
      {data?.hallName}
    </Button>
  );
});
const HallListChipCard = memo(function ({
  hallsData,
  selectedHallChip,
  handleChangeSelectedHallChip,
}) {
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
            mt: 1,
            display: "flex",
            flexGrow: 1,
            flexWrap: "wrap",
            overflowY: "auto",
            columnGap: 1,
            rowGap: 0.7,
            paddingBottom: 0.5,
          }}
        >
          {Boolean(hallsData?.length) &&
            hallsData?.map((item, index) => {
              return (
                <CustomChipTypeButton
                  key={`Hall-chipButton-${index}`}
                  data={item}
                  isSelectedChip={
                    Boolean(selectedHallChip?.id === item?.id) ? true : false
                  }
                  handleChangeSelectedHallChip={handleChangeSelectedHallChip}
                />
              );
            })}
        </Box>
      </Box>
    </>
  );
});

const CustomEventList = memo(function ({ eventListData }) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        columnGap: 2,
        rowGap: 1,
      }}
    >
      {Boolean(eventListData?.length) ? (
        <>
          {eventListData?.map((item, index) => {
            return (
              <Paper
                key={`event-minicard-${index}`}
                elevation={1}
                sx={{
                  padding: 1,
                  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
                }}
              >
                <Box>
                  <Typography>{item?.eventName}</Typography>
                  <Typography>
                    {item?.startTime &&
                      moment(item?.startTime, "DD-MM-YYYY HH:mm:ss").format(
                        "DD-MM-YYYY hh:mm A"
                      )}
                  </Typography>
                  <Typography>
                    {item?.endTime &&
                      moment(item?.endTime, "DD-MM-YYYY HH:mm:ss").format(
                        "DD-MM-YYYY hh:mm A"
                      )}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </>
      ) : (
        <Typography>There is no event.</Typography>
      )}
    </Box>
  );
});

const CustomHallBookingDrawer = memo(function ({
  customDrawerOpen,
  title,
  type,
  handleToggleCustomFormDrawer,
  hallBookingFormData,
  handleChangeSelectedHallBooking,
  handleChangeHallBookingFormData,
  selectedHallBooking,
  allHallsData,
  selectedHallChip,
  handleChangeSelectedHallChip,
  warnDates,
  sortedArray,
  allBanquetsByHotelIdData,
  allPaymentMethods,
  handleSubmitBookHallFromFrontdesk,
}) {
  console.log("CustomFormDrawer customDrawerOpen : ", customDrawerOpen, type);
  const [selectedDateOnCalendar, setSelectedDateOnCalendar] = useState(null);

  console.log("selectedDateOnCalendar : ", selectedDateOnCalendar);

  const finalFilteredEvent = useMemo(
    () => filterBySelectedDate(sortedArray, selectedDateOnCalendar),
    [sortedArray, selectedDateOnCalendar]
  );

  console.log("finalFilteredEvent : ", finalFilteredEvent);

  const handleChangeSetSelectedDateOnCalendar = useCallback((selectedDate) => {
    setSelectedDateOnCalendar((prevState) => {
      const newSelectedDate = dayjs(selectedDate).startOf("day"); // Strip off time part
      console.log(
        "handleChangeSetSelectedDateOnCalendar selectedDate : ",
        selectedDate
      );
      const prevSelectedDate = prevState
        ? dayjs(prevState).startOf("day")
        : null;

      // Compare dates without time, if same, set null; otherwise, set the new date
      if (newSelectedDate.isSame(prevSelectedDate)) {
        return null; // If the same date is selected, set it to null
      } else {
        return selectedDate; // Otherwise, set the new selected date
      }
    });
  }, []);

  const handleToggleCustomFormDrawerOnChange = useCallback(() => {
    handleToggleCustomFormDrawer();
    handleChangeSelectedHallBooking();
    handleChangeSetSelectedDateOnCalendar();
  }, [
    handleToggleCustomFormDrawer,
    handleChangeSelectedHallBooking,
    handleChangeSetSelectedDateOnCalendar,
  ]);

  const handleChangeHallBookingFormDataOnChange = useCallback(
    (name, value) => {
      handleChangeHallBookingFormData(name, value);
    },
    [handleChangeHallBookingFormData]
  );
  // const handleChangeSetSelectedDateOnCalendar = useCallback((selectedDate) => {
  //   setSelectedDateOnCalendar(selectedDate);
  //   // handleChangeHallBookingFormDataOnChange("startTime", dayjs(selectedDate));
  // }, []);

  //   const handleChangeBookingConfirmationOnClick = useCallback(
  //     (name, roomId) => {
  //       handleChangeBookingConfirmation(name, roomId);
  //     },
  //     [handleChangeBookingConfirmation]
  //   );

  const handleSubmitBookHallFromFrontdeskOnClick = useCallback(() => {
    handleSubmitBookHallFromFrontdesk();
  }, [handleSubmitBookHallFromFrontdesk]);

  useEffect(() => {
    if (customDrawerOpen && selectedHallBooking) {
      handleChangeHallBookingFormDataOnChange("fullCheck", selectedHallBooking);
    }
  }, [
    handleChangeHallBookingFormDataOnChange,
    customDrawerOpen,
    selectedHallBooking,
  ]);

  return (
    <Drawer
      anchor="right"
      open={customDrawerOpen}
      onClose={() => handleToggleCustomFormDrawerOnChange()}
      sx={{ zIndex: 1300 }}
    >
      <Box sx={{ width: 500, paddingBottom: "15px" }} role="presentation">
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
          {type === "hallBooking" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12} columnSpacing={1}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Customer Details :
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      // autoComplete="firstName"
                      variant="standard"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={hallBookingFormData?.firstName || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "firstName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      // required
                      fullWidth
                      id="middleName"
                      label="Middle Name"
                      name="middleName"
                      // autoComplete="middleName"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      variant="standard"
                      value={hallBookingFormData?.middleName || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "middleName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      // required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      // autoComplete="lastName"
                      variant="standard"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={hallBookingFormData?.lastName || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "lastName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="phoneNumber"
                      label="Phone No."
                      name="phoneNumber"
                      inputProps={{
                        maxLength: 10,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      // autoComplete="phoneNumber"
                      variant="standard"
                      value={hallBookingFormData?.phoneNumber || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "phoneNumber",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      // autoComplete="email"
                      variant="standard"
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
                      value={hallBookingFormData?.email || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "email",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="customerAddress"
                      label="Address"
                      name="customerAddress"
                      // autoComplete="customerAddress"
                      variant="standard"
                      inputProps={{
                        maxLength: 150,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={hallBookingFormData?.customerAddress || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "customerAddress",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="eventName"
                      label="Event Name"
                      name="eventName"
                      // autoComplete="eventName"
                      variant="standard"
                      inputProps={{
                        maxLength: 150,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={hallBookingFormData?.eventName || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "eventName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="noOfGuest"
                      label="No. of Guests"
                      name="noOfGuest"
                      // autoComplete="noOfGuest"
                      variant="standard"
                      inputProps={{
                        maxLength: 5,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={hallBookingFormData?.noOfGuest || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "noOfGuest",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    backgroundColor: "#B0B0B0",
                    my: 0.5,
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    // boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
                    // borderRadius: "10px",
                  }}
                >
                  <Box sx={{ width: "100%", p: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Date wise Halls Availability :
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      // border: "2px solid black",
                      // box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
                      // box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
                      px: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: "55%",
                        maxHeight: "190px",
                        overflowY: "auto",
                        // mt: 1.5,
                      }}
                    >
                      <HallListChipCard
                        hallsData={allHallsData}
                        selectedHallChip={selectedHallChip}
                        handleChangeSelectedHallChip={
                          handleChangeSelectedHallChip
                        }
                      />
                    </Box>
                    <Box sx={{ width: "45%" }}>
                      <Collapse in={true} timeout="auto">
                        <CustomCalenderCard
                          onDateSelect={(date) => {
                            console.log("Selected date:", date);
                            handleChangeSetSelectedDateOnCalendar(date);
                          }}
                          warnDates={warnDates}
                        />
                      </Collapse>
                    </Box>
                  </Box>
                </Box>

                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    backgroundColor: "#B0B0B0",
                    my: 0.5,
                  }}
                />
              </Grid>

              <Grid size={12}>
                <Typography
                  sx={{
                    fontSize: "15.5px",
                    // color: "#707070",
                    fontWeight: 600,
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  {`Events on the selected date : ${
                    selectedDateOnCalendar
                      ? `(${dayjs(selectedDateOnCalendar).format(
                          "DD-MM-YYYY"
                        )})`
                      : ""
                  }`}
                </Typography>
                <Box sx={{ width: "100%", marginY: "2px" }}>
                  <CustomEventList eventListData={finalFilteredEvent} />
                </Box>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    backgroundColor: "#B0B0B0",
                    my: 1.5,
                  }}
                />{" "}
              </Grid>

              <Grid size={12}>
                <Grid container size={12} columnSpacing={1}>
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        fontWeight: 600,
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Booking Info :
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
                        paddingBottom: "8px",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          disablePast
                          value={hallBookingFormData?.startTime || null}
                          onChange={(newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "startTime",
                              newVal
                            )
                          }
                          slotProps={{
                            textField: {
                              variant: "standard",
                              size: "small",
                              readOnly: true,
                              label: "Start Time",
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
                                  fontSize: 13,
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
                          //   format="DD-MM-YYYY"
                          format="DD-MM-YYYY hh:mm A"
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
                        justifyContent: "flex-end",
                        paddingBottom: "8px",
                      }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                          disablePast
                          minDateTime={
                            hallBookingFormData?.startTime
                              ? dayjs(hallBookingFormData?.startTime)
                              : // .add(1, "day")
                                undefined
                          }
                          value={hallBookingFormData?.endTime || null}
                          onChange={(newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "endTime",
                              newVal
                            )
                          }
                          slotProps={{
                            textField: {
                              variant: "standard",
                              size: "small",
                              readOnly: true,
                              label: "End Time",
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
                                  fontSize: 13,
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
                          //   format="DD-MM-YYYY"
                          format="DD-MM-YYYY hh:mm A"
                        />
                      </LocalizationProvider>
                    </Box>
                  </Grid>
                  {(hallBookingFormData?.estimatedHours > 0 ||
                    hallBookingFormData?.estimatedDays > 0) && (
                    <Grid size={12}>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "10px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#eee6ff",
                          color: "#2c0087",
                        }}
                      >
                        <Typography sx={{ fontSize: "13px", fontWeight: 550 }}>
                          Booking Duration:{" "}
                          {hallBookingFormData?.estimatedDays > 0 &&
                            `${hallBookingFormData?.estimatedDays} ${
                              hallBookingFormData?.estimatedDays === 1
                                ? "day"
                                : "days"
                            }`}
                          {hallBookingFormData?.estimatedDays > 0 &&
                            hallBookingFormData?.estimatedHours > 0 &&
                            " & "}
                          {hallBookingFormData?.estimatedHours > 0 &&
                            `${hallBookingFormData?.estimatedHours} ${
                              hallBookingFormData?.estimatedHours === 1
                                ? "hour"
                                : "hours"
                            }`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "10px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                          marginTop: "10px",
                        }}
                      >
                        <Typography sx={{ fontSize: "13px", fontWeight: 550 }}>
                          Estimated Price:{" "}
                          {hallBookingFormData?.totalHallDurationPrice || "0"}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hallBookingFormData?.isBanquetRequired}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "isBanquetRequired",
                          e?.target?.checked
                        )
                      }
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "14px", color: "#666666" }}>
                      Banquet required
                    </Typography>
                  }
                  labelPlacement="end"
                />
              </Grid>
              {hallBookingFormData?.isBanquetRequired ? (
                <Grid size={12}>
                  <Grid container size={12} spacing={1}>
                    <Grid size={6}>
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
                          ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                            {
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                            },
                          ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                            {
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                            },
                        }}
                      >
                        <Autocomplete
                          options={allBanquetsByHotelIdData || []}
                          disableClearable
                          fullWidth
                          value={hallBookingFormData?.banquetDetails || null}
                          onChange={(e, newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "banquetDetails",
                              newVal
                            )
                          }
                          inputValue={
                            hallBookingFormData?.banquetDetailsInputVal
                          }
                          onInputChange={(e, newVal) =>
                            handleChangeHallBookingFormDataOnChange(
                              "banquetDetailsInputVal",
                              newVal
                            )
                          }
                          getOptionLabel={(option) =>
                            option?.type
                              ?.replace(/_/g, " ")
                              ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                              ?.replace(/\b\w/g, (char) =>
                                char.toUpperCase()
                              ) || ""
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
                              label="Banquet Type"
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
                    <Grid size={6}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "7px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#c6fff0",
                          color: "#006d50",
                        }}
                      >
                        <Typography sx={{ fontSize: "13px", fontWeight: 550 }}>
                          Price Per Plate:{" "}
                          {hallBookingFormData?.banquetDetails?.perPlatePrice ||
                            "0"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        required
                        fullWidth
                        id="noOfPlates"
                        label="Plates"
                        name="noOfPlates"
                        inputProps={{
                          maxLength: 10,
                          style: {
                            fontSize: "14px",
                          },
                        }}
                        InputLabelProps={{
                          style: {
                            fontSize: "13px",
                          },
                        }}
                        // autoComplete="noOfPlates"
                        variant="standard"
                        value={hallBookingFormData?.noOfPlates || ""}
                        onChange={(e) =>
                          handleChangeHallBookingFormDataOnChange(
                            "noOfPlates",
                            e?.target?.value
                          )
                        }
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "23px",
                          },
                          "& .MuiTextField-root": {
                            maxHeight: "30px",
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "7px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#DBEAFE",
                          color: "#1E40AF",
                        }}
                      >
                        <Typography sx={{ fontSize: "13px", fontWeight: 550 }}>
                          Total Price:{" "}
                          {hallBookingFormData?.totalBanquetPlatePrice || "0"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                ""
              )}
              <Grid size={{ xs: 12 }}>
                <Divider
                  sx={{
                    borderBottomWidth: 2,
                    backgroundColor: "#B0B0B0",
                    my: 0.5,
                  }}
                />
              </Grid>
              <Grid size={12}>
                <Typography
                  sx={{
                    fontSize: "15.5px",
                    // color: "#707070",
                    fontWeight: 600,
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  Payments :
                </Typography>
              </Grid>
              <Grid size={12}>
                <Grid container size={12} spacing={1}>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "13px",
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
                          fontSize: "13px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {parseFloat(
                          hallBookingFormData?.subtotalAdvanceAmount * 2
                        ).toFixed(3)}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Advance (50%)
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "13px",
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
                          fontSize: "13px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {parseFloat(
                          hallBookingFormData?.subtotalAdvanceAmount
                        ).toFixed(3)}
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Grid container size={12} spacing={1}>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Box
                      sx={{
                        paddingTop: "1.5px",
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
                        fullWidth
                        options={
                          allPaymentMethods?.data
                            ?.filter((item) =>
                              ["Cash", "Online"].includes(item)
                            )
                            ?.map((item) => ({
                              key: item,
                              name: item.replace(/_/g, " "),
                            })) || []
                        }
                        disableClearable
                        value={hallBookingFormData?.paymentMethod || null}
                        onChange={(e, newVal) =>
                          handleChangeHallBookingFormDataOnChange(
                            "paymentMethod",
                            newVal
                          )
                        }
                        inputValue={
                          hallBookingFormData?.paymentMethodInputValue || ""
                        }
                        onInputChange={(e, newVal) =>
                          handleChangeHallBookingFormDataOnChange(
                            "paymentMethodInputValue",
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
                            label="Payment Method"
                            variant="standard"
                            // sx={{
                            //   "& .MuiOutlinedInput-root": {
                            //     borderRadius: 2,
                            //   },
                            // }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  {hallBookingFormData?.paymentMethod &&
                    !(hallBookingFormData?.paymentMethod?.key === "Cash") &&
                    !(hallBookingFormData?.paymentMethod?.key === "Online") && (
                      <Grid size={{ xs: 6, md: 4 }}>
                        <TextField
                          required
                          fullWidth
                          id={`transactionReferenceNo`}
                          label="Transaction ref. No."
                          name="transactionReferenceNo"
                          autoComplete="transactionReferenceNo"
                          variant="standard"
                          value={
                            hallBookingFormData?.transactionReferenceNo || ""
                          }
                          inputProps={{
                            maxLength: 80,
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
                            "& .MuiInputBase-root": {
                              height: "23px",
                            },
                            "& .MuiTextField-root": {
                              maxHeight: "30px",
                              backgroundColor: "transparent",
                            },
                          }}
                          onChange={(e) =>
                            handleChangeHallBookingFormDataOnChange(
                              "transactionReferenceNo",
                              e?.target?.value
                            )
                          }
                        />
                      </Grid>
                    )}

                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      disabled={!Boolean(hallBookingFormData?.paymentMethod)}
                      id={`paidAmount`}
                      label="Amount"
                      name="paidAmount"
                      autoComplete="paidAmount"
                      variant="standard"
                      inputProps={{
                        maxLength: 20,
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
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                      value={hallBookingFormData?.paidAmount || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "paidAmount",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      // required
                      fullWidth
                      id={`specialRequirements`}
                      label="Special Requirements"
                      name="specialRequirements"
                      autoComplete="specialRequirements"
                      variant="standard"
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
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                      value={hallBookingFormData?.specialRequirements || ""}
                      onChange={(e) =>
                        handleChangeHallBookingFormDataOnChange(
                          "specialRequirements",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <Box sx={{ width: "100%", marginY: "2px" }}>
                  <Button
                    variant="contained"
                    color="success"
                    // disabled={!hallBookingFormData?.roomDto?.id}
                    sx={{ fontSize: "11px" }}
                    onClick={() => handleSubmitBookHallFromFrontdeskOnClick()}
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

const HallBookingDashboard = () => {
  const initialHallBookingTableFilters = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      hallBookingStatus: null,
      hallBookingStatusInputVal: "",
      bookingRefNumber: "",
      isForLiveEvents: false,
      isForTodayEvents: false,
      isForFutureEvents: false,
      isForExpiredEvents: false,
      capacity: null,
      capacityInputVal: "",
    }),
    []
  );
  const hallBookingTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Guest Name", key: "guestName" },
      { label: "Phone No.", key: "phoneNumber" },
      { label: "Event Name", key: "eventName" },
      { label: "Hall Name", key: "hallName" },
      { label: "Event Date", key: "eventDate" },
      { label: "From", key: "startTime" },
      { label: "To", key: "endTime" },
      { label: "Total Guests", key: "noOfGuest" },
      { label: "Total Hall Price", key: "totalPrice" },
      { label: "Total Banquet Price", key: "totalBanquetPrice" },
      { label: "Amount Paid", key: "paidAmount" },
      { label: "Status", key: "hallStatus" },
      { label: "Action", key: "hallBookingAction" },
    ],
    []
  );

  const initialHallBookingFormData = useMemo(
    () => ({
      startTime: null,
      toDate: null,
      eventDate: null,
      endTime: null,
      eventName: "",
      noOfGuest: "1",
      banquetDetails: null,
      banquetDetailsInputVal: "",
      paymentMethod: null,
      paymentMethodInputValue: "",
      transactionReferenceNo: "",
      paidAmount: "",
      specialRequirements: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      customerAddress: "",
      pricePerDay: 0,
      pricePerHour: 0,
      capacity: 0,
      noOfPlates: 0,
      advanceAmount: 0,
      totalBanquetPlatePrice: 0,
      estimatedDays: 0,
      estimatedHours: 0,
      totalHallDurationPrice: 0,
      subtotalAdvanceAmount: 0,
      isBanquetRequired: false,
    }),
    []
  );

  const pieChartLabels = useMemo(
    () => [
      {
        name: "Confirmed",
        key: "bookedHallCount",
        color: "#0f4392",
        filterationKey: "CONFIRMED",
      },
      {
        name: "Started",
        key: "noOfStartedEventsCount",
        color: "#0fd87c",
        filterationKey: "STARTED",
      },
      {
        name: "Completed",
        key: "completedHallCount",
        color: "#6101a8",
        filterationKey: "COMPLETED",
      },
      {
        name: "Canceled",
        key: "cancelledHallCount",
        color: "#f73859",
        filterationKey: "CANCELLED",
      },
    ],
    []
  );

  const customHallAlertChips = useMemo(
    () => [
      {
        label: "Live",
        key: "noOfStartedEventsCount",
        filterationKey: "isForLiveEvents",
        customColor: "#0a853e",
      },
      {
        label: "Today",
        key: "todayEventsCount",
        filterationKey: "isForTodayEvents",
        customColor: "#290383",
      },
      {
        label: "Upcoming",
        key: "futureEventsCount",
        filterationKey: "isForFutureEvents",
        customColor: "#087eb9",
      },
      {
        label: "Expired",
        key: "pastEventsNotCompleted",
        filterationKey: "isForExpiredEvents",
        customColor: "#bd4707",
      },
    ],
    []
  );

  const initialShowcaseHallBookingDialogData = useMemo(
    () => ({
      open: false,
      title: "",
      type: null,
      hallBookingDetailsData: null,
    }),
    []
  );

  const [hallBookingTableFilters, sethallBookingTableFilters] = useState(
    initialHallBookingTableFilters
  );
  console.log("hallBookingTableFilters : ", hallBookingTableFilters);

  const [hallBookingTablePageNo, setHallBookingTablePageNo] = useState(0);
  console.log(" hallBookingTablePageNo : ", hallBookingTablePageNo);
  const [hallBookingTableRowsPerPage, setHallBookingTableRowsPerPage] =
    useState(10);
  console.log(" hallBookingTableRowsPerPage : ", hallBookingTableRowsPerPage);

  const [selectedHallChip, setSelectedHallChip] = useState(null);
  console.log("selectedHallChip : ", selectedHallChip);

  const [bookHallFromFrontdesk, bookHallFromFrontdeskres] =
    useBookHallFromFrontdeskMutation();
  const [changeHallBookingStatus, changeHallBookingStatusRes] =
    useChangeHallBookingStatusMutation();

  const {
    data: getAllHallBookingsData = {
      paginationData: {
        numberOfElements: 0,
        totalElements: 0,
        totalPages: 0,
        data: [],
      },
    },
    isLoading: isGetAllHallBookingsDataLoading,
  } = useGetAllHallBookingsQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      pageNo: hallBookingTablePageNo,
      pageSize: hallBookingTableRowsPerPage,
      status: hallBookingTableFilters?.hallBookingStatus?.key || null,
      isForLiveEvents: hallBookingTableFilters?.isForLiveEvents || false,
      isForTodayEvents: hallBookingTableFilters?.isForTodayEvents || false,
      isForFutureEvents: hallBookingTableFilters?.isForFutureEvents || false,
      isForExpiredEvents: hallBookingTableFilters?.isForExpiredEvents || false,
      capacity: hallBookingTableFilters?.capacity?.name,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data"))?.hotelId ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("getAllHallBookingsData : ", getAllHallBookingsData);

  const {
    data: allHallStatusTypeData = { data: [] },
    isFetching: isAllHallStatusTypeDataFetching,
  } = useGetAllHallStatusQuery(
    {},
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  const {
    data: allCapacityFilters = { data: [] },
    // isLoading: isGetAllHallCapacityDataLoading,
  } = useCapacityFilterOptionsQuery();

  console.log("allCapacityFilters", allCapacityFilters);
  // {},
  // {
  //   skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
  // }

  console.log("allHallStatusTypeData : ", allHallStatusTypeData);

  const {
    data: allHallsByHotelIdForHallBooking = { data: [] },
    isFetching: isAllHallsByHotelIdForHallBookingFetching,
  } = useGetAllHallsByHotelIdForHallBookingQuery(
    { hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data"))?.hotelId ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

  console.log(
    "allHallsByHotelIdForHallBooking : ",
    allHallsByHotelIdForHallBooking
  );

  // ========

  const {
    data: allBanquetsByHotelIdData = { data: [] },
    isFetching: isAllBanquetsByHotelIdDataFetching,
  } = useGetAllBanquetsByHotelIdQuery(
    { hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data"))?.hotelId ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

  console.log("allBanquetsByHotelIdData : ", allBanquetsByHotelIdData);

  const {
    data: hallBookingChartData = {
      data: {
        bookedHallCount: 0,
        cancelledHallCount: 0,
        completedHallCount: 0,
        chartHallData: {
          June: 0,
          October: 0,
          December: 0,
          May: 0,
          September: 0,
          March: 0,
          July: 0,
          January: 0,
          February: 0,
          April: 0,
          August: 0,
          November: 0,
        },
      },
    },
    isLoading: isHallBookingChartDataLoading,
  } = useGetHallBookingChartQuery(
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

  console.log("hallBookingChartData : ", hallBookingChartData);

  const {
    data: individualHallBookingData = {
      data: [],
    },
    isFetching: isIndividualHallBookingDataFetching,
  } = useGetIndividualHallBookingDataByIdQuery(
    {
      id: selectedHallChip?.id,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !selectedHallChip?.id ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );

  console.log("individualHallBookingData : ", individualHallBookingData);

  const {
    data: allPaymentMethods = { data: [] },
    isFetching: isAllPaymentMethodsFetching,
  } = useGetAllPaymentMethodsQuery(
    {},
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("allPaymentMethods : ", allPaymentMethods);

  const { sortedArray, warnDates } = useMemo(
    () =>
      sortAndExtractWarnDates(
        selectedHallChip?.id ? individualHallBookingData?.data : []
      ),
    [individualHallBookingData?.data, selectedHallChip?.id]
  );

  console.log("sortedArrayyyyyyy : ", sortedArray);
  console.log("warnDatesssssss : ", warnDates);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const [selectedHallBooking, setSelectedHallBooking] = useState(null);
  console.log("selectedHallBooking : ", selectedHallBooking);

  const [customHallBookingDrawerOpen, setCustomHallBookingDrawerOpen] =
    useState({
      open: false,
      title: "",
      type: null,
    });

  const [hallBookingFormData, setHallBookingFormData] = useState(
    initialHallBookingFormData
  );

  console.log("hallBookingFormData : ", hallBookingFormData);
  const [selectedFilterInChartComponent, setSelectedFilterInChartComponent] =
    useState(null);

  console.log(
    "selectedFilterInChartComponent : ",
    selectedFilterInChartComponent
  );

  const [showcaseHallBookingDialogData, setShowcaseHallBookingDialogData] =
    useState(initialShowcaseHallBookingDialogData);

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

  const handleOpenShowcaseHallBookingDialogForDetails = useCallback(
    (hallBookingDetails) => {
      setShowcaseHallBookingDialogData((prevData) => ({
        ...prevData,
        open: true,
        title: "Complete Booking",
        type: "completeHallBookings",
        hallBookingDetailsData: hallBookingDetails || null,
      }));
    },
    []
  );

  const handleCloseShowcaseHallBookingDialog = useCallback(() => {
    setShowcaseHallBookingDialogData(initialShowcaseHallBookingDialogData);
  }, [initialShowcaseHallBookingDialogData]);

  const handleChangeHallBookingTableFilters = useCallback(
    (name, inputValue) => {
      const poolOfKeys = [
        "isForLiveEvents",
        "isForTodayEvents",
        "isForFutureEvents",
        "isForExpiredEvents",
      ];
      if (name) {
        sethallBookingTableFilters((prevData) => {
          const newState = {
            ...prevData,
            [name]: inputValue, // Update the specific filter key
          };

          // Reset pool keys to false
          poolOfKeys.forEach((key) => {
            newState[key] = false;
          });

          return newState;
        });
        if (name === "fromDate") {
          sethallBookingTableFilters((prevData) => ({
            ...prevData,
            [name]: inputValue,
            toDate: null,
          }));
        } else {
          sethallBookingTableFilters((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        sethallBookingTableFilters(initialHallBookingTableFilters);
      }
    },
    [initialHallBookingTableFilters]
  );

  const handleChangeHallBookingTablePageNo = useCallback((event, newpage) => {
    console.log(
      "handleChangeHallBookingTablePageNo event & newPage : ",
      event,
      newpage
    );
    setHallBookingTablePageNo(newpage);
  }, []);

  const handleChangeHallBookingTableRowsPerPage = useCallback((event) => {
    setHallBookingTableRowsPerPage(parseInt(event.target.value, 10));
    setHallBookingTablePageNo(0);
  }, []);

  const handleChangeSelectedHallBooking = useCallback((value) => {
    setSelectedHallBooking(value || null);
  }, []);

  const handleChangeHallBookingFormData = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "selectedRoom") {
          setHallBookingFormData((prevData) => ({
            ...prevData,
            roomDto:
              inputValue?.id === prevData?.roomDto?.id ? null : inputValue,
          }));
        } else if (name === "startTime") {
          setHallBookingFormData((prevData) => {
            const subtotalAdvanceAmount =
              (prevData?.totalBanquetPlatePrice || 0) * 0.5;

            return {
              ...prevData,
              [name]: inputValue,
              endTime: null,
              estimatedDays: 0,
              estimatedHours: 0,
              totalHallDurationPrice: 0,
              subtotalAdvanceAmount,
            };
          });
        } else if (name === "endTime") {
          setHallBookingFormData((prevData) => {
            // Parse start and end times
            const startTime = dayjs(prevData?.startTime);
            const endTime = dayjs(inputValue);

            // Calculate total difference in hours
            const totalHoursDifference = endTime.diff(startTime, "hour", true);

            // Calculate days and remaining hours
            const estimatedDays = Math.floor(totalHoursDifference / 24);
            // const remainingHours = totalHoursDifference % 24;

            // // Round up additional hours if more than 29 minutes
            // const finalRemainingHours =
            //   remainingHours > 0.5
            //     ? Math.ceil(remainingHours)
            //     : Math.floor(remainingHours);

            const fractionalHours = totalHoursDifference % 1;

            // Round up additional hours if fractional part is >= 0.5
            const finalRemainingHours =
              fractionalHours >= 0.5
                ? Math.ceil(totalHoursDifference % 24)
                : Math.floor(totalHoursDifference % 24);

            const dayPrice = estimatedDays * selectedHallChip?.pricePerDay;
            const hourPrice =
              (estimatedDays > 0
                ? finalRemainingHours
                : Math.ceil(totalHoursDifference)) *
              selectedHallChip?.pricePerHour;
            const totalHallDurationPrice = dayPrice + hourPrice;

            const subtotalAdvanceAmount =
              (totalHallDurationPrice || 0) * 0.5 +
              (prevData?.totalBanquetPlatePrice || 0) * 0.5;

            return {
              ...prevData,
              [name]: inputValue,
              estimatedDays: estimatedDays > 0 ? estimatedDays : 0,
              estimatedHours:
                estimatedDays > 0
                  ? finalRemainingHours
                  : Math.ceil(totalHoursDifference),
              totalHallDurationPrice,
              subtotalAdvanceAmount,
            };
          });
        } else if (name === "noOfPlates") {
          const numericRegex = /^[0-9]*$/;
          if (numericRegex.test(inputValue)) {
            // Remove leading zeros if present
            const sanitizedValue = inputValue.replace(/^0+/, "");

            setHallBookingFormData((prevData) => {
              const perPlatePrice = Number(
                prevData?.banquetDetails?.perPlatePrice || 0
              );

              const totalBanquetPlatePrice =
                perPlatePrice * Number(sanitizedValue || 0);

              const subtotalAdvanceAmount =
                (prevData?.totalHallDurationPrice || 0) * 0.5 +
                (totalBanquetPlatePrice || 0) * 0.5;

              return {
                ...prevData,
                [name]: sanitizedValue === "" ? 0 : Number(sanitizedValue),
                totalBanquetPlatePrice,
                subtotalAdvanceAmount,
              };
            });
          }
        } else if (name === "noOfGuest") {
          const numericRegex = /^[0-9]*$/;
          if (numericRegex.test(inputValue)) {
            setHallBookingFormData((prevData) => {
              return {
                ...prevData,
                [name]: inputValue === "" ? 0 : Number(inputValue),
              };
            });
          }
        } else if (name === "phoneNumber") {
          const numericRegex = /^[0-9]*$/;
          if (numericRegex.test(inputValue)) {
            setHallBookingFormData((prevData) => {
              return {
                ...prevData,
                [name]: inputValue,
              };
            });
          }
        } else if (name === "isBanquetRequired") {
          setHallBookingFormData((prevData) => {
            const subtotalAdvanceAmount =
              (prevData?.totalHallDurationPrice || 0) * 0.5;
            return {
              ...prevData,
              [name]: inputValue,
              banquetDetails: null,
              banquetDetailsInputVal: "",
              subtotalAdvanceAmount,
              noOfPlates: 0,
              totalBanquetPlatePrice: 0,
            };
          });
        } else if (name === "paidAmount") {
          const sanitizedValue = inputValue.replace(/[^0-9.]/g, "");

          const validValue =
            sanitizedValue.split(".").length > 2
              ? sanitizedValue.slice(0, sanitizedValue.lastIndexOf("."))
              : sanitizedValue;

          const restrictedValue = validValue.includes(".")
            ? validValue.split(".")[0] +
              "." +
              validValue.split(".")[1].slice(0, 3)
            : validValue;
          setHallBookingFormData((prevData) => {
            return {
              ...prevData,
              paidAmount: restrictedValue,
            };
          });
        } else if (
          name === "firstName" ||
          name === "middleName" ||
          name === "lastName"
        ) {
          const modifiedName = inputValue.trim();
          if (/^[a-zA-Z\s]*$/.test(modifiedName)) {
            setHallBookingFormData((prevData) => {
              return {
                ...prevData,
                [name]: modifiedName,
              };
            });
          }
        } else if (name === "paymentMethod") {
          setHallBookingFormData((prevData) => {
            const shouldClearPaymentAmount =
              !inputValue || inputValue?.key !== prevData?.paymentMethod?.key;
            return {
              ...prevData,
              paymentMethod: inputValue,
              paidAmount: shouldClearPaymentAmount ? "" : prevData?.paidAmount,
            };
          });
        } else if (name === "banquetDetails") {
          setHallBookingFormData((prevData) => {
            const subtotalAdvanceAmount =
              (prevData?.totalHallDurationPrice || 0) * 0.5;
            return {
              ...prevData,
              [name]: inputValue,
              subtotalAdvanceAmount,
              noOfPlates: 0,
              totalBanquetPlatePrice: 0,
            };
          });
        } else {
          setHallBookingFormData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setHallBookingFormData(initialHallBookingFormData);
      }
    },
    [initialHallBookingFormData, selectedHallChip]
  );

  const handleChangeSelectedHallChip = useCallback((selectedHall) => {
    setSelectedHallChip((prevData) => {
      if (prevData?.id !== selectedHall?.id) {
        return selectedHall || null;
      } else {
        return null;
      }
    });
  }, []);

  const handleOpenCustomHallBookingDrawer = useCallback(
    (open = false, title = "", type = null) => {
      setCustomHallBookingDrawerOpen({
        open: open || false,
        title: title || "",
        type: type || null,
      });

      if (!open) {
        handleChangeHallBookingFormData();
        handleChangeSelectedHallBooking();
        handleChangeSelectedHallChip();
      }
    },
    [
      handleChangeHallBookingFormData,
      handleChangeSelectedHallBooking,
      handleChangeSelectedHallChip,
    ]
  );
  const handleSubmitBookHallFromFrontdesk = useCallback(() => {
    const currentTime = dayjs();
    const startTime = dayjs(hallBookingFormData.startTime);
    const endTime = dayjs(hallBookingFormData.endTime);
    if (!Boolean(hallBookingFormData?.firstName)) {
      setSnack({
        open: true,
        message: "First name is required!",
        severity: "warning",
      });
      return;
    } else if (!/^\d{10}$/.test(String(hallBookingFormData?.phoneNumber))) {
      setSnack({
        open: true,
        message: "Please provide a valid phone number",
        severity: "warning",
      });
      return;
    } else if (!Boolean(hallBookingFormData?.customerAddress?.trim())) {
      setSnack({
        open: true,
        message: "Please provide customer address",
        severity: "warning",
      });
      return;
    } else if (!Boolean(hallBookingFormData?.eventName?.trim())) {
      setSnack({
        open: true,
        message: "Please provide event name",
        severity: "warning",
      });
      return;
    } else if (!Boolean(hallBookingFormData?.startTime)) {
      setSnack({
        open: true,
        message: "Please provide a valid Start time",
        severity: "warning",
      });
      return;
    } else if (!Boolean(hallBookingFormData?.endTime)) {
      setSnack({
        open: true,
        message: "Please provide a valid End Time",
        severity: "warning",
      });
      return;
    } else if (startTime.isBefore(currentTime)) {
      setSnack({
        open: true,
        message: "Start Time must not be in the past",
        severity: "warning",
      });
      return;
    } else if (endTime.isBefore(currentTime)) {
      setSnack({
        open: true,
        message: "End Time must not be in the past",
        severity: "warning",
      });
      return;
    } else if (endTime.isBefore(startTime)) {
      setSnack({
        open: true,
        message: "End Time cannot be before Start Time",
        severity: "warning",
      });
      return;
    } else if (endTime.diff(startTime, "minute") < 30) {
      setSnack({
        open: true,
        message: "End time must be at least 30 minutes ahead of start time!",
        severity: "warning",
      });
      return;
    } else if (!Boolean(hallBookingFormData?.noOfGuest)) {
      setSnack({
        open: true,
        message: "Atleast 1 guest is required",
        severity: "warning",
      });
      return;
    } else if (!Boolean(selectedHallChip?.id)) {
      setSnack({
        open: true,
        message: "Please Select a hall",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(hallBookingFormData?.isBanquetRequired) &&
      !Boolean(hallBookingFormData?.banquetDetails?.id)
    ) {
      setSnack({
        open: true,
        message: "Please Select a banquet type",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(hallBookingFormData?.isBanquetRequired) &&
      (hallBookingFormData?.noOfPlates === "" ||
        !Boolean(hallBookingFormData?.noOfPlates))
    ) {
      setSnack({
        open: true,
        message: "Please provide valid plates for banquet",
        severity: "warning",
      });
      return;
    } else if (!hallBookingFormData?.paymentMethod?.key) {
      setSnack({
        open: true,
        message: "Please Select A Payment Method",
        severity: "warning",
      });
      return;
    } else if (Boolean(hallBookingFormData?.paidAmount === "")) {
      setSnack({
        open: true,
        message: "Please pay the required amount",
        severity: "warning",
      });
      return;
    }
    //  else if (
    //   hallBookingFormData?.paymentMethod?.key &&
    //   hallBookingFormData?.paymentMethod?.key !== "Cash" &&
    //   hallBookingFormData?.paymentMethod?.key.trim() !== "" &&
    //   !hallBookingFormData?.transactionReferenceNo?.trim()
    // ) {
    //   setSnack({
    //     open: true,
    //     message:
    //       "Please provide a valid transaction reference for the selected payment method.",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (
      parseFloat(hallBookingFormData?.paidAmount)?.toFixed(3) <
      hallBookingFormData?.advanceAmount
    ) {
      setSnack({
        open: true,
        message: "Please provide required advance amount.",
        severity: "warning",
      });
      return;
    } else if (
      checkEventConflict(
        sortedArray,
        hallBookingFormData?.startTime,
        hallBookingFormData?.endTime
      )
    ) {
      setSnack({
        open: true,
        message: "Given Event date range is conflicting on existing events.",
        severity: "warning",
      });
      return;
    }
    const payload = {
      firstName: hallBookingFormData?.firstName,
      middleName: hallBookingFormData?.middleName,
      lastName: hallBookingFormData?.lastName,
      phoneNumber: hallBookingFormData?.phoneNumber,
      customerAddress: hallBookingFormData?.customerAddress,
      customeremail: hallBookingFormData?.email,
      eventName: hallBookingFormData?.eventName,
      eventDate: hallBookingFormData?.startTime
        ? moment(hallBookingFormData?.startTime?.toISOString())?.format(
            "DD-MM-YYYY"
          )
        : null,
      startTime: hallBookingFormData?.startTime
        ? moment(hallBookingFormData.startTime?.toISOString())?.format(
            "DD-MM-YYYY HH:mm:ss"
          )
        : null,
      endTime: hallBookingFormData?.endTime
        ? moment(hallBookingFormData.endTime?.toISOString())?.format(
            "DD-MM-YYYY HH:mm:ss"
          )
        : null,
      noOfGuest: hallBookingFormData?.noOfGuest,
      hallId: selectedHallChip?.id,
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      totalPrice: hallBookingFormData?.totalHallDurationPrice,
      paidAmount: hallBookingFormData?.paidAmount,
      paymentMethod: hallBookingFormData?.paymentMethod?.key,
      ...(hallBookingFormData?.paymentMethod?.key !== "Cash" &&
        hallBookingFormData?.paymentMethod?.key !== "Online" &&
        hallBookingFormData?.transactionReferenceNo?.trim() && {
          transactionReferenceNo: hallBookingFormData?.transactionReferenceNo,
        }),
      specialRequirements: hallBookingFormData?.specialRequirements,
      isBanquetRequired: hallBookingFormData?.isBanquetRequired,
      totalBanquetPrice: hallBookingFormData?.totalBanquetPlatePrice,
      noOfBanquetsRequired: hallBookingFormData?.noOfPlates,
      hallBanquetMappingData: [
        {
          banquetDetails: {
            id: hallBookingFormData?.banquetDetails?.id,
          },
          noOfQty: hallBookingFormData?.noOfPlates,
          totalPrice: hallBookingFormData?.totalBanquetPlatePrice,
        },
      ],
    };

    console.log("handleSubmitBookHallFromFrontdesk payload : ", payload);

    if (hallBookingFormData?.paymentMethod?.key === "Online") {
      handleChangeSetPaymentDialogFinalPayload({
        open: true,
        mutationType: "saveHallBooking",
        payloadValue: payload,
      });
    } else {
      bookHallFromFrontdesk(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Hall Booking Success",
            severity: "success",
          });
          handleOpenCustomHallBookingDrawer();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err?.data?.message || err?.data || "Hall Booking Failed",
            severity: "error",
          });
        });
    }
  }, [
    hallBookingFormData,
    selectedHallChip,
    bookHallFromFrontdesk,
    handleOpenCustomHallBookingDrawer,
    sortedArray,
    handleChangeSetPaymentDialogFinalPayload,
  ]);

  const handleChangeHallBookingStatus = useCallback(
    (name, hallBookingData) => {
      // if (name === "completeHallEvent") {
      //   Swal.fire({
      //     title: "Complete Event!",
      //     text: "Are you Sure To Complete The Event?",
      //     icon: "warning",
      //     showCancelButton: true,
      //     confirmButtonColor: "#3085d6",
      //     cancelButtonColor: "#d33",
      //     confirmButtonText: "Yes",
      //   }).then((result) => {
      //     if (result.isConfirmed) {
      //       const payload = {
      //         id: hallBookingData?.id || null,
      //         hallStatus: "COMPLETED",
      //       };
      //       changeHallBookingStatus(payload)
      //         .unwrap()
      //         .then((res) => {
      //           setSnack({
      //             open: true,
      //             message: res?.message || "Hall Event Completion Success",
      //             severity: "success",
      //           });
      //         })
      //         .catch((err) => {
      //           setSnack({
      //             open: true,
      //             message:
      //               err?.data?.message ||
      //               err?.data ||
      //               "Hall Event Completion Failed",
      //             severity: "error",
      //           });
      //         });
      //     }
      //   });
      // }

      if (name === "startlHallEvent") {
        Swal.fire({
          title: "Start Event!",
          text: "Are You Sure To Start The Event?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
        }).then((result) => {
          if (result.isConfirmed) {
            const payload = {
              id: hallBookingData?.id || null,
              hallStatus: "STARTED",
            };

            changeHallBookingStatus(payload)
              .unwrap()
              .then((res) => {
                setSnack({
                  open: true,
                  message: res?.message || "Hall Event Initiation Success",
                  severity: "success",
                });
              })
              .catch((err) => {
                setSnack({
                  open: true,
                  message:
                    err?.data?.message ||
                    err?.data ||
                    "Hall Event Initiation Failed",
                  severity: "error",
                });
              });
          }
        });
      } else if (name === "cancelHallEvent") {
        Swal.fire({
          title: "Cancel Event!",
          text: "Are You Sure To CANCEL The Event?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
        }).then((result) => {
          if (result.isConfirmed) {
            const payload = {
              id: hallBookingData?.id || null,
              hallStatus: "CANCELLED",
            };

            changeHallBookingStatus(payload)
              .unwrap()
              .then((res) => {
                setSnack({
                  open: true,
                  message: res?.message || "Hall Event Cancelation Success",
                  severity: "success",
                });
              })
              .catch((err) => {
                setSnack({
                  open: true,
                  message:
                    err?.data?.message ||
                    err?.data ||
                    "Hall Event Cancelation Failed",
                  severity: "error",
                });
              });
          }
        });
      }
    },
    [changeHallBookingStatus]
  );

  // const handleOpenShowcaseSialogForHallBooking = useCallback((hallRowData)=>{}, [] )

  const handleChangeHallBookingStatusToComplete = useCallback(
    (hallBookingData, remainingAmountToPayout) => {
      if (
        Boolean(remainingAmountToPayout > 0) &&
        !hallBookingFormData?.paymentMethod?.key
      ) {
        setSnack({
          open: true,
          message: "Please Select A Payment Method",
          severity: "warning",
        });
        return;
      } else if (
        Boolean(remainingAmountToPayout > 0) &&
        Boolean(
          Boolean(hallBookingFormData?.paymentMethod?.key) !==
            Boolean(parseFloat(hallBookingFormData?.paidAmount))
        )
      ) {
        setSnack({
          open: true,
          message:
            "Please provide both payment method and advance amount to proceed.",
          severity: "warning",
        });
        return;
      } else if (
        Boolean(remainingAmountToPayout > 0) &&
        Boolean(
          parseFloat(hallBookingFormData?.paidAmount) !==
            parseFloat(remainingAmountToPayout)
        )
      ) {
        setSnack({
          open: true,
          message: "please provide remaining amount.",
          severity: "warning",
        });
        return;
      }
      const payload = {
        id: hallBookingData?.id || null,
        hallStatus: "COMPLETED",
        ...(remainingAmountToPayout > 0 && {
          paymentMethod: hallBookingFormData?.paymentMethod?.key,
          paidAmount: hallBookingFormData?.paidAmount,
        }),
      };

      console.log(
        "handleChangeHallBookingStatusToComplete payload : ",
        payload
      );

      if (hallBookingFormData?.paymentMethod?.key === "Online") {
        handleChangeSetPaymentDialogFinalPayload({
          open: true,
          mutationType: "completeHallBooking",
          payloadValue: payload,
        });
      } else {
        changeHallBookingStatus(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res?.message || "Hall Event Completion Success",
              severity: "success",
            });

            handleCloseShowcaseHallBookingDialog();
            handleChangeHallBookingFormData();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message:
                err?.data?.message ||
                err?.data ||
                "Hall Event Completion Failed",
              severity: "error",
            });
          });
      }
    },
    [
      changeHallBookingStatus,
      hallBookingFormData,
      handleChangeSetPaymentDialogFinalPayload,
      handleChangeHallBookingFormData,
      handleCloseShowcaseHallBookingDialog,
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
          const foundPieChartComponentItem = pieChartLabels?.find(
            (item) => item?.key === filter
          );
          const foundHallBookingStatusTypeData = foundPieChartComponentItem
            ? allHallStatusTypeData?.data?.find(
                (item) => item === foundPieChartComponentItem?.filterationKey
              )
            : null;
          const foundHallBookingStatusTypeDataObj =
            foundHallBookingStatusTypeData
              ? {
                  key: foundHallBookingStatusTypeData,
                  name: foundHallBookingStatusTypeData.replace(/_/g, " "),
                }
              : null;

          handleChangeHallBookingTableFilters(
            "hallBookingStatus",
            foundHallBookingStatusTypeDataObj
          );
          return filter;
        } else {
          handleChangeHallBookingTableFilters("hallBookingStatus", null);
          return null;
        }
      });
    },
    [handleChangeHallBookingTableFilters, allHallStatusTypeData, pieChartLabels]
  );

  const handleChangeHallBookingFilterFromAlertChip = useCallback(
    (selectedFilterKey) => {
      const poolOfKeys = [
        "isForLiveEvents",
        "isForTodayEvents",
        "isForFutureEvents",
        "isForExpiredEvents",
      ];

      // sethallBookingTableFilters((prevState) => {
      //   return Object.keys(prevState).reduce((newState, key) => {
      //     if (poolOfKeys.includes(key)) {
      //       if (key === selectedFilterKey && prevState[key] === true) {
      //         newState[key] = false;
      //       } else {
      //         newState[key] = key === selectedFilterKey;
      //       }
      //     } else {
      //       newState[key] = prevState[key];
      //     }
      //     return newState;
      //   }, {});
      // });
      sethallBookingTableFilters((prevState) => {
        return Object.keys(initialHallBookingTableFilters).reduce(
          (newState, key) => {
            if (poolOfKeys.includes(key)) {
              if (key === selectedFilterKey && prevState[key] === true) {
                newState[key] = false; // Uncheck the selected key if it was true
              } else {
                newState[key] = key === selectedFilterKey; // Set selected key to true, others to false
              }
            } else {
              newState[key] = initialHallBookingTableFilters[key]; // Reset non-pool keys to initial values
            }
            return newState;
          },
          {}
        );
      });
    },
    [initialHallBookingTableFilters]
  );

  const HandleDynamicFinalApiMutationForPaymentDialog = useCallback(
    (submitType = "") => {
      let mutationFunction = () => {};
      let afterMutationSuccessFunction = () => {};

      if (submitType === "saveHallBooking") {
        mutationFunction = bookHallFromFrontdesk;

        afterMutationSuccessFunction = () => {
          handleOpenCustomHallBookingDrawer();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      } else if (submitType === "completeHallBooking") {
        mutationFunction = changeHallBookingStatus;

        afterMutationSuccessFunction = () => {
          handleCloseShowcaseHallBookingDialog();
          handleChangeHallBookingFormData();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      }

      return {
        mutationFunction,
        afterMutationSuccessFunction,
      };
    },
    [
      handleChangeSetPaymentDialogFinalPayload,
      handleOpenCustomHallBookingDrawer,
      bookHallFromFrontdesk,
      handleChangeHallBookingFormData,
      changeHallBookingStatus,
      handleCloseShowcaseHallBookingDialog,
    ]
  );

  useEffect(() => {
    handleChangeHallBookingFormData("endTime", hallBookingFormData?.endTime);
  }, [
    handleChangeHallBookingFormData,
    hallBookingFormData?.endTime,
    selectedHallChip,
  ]);

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
          <CustomHallBookingTableFIlters
            hallBookingTableFilters={hallBookingTableFilters}
            handleChangeHallBookingTableFilters={
              handleChangeHallBookingTableFilters
            }
            hallStatuses={allHallStatusTypeData?.data || []}
            capacityFilters={allCapacityFilters?.data || []}
            handleOpenCustomHallBookingDrawer={
              handleOpenCustomHallBookingDrawer
            }
          />
        </Box>

        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                // width: { lg: "75%", md: "80%", xs: "91%" },
                width: "100%",
                margin: "auto",
              }}
            >
              <Grid container size={12} spacing={1}>
                <Grid size={4}>
                  <Box
                    sx={{
                      width: "100%",
                    }}
                  >
                    <HallBookingChartComponent
                      dataCount={hallBookingChartData?.data}
                      customLabels={pieChartLabels}
                      showTotal={true}
                      isActionable={true}
                      pieSelectionFunction={
                        handleChangeSelectedFilterInChartComponent
                      }
                    />
                  </Box>
                </Grid>
                <Grid size={5}>
                  <Box
                    sx={{
                      width: "97%",
                      height: "240px",
                      // marginBottom: "10px",
                    }}
                  >
                    <HallBookingBarChartComponent
                      data={hallBookingChartData?.data?.chartHallData}
                    />
                  </Box>
                </Grid>
                <Grid size={3}>
                  <CustomHallBookingAlertSection
                    chipData={customHallAlertChips}
                    alertData={hallBookingChartData?.data}
                    handleChangeHallBookingFilterFromAlertChip={
                      handleChangeHallBookingFilterFromAlertChip
                    }
                    filters={Object.fromEntries(
                      Object?.entries(hallBookingTableFilters)?.filter(
                        ([key]) =>
                          [
                            "isForLiveEvents",
                            "isForTodayEvents",
                            "isForFutureEvents",
                            "isForExpiredEvents",
                          ]?.includes(key)
                      )
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  // xs: "calc(100vh - 410px)",
                  // xl: "calc(100vh - 410px)",
                  xs: "calc(100vh - 80px)",
                  md: "calc(100vh - 235px)",
                  lg: "calc(100vh - 235px)",
                  xl: "calc(100vh - 440px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <CustomHallBookingTableContainer
                tableHeaders={hallBookingTableHeaders}
                tableData={getAllHallBookingsData?.paginationData}
                pageNo={hallBookingTablePageNo}
                pageSize={hallBookingTableRowsPerPage}
                handlePageChange={handleChangeHallBookingTablePageNo}
                handleChangeRowsPerPage={
                  handleChangeHallBookingTableRowsPerPage
                }
                handleChangeHallBookingStatus={handleChangeHallBookingStatus}
                handleOpenShowcaseHallBookingDialogForDetails={
                  handleOpenShowcaseHallBookingDialogForDetails
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <CustomHallBookingDrawer
        customDrawerOpen={customHallBookingDrawerOpen?.open}
        title={customHallBookingDrawerOpen?.title}
        type={customHallBookingDrawerOpen?.type}
        handleToggleCustomFormDrawer={handleOpenCustomHallBookingDrawer}
        handleChangeSelectedHallBooking={handleChangeSelectedHallBooking}
        hallBookingFormData={hallBookingFormData}
        handleChangeHallBookingFormData={handleChangeHallBookingFormData}
        selectedHallBooking={selectedHallBooking}
        allHallsData={allHallsByHotelIdForHallBooking?.data || []}
        selectedHallChip={selectedHallChip}
        handleChangeSelectedHallChip={handleChangeSelectedHallChip}
        warnDates={warnDates}
        sortedArray={sortedArray}
        allBanquetsByHotelIdData={allBanquetsByHotelIdData?.data || []}
        allPaymentMethods={allPaymentMethods}
        handleSubmitBookHallFromFrontdesk={handleSubmitBookHallFromFrontdesk}
      />
      <ShowcaseHallBookingDialog
        hallBookingFormData={hallBookingFormData}
        handleChangeHallBookingFormData={handleChangeHallBookingFormData}
        allPaymentMethods={allPaymentMethods}
        openShowcaseHallBookingDialog={showcaseHallBookingDialogData?.open}
        handleCloseShowcaseHallBookingDialog={
          handleCloseShowcaseHallBookingDialog
        }
        title={showcaseHallBookingDialogData?.title}
        type={showcaseHallBookingDialogData?.type}
        hallBookingDetailsData={
          showcaseHallBookingDialogData?.hallBookingDetailsData
        }
        handleChangeHallBookingStatusToComplete={
          handleChangeHallBookingStatusToComplete
        }
      />
      <LoadingComponent
        open={
          isGetAllHallBookingsDataLoading ||
          isAllHallStatusTypeDataFetching ||
          isAllHallsByHotelIdForHallBookingFetching ||
          isHallBookingChartDataLoading ||
          isIndividualHallBookingDataFetching ||
          bookHallFromFrontdeskres?.isLoading ||
          isAllBanquetsByHotelIdDataFetching ||
          isAllPaymentMethodsFetching ||
          changeHallBookingStatusRes?.isLoading ||
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
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default HallBookingDashboard;
