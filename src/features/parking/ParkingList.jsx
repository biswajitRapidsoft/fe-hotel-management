import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Divider,
  Grid2 as Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import {
  useGetAllParkingVehicleTypeQuery,
  useCreateParkingAreaMutation,
  useGetParkingDataForAdminQuery,
  useUpdateParkingAreaMutation,
} from "../../services/parking";
import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
import ParkingListTable from "./ParkingListTable";

const ParkingList = () => {
  const [parkingToUpdate, setParkingToUpdate] = React.useState(null);
  const {
    data: parkingData = {
      data: [],
    },
    isLoading,
  } = useGetParkingDataForAdminQuery({
    hotelId: sessionStorage.getItem("hotelIdForParkingList"),
  });
  const [createParking, createParkingRes] = useCreateParkingAreaMutation();
  const [updateParking, updateParkingRes] = useUpdateParkingAreaMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [parkingSlotArr, setParkingSlotArr] = React.useState([]);
  const {
    data: vehicleTypeList = {
      data: [],
    },
  } = useGetAllParkingVehicleTypeQuery();
  const [formData, setFormData] = React.useState({
    parkingName: "",
    areaName: "",
  });
  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      parkingName: "",
      areaName: "",
    });
    setParkingSlotArr([]);
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.parkingName.trim() &&
        formData.areaName.trim() &&
        parkingSlotArr.length > 0
    );
  }, [formData, parkingSlotArr]);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      if (Boolean(parkingToUpdate)) {
        updateParking({
          id: parkingToUpdate.id,
          areaName: formData.parkingName,
          locations: formData.areaName,
          hotelDto: {
            id: sessionStorage.getItem("hotelIdForParkingList"),
          },
          slotList: parkingSlotArr.map((slot) => ({
            slotNumber: slot.slotName,
            vehicleType: slot.vehicleType,
          })),
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
      } else {
        createParking({
          areaName: formData.parkingName,
          locations: formData.areaName,
          hotelDto: {
            id: sessionStorage.getItem("hotelIdForParkingList"),
          },
          slotList: parkingSlotArr.map((slot) => ({
            slotNumber: slot.slotName,
            vehicleType: slot.vehicleType,
          })),
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
      }
    },
    [
      createParking,
      formData,
      parkingSlotArr,
      handleResetForm,
      updateParking,
      parkingToUpdate,
    ]
  );

  React.useEffect(() => {
    if (parkingToUpdate) {
      setFormData({
        parkingName: parkingToUpdate.areaName || "",
        areaName: parkingToUpdate.location || "",
      });
      setParkingSlotArr(
        parkingToUpdate.parkingSlotData.map((slotData) => ({
          id: slotData.id,
          slotName: slotData.slotNumber,
          vehicleType: slotData.vehicleType,
        }))
      );
    }
  }, [parkingToUpdate]);

  return (
    <Container>
      <Box
        sx={{
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
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Grid container columnSpacing={5} rowSpacing={3}>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Parking Name{" "}
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
              name="parkingName"
              value={formData.parkingName}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Location{" "}
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
              name="areaName"
              value={formData.areaName}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
        </Grid>
        <Box>
          <AddParkingSlotFormComponent
            vehicleTypeList={vehicleTypeList.data}
            parkingSlotArr={parkingSlotArr}
            setParkingSlotArr={setParkingSlotArr}
            setSnack={setSnack}
          />
        </Box>
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
            {Boolean(parkingToUpdate) ? "Update Parking" : "Add Parking"}
          </Button>
        </Box>
      </Box>
      <ParkingListTable
        parkingData={parkingData.data}
        setParkingToUpdate={setParkingToUpdate}
      />
      <LoadingComponent
        open={
          createParkingRes.isLoading || updateParkingRes.isLoading || isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

function AddParkingSlotFormComponent({
  vehicleTypeList,
  parkingSlotArr,
  setParkingSlotArr,
  setSnack,
}) {
  const [formData, setFormData] = React.useState({
    slotName: "",
    selectedVehicleType: null,
    selectedVehicleTypeInputVal: "",
  });

  const handleResetForm = React.useCallback(() => {
    setFormData({
      slotName: "",
      selectedVehicleType: null,
      selectedVehicleTypeInputVal: "",
    });
  }, []);

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);
  const handleAddParkingSlotToArray = React.useCallback(() => {
    if (
      Boolean(
        parkingSlotArr.find(
          (slot) =>
            slot.slotName.trim().toLowerCase() ===
            formData.slotName.trim().toLocaleLowerCase()
        )
      )
    ) {
      return setSnack({
        open: true,
        message: "Slot name already exists.",
        severity: "error",
      });
    } else {
      setParkingSlotArr((prevData) => [
        ...prevData,
        {
          slotName: formData.slotName,
          vehicleType: formData.selectedVehicleType,
        },
      ]);
      handleResetForm();
    }
  }, [formData, parkingSlotArr, setSnack, handleResetForm, setParkingSlotArr]);
  const isFormValid = React.useCallback(() => {
    return Boolean(formData.slotName.trim() && formData.selectedVehicleType);
  }, [formData]);

  const handleDeleteSlot = React.useCallback(
    (slotName) => {
      setParkingSlotArr([
        ...parkingSlotArr.filter((slot) => slot.slotName !== slotName),
      ]);
    },
    [parkingSlotArr, setParkingSlotArr]
  );

  return (
    <React.Fragment>
      <Box
        sx={{
          mt: 2,
          px: 1,
          py: 0.5,
          // borderBottom: (theme) => `3px solid ${theme.palette.primary.main}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#BDBDBD",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            letterSpacing: 1,
            //   color: (theme) => theme.palette.primary.main,
            color: "#FFFFFF",
            fontWeight: 600,
          }}
          // gutterBottom
        >
          Add Slots
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#BDBDBD" }} />
      <Box sx={{ p: 2, border: "1px solid #BDBDBD" }}>
        <Grid container columnSpacing={2}>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Slot Number{" "}
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
              name="slotName"
              value={formData.slotName}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={vehicleTypeList}
              value={formData.selectedVehicleType}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedVehicleType", value: newVal },
                })
              }
              inputValue={formData.selectedVehicleTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedVehicleTypeInputVal",
                    value: newVal,
                  },
                })
              }
              clearOnEscape
              disablePortal
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
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
                      Select Vehicle Type{" "}
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
          <Grid size={3}>
            <Button
              color="secondary"
              variant="contained"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 15,
                mt: 1.5,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              size="small"
              onClick={handleAddParkingSlotToArray}
              disabled={!isFormValid()}
            >
              Add Slot
            </Button>
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 3, mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        ".MuiTableCell-root": {
                          fontSize: "1rem",
                          backgroundColor: "#E9E5F1",
                        },
                      }}
                    >
                      <TableCell>S.No.</TableCell>
                      <TableCell>Slot Number</TableCell>
                      <TableCell>Vehicle Type</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parkingSlotArr.map((parkingSlot, index) => {
                      return (
                        <TableRow
                          sx={{
                            "& > *": { borderBottom: "unset" },
                            ".MuiTableCell-root": {
                              color: "#747474",
                            },
                          }}
                          key={parkingSlot.slotName}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{parkingSlot.slotName}</TableCell>
                          <TableCell>{parkingSlot.vehicleType}</TableCell>
                          <TableCell>
                            {typeof parkingSlot.id !== "number" && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteSlot(parkingSlot.slotName)
                                }
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default ParkingList;
