import React from "react";

import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid2 as Grid,
  DialogActions,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import {
  useGetRoomBySpaTypeReceptionistQuery,
  useGetSpaBookingHistoryAdminQuery,
  useUpdateSpaBookingMutation,
} from "../../services/spa";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const SpaFrontdeskBookingHistory = () => {
  const [spaToBook, setSpaToBook] = React.useState(null);
  const [isCancelDialog, setIsCancelDialog] = React.useState(false);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateSpaBooking, updateSpaBookingRes] = useUpdateSpaBookingMutation();
  const {
    data: bookingList = {
      data: {
        data: [],
      },
    },
    isLoading,
  } = useGetSpaBookingHistoryAdminQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    pageNo: 0,
    pageSize: 0,
    fromDate: null,
    toDate: null,
  });
  const {
    data: spaRoomList = {
      data: {
        spaRoomDtoList: [],
        therapistUserList: [],
      },
    },
  } = useGetRoomBySpaTypeReceptionistQuery(
    {
      spaTypeId: spaToBook?.bookingDetailsTrailDtosList[0]?.spaType?.id || null,
      startTime: moment(formatDateTime(spaToBook?.bookingDate)).format(
        "DD-MM-YYYY HH:mm:ss"
      ),
      endTime: moment(formatDateTime(spaToBook?.bookingDate))
        .add(
          spaToBook?.bookingDetailsTrailDtosList[0]?.spaType?.spaTypeDetailsList.reduce(
            (prev, curr) => prev + curr.durationMinutes,
            0
          ),
          "minutes"
        )
        .format("DD-MM-YYYY HH:mm:ss"),
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    },
    { skip: !Boolean(spaToBook) }
  );

  const navigate = useNavigate();

  const handleUpdateSpaBooking = React.useCallback(
    (payload) => {
      updateSpaBooking(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            seveirty: "success",
          });
          setSpaToBook(null);
          setIsCancelDialog(false);
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [updateSpaBooking]
  );

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate("/spa-frontdesk-dashboard")}>
          <KeyboardBackspaceIcon color="primary" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
          Spa Booking History
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                ".MuiTableCell-root": {
                  fontWeight: "bold",
                  //   fontSize: "1rem",
                  letterSpacing: 1,
                  backgroundColor: (theme) => theme.palette.primary.light,
                  color: "#fff",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableCell>SL No.</TableCell>
              <TableCell>Spa Booking Ref.</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Phone No</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {bookingList.data.data.map((booking, index) => {
              return (
                <Row
                  booking={booking}
                  index={index}
                  key={booking.id}
                  setSpaToBook={setSpaToBook}
                  setIsCancelDialog={setIsCancelDialog}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <UpdateStatusDialog
        open={Boolean(spaToBook)}
        handleClose={() => setSpaToBook(null)}
        spaToBook={spaToBook}
        spaRoomDtoList={spaRoomList.data.spaRoomDtoList}
        therapistUserList={spaRoomList.data.therapistUserList}
        isCancelDialog={isCancelDialog}
        key={spaToBook?.id || null}
        handleUpdateSpaBooking={handleUpdateSpaBooking}
      />
      <LoadingComponent open={isLoading || updateSpaBookingRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const Row = React.memo(function ({
  booking,
  index,
  setSpaToBook,
  setIsCancelDialog,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          ".MuiTableCell-root": {
            //   fontSize: "1rem",
            letterSpacing: 1,
          },
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>{booking.bookingSpaRefNumber}</TableCell>
        <TableCell>{`${booking.customerFirstName || ""} ${
          booking.customerMiddleName || ""
        } ${booking.customerLastName || ""}`}</TableCell>
        <TableCell>{booking.customerPhoneNo}</TableCell>
        <TableCell>
          <Typography variant="body2">
            {moment(formatDateTime(booking.bookingDate)).format("DD-MM-YYYY")}
          </Typography>
          <Typography variant="caption">
            {moment(formatDateTime(booking.bookingDate)).format("hh:mm a")}
          </Typography>
        </TableCell>
        <TableCell>{booking.status}</TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow x={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell sx={{ p: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: "#f4f4f4" }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      ".MuiTableCell-root": {
                        fontWeight: "bold",
                        letterSpacing: 1,
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell>SL No.</TableCell>
                    <TableCell>Spa Type</TableCell>
                    <TableCell>Therapist Name</TableCell>
                    <TableCell>Room No.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {booking.bookingDetailsTrailDtosList.map(
                    (detail, detailIndex) => {
                      return (
                        <TableRow key={detail.id}>
                          <TableCell>{detailIndex + 1}</TableCell>
                          <TableCell>{detail.spaType?.name || "--"}</TableCell>
                          <TableCell>
                            {detail.therapist?.name || "--"}
                          </TableCell>
                          <TableCell>{detail.roomDto?.name || "--"}</TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Button
                  color="secondary"
                  variant="outlined"
                  sx={{
                    display: "block",
                    //   color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 15,
                    "&.Mui-disabled": {
                      background: "#B2E5F6",
                      color: "#FFFFFF",
                    },
                  }}
                  // size="small"
                  onClick={() => {
                    setSpaToBook(booking);
                    setIsCancelDialog(false);
                  }}
                >
                  Confirm Booking
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  sx={{
                    display: "block",
                    //   color: "#fff",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: 15,
                    "&.Mui-disabled": {
                      background: "#B2E5F6",
                      color: "#FFFFFF",
                    },
                  }}
                  // size="small"
                  onClick={() => {
                    setSpaToBook(booking);
                    setIsCancelDialog(true);
                  }}
                >
                  Cancel Booking
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

const UpdateStatusDialog = ({
  open,
  handleClose,
  spaToBook,
  spaRoomDtoList,
  therapistUserList,
  isCancelDialog,
  handleUpdateSpaBooking,
}) => {
  const [formData, setFormData] = React.useState({
    selectedRoom: null,
    selectedTherapist: null,
    remark: "",
  });

  const handleChange = React.useCallback((name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleSubmitDialogForm = React.useCallback(
    (e) => {
      e.preventDefault();
      handleUpdateSpaBooking({
        status: isCancelDialog ? "CANCELLED" : "CONFIRMED",
        bookingSpaRefNumber: spaToBook.bookingSpaRefNumber,
        spaRoomDto: isCancelDialog
          ? null
          : {
              id: formData.selectedRoom.id,
            },
        therapist: isCancelDialog
          ? null
          : {
              id: formData.selectedTherapist.id,
            },
        remark: isCancelDialog ? formData.remark : null,
      });
    },
    [formData, isCancelDialog, spaToBook]
  );

  return (
    <React.Fragment>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmitDialogForm,
          sx: {
            ".MuiTextField-root": {
              width: "100%",
              backgroundColor: "transparent",
              ".MuiInputBase-root": {
                color: "#7A7A7A",
              },
            },
            ".MuiFormLabel-root": {
              color: (theme) => `${theme.palette.primary.main} !important`,
              fontWeight: 600,
              fontSize: 18,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-iwxl7s::before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-iwxl7s::after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-1kbklr8::before": {
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main} !important`,
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:after": {
              borderBottom: "1px solid #fff !important",
            },
            ".css-1kbklr8::after": {
              borderBottom: "1px solid #fff !important",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          {isCancelDialog ? "Cancel Booking" : "Confirm Booking"}
          <Typography sx={{ fontWeight: 600, color: "#7A7A7A" }}>
            {spaToBook?.bookingSpaRefNumber}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container rowSpacing={2}>
            {isCancelDialog ? (
              <Grid size={12}>
                <TextField
                  label={
                    <React.Fragment>
                      Remark{" "}
                      <Box
                        component="span"
                        sx={{
                          color: (theme) => theme.palette.error.main,
                        }}
                      >
                        *
                      </Box>
                    </React.Fragment>
                  }
                  name="remark"
                  value={formData.remark}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  variant="standard"
                />
              </Grid>
            ) : (
              <React.Fragment>
                <Grid size={12}>
                  <Autocomplete
                    size="small"
                    options={spaRoomDtoList}
                    getOptionLabel={(option) => option.name}
                    value={formData.selectedRoom}
                    onChange={(e, newVal) =>
                      handleChange("selectedRoom", newVal)
                    }
                    clearOnEscape
                    // disablePortal
                    popupIcon={<KeyboardArrowDownIcon color="primary" />}
                    sx={{
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
                        label={
                          <React.Fragment>
                            Select Room{" "}
                            <Box
                              component="span"
                              sx={{
                                color: (theme) => theme.palette.error.main,
                              }}
                            >
                              *
                            </Box>
                          </React.Fragment>
                        }
                        variant="standard"
                      />
                    )}
                  />
                </Grid>
                <Grid size={12}>
                  <Autocomplete
                    size="small"
                    options={therapistUserList}
                    getOptionLabel={(option) => option.name}
                    value={formData.selectedTherapist}
                    onChange={(e, newVal) =>
                      handleChange("selectedTherapist", newVal)
                    }
                    clearOnEscape
                    // disablePortal
                    popupIcon={<KeyboardArrowDownIcon color="primary" />}
                    sx={{
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
                        label={
                          <React.Fragment>
                            Select Therapist{" "}
                            <Box
                              component="span"
                              sx={{
                                color: (theme) => theme.palette.error.main,
                              }}
                            >
                              *
                            </Box>
                          </React.Fragment>
                        }
                        variant="standard"
                      />
                    )}
                  />
                </Grid>
              </React.Fragment>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color={isCancelDialog ? "error" : "secondary"}
            variant="contained"
            sx={{
              display: "block",
              mx: "auto",
              mb: 1,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              fontSize: 16,
              mt: 1.5,
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            size="small"
            disabled={
              !Boolean(
                isCancelDialog
                  ? formData.remark.trim()
                  : formData.selectedRoom && formData.selectedTherapist
              )
            }
            type="submit"
          >
            {isCancelDialog ? "Cancel Booking" : "Confirm Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

function formatDateTime(dateTime) {
  if (dateTime) {
    const [date, time] = dateTime.split(" ");
    return `${date.split("-").reverse().join("-")} ${time}`;
  }
  return null;
}

export default SpaFrontdeskBookingHistory;
