import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Container,
  Grid2 as Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

import { StyledCalendarIcon } from "../dashboard/Dashboard";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";
import {
  useGetAllRoomTypesByCompanyQuery,
  useSaveRoomTypeUpgradePriceConfigMutation,
  useGetRoomTypeUpgradePriceConfigAdminQuery,
} from "../../services/roomType";
import { ADMIN } from "../../helper/constants";
import moment from "moment";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const Row = ({ roomType, index }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment key={roomType.id}>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          ".MuiTableCell-root": {
            fontSize: "1rem",
            letterSpacing: 1,
          },
        }}
      >
        <TableCell>{index + 1}</TableCell>
        <TableCell>{roomType.type}</TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: "#f4f4f4" }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      ".MuiTableCell-root": {
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <TableCell>Sl No.</TableCell>
                    <TableCell>Upgrade Type</TableCell>
                    <TableCell>Discount percentage</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Boolean(
                    roomType.upgradeRoomTypePriceConfiguration?.length
                  ) ? (
                    roomType.upgradeRoomTypePriceConfiguration.map(
                      (upgrade, ind) => {
                        return (
                          <TableRow>
                            <TableCell>{ind + 1}</TableCell>
                            <TableCell>
                              {upgrade.upgradeRoomTypeDto.type}
                            </TableCell>
                            <TableCell>{upgrade.percentageDiscount}</TableCell>
                            <TableCell>
                              {moment(upgrade.startDate).format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell>
                              {moment(upgrade.endDate).format("DD-MM-YYYY")}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box sx={{ p: 1, textAlign: "center" }}>
                          No record found.
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const RoomUpgradeConfiguration = () => {
  const {
    data: roomTypeUpgradeConfigurationList = {
      data: [],
    },
    isLoading,
  } = useGetRoomTypeUpgradePriceConfigAdminQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );
  const [snack, setSnack] = React.useState({
    open: false,
    severity: "",
    message: "",
  });
  const [saveRoomTypeUpgradePriceConfig, saveRoomTypeUpgradePriceConfigRes] =
    useSaveRoomTypeUpgradePriceConfigMutation();

  const {
    data: roomTypeByCompany = {
      data: [],
    },
  } = useGetAllRoomTypesByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const [formData, setFormData] = React.useState({
    startDate: null,
    endDate: null,
    selectedRoomType: null,
    selectedRoomTypeInputVal: "",
    selectedUpgradeRoomType: null,
    selectedUpgradeRoomTypeInputVal: "",
    discountPercentage: "",
  });

  const handleChange = React.useCallback((name, val) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: val,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      startDate: null,
      endDate: null,
      selectedRoomType: null,
      selectedRoomTypeInputVal: "",
      selectedUpgradeRoomType: null,
      selectedUpgradeRoomTypeInputVal: "",
      discountPercentage: "",
    }));
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      saveRoomTypeUpgradePriceConfig({
        roomTypeId: formData.selectedRoomType.id,
        updateTypeId: formData.selectedUpgradeRoomType.id,
        startDate: moment(formData.startDate.$d).format("YYYY-MM-DD"),
        endDate: moment(formData.endDate.$d).format("YYYY-MM-DD"),
        percentageDiscount: formData.discountPercentage,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
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
    [formData, saveRoomTypeUpgradePriceConfig, handleResetForm]
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.startDate &&
        formData.endDate &&
        formData.selectedRoomType &&
        formData.selectedUpgradeRoomType &&
        formData.discountPercentage
    );
  }, [formData]);

  return (
    <Container>
      <Box
        component="form"
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
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2}>
          <Grid size={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disablePast
                value={formData?.startDate}
                maxDate={formData.endDate}
                onChange={(newVal) => handleChange("startDate", newVal)}
                slotProps={{
                  textField: {
                    variant: "standard",
                    size: "small",
                    readOnly: true,
                    label: (
                      <React.Fragment>
                        Start-Date{" "}
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.error.main,
                          }}
                        >
                          *
                        </Box>
                      </React.Fragment>
                    ),
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
                    },
                  },
                }}
                slots={{
                  openPickerIcon: StyledCalendarIcon,
                }}
                format="DD-MM-YYYY"
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                disablePast
                value={formData?.endDate}
                minDate={formData.startDate}
                onChange={(newVal) => handleChange("endDate", newVal)}
                slotProps={{
                  textField: {
                    variant: "standard",
                    size: "small",
                    readOnly: true,
                    label: (
                      <React.Fragment>
                        End-Date{" "}
                        <Box
                          component="span"
                          sx={{
                            color: (theme) => theme.palette.error.main,
                          }}
                        >
                          *
                        </Box>
                      </React.Fragment>
                    ),
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
                    },
                  },
                }}
                slots={{
                  openPickerIcon: StyledCalendarIcon,
                }}
                format="DD-MM-YYYY"
              />
            </LocalizationProvider>
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={roomTypeByCompany.data.filter(
                (roomType) =>
                  roomType.id !== formData.selectedUpgradeRoomType?.id
              )}
              getOptionLabel={(option) => option.type}
              value={formData.selectedRoomType}
              onChange={(e, newVal) => handleChange("selectedRoomType", newVal)}
              inputValue={formData.selectedRoomTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChange("selectedRoomTypeInputVal", newVal)
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
                      Select Room Type{" "}
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
            <Autocomplete
              options={roomTypeByCompany.data.filter(
                (roomType) => roomType.id !== formData.selectedRoomType?.id
              )}
              getOptionLabel={(option) => option.type}
              value={formData.selectedUpgradeRoomType}
              onChange={(e, newVal) =>
                handleChange("selectedUpgradeRoomType", newVal)
              }
              inputValue={formData.selectedUpgradeRoomTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChange("selectedUpgradeRoomTypeInputVal", newVal)
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
                      Upgrade Room Type{" "}
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
            <TextField
              label={
                <React.Fragment>
                  Discount Percentage{" "}
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
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={(e) =>
                handleChange(
                  e.target.name,
                  e.target.value.replace(/\D|^0/g, "")
                )
              }
              variant="standard"
            />
          </Grid>
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
            disabled={!isFormValid()}
            type="submit"
          >
            Add Room Upgrade
          </Button>
        </Box>
        <Paper>
          <Toolbar
            sx={[
              {
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
              },
            ]}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Room Type Upgrade Price Configuration
            </Typography>
          </Toolbar>
        </Paper>
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
                <TableCell>Sl. No.</TableCell>
                <TableCell>Room Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTypeUpgradeConfigurationList.data.map((roomType, index) => {
                return (
                  <Row roomType={roomType} key={roomType.id} index={index} />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <LoadingComponent
        open={saveRoomTypeUpgradePriceConfigRes.isLoading || isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default RoomUpgradeConfiguration;
