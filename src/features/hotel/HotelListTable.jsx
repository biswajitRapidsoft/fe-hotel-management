import React from "react";
import ReactDOM from "react-dom";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  // Collapse,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid2 as Grid,
  Chip,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import { BootstrapDialog } from "../header/Header";

// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditIcon from "@mui/icons-material/Edit";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import LoadingComponent from "../../components/LoadingComponent";

import {
  useChangeRoomStatusMutation,
  useGetHotelListByCompanyQuery,
  useGetCheckInCheckOutConfigByHotelIdQuery,
  useSaveCheckInCheckOutConfigByHotelMutation,
} from "../../services/hotel";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../helper/constants";
import SnackAlert from "../../components/Alert";
import moment from "moment";
import dayjs from "dayjs";

const tableHeader = [
  { label: "Sl." },
  { label: "Hotel Name" },
  // { label: "State" },
  // { label: "City" },
  // { label: "Address" },
  // { label: "GST IN" },
  // {
  //   label: "Email",
  // },
  // { label: "Phone No." },
  { label: "Halls" },
  { label: "Banquets" },
  { label: "Spa" },
  { label: "Parkings" },
  { label: "PromoCode" },
  { label: "Restaurant" },
  { label: "Bar" },
  { label: "Laundry" },
  { label: "Action" },
];

