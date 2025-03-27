import React, { memo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Button,
  TextField,
  Divider,
  Paper,
  Toolbar,
  Autocomplete,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SearchIcon from "@mui/icons-material/Search";
import Grid from "@mui/material/Grid2";
import Slider from "@mui/material/Slider";
import {
  useGetAllParkingDataQuery,
  useParkVehicleMutation,
  useReleaseVehicleMutation,
  useCheckVehicleParkingStatusMutation,
  useGetValetUserListQuery,
  useGetParkingTypeQuery,
  useLazyGetGuestDetilsFromBookingRefQuery,
  useAddVehicleToAreaMutation,
  useGetVehiclesInsideParkingQuery,
  useAssignParkingSlotMutation,
} from "../../services/parking";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { FaCarSide } from "react-icons/fa6";
import dayjs from "dayjs";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import { PaymentDialog } from "../dashboard/GuestDashboard";
import { PaymentDialogV2 } from "../spa/SpaAdmin";
import moment from "moment";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Parking = () => {
  const [assignParkingSlot, assignParkingSlotRes] =
    useAssignParkingSlotMutation();
  const [addVehicleToParkFormDialog, setAddVehicleToParkFormDialog] =
    React.useState(false);
  const [addVehicleToArea, addVehicleToAreaRes] = useAddVehicleToAreaMutation();
  const [openPaymentDialogV2, setOpenPaymentDialogV2] = React.useState(null);
  const [apiPayload, setApiPayload] = React.useState({});
  const [searchVehicle, setSearchVehicle] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");
  const [selectedParkingArea, setSelectedParkingArea] = React.useState(null);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  // const queryPayload = {
  //   hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
  //   searchVehicle: debouncedSearchTerm,
  // };
  const {
    data: vehiclesInsideParking = {
      data: {
        data: [],
      },
    },
  } = useGetVehiclesInsideParkingQuery(
    JSON.parse(sessionStorage.getItem("data"))?.hotelId || null
  );
  const {
    data: parkingData = {
      data: [],
    },
    isLoading,
    isFetching: isParkingDataFetching,
  } = useGetAllParkingDataQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      searchVehicle: debouncedSearchTerm,
    },
    {
      // refetchOnMountOrArgChange: searchTrigger,
    }
  );
  const {
    data: valetUserList = {
      data: [],
    },
  } = useGetValetUserListQuery(
    JSON.parse(sessionStorage.getItem("data"))?.hotelId || null
  );

  const {
    data: parkingTypes = {
      data: [],
    },
  } = useGetParkingTypeQuery();
  console.log("parkingDataaaa", parkingData);
  // React.useEffect(() => {
  //   if (
  //     parkingData?.data &&
  //     parkingData.data.length > 0 &&
  //     !selectedParkingArea
  //   ) {
  //     setSelectedParkingArea(parkingData.data[0]);
  //   }
  // }, [parkingData?.data, selectedParkingArea]);

  // React.useEffect(() => {
  //   if (parkingData?.data?.length > 0) {
  //     // Always update selected area to match latest data
  //     setSelectedParkingArea(
  //       (prev) =>
  //         parkingData.data.find((area) => prev?.id === area.id) ||
  //         parkingData.data[0]
  //     );
  //   }
  // }, [parkingData?.data]);

  React.useEffect(() => {
    const identifier = setTimeout(() => {
      setDebouncedSearchTerm(searchVehicle);
    }, 500);
    return () => {
      clearTimeout(identifier);
    };
  }, [searchVehicle]);

  const handleAssignParkingSlot = React.useCallback(
    (payload, resetForm) => {
      assignParkingSlot(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setSelectedParkingArea(null);
          resetForm();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [assignParkingSlot]
  );

  // React.useEffect(() => {
  //   if (parkingData?.data?.length === 0) {
  //     setSelectedParkingArea(null);
  //   } else if (parkingData?.data?.length > 0) {
  //     setSelectedParkingArea(
  //       (prev) =>
  //         parkingData.data.find((area) => prev?.id === area.id) ||
  //         parkingData.data[0]
  //     );
  //   }
  // }, [parkingData?.data]);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header Box */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: "bold",
              color: "#606470",
              fontSize: "1.6rem",
            }}
          >
            PARKING MAP
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            id="searchVehicle"
            label="Search Vehicle"
            name="searchVehicle"
            variant="outlined"
            value={searchVehicle}
            onChange={(e) => setSearchVehicle(e.target.value)}
            sx={{
              bgcolor: "#F9F4FF",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          {/* <Button variant="contained" onClick={handleSearchSubmit}>
            Submit
          </Button> */}
        </Box>
      </Box>

      {/* cards */}
      <CustomParentCard
        parkingDataArray={parkingData?.data}
        onCardClick={setSelectedParkingArea}
        selectedParkingArea={selectedParkingArea}
      />
      {/* {selectedParkingArea && (
        <CustomParkingSlots parkingDataArray={[selectedParkingArea]} />
      )} */}
      {selectedParkingArea && (
        <CustomParkingSlots
          parkingDataArray={[selectedParkingArea]}
          setSelectedParkingArea={setSelectedParkingArea}
        />
      )}
      <VehicleToParkTable
        setAddVehicleToParkFormDialog={setAddVehicleToParkFormDialog}
        vehiclesInsideParking={vehiclesInsideParking.data.data}
        parkingData={parkingData.data}
        handleAssignParkingSlot={handleAssignParkingSlot}
      />
      <AddVehicleToParkFormDialog
        open={addVehicleToParkFormDialog}
        onClose={() => setAddVehicleToParkFormDialog(false)}
        valetUserList={valetUserList.data}
        parkingTypes={parkingTypes.data}
        setSnack={setSnack}
        parkingData={parkingData.data}
        addVehicleToArea={addVehicleToArea}
        setApiPayload={setApiPayload}
        setOpenPaymentDialogV2={setOpenPaymentDialogV2}
      />
      <PaymentDialogV2
        openPaymentDialog={Boolean(openPaymentDialogV2)}
        amountToPay={openPaymentDialogV2}
        handlePaymentDialogClose={() => setOpenPaymentDialogV2(null)}
        setSnack={setSnack}
        fetchApi={addVehicleToArea}
        apiPayload={apiPayload}
        handleReset={() => {
          setAddVehicleToParkFormDialog(false);
        }}
      />
      <LoadingComponent
        open={
          isLoading ||
          isParkingDataFetching ||
          addVehicleToAreaRes.isLoading ||
          assignParkingSlotRes.isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Box>
  );
};

const AddVehicleToParkFormDialog = memo(
  ({
    open,
    onClose,
    valetUserList,
    parkingTypes,
    setSnack,
    parkingData,
    addVehicleToArea,
    setApiPayload,
    setOpenPaymentDialogV2,
  }) => {
    const [getGuestDetails, getGuestDetailsRes] =
      useLazyGetGuestDetilsFromBookingRefQuery();
    const [isBookingRefSuccess, setIsBookingRefSuccess] = React.useState(null);
    const [formData, setFormData] = React.useState({
      name: "",
      phoneNo: "",
      vehicleNumber: "",
      vehicleType: "",
      parkingService: "",
      selectedValetUser: null,
      valetUserInputVal: "",
      parkingType: "",
      bookingRefNumber: "",
      description: "",
      selectedParkingArea: null,
      parkingAreaInputVal: "",
    });

    const handleChange = React.useCallback((name, val) => {
      if (name === "parkingType" && val !== "HOTEL") {
        setFormData((prevData) => ({
          ...prevData,
          bookingRefNumber: "",
          [name]: val,
        }));
      } else if (name === "parkingService" && val !== "Valet") {
        setFormData((prevData) => ({
          ...prevData,
          selectedValetUser: null,
          valetUserInputVal: "",
          [name]: val,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: val,
        }));
      }
    }, []);

    const handleResetForm = React.useCallback(() => {
      setFormData({
        name: "",
        phoneNo: "",
        vehicleNumber: "",
        vehicleType: "",
        parkingService: "",
        selectedValetUser: null,
        valetUserInputVal: "",
        parkingType: "",
        bookingRefNumber: "",
        description: "",
        selectedParkingArea: null,
        parkingAreaInputVal: "",
      });
    }, []);

    const isFormValid = React.useCallback(() => {
      return Boolean(
        formData.name.trim() &&
          formData.phoneNo &&
          formData.vehicleNumber.trim() &&
          formData.vehicleType &&
          formData.parkingService &&
          formData.selectedParkingArea &&
          formData.parkingType &&
          formData.description.trim() &&
          (formData.parkingService === "Valet"
            ? formData.selectedValetUser
            : true)
      );
    }, [formData]);

    const handleSearchDetailsFromBookingRef = React.useCallback(() => {
      getGuestDetails(formData.bookingRefNumber)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setFormData((prevData) => ({
            ...prevData,
            name: `${res.data.firstName} ${res.data.middleName || ""} ${
              res.data.lastName || ""
            }`,
            phoneNo: res.data.phoneNumber,
            parkingType: "HOTEL",
          }));
          setIsBookingRefSuccess(res.data);
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
          handleResetForm();
          setIsBookingRefSuccess(null);
        });
    }, [formData.bookingRefNumber, getGuestDetails, setSnack, handleResetForm]);

    const handleAddVehicleToArea = React.useCallback(() => {
      const vehicleNumberRegex =
        /^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/;
      if (formData.bookingRefNumber && !Boolean(isBookingRefSuccess)) {
        return setSnack({
          open: true,
          message: "Please provide a valid Booking Ref. Number.",
          severity: "error",
        });
      } else if (formData.phoneNo.length !== 10) {
        return setSnack({
          open: true,
          message: "Please provide a valid Phone Number.",
          severity: "error",
        });
      } else if (!vehicleNumberRegex.test(formData.vehicleNumber)) {
        return setSnack({
          open: true,
          message:
            "Invalid vehicle number. Use format like KA-01 AB 1234 or KA 01 1234",
          severity: "error",
        });
      }
      const payload = {
        bookingRefNumber: formData.bookingRefNumber || null,
        name: formData.name,
        phone: formData.phoneNo,
        vehicleNo: formData.vehicleNumber,
        vehicleType: formData.vehicleType,
        parkingService: formData.parkingService,
        valetUserId: formData.selectedValetUser?.id || null,
        parkingAreasId: formData.selectedParkingArea?.id || null,
        hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
        parkingType: formData.parkingType,
        description: formData.description,
        fromDate:
          isBookingRefSuccess?.fromDate || moment().format("DD-MM-YYYY"),
        toDate: isBookingRefSuccess?.toDate || moment().format("DD-MM-YYYY"),
      };

      if (formData.selectedParkingArea.isPaid) {
        const duration =
          isBookingRefSuccess?.fromDate && isBookingRefSuccess?.toDate
            ? ((new Date(
                isBookingRefSuccess?.toDate.split("-").reverse().join("-")
              ).getTime() -
                new Date(
                  isBookingRefSuccess?.fromDate.split("-").reverse().join("-")
                ).getTime()) /
                1000) *
              3600 *
              24
            : 1;
        const parkingAmount =
          formData.vehicleType === "Bike"
            ? formData.selectedParkingArea.bikeParkingAmount * duration
            : formData.selectedParkingArea.carParkingAmount * duration;
        setApiPayload(payload);
        setOpenPaymentDialogV2(parkingAmount);
      } else {
        addVehicleToArea(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res.message,
              severity: "success",
            });
            handleResetForm();
            onClose();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: err.data?.message || err.data,
              severity: "error",
            });
          });
      }
    }, [
      formData,
      addVehicleToArea,
      setSnack,
      handleResetForm,
      isBookingRefSuccess,
      setApiPayload,
      setOpenPaymentDialogV2,
      onClose,
    ]);

    return (
      <Dialog
        TransitionComponent={Transition}
        open={open}
        onClose={onClose}
        fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "450px", minWidth: "700px" } }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: "#280071",
            }}
          >
            Add Vehicle To Park
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                disabled={
                  Boolean(isBookingRefSuccess) ||
                  Boolean(
                    formData.parkingType && formData.parkingType !== "HOTEL"
                  )
                }
                name="bookingRefNumber"
                label="Booking Ref Number"
                variant="outlined"
                value={formData.bookingRefNumber}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                inputProps={{ maxLength: 200 }}
                sx={{ width: "100%" }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {getGuestDetailsRes.isFetching ? (
                          <CircularProgress size={30} />
                        ) : (
                          <IconButton
                            onClick={handleSearchDetailsFromBookingRef}
                          >
                            <SearchIcon />
                          </IconButton>
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="name"
                label="Name*"
                variant="outlined"
                value={formData.name}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                inputProps={{ maxLength: 100 }}
                sx={{ width: "100%" }}
                disabled={Boolean(isBookingRefSuccess)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="phoneNo"
                label="Phone No.*"
                variant="outlined"
                value={formData.phoneNo}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                inputProps={{ maxLength: 10 }}
                sx={{ width: "100%" }}
                disabled={Boolean(isBookingRefSuccess)}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                name="vehicleNumber"
                label="Vehicle Number*"
                variant="outlined"
                value={formData.vehicleNumber}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                inputProps={{ maxLength: 25 }}
                sx={{ width: "100%" }}
                helperText="Example: OD-05 AB 1234"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl
                component="fieldset"
                variant="standard"
                onChange={(e) => handleChange("vehicleType", e.target.value)}
              >
                <FormLabel component="legend">Vehicle Type</FormLabel>
                <FormGroup row>
                  {["Bike", "Car"].map((option) => {
                    return (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            name={option}
                            value={option}
                            checked={formData.vehicleType === option}
                          />
                        }
                        label={option}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl
                component="fieldset"
                variant="standard"
                onChange={(e) => handleChange("parkingService", e.target.value)}
              >
                <FormLabel component="legend">Parking Service</FormLabel>
                <FormGroup row>
                  {["Self", "Valet"].map((option) => {
                    return (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            name={option}
                            value={option}
                            checked={formData.parkingService === option}
                          />
                        }
                        label={option}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Autocomplete
                disabled={Boolean(
                  formData.parkingService && formData.parkingService === "Self"
                )}
                options={valetUserList}
                getOptionLabel={(option) => `${option.name}(${option.email})`}
                value={formData.selectedValetUser}
                onChange={(e, newVal) =>
                  handleChange("selectedValetUser", newVal)
                }
                inputValue={formData.valetUserInputVal}
                onInputChange={(e, newVal) =>
                  handleChange("valetUserInputVal", newVal)
                }
                clearOnEscape
                disablePortal
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <React.Fragment>Select Valet User{"*"}</React.Fragment>
                    }
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Autocomplete
                options={parkingData}
                getOptionLabel={(option) => `${option.areaName}`}
                value={formData.selectedParkingArea}
                onChange={(e, newVal) =>
                  handleChange("selectedParkingArea", newVal)
                }
                inputValue={formData.parkingAreaInputVal}
                onInputChange={(e, newVal) =>
                  handleChange("parkingAreaInputVal", newVal)
                }
                clearOnEscape
                disablePortal
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <React.Fragment>Select Parking Area{"*"}</React.Fragment>
                    }
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl
                component="fieldset"
                variant="standard"
                onChange={(e) => handleChange("parkingType", e.target.value)}
                disabled={Boolean(isBookingRefSuccess)}
              >
                <FormLabel component="legend">Parking Type</FormLabel>
                <FormGroup row>
                  {parkingTypes.map((option) => {
                    return (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            name={option}
                            value={option}
                            checked={formData.parkingType === option}
                          />
                        }
                        label={option}
                      />
                    );
                  })}
                </FormGroup>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="description"
                label="Description*"
                variant="outlined"
                value={formData.description}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                inputProps={{ maxLength: 200 }}
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            sx={{
              backgroundImage:
                "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
              backgroundColor: "inherit",
              color: "white",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
              },
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            disabled={!isFormValid()}
            onClick={handleAddVehicleToArea}
          >
            {formData?.selectedParkingArea?.isPaid
              ? "Pay And Add Vehicle"
              : "Add Vehicle"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

const CustomRowForVehicleParkTable = memo(
  ({ index, vehicle, slots, handleAssignParkingSlot }) => {
    const [selectedSlot, setSelectedSlot] = React.useState(null);
    const [selectedSlotInputVal, setSelectedSlotInputVal] = React.useState("");
    const allocateParkingSlot = React.useCallback(() => {
      handleAssignParkingSlot(
        {
          id: vehicle.id,
          slotId: selectedSlot.id,
        },
        () => {}
      );
    }, [handleAssignParkingSlot, selectedSlot, vehicle.id]);
    return (
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          ".MuiTableCell-root": {
            fontSize: "1rem",
            letterSpacing: 1,
          },
        }}
        key={vehicle.id}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>{vehicle.name}</TableCell>
        <TableCell>{vehicle.vehicleType}</TableCell>
        <TableCell>{vehicle.parkingService}</TableCell>
        <TableCell>{vehicle.parkingType}</TableCell>
        <TableCell>{vehicle.vehicleNo}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex" }}>
            <Autocomplete
              sx={{ flexGrow: 1 }}
              size="small"
              options={slots.filter(
                (slot) =>
                  !slot.isOccupied && slot.vehicleType === vehicle.vehicleType
              )}
              getOptionLabel={(option) => option.slotNumber}
              value={selectedSlot}
              onChange={(e, newVal) => setSelectedSlot(newVal)}
              inputValue={selectedSlotInputVal}
              onInputChange={(e, newVal) => setSelectedSlotInputVal(newVal)}
              clearOnEscape
              disablePortal
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={<React.Fragment>Select Slot</React.Fragment>}
                  variant="outlined"
                />
              )}
            />
            {true && (
              <Button
                size="small"
                color="secondary"
                variant="contained"
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  // fontSize: 18,
                  "&.Mui-disabled": {
                    background: "#B2E5F6",
                    color: "#FFFFFF",
                  },
                }}
                onClick={allocateParkingSlot}
                disabled={!Boolean(selectedSlot)}
              >
                Allocate
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
    );
  }
);

const VehicleToParkTable = memo(
  ({
    setAddVehicleToParkFormDialog,
    vehiclesInsideParking,
    parkingData,
    handleAssignParkingSlot,
  }) => {
    return (
      <Box>
        <Paper>
          <Toolbar
            sx={[
              {
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                justifyContent: { xs: "space-between" },
              },
            ]}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Vehicles To Park
            </Typography>
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
              onClick={() => setAddVehicleToParkFormDialog(true)}
            >
              Add Vehicle To Park
            </Button>
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
                  <TableCell>Sl No.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Parking Service</TableCell>
                  <TableCell>Parking Type</TableCell>
                  <TableCell>Vehicle Number</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehiclesInsideParking.map((vehicle, index) => {
                  return (
                    <CustomRowForVehicleParkTable
                      key={vehicle.id}
                      index={index}
                      vehicle={vehicle}
                      slots={
                        parkingData.find(
                          (parkingArea) =>
                            parkingArea.id === vehicle.parkingArea.id
                        )?.parkingSlotData || []
                      }
                      handleAssignParkingSlot={handleAssignParkingSlot}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  }
);

const CustomParentCard = memo(
  ({ parkingDataArray, onCardClick, selectedParkingArea }) => {
    // console.log("parkingDataArray", parkingDataArray);

    const calculateAvailableSlotsByType = (parkingSlotData) => {
      const availableBikes = parkingSlotData.filter(
        (slot) => !slot.isOccupied && slot.vehicleType === "Bike"
      ).length;

      const availableCars = parkingSlotData.filter(
        (slot) => !slot.isOccupied && slot.vehicleType === "Car"
      ).length;

      return { availableBikes, availableCars };
    };
    return (
      // <Box>
      <Grid container size={12} columnSpacing={4} rowSpacing={2}>
        {parkingDataArray?.map((item, index) => {
          const occupiedPercentage =
            (item.noOfOccupiedSlots / item.noOfSlots) * 100;
          const { availableBikes, availableCars } =
            calculateAvailableSlotsByType(item.parkingSlotData);

          return (
            <React.Fragment key={index}>
              <Grid size={{ xs: 3 }}>
                <Box
                  sx={{
                    minHeight: "12rem",
                    boxShadow:
                      "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
                    borderRadius: "0.7rem",
                    backgroundColor:
                      selectedParkingArea === item ? "#e6f2ff" : "#fff",
                    display: "flex",
                    flexDirection: "column",
                    p: 1.5,
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                  onClick={() => onCardClick(item)}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#606470",
                        fontWeight: "bold",
                        letterSpacing: "0.75",
                      }}
                    >
                      {item?.areaName}
                    </Typography>
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <Slider
                      value={occupiedPercentage}
                      aria-label="Disabled slider"
                      sx={{
                        "& .MuiSlider-thumb": {
                          display: "none",
                        },
                        "& .MuiSlider-track": {
                          height: 8,
                        },
                        "& .MuiSlider-rail": {
                          height: 8,
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Occupied</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfOccupiedSlots}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Available Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfAvailableSlots}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Total Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {item?.noOfSlots}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Available Bikes Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {availableBikes}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <span>.</span>
                        <Typography>Available Cars Slots</Typography>
                      </Box>
                      <Box>
                        <Typography color="secondary">
                          {availableCars}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </React.Fragment>
          );
        })}
      </Grid>
      // </Box>
    );
  }
);

// parking slots

const CustomParkingSlots = memo(
  ({ parkingDataArray, setSelectedParkingArea }) => {
    const [parkVehicleOpen, setParkVehicleOpen] = React.useState(false);
    const [selectedSlot, setSelectedSlot] = React.useState(null);
    console.log("selectedSlotin", selectedSlot);

    console.log("parkingDataArray inside slots", parkingDataArray);
    const handleVehicleParking = (slot) => {
      // setSelectedSlot(slot);
      // setParkVehicleOpen(true);
      if (slot.isOccupied) {
        setSelectedSlot(slot);
        setParkVehicleOpen(true);
      }
    };

    const handleCloseDialog = () => {
      setParkVehicleOpen(false);
      setSelectedSlot(null);
    };
    return (
      <Box
        elevation={2}
        sx={{
          p: 2,
          backgroundColor: "#fff",
          // minHeight: "500px",
        }}
      >
        {parkingDataArray?.map((parkingData) => (
          <>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#606470",
                  textTransform: "uppercase",
                }}
              >
                {parkingData?.areaName} Slots
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {parkingData?.parkingSlotData?.map((slot, index) => (
                <Grid key={index}>
                  <Box
                    key={slot.id}
                    sx={{
                      boxShadow:
                        "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px",
                      height: "4rem",
                      p: 2,
                      width: "100%",
                      borderRadius: "1rem",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: Boolean(slot?.isOccupied)
                        ? "gray"
                        : "#FFF",
                    }}
                  >
                    {slot?.vehicleType === "Bike" ? (
                      <IconButton
                        onClick={() => {
                          handleVehicleParking(slot);
                        }}
                        // disabled={slot?.isOccupied}
                      >
                        <TwoWheelerIcon
                          style={{
                            fontSize: "2.4rem",
                            color: Boolean(slot?.isOccupied)
                              ? "#fff"
                              : "#00A9E0",
                          }}
                        />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => {
                          handleVehicleParking(slot);
                        }}
                        // disabled={slot?.isOccupied}
                      >
                        <FaCarSide
                          style={{
                            fontSize: "2.4rem",
                            color: Boolean(slot?.isOccupied)
                              ? "#fff"
                              : "#280071",
                          }}
                        />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        ))}
        <VehicleParkingDialog
          parkVehicleOpen={parkVehicleOpen}
          selectedSlot={selectedSlot}
          onClose={handleCloseDialog}
          setSelectedParkingArea={setSelectedParkingArea}
        />
      </Box>
    );
  }
);

// Dialog for vehicle parking
const VehicleParkingDialog = ({
  parkVehicleOpen,
  selectedSlot,
  onClose,
  setSelectedParkingArea,
}) => {
  console.log("selectedslot", selectedSlot);
  const [formData, setFormData] = React.useState({
    vehicleNumber: "",
    amount: "",
    fromDate: null,
    toDate: null,
    description: "",
  });

  const [vehicleParking, vehicleParkingRes] = useParkVehicleMutation();
  const [releaseVehicle, releaseVehicleRes] = useReleaseVehicleMutation();
  const [checkVehicleParking, checkVehicleParkingRes] =
    useCheckVehicleParkingStatusMutation();

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);

  const calculateNumberOfDays = React.useMemo(() => {
    if (formData.fromDate && formData.toDate) {
      const startDate = dayjs(formData.fromDate);
      const endDate = dayjs(formData.toDate);
      return endDate.diff(startDate, "day") + 1;
    }
    return 0;
  }, [formData.fromDate, formData.toDate]);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "amount") {
      const numericRegex = /^[0-9]*$/;
      if (!numericRegex.test(value)) {
        return;
      }
    } else if (name === "vehicleNumber") {
      newValue = value.toUpperCase();
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleDateChange = (field) => (date) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };
  // const handleSubmit = () => {
  //   if (Boolean(selectedSlot?.isOccupied)) {
  //     // Call releaseVehicle API
  //     const releaseVehiclePayload = {
  //       id: selectedSlot?.id,
  //       parkingVehicleData: {
  //         id: selectedSlot?.parkingVehicleData?.id,
  //       },
  //     };
  //     releaseVehicle(releaseVehiclePayload)
  //       .unwrap()
  //       .then((res) => {
  //         setSnack({
  //           open: true,
  //           message: res.message,
  //           severity: "success",
  //         });

  //         onClose();
  //         setFormData({
  //           vehicleNumber: "",
  //           amount: "",
  //           fromDate: null,
  //           toDate: null,
  //         });
  //       })
  //       .catch((err) => {
  //         setSnack({
  //           open: true,
  //           message: err.data?.message || err.data || "Something Went Wrong",
  //           severity: "error",
  //         });
  //       });
  //   } else {
  //     const isAmountValid =
  //       formData.amount &&
  //       Number(formData.amount) >=
  //         Number(selectedSlot?.perDayPrice) * calculateNumberOfDays &&
  //       Number(formData.amount) <=
  //         Number(selectedSlot?.perDayPrice) * calculateNumberOfDays;

  //     if (!isAmountValid) {
  //       return setSnack({
  //         open: true,
  //         message:
  //           calculateNumberOfDays > 0
  //             ? Number(formData.amount) <
  //               Number(selectedSlot?.perDayPrice) * calculateNumberOfDays
  //               ? `Please pay ₹${
  //                   selectedSlot?.perDayPrice * calculateNumberOfDays
  //                 } in advance`
  //               : `Advance amount cannot exceed ₹${
  //                   selectedSlot?.perDayPrice * calculateNumberOfDays
  //                 }`
  //             : "Invalid  payment",
  //         severity: "error",
  //       });
  //     }
  //     // Call vehicleParking API
  //     const parkingVehiclePayload = {
  //       id: selectedSlot?.id,
  //       parkingVehicleData: {
  //         vehicleNo: formData.vehicleNumber,
  //         vehicleType: selectedSlot?.vehicleType,
  //         fromDate: formData.fromDate
  //           ? dayjs(formData.fromDate).format("DD-MM-YYYY")
  //           : null,
  //         toDate: formData.toDate
  //           ? dayjs(formData.toDate).format("DD-MM-YYYY")
  //           : null,
  //         totalAmount: selectedSlot?.perDayPrice,
  //         paidAmount: formData.amount,
  //         description: formData.description,
  //       },
  //     };
  //     vehicleParking(parkingVehiclePayload)
  //       .unwrap()
  //       .then((res) => {
  //         setSnack({
  //           open: true,
  //           message: res.message,
  //           severity: "success",
  //         });
  //         onClose();
  //         setFormData({
  //           vehicleNumber: "",
  //           amount: "",
  //           fromDate: null,
  //           toDate: null,
  //         });
  //       })
  //       .catch((err) => {
  //         setSnack({
  //           open: true,
  //           message: err.data?.message || err.data || "Something Went Wrong",
  //           severity: "error",
  //         });
  //       });
  //   }
  // };

  const validateAndOpenPaymentDialog = React.useCallback(() => {
    if (Boolean(selectedSlot?.isOccupied)) {
      // Call releaseVehicle API
      const releaseVehiclePayload = {
        id: selectedSlot?.id,
        parkingVehicleData: {
          id: selectedSlot?.parkingVehicleData?.id,
        },
      };
      releaseVehicle(releaseVehiclePayload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setSelectedParkingArea(null);
          onClose();
          setFormData({
            vehicleNumber: "",
            amount: "",
            fromDate: null,
            toDate: null,
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data || "Something Went Wrong",
            severity: "error",
          });
        });
    } else {
      const vehicleNumberRegex =
        /^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/;

      if (!formData.vehicleNumber) {
        return setSnack({
          open: true,
          message: "Please enter a vehicle number",
          severity: "error",
        });
      }
      if (!vehicleNumberRegex.test(formData.vehicleNumber)) {
        return setSnack({
          open: true,
          message:
            "Invalid vehicle number. Use format like KA-01 AB 1234 or KA 01 1234",
          severity: "error",
        });
      }
      const isAmountValid =
        formData.amount &&
        Number(formData.amount) >=
          Number(selectedSlot?.perDayPrice) * calculateNumberOfDays &&
        Number(formData.amount) <=
          Number(selectedSlot?.perDayPrice) * calculateNumberOfDays;

      if (!isAmountValid) {
        return setSnack({
          open: true,
          message:
            calculateNumberOfDays > 0
              ? Number(formData.amount) <
                Number(selectedSlot?.perDayPrice) * calculateNumberOfDays
                ? `Please pay ₹${
                    selectedSlot?.perDayPrice * calculateNumberOfDays
                  } in advance`
                : `Advance amount cannot exceed ₹${
                    selectedSlot?.perDayPrice * calculateNumberOfDays
                  }`
              : "Invalid  Details",
          severity: "error",
        });
      }

      const payload = {
        vehicleNo: formData.vehicleNumber,
      };
      checkVehicleParking(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          // setFormData({
          //   vehicleNumber: "",
          //   amount: "",
          //   fromDate: null,
          //   toDate: null,
          // });
          setOpenPaymentDialog(true);
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data || "Something Went Wrong",
            severity: "error",
          });
        });
      // checkVehicleParking;
    }
  }, [
    formData.vehicleNumber,
    calculateNumberOfDays,
    formData.amount,
    onClose,
    releaseVehicle,
    selectedSlot,
    checkVehicleParking,
    setSelectedParkingArea,
  ]);

  const handlePrintReceipt = () => {
    const prtContent = document.getElementById("bookingReceipt");
    var WinPrint = window.open(
      "",
      "",
      "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0"
    );
    WinPrint.document.write(prtContent.innerHTML);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  console.log("selectedSlot", selectedSlot);
  return (
    <>
      <Dialog
        TransitionComponent={Transition}
        open={parkVehicleOpen}
        onClose={onClose}
        // maxWidth="sm"
        fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "450px", minWidth: "700px" } }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: selectedSlot?.isOccupied ? "#606470" : "#280071",

              // "#606470"
            }}
          >
            {/* Park Vehicle */}
            {Boolean(selectedSlot?.isOccupied)
              ? "Release Vehicle"
              : "Park Vehicle"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {Boolean(selectedSlot?.isOccupied) ? (
            <div
              style={{ display: "flex", flexDirection: "column" }}
              id="bookingReceipt"
            >
              <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
              <div style={{ textAlign: "center" }}>
                <h3>BOOKING RECEIPT</h3>
              </div>
              <Divider sx={{ borderWidth: "2px", borderColor: "#000" }} />
              <div
                style={{
                  width: "550px",
                  margin: "auto",
                  marginTop: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      width: "50%",
                      fontWeight: "bold",
                    }}
                  >
                    Vehicle Number :
                  </div>
                  <div>{selectedSlot?.parkingVehicleData?.vehicleNo}</div>
                </div>

                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%", fontWeight: "bold" }}>
                    From Date:
                  </div>
                  <div>{selectedSlot?.parkingVehicleData?.fromDate}</div>
                </div>

                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%", fontWeight: "bold" }}>
                    To Date:
                  </div>
                  <div>{selectedSlot?.parkingVehicleData?.toDate}</div>
                </div>

                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%", fontWeight: "bold" }}>
                    Token No.
                  </div>
                  <div>{selectedSlot?.parkingVehicleData?.digitalTokenNo}</div>
                </div>

                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%", fontWeight: "bold" }}>
                    Paid Amount
                  </div>
                  <div>₹ {selectedSlot?.parkingVehicleData?.totalAmount}</div>
                </div>
              </div>
            </div>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} fullWidth>
                  <DatePicker
                    label="From Date"
                    disablePast
                    format="DD-MM-YYYY"
                    value={formData.fromDate}
                    onChange={handleDateChange("fromDate")}
                    slotProps={{
                      textField: {
                        readOnly: true,
                      },
                    }}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="To Date"
                    format="DD-MM-YYYY"
                    value={formData.toDate}
                    onChange={handleDateChange("toDate")}
                    minDate={
                      formData.fromDate ? dayjs(formData.fromDate) : undefined
                    }
                    slotProps={{
                      textField: {
                        readOnly: true,
                      },
                    }}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="vehicleNumber"
                  label="Vehicle Number"
                  variant="outlined"
                  value={formData.vehicleNumber}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                  required
                  sx={{ width: "100%" }}
                  helperText="Example: OD-05 AB 1234"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  id="outlined-basic"
                  name="amount"
                  label="Total Amount"
                  variant="outlined"
                  value={formData.amount}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                  required
                  sx={{ width: "100%" }}
                  helperText={
                    calculateNumberOfDays > 0
                      ? Number(formData.amount) <
                        Number(selectedSlot?.perDayPrice) *
                          calculateNumberOfDays
                        ? `Please pay ₹${
                            selectedSlot?.perDayPrice * calculateNumberOfDays
                          } in advance`
                        : Number(formData.amount) >
                          Number(selectedSlot?.perDayPrice) *
                            calculateNumberOfDays
                        ? `Advance amount cannot exceed ₹${
                            selectedSlot?.perDayPrice * calculateNumberOfDays
                          }`
                        : ""
                      : ""
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  id="outlined-basic"
                  name="description"
                  label="Description"
                  variant="outlined"
                  value={formData.description}
                  onChange={handleChangeInput}
                  inputProps={{ maxLength: 25 }}
                  required
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          )}
          {/* <Box> */}

          {/* </Box> */}
        </DialogContent>
        <DialogActions>
          {/* <Button
            onClick={onClose}
            variant="contained"
            sx={{ backgroundColor: "#E31837" }}
          >
            No
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#318CE7" }}
            onClick={handleSubmit}
          >
            Yes
          </Button> */}
          {Boolean(selectedSlot?.isOccupied) && (
            <Button
              variant="contained"
              color="secondary"
              sx={{
                color: "#fff",
              }}
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>
          )}
          <Button
            variant="contained"
            sx={{
              backgroundImage:
                "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
              backgroundColor: "inherit",
              color: "white",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
              },
            }}
            onClick={validateAndOpenPaymentDialog}
          >
            {Boolean(selectedSlot?.isOccupied) ? "Release" : "Pay and Park"}
          </Button>
        </DialogActions>
      </Dialog>

      <LoadingComponent
        open={
          vehicleParkingRes?.isLoading ||
          releaseVehicleRes?.isLoading ||
          checkVehicleParkingRes?.isLoading
        }
      />
      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={{
          id: selectedSlot?.id,
          parkingVehicleData: {
            vehicleNo: formData.vehicleNumber,
            vehicleType: selectedSlot?.vehicleType,
            fromDate: formData.fromDate
              ? dayjs(formData.fromDate).format("DD-MM-YYYY")
              : null,
            toDate: formData.toDate
              ? dayjs(formData.toDate).format("DD-MM-YYYY")
              : null,
            // totalAmount: selectedSlot?.perDayPrice,
            totalAmount: selectedSlot?.perDayPrice * calculateNumberOfDays,
            description: formData.description,
          },
          paidAmount: formData.amount,
        }}
        reserveHotelRoom={vehicleParking}
        setSnack={setSnack}
        handleResetForm={() => {
          setFormData({
            vehicleNumber: "",
            amount: "",
            fromDate: null,
            toDate: null,
            description: "",
          });
        }}
        handleAfterSuccessFunction={() => {
          onClose();
        }}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default Parking;
