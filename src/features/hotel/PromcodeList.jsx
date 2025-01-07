import React from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Grid2 as Grid,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { StyledCalendarIcon } from "../dashboard/Dashboard";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import {
  // useGetAllPromoCodeQuery,
  useCreatePromoCodeMutation,
  useGetAllPromocodeTypesQuery,
  useGetAllPromoCodeListForAdminQuery,
} from "../../services/hotel";
import { ADMIN } from "../../helper/constants";

const PromcodeList = () => {
  const [formData, setFormData] = React.useState({
    codeName: "",
    fromDate: null,
    toDate: null,
    discountPercentage: "",
    maxDiscountAmount: "",
    minOrderValue: "",
    // promoCodeType: "",
    promoCodeType: null,
    promoCodeTypeInputVal: "",
  });

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [createPromocode, createPromocodeRes] = useCreatePromoCodeMutation();

  const {
    data: promoCodeListData = {
      data: [],
    },
    isLoading: isPromoCodeListDataLoading,
  } = useGetAllPromoCodeListForAdminQuery(
    sessionStorage.getItem("hotelIdForPromoCode"),
    {
      skip:
        !Boolean(sessionStorage.getItem("hotelIdForPromoCode")) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN,
    }
  );

  const {
    data: promoCodeTypeList = {
      data: [],
    },
  } = useGetAllPromocodeTypesQuery();
  console.log("promoCodeTypeList", promoCodeTypeList?.data);
  const handleResetForm = React.useCallback(() => {
    setFormData({
      codeName: "",
      fromDate: null,
      toDate: null,
      discountPercentage: "",
      maxDiscountAmount: "",
      minOrderValue: "",
      promoCodeType: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      const payload = {
        hotel: {
          id: Boolean(sessionStorage.getItem("hotelIdForPromoCode"))
            ? sessionStorage.getItem("hotelIdForPromoCode")
            : "",
        },
        codeName: formData.codeName,
        fromDate: formData.fromDate
          ? dayjs(formData.fromDate).format("DD-MM-YYYY")
          : null,
        toDate: formData.toDate
          ? dayjs(formData.toDate).format("DD-MM-YYYY")
          : null,
        discountPercentage: formData.discountPercentage,
        maxDiscountAmount: formData.maxDiscountAmount,
        minOrderValue: formData.minOrderValue,
        promocodeType: formData.promoCodeType,
      };
      createPromocode(payload)
        .unwrap()
        .then((res) => {
          setSnack({ open: true, message: res.message, severity: "success" });
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
    [formData, handleResetForm, createPromocode]
  );

  // const handleChange = React.useCallback((e) => {
  //   if (
  //     ["discountPercentage", "maxDiscountAmount", "minOrderValue"].includes(
  //       e.target.name
  //     )
  //   ) {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [e.target.name]: e.target.value.replace(/\D/g, ""),
  //     }));
  //     // } else if (name === "codeName") {
  //   } else if (["codeName"].includes(e.target.name)) {
  //     setFormData((prevData) => ({
  //       [e.target.name]: e.target.value.toUpperCase(),
  //     }));
  //   } else {
  //     setFormData((prevData) => ({
  //       ...prevData,
  //       [e.target.name]: e.target.value,
  //     }));
  //   }
  // }, []);

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      if (
        ["discountPercentage", "maxDiscountAmount", "minOrderValue"].includes(
          name
        )
      ) {
        return {
          ...prevData,
          [name]: value.replace(/\D/g, ""),
        };
      } else if (name === "codeName") {
        return {
          ...prevData,
          [name]: value.toUpperCase(),
        };
      } else {
        return {
          ...prevData,
          [name]: value,
        };
      }
    });
  }, []);

  const handleDateChange = (field) => (date) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
  };
  const isFormValid = React.useCallback(() => {
    const {
      codeName,
      fromDate,
      toDate,
      discountPercentage,
      maxDiscountAmount,
      minOrderValue,
      promoCodeType,
    } = formData;
    return Boolean(
      codeName &&
        fromDate &&
        toDate &&
        discountPercentage &&
        discountPercentage &&
        maxDiscountAmount &&
        minOrderValue &&
        promoCodeType
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
            <TextField
              label={
                <React.Fragment>
                  Code Name
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
              name="codeName"
              value={formData.codeName}
              onChange={handleChange}
              variant="standard"
              inputProps={{
                maxLength: 45,
              }}
            />
          </Grid>
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

          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Discount Percentage
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
              onChange={handleChange}
              variant="standard"
              inputProps={{
                maxLength: 45,
              }}
            />
          </Grid>

          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Max Discount Amount
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
              name="maxDiscountAmount"
              value={formData.maxDiscountAmount}
              onChange={handleChange}
              variant="standard"
              inputProps={{
                maxLength: 45,
              }}
            />
          </Grid>

          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Minimum Order Value
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
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleChange}
              variant="standard"
              inputProps={{
                maxLength: 45,
              }}
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={promoCodeTypeList?.data}
              getOptionLabel={(option) => option}
              value={formData.promoCodeType || null}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "promoCodeType", value: newVal },
                })
              }
              inputValue={formData.promoCodeTypeInputVal || ""}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "promoCodeTypeInputVal",
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
                      Select PromoCode Type
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
            Add PromoCode
          </Button>
        </Box>
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
            PromoCode List
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
                <TableCell>Sl No.</TableCell>
                <TableCell> Code Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Discount Percentage</TableCell>
                <TableCell>Maximum Discount</TableCell>
                <TableCell>Minimum Order Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promoCodeListData.data.map((item, index) => {
                return (
                  <TableRow
                    key={index}
                    sx={{
                      "& > *": { borderBottom: "unset" },
                      ".MuiTableCell-root": {
                        fontSize: "1rem",
                        letterSpacing: 1,
                      },
                    }}
                  >
                    <TableCell> {index + 1}</TableCell>
                    <TableCell>{item?.codeName}</TableCell>
                    <TableCell>{item.promocodeType}</TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      {item?.fromDate}
                    </TableCell>
                    <TableCell sx={{ width: "15%" }}>{item?.toDate}</TableCell>
                    <TableCell>{item?.discountPercentage}</TableCell>
                    <TableCell>{item?.maxDiscountAmount}</TableCell>
                    <TableCell>{item?.minOrderValue}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* isPromoCodeListDataLoading */}

      <LoadingComponent
        open={
          isPromoCodeListDataLoading || createPromocodeRes.isLoading || false
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default PromcodeList;