const HotelListTable = ({ setHotelToUpdate }) => {
  const navigate = useNavigate();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    data: hotelList = {
      data: [],
    },
    isLoading,
  } = useGetHotelListByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );
  const [changeRoomStatus, changeRoomStatusRes] = useChangeRoomStatusMutation();
  const [checkInCheckOutDialog, setCheckInCheckOutDialog] =
    React.useState(null);

  const {
    data: checkInCheckOutConfig = {
      data: null,
    },
    isFetching: isCheckInCheckOutConfigLoading,
    isError: isCheckInCheckOutConfigError,
  } = useGetCheckInCheckOutConfigByHotelIdQuery(
    checkInCheckOutDialog?.id || null,
    { skip: !Boolean(checkInCheckOutDialog) }
  );

  const [saveCheckInCheckOutConfig, saveCheckInCheckOutConfigRes] =
    useSaveCheckInCheckOutConfigByHotelMutation();

  const handleChangeStatus = React.useCallback(
    (room) => {
      changeRoomStatus({ id: room.id })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
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
    [changeRoomStatus]
  );

  return (
    <React.Fragment>
      <Paper>
        <Toolbar
          sx={[
            {
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            },
          ]}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between  ",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Hotel List
            </Typography>
            <Button
              color="secondary"
              variant="contained"
              size="small"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 18,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              onClick={() => navigate("/ConfigurePrice")}
            >
              Configure Price
            </Button>
          </Box>
        </Toolbar>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    fontWeight: "bold",
                    fontSize: "1rem",
                    letterSpacing: 1,
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                {tableHeader.map((header) => {
                  return (
                    <TableCell key={header.label}>{header.label}</TableCell>
                  );
                })}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {hotelList.data.map((hotel, index) => {
                return (
                  <Row
                    hotel={hotel}
                    key={hotel.id}
                    sequence={index + 1}
                    setHotelToUpdate={setHotelToUpdate}
                    handleChangeStatus={handleChangeStatus}
                    setCheckInCheckOutDialog={setCheckInCheckOutDialog}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <CheckInCheckOutDialog
        open={Boolean(checkInCheckOutDialog)}
        handleClose={() => setCheckInCheckOutDialog(null)}
        hotel={checkInCheckOutDialog}
        key={checkInCheckOutDialog?.id || null}
        configData={
          isCheckInCheckOutConfigLoading || isCheckInCheckOutConfigError
            ? null
            : checkInCheckOutConfig.data
        }
        saveCheckInCheckOutConfig={saveCheckInCheckOutConfig}
        setSnack={setSnack}
      />
      <LoadingComponent
        open={
          isLoading ||
          changeRoomStatusRes.isLoading ||
          saveCheckInCheckOutConfigRes.isLoading ||
          isCheckInCheckOutConfigLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

function Row({
  hotel,
  sequence,
  setHotelToUpdate,
  handleChangeStatus,
  setCheckInCheckOutDialog,
}) {
  // const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [viewHotelDetailsDialog, setHotelDetailsDialog] = React.useState(null);
  const handleCloseViewHotelDetailsDialog = React.useCallback(() => {
    setHotelDetailsDialog(null);
  }, []);
  //   let roomSlNo = 0;
  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          ".MuiTableCell-root": {
            fontSize: "1rem",
            letterSpacing: 1,
          },
        }}
      >
        <TableCell>{sequence}</TableCell>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: 230,
            }}
          >
            <Box
              component="img"
              src={hotel.logoUrl}
              sx={{ width: 50, height: 50 }}
            />
            {hotel.name}
          </Box>
        </TableCell>
        {/* <TableCell>{hotel.state.name}</TableCell> */}
        {/* <TableCell>{hotel.city.name}</TableCell> */}
        {/* <TableCell sx={{ minWidth: 200 }}>{hotel.address}</TableCell> */}
        {/* <TableCell>{hotel.gstIn}</TableCell> */}
        {/* <TableCell>{hotel.email}</TableCell> */}
        {/* <TableCell>{hotel.contactNos?.join(", ")}</TableCell> */}
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForHall", hotel?.id);
            navigate("/HallList");
          }}
        >
          <Chip
            label={hotel?.noOfHalls}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForBanquet", hotel?.id);
            navigate("/BanquetList");
          }}
        >
          <Chip
            label={hotel?.noOfBanquets}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForSpaType", hotel?.id);
            navigate("/spa-type");
          }}
        >
          <Chip
            label={hotel?.noOfSpaType || 0}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForParkingList", hotel?.id);
            navigate("/parking-list");
          }}
        >
          {/* <Typography sx={{ cursor: "pointer" }}> */}
          <Chip
            label={hotel?.noOfParkingAreaCounts || 0}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
          {/* </Typography> */}
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForPromoCode", hotel?.id);
            navigate("/PromocodeList");
          }}
        >
          <Chip
            label={hotel?.noOfCoupons}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForFoodItem", hotel?.id);

            navigate("/FoodItemList");
          }}
        >
          <Chip
            label={hotel?.noOfMasterDinningTypes}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForBarItem", hotel?.id);

            navigate("/barItemList");
          }}
        >
          <Chip
            label={hotel?.noOfBarMenu}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForLaundryItem", hotel?.id);

            navigate("/laundryItemList");
          }}
        >
          <Chip
            label={hotel?.noOfLaundryItemsCount || 0}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton onClick={() => setHotelToUpdate(hotel)}>
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{ display: "block" }}
              size="small"
              // onClick={() => setOpen(!open)}
              onClick={() => setHotelDetailsDialog(hotel)}
            >
              <InfoIcon />
            </IconButton>
            <IconButton onClick={() => setCheckInCheckOutDialog(hotel)}>
              <CompareArrowsIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          {/* <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
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
                    <TableCell>Sl No.</TableCell>
                    <TableCell>Floor</TableCell>
                    <TableCell>Room number</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotel.floorRoomMapData?.map((floor) => {
                    return floor.roomDto?.map((room, roomIndex) => {
                      //   roomSlNo += 1;
                      return (
                        <TableRow key={room.id}>
                          {roomIndex === 0 && (
                            <TableCell rowSpan={floor.roomDto.length}>
                              {floor.floorNo}
                            </TableCell>
                          )}
                          {roomIndex === 0 && (
                            <TableCell
                              rowSpan={floor.roomDto.length}
                            >{`Floor ${floor.floorNo}`}</TableCell>
                          )}
                          <TableCell>{room.roomNo}</TableCell>
                          <TableCell>{room.roomType.type}</TableCell>
                          <TableCell>
                            <Switch
                              checked={room.isActive}
                              color="success"
                              onChange={() => handleChangeStatus(room)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse> */}
        </TableCell>
      </TableRow>
      <HotelDetailsDialog
        open={Boolean(viewHotelDetailsDialog)}
        viewHotelDetailsDialog={viewHotelDetailsDialog}
        handleClose={handleCloseViewHotelDetailsDialog}
        handleChangeStatus={handleChangeStatus}
        hotel={hotel}
      />
    </React.Fragment>
  );
}

