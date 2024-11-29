import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import Swal from "sweetalert2";
import {
  Autocomplete,
  Box,
  Button,
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

function generateBookingHistoryResponse(totalRecords, rowsPerPage, pageNo) {
  const startIndex = pageNo * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const data = Array.from({ length: totalRecords }, (_, i) => ({
    roomTypeId: null,
    firstName: `FirstName${i + 1}`,
    middleName: `MiddleName${i + 1}`,
    lastName: `LastName${i + 1}`,
    phoneNumber: `900000000${i}`,
    email: `user${i + 1}@example.com`,
    address: `Address${i + 1}`,
    fromDate: "27-11-2024",
    toDate: "30-11-2024",
    noOfPeoples: Math.floor(Math.random() * 5) + 1,
    hotelId: null,
    bookingStatus: [
      "Pending_Confirmation",
      "Booked",
      "Checked_In",
      "Checked_Out",
      "Cancelled",
    ][Math.floor(Math.random() * 5)],
    bookedOn: new Date().toISOString(),
    id: i + 1,
    roomType: {
      id: i + 1,
      type: `RoomType${i + 1}`,
      description: null,
      capacity: Math.floor(Math.random() * 5) + 1,
      basePrice: 5500 + i * 100,
      images: [
        `http://example.com/image${i + 1}-1.jpg`,
        `http://example.com/image${i + 1}-2.jpg`,
      ],
      roomTypeData: null,
      hotelId: null,
      companyId: null,
      hotelDto: null,
      extraItemsList: null,
      imageUrl: null,
      isAdvanceRequired: true,
      advanceAmount: 2000,
      extraItem: null,
    },
    hotel: {
      id: i + 2,
      name: `Hotel${i + 1}`,
      city: {
        id: 800 + i,
        name: `City${i + 1}`,
        state: {
          id: 20 + i,
          name: `State${i + 1}`,
        },
      },
      state: {
        id: 20 + i,
        name: `State${i + 1}`,
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: `User${i + 1}`,
      address: `HotelAddress${i + 1}`,
      noOfFloors: null,
      floorRoomMapData: null,
      company: null,
      createdByUser: null,
      logoUrl: null,
      email: `hotel${i + 1}@example.com`,
      contactNo: null,
      contactNos: [`180037600${i}`, `98776000${i}`],
    },
    bookingAmount: null,
    bookingRefNumber: `REF-2024-${i + 1}`,
    rejectionReason: null,
    bookingMapDatas: null,
    checkOutDate: "29-11-2024",
    paidAmount: null,
    paymentMethod: null,
    transactionReferenceNo: null,
    remarks: null,
    transactionDetails: null,
    isCheckoutProceed: null,
    isCheckedByKeepingStaff: null,
    isRoomCleaningRequested: null,
    roomDto: {
      id: i + 1,
      floorNo: Math.floor(Math.random() * 10) + 1,
      roomNo: `Room${i + 1}`,
      isActive: true,
      isAvailable: Math.random() > 0.5,
      roomType: {
        id: i + 1,
        type: `RoomType${i + 1}`,
        description: null,
        capacity: Math.floor(Math.random() * 5) + 1,
        basePrice: 5500 + i * 100,
        images: [
          `http://example.com/image${i + 1}-1.jpg`,
          `http://example.com/image${i + 1}-2.jpg`,
        ],
        roomTypeData: null,
        hotelId: null,
        companyId: null,
        hotelDto: null,
        extraItemsList: null,
        imageUrl: null,
        isAdvanceRequired: true,
        advanceAmount: 2000,
        extraItem: null,
      },
      createdAt: new Date().toISOString(),
      createdBy: `Creator${i + 1}`,
      createdUserName: `User${i + 1}`,
      isBooked: true,
      isServiceGoingOn: Math.random() > 0.5,
      bookingDto: null,
      isCheckoutProceed: null,
      isCheckedByKeepingStaff: null,
      isRoomCleaningRequested: Math.random() > 0.5,
      serviceTypeStatus: null,
      extraItemsList: null,
      hotelId: null,
      keyData: null,
      bookingList: null,
    },
    isForCheckoutRequest: null,
    extraItemsList: null,
    checkInDate: "27-11-2024",
    amountPaidVia: null,
    isBookingForToday: null,
    groupBookingList: null,
    isBookingConfirmed: Math.random() > 0.5,
    pageSize: rowsPerPage,
  }));

  console.log("generateBookingHistoryResponse inline data : ", data);

  return {
    responseCode: 200,
    paginationData: {
      totalPages,
      numberOfElements: rowsPerPage,
      totalElements: totalRecords,
      data: data.slice(startIndex, endIndex),
    },
  };
}

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
                <TableCell align="center">No data available</TableCell>
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
  customFormDrawerData,
  handleChangeSelectedBookingHistory,
}) {
  console.log("CustomFormDrawer customDrawerOpen : ", customDrawerOpen, type);
  const handleToggleCustomFormDrawerOnChange = useCallback(() => {
    handleToggleCustomFormDrawer();
    handleChangeSelectedBookingHistory();
  }, [handleToggleCustomFormDrawer, handleChangeSelectedBookingHistory]);

  return (
    <Drawer
      anchor="right"
      open={customDrawerOpen}
      onClose={() => handleToggleCustomFormDrawerOnChange()}
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
                <Grid container size={12} spacing={1}>
                  <Grid size={4}></Grid>
                  <Grid size={4}></Grid>
                  <Grid size={4}>
                    {/* <Box
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
                                // ".MuiFormLabel-root": {
                                //   color: (theme) => theme.palette.primary.main,
                                //   fontWeight: 600,
                                //   fontSize: 18,
                                // },
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
                                fullWidth
                                options={
                                  allPaymentMethods?.data?.map((item) => ({
                                    key: item,
                                    name: item.replace(/_/g, " "),
                                  })) || []
                                }
                                disableClearable
                                value={
                                  showcaseDialogFormData?.paymentMethod || null
                                }
                                onChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethod",
                                    newVal
                                  )
                                }
                                inputValue={
                                  showcaseDialogFormData?.paymentMethodInputValue ||
                                  ""
                                }
                                onInputChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethodInputValue",
                                    newVal
                                  )
                                }
                                getOptionLabel={(option) => option?.name}
                                clearOnEscape
                                disablePortal
                                popupIcon={
                                  <KeyboardArrowDownIcon color="primary" />
                                }
                                sx={{
                                  // width: 200,
                                  position: "absolute",
                                  bottom: 7,
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
                            </Box> */}
                  </Grid>
                </Grid>
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
  const [bookingHistoryTableFilters, setBookingHistoryTableFilters] = useState(
    initialBookingHistoryTableFilters
  );
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

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
    // isSuccess: isRoomBookingHistoryByHotelIdSuccess,
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

  const [confirmBookingByFrontDesk, confirmBookingByFrontDeskRes] =
    useConFirmBookingMutation();

  const [cancelBookingByFrontDesk, cancelBookingByFrontDeskRes] =
    useCancelHotelRoomMutation();

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
      debugger;
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
    [cancelBookingByFrontDesk, confirmBookingByFrontDesk]
  );

  const handleOpenCustomBookingHistoryDrawer = useCallback(
    (open = false, title = "", type = null) => {
      setCustomBookingHistoryDrawerOpen({
        open: open || false,
        title: title || "",
        type: type || null,
      });
    },
    []
  );

  const handleChangeSelectedBookingHistory = useCallback((value) => {
    setSelectedBookingHistory(value || null);
  }, []);

  // useEffect(() => {
  //   if (isRoomBookingHistoryByHotelIdSuccess) {
  //     setBookingHistoryTableData(
  //       roomBookingHistoryByHotelIdData?.paginationData?.data || []
  //     );
  //   }
  // }, [isRoomBookingHistoryByHotelIdSuccess, roomBookingHistoryByHotelIdData]);

  useEffect(() => {
    const response = generateBookingHistoryResponse(
      50,
      bookingHistoryTableRowsPerPage,
      bookingHistoryTablePageNo
    );

    console.log("generateBookingHistoryResponse response : ", response);
    setBookingHistoryTableData(response?.paginationData);
  }, [bookingHistoryTableRowsPerPage, bookingHistoryTablePageNo]);
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
                tableData={bookingHistoryTableData}
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
          roomtypeByHotelIdForBookingHistoryData
        }
      />
      <LoadingComponent
        open={
          true
            ? false
            : isRoomBookingHistoryByHotelIdLoading ||
              isAllBookingStatusTypeDataFetching ||
              confirmBookingByFrontDeskRes?.isLoading ||
              cancelBookingByFrontDeskRes?.isLoading ||
              isRoomtypeByHotelIdForBookingHistoryDataFetching ||
              false
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default FrontdeskBookingHistory;
