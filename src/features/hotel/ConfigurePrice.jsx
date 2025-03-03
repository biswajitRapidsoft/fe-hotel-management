import React from "react";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import ClearIcon from "@mui/icons-material/Clear";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import dayjs from "dayjs";
import InfoIcon from "@mui/icons-material/Info";
import { BootstrapDialog } from "../header/Header";
// import ReactDOM from "react-dom";

import {
  Grid2 as Grid,
  Container,
  Box,
  Typography,
  Toolbar,
  Paper,
  TextField,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  Button,
  TableHead,
  TableBody,
  Switch,
  IconButton,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  useGetAllConfiguredPricesQuery,
  useUpdateConfiguredPricesMutation,
  useGetAllConfiguredPricesTableDataQuery,
  useUpdateConfigurationStatusMutation,
} from "../../services/hotel";
import moment from "moment";

const tableHeader = [
  { label: "Sl." },
  { label: "Configuration Start Date" },
  { label: "Configuration End Date" },
  // { label: "Configured Price" },
  { label: "Action" },
];
const ConfigurePrice = () => {
  const [formData, setFormData] = React.useState({
    fromDate: null,
    toDate: null,
  });
  const [configureDetailsDialog, setConfigureDetailsDialog] =
    React.useState(null);

  const [configuredPriceListData, setConfiguredPriceListData] = React.useState(
    []
  );

  const handleCloseDialog = React.useCallback(() => {
    setConfigureDetailsDialog(null);
  }, []);

  // console.log("configuredPriceListData", configuredPriceListData);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [configurePriceApi, configurePriceApiRes] =
    useUpdateConfiguredPricesMutation();

  const [updateConfigStatus, updateConfigStatusRes] =
    useUpdateConfigurationStatusMutation();

  const handleDateChange = (field) => (date) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };

  const handleResetForm = React.useCallback(() => {
    setFormData({
      fromDate: null,
      toDate: null,
    });
  }, []);

  const {
    data: configuredPriceList = {
      data: [],
    },
    isLoading: isConfiguredPriceListLoading,
    isSuccess: isConfiguredPriceListSuccess,
  } = useGetAllConfiguredPricesQuery(
    {
      companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
      fromDate: formData.fromDate
        ? dayjs(formData.fromDate).format("YYYY-MM-DD")
        : null,
      toDate: formData.toDate
        ? dayjs(formData.toDate).format("YYYY-MM-DD")
        : null,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data")).companyId) ||
        !Boolean(formData.fromDate) ||
        !Boolean(formData.toDate),
    }
  );

  React.useEffect(() => {
    if (isConfiguredPriceListSuccess && configuredPriceList?.data) {
      setConfiguredPriceListData(configuredPriceList?.data);
    }
  }, [isConfiguredPriceListSuccess, configuredPriceList?.data]);

  const {
    data: ConfiguredPricesTableData = {
      data: [],
    },
  } = useGetAllConfiguredPricesTableDataQuery({
    companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
  });

  console.log("ConfiguredPricesTableData", ConfiguredPricesTableData);

  const handlePriceChange = (index, value) => {
    const sanitizedValue = value.replace(/^0+|\D/g, "");

    const updatedData = configuredPriceListData.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, isModifiedPrice: true };

        if (!updatedItem.priceConfigurationDataDto) {
          updatedItem.priceConfigurationDataDto = {
            hotelId:
              updatedItem.hotelId ||
              JSON.parse(sessionStorage.getItem("data")).companyId,
            masterRoomTypeId: updatedItem.id,
            price: sanitizedValue,
            startDate: null,
            endDate: null,
          };
        } else {
          updatedItem.priceConfigurationDataDto = {
            ...updatedItem.priceConfigurationDataDto,
            price: sanitizedValue,
          };
        }

        return updatedItem;
      }

      return item;
    });

    setConfiguredPriceListData(updatedData);
  };
  const handleChangeConfigurationStatus = React.useCallback(
    (item) => {
      updateConfigStatus({
        id: item.priceConfigurationId,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleCloseDialog();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [updateConfigStatus]
  );
  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();

      const payload = configuredPriceListData
        .filter((item) => item.isModifiedPrice)
        .map((item) => {
          const companyId = JSON.parse(
            sessionStorage.getItem("data")
          ).companyId;
          const startDate = formData.fromDate
            ? dayjs(formData.fromDate).format("YYYY-MM-DD")
            : null;
          const endDate = formData.toDate
            ? dayjs(formData.toDate).format("YYYY-MM-DD")
            : null;

          return {
            id: item.id || null,
            companyId: companyId,
            startDate: startDate,
            endDate: endDate,
            price: parseFloat(item.priceConfigurationDataDto.price),
            typeConfigurationPriceId: item.typeConfigurationPriceId || null,
          };
        });

      if (payload.length === 0) {
        setSnack({
          open: true,
          message: "No price changes detected to update",
          severity: "warning",
        });
        return;
      }

      configurePriceApi(payload)
        .unwrap()
        .then((res) => {
          setSnack({ open: true, message: res.message, severity: "success" });
          handleResetForm();
          setConfiguredPriceListData([]);
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [formData, handleResetForm, configurePriceApi, configuredPriceListData]
  );

  return (
    <>
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
                  value={formData?.fromDate}
                  maxDate={formData.toDate}
                  onChange={handleDateChange("fromDate")}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      size: "small",
                      readOnly: true,
                      label: "From-Date",
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
                  value={formData?.toDate}
                  minDate={formData?.fromDate}
                  onChange={handleDateChange("toDate")}
                  slotProps={{
                    textField: {
                      variant: "standard",
                      size: "small",
                      readOnly: true,
                      label: "To-Date",
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
          </Grid>

          {/* separation */}
          <Box sx={{ mt: 2 }}>
            <Toolbar
              sx={[
                {
                  pl: { sm: 2 },
                  pr: { xs: 1, sm: 1 },
                },
              ]}
            >
              {Boolean(configuredPriceListData.length > 0) && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: 1,
                    color: "primary.main",
                  }}
                >
                  Configured Room Prices
                </Typography>
              )}
            </Toolbar>
            <ConfigurePriceCard
              // configuredPriceList={configuredPriceList?.data}
              configuredPriceListData={configuredPriceListData}
              handlePriceChange={handlePriceChange}
            />
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
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
              type="submit"
            >
              Update Price
            </Button>
          </Box>

          <ConfigurePriceTable
            ConfiguredPricesTableData={ConfiguredPricesTableData?.data}
            setConfigureDetailsDialog={setConfigureDetailsDialog}
            handleChangeConfigurationStatus={handleChangeConfigurationStatus}
          />
        </Box>
      </Container>

      <LoadingComponent
        open={
          isConfiguredPriceListLoading ||
          configurePriceApiRes.isLoading ||
          updateConfigStatusRes.isLoading ||
          false
        }
      />
      <ViewConfigurationDetailsDialog
        configureDetailsDialog={configureDetailsDialog}
        handleClose={handleCloseDialog}
        handleChangeConfigurationStatus={handleChangeConfigurationStatus}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const ConfigurePriceCard = React.memo(function ({
  configuredPriceListData,
  handlePriceChange,
}) {
  return (
    <>
      <Box>
        <Grid container spacing={2}>
          {configuredPriceListData?.map((item, index) => {
            return (
              <Grid size={3.5}>
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    boxShadow: " rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    borderRadius: "0.4rem",
                    height: "170px",
                  }}
                >
                  <Box sx={{ p: 2, gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.3rem",
                          color: "primary.main",
                        }}
                      >
                        {item.type}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        Price:
                      </Typography>
                      <Typography>₹ {item.basePrice}</Typography>
                    </Box>
                    {/* <Box sx={{ display: "flex", gap: 1 }}> */}
                    <Typography sx={{ fontWeight: "bold" }}>
                      Configured Price:
                    </Typography>

                    <TextField
                      name={`price-${item.id}`}
                      variant="standard"
                      type="number"
                      value={item?.priceConfigurationDataDto?.price || ""}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      InputProps={{
                        startAdornment: "₹ ",
                        // maxLength: 4,
                      }}
                    />
                    {/* </Box> */}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
});

const ConfigurePriceTable = React.memo(function ({
  ConfiguredPricesTableData,
  setConfigureDetailsDialog,
  handleChangeConfigurationStatus,
}) {
  // console.log(
  //   "ConfiguredPricesTableDataConfiguredPricesTableData",
  //   ConfiguredPricesTableData
  // );
  return (
    <>
      <Paper sx={{ mt: 2 }}>
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
            Configured Dates
          </Typography>
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
                {/* <TableCell /> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {ConfiguredPricesTableData.map((item, index) => {
                return (
                  <Row
                    item={item}
                    key={item?.id}
                    sequence={index + 1}
                    setConfigureDetailsDialog={setConfigureDetailsDialog}
                    handleChangeConfigurationStatus={
                      handleChangeConfigurationStatus
                    }
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
});

function Row({
  item,
  sequence,
  setConfigureDetailsDialog,
  handleChangeConfigurationStatus,
}) {
  // console.log("item", item);
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
            {moment(item.startDate).format("DD/MM/YYYY hh:mma")}
          </Box>
        </TableCell>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: 230,
            }}
          >
            {moment(item.endDate).format("DD/MM/YYYY hh:mma")}
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex" }}>
            <IconButton
              sx={{ display: "block" }}
              size="small"
              onClick={() => setConfigureDetailsDialog(item)}
            >
              <InfoIcon />
            </IconButton>
          </Box>
        </TableCell>
        {/* <TableCell></TableCell> */}
      </TableRow>
    </React.Fragment>
  );
}

const ViewConfigurationDetailsDialog = React.memo(function ({
  // configureDetailsDialog,
  handleClose,
  configureDetailsDialog,
  handleChangeConfigurationStatus,
}) {
  console.log("configureDetailsDialog...", configureDetailsDialog);
  return (
    <React.Fragment>
      <BootstrapDialog
        open={Boolean(configureDetailsDialog)}
        onClose={handleClose}
        aria-labelledby="password-change-dialog-title"
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
          Configuration Details
        </DialogTitle>{" "}
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
        <DialogContent>
          <Paper>
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
                    <TableCell>Sl. No.</TableCell>
                    <TableCell>Room-Type</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell>Configured Price</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configureDetailsDialog?.roomTypeDtoList.map(
                    (item, index) => {
                      return (
                        <TableRow key={item?.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item?.type}</TableCell>
                          <TableCell>{item?.basePrice}</TableCell>
                          <TableCell>{item?.configurationPrice}</TableCell>
                          <TableCell>
                            <Switch
                              checked={item?.isActive}
                              color="success"
                              onChange={(e) =>
                                handleChangeConfigurationStatus(item)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
});
export default ConfigurePrice;