const CheckInCheckOutDialog = ({
  open,
  handleClose,
  hotel,
  configData,
  saveCheckInCheckOutConfig,
  setSnack,
}) => {
  const [configDataToUpdate, setConfigDataToUpdate] = React.useState(null);
  const [formData, setFormData] = React.useState({
    checkInTime: null,
    checkOutTime: null,
    isPaid: false,
    isFixedPrice: false,
    fixedAmount: "",
    perHourRate: "",
  });

  const handleChange = React.useCallback((name, value) => {
    if (name === "isPaid") {
      setFormData((prevData) => ({
        ...prevData,
        isFixedPrice: false,
        fixedAmount: "",
        perHourRate: "",
        [name]: value,
      }));
    } else if (name === "isFixedPrice") {
      setFormData((prevData) => ({
        ...prevData,
        fixedAmount: "",
        perHourRate: "",
        [name]: value,
      }));
    } else if (["fixedAmount", "perHourRate"].includes(name)) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.replace(/\D|^0/g, ""),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      checkInTime: null,
      checkOutTime: null,
      isPaid: false,
      isFixedPrice: false,
      fixedAmount: "",
      perHourRate: "",
    }));
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.checkInTime &&
        formData.checkOutTime &&
        (formData.isPaid
          ? formData.isFixedPrice
            ? formData.fixedAmount
            : formData.perHourRate
          : true)
    );
  }, [formData]);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      saveCheckInCheckOutConfig({
        id: configDataToUpdate?.id || null,
        checkInTime: moment(formData.checkInTime.$d).format("hh:mm A"),
        checkOutTime: moment(formData.checkOutTime.$d).format("hh:mm A"),
        hotelId: hotel.id,
        isPaid: formData.isPaid,
        isFixedAmount: formData.isFixedPrice,
        fixedAmount: formData.fixedAmount || null,
        perHourRate: formData.perHourRate || null,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleResetForm();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [
      formData,
      saveCheckInCheckOutConfig,
      setSnack,
      hotel,
      handleResetForm,
      configDataToUpdate,
    ]
  );

  React.useEffect(() => {
    if (configDataToUpdate) {
      setFormData({
        checkInTime: dayjs(
          new Date().toISOString().split("T")[0] + ` ${configData.checkInTime}`
        ),
        checkOutTime: dayjs(
          new Date().toISOString().split("T")[0] + ` ${configData.checkOutTime}`
        ),
        isPaid: false,
        isFixedPrice: false,
        fixedAmount: configData.fixedAmount || "",
        perHourRate: configData.perHourRate || "",
      });
    }
  }, [configDataToUpdate]);

  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 5,
            py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.9rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {`Check-In Check-Out Configuration (${hotel?.name})`}
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 30,
            top: 16,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ px: 3 }}>
            {configData === null || configDataToUpdate !== null ? (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  ".MuiTextField-root": {
                    width: "100%",
                    backgroundColor: "transparent",
                    ".MuiInputBase-root": {
                      color: "#7A7A7A",
                    },
                  },
                  ".MuiFormLabel-root": {
                    color: (theme) =>
                      `${theme.palette.primary.main} !important`,
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
                }}
              >
                <Grid container columnSpacing={4} rowSpacing={2}>
                  <Grid size={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Check-In Time"
                        slotProps={{
                          textField: { variant: "standard", readOnly: true },
                        }}
                        value={formData.checkInTime}
                        onChange={(newVal) =>
                          handleChange("checkInTime", newVal)
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid size={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Check-Out Time"
                        slotProps={{
                          textField: { variant: "standard", readOnly: true },
                        }}
                        value={formData.checkOutTime}
                        onChange={(newVal) =>
                          handleChange("checkOutTime", newVal)
                        }
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid size={4}>
                    <FormGroup sx={{ mt: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.isPaid}
                            name="isPaid"
                            onChange={(e) =>
                              handleChange(e.target.name, e.target.checked)
                            }
                          />
                        }
                        label="Is Paid Extension"
                      />
                    </FormGroup>
                  </Grid>
                  {formData.isPaid && (
                    <React.Fragment>
                      <Grid size={4}>
                        <FormGroup sx={{ mt: 1 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.isFixedPrice}
                                name="isFixedPrice"
                                onChange={(e) =>
                                  handleChange(e.target.name, e.target.checked)
                                }
                              />
                            }
                            label="Is Fixed Price"
                          />
                        </FormGroup>
                      </Grid>
                      {formData.isFixedPrice ? (
                        <Grid size={4}>
                          <TextField
                            label={
                              <React.Fragment>
                                Fixed Amount{" "}
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
                            name="fixedAmount"
                            value={formData.fixedAmount}
                            onChange={(e) =>
                              handleChange(e.target.name, e.target.value)
                            }
                            variant="standard"
                            // disabled={Boolean(hotelToUpdate)}
                          />
                        </Grid>
                      ) : (
                        <Grid size={4}>
                          <TextField
                            label={
                              <React.Fragment>
                                Per Hour Rate{" "}
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
                            name="perHourRate"
                            value={formData.perHourRate}
                            onChange={(e) =>
                              handleChange(e.target.name, e.target.value)
                            }
                            variant="standard"
                            // disabled={Boolean(hotelToUpdate)}
                          />
                        </Grid>
                      )}
                    </React.Fragment>
                  )}
                </Grid>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                >
                  <Button
                    color="secondary"
                    variant="contained"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    type="submit"
                    disabled={!isFormValid()}
                  >
                    {Boolean(configDataToUpdate)
                      ? "Update Configuration"
                      : "Save Configuration"}
                  </Button>
                </Box>
              </Box>
            ) : (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        ".MuiTableCell-root": {
                          fontWeight: "bold",
                          fontSize: "1rem",
                          letterSpacing: 1,
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell>Check-In Time</TableCell>
                      <TableCell>Check-Out Time</TableCell>
                      <TableCell>Is Paid Extension</TableCell>
                      <TableCell>Is Fixed Price</TableCell>
                      <TableCell>Fixed Amount</TableCell>
                      <TableCell>Per Hour Rate</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configData ? (
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          ".MuiTableCell-root": {
                            fontSize: "1rem",
                            letterSpacing: 1,
                          },
                        }}
                      >
                        <TableCell>{configData.checkInTime}</TableCell>
                        <TableCell>{configData.checkOutTime}</TableCell>
                        <TableCell>
                          {configData.isPaid ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>
                          {configData.isFixedAmount ? "Yes" : "No"}
                        </TableCell>
                        <TableCell>{configData.fixedAmount || "--"}</TableCell>
                        <TableCell>{configData.perHourRate || "--"}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => setConfigDataToUpdate(configData)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Box>
                            <Typography align="center">
                              No data Found.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>,
    document.getElementById("portal")
  );
};

const HotelDetailsDialog = ({
  open,
  viewHotelDetailsDialog,
  handleClose,
  handleChangeStatus,
  hotel,
}) => {
  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="lg"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 5,
            py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.9rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {viewHotelDetailsDialog?.name}
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 30,
            top: 16,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Grid container>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      State:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.state?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      City:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.city?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      GST IN:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.gstIn}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      Address:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      Email:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.email}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ height: "400px", overflowY: "auto" }}>
              <Table stickyHeader>
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
                    <TableCell>Sl No.</TableCell>
                    <TableCell>Floor</TableCell>
                    <TableCell>Room number</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell>No. of Keys</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotel?.floorRoomMapData?.map((floor) => {
                    return floor.roomDto?.map((room, roomIndex) => {
                      //   roomSlNo += 1;
                      return (
                        <TableRow key={room.id}>
                          {roomIndex === 0 && (
                            <TableCell rowSpan={floor.roomDto.length}>
                              {floor.floorNo}
                            </TableCell>
                          )}
                          {roomIndex === 0 && (
                            <TableCell
                              rowSpan={floor.roomDto.length}
                            >{`Floor ${floor.floorNo}`}</TableCell>
                          )}
                          <TableCell>{room.roomNo}</TableCell>
                          <TableCell>{room.roomType.type}</TableCell>
                          <TableCell>{room.noOfKeys}</TableCell>
                          <TableCell>
                            <Switch
                              checked={room.isActive}
                              color="success"
                              onChange={() => handleChangeStatus(room)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions />
      </BootstrapDialog>
    </React.Fragment>,
    document.getElementById("portal")
  );
};

export default React.memo(HotelListTable);
