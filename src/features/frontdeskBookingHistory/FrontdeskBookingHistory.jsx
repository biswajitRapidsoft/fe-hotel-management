import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
// import Swal from "sweetalert2";
import { Autocomplete, Box, Paper, TextField, Typography } from "@mui/material";
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
} from "../../services/frontdeskBookingHistory";
import moment from "moment";
// import Table from "@mui/material/Table";
// import TableBody from "@mui/material/TableBody";
// import TableCell from "@mui/material/TableCell";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableRow from "@mui/material/TableRow";

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

  const [bookingHistoryTableData, setBookingHistoryTableData] = useState([]);

  console.log("bookingHistoryTableData : ", bookingHistoryTableData);

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

  useEffect(() => {
    if (isRoomBookingHistoryByHotelIdSuccess) {
      setBookingHistoryTableData(
        roomBookingHistoryByHotelIdData?.paginationData?.data || []
      );
    }
  }, [isRoomBookingHistoryByHotelIdSuccess, roomBookingHistoryByHotelIdData]);
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

        <Grid container size={12} columnSpacing={1.5} rowSpacing={2}>
          {/* ROOM LIST  */}

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 220px)",
                  xl: "calc(100vh - 180px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <Grid container size={12} spacing={2}></Grid>
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
          />
          <CustomFormDrawer
            customDrawerOpen={customFormDrawerOpen?.open}
            title={customFormDrawerOpen?.title}
            type={customFormDrawerOpen?.type}
            handleToggleCustomFormDrawer={handleOpenCustomFormDrawer}
            customFormDrawerData={customFormDrawerData}
            handleChangeCustomFormDrawerData={handleChangeCustomFormDrawerData}
            isSelectedRoom={isSelectedRoom}
            allGovtIdsData={allGovtIdsData}
            allPaymentMethods={allPaymentMethods}
            handleSubmitRoomCheckIn={handleSubmitRoomCheckIn}
            handleSubmitRoomBookingCanelation={handleSubmitRoomBookingCanelation}
            broomBookingRequestData={roomBookingHistoryByHotelIdData?.data || []}
          /> */}
      <LoadingComponent
        open={
          isRoomBookingHistoryByHotelIdLoading ||
          isAllBookingStatusTypeDataFetching ||
          false
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default FrontdeskBookingHistory;
