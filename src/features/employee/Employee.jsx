import {
  Autocomplete,
  Box,
  Button,
  Container,
  Grid2 as Grid,
  Paper,
  TextField,
} from "@mui/material";
import React from "react";
import EmployeeListTable from "./EmployeeListTable";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";

import { useGetAllRolesQuery, useSaveUserMutation } from "../../services/users";
import { useGetHotelListByCompanyQuery } from "../../services/hotel";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { ADMIN } from "../../helper/constants";

const Employee = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [saveUser, saveUserRes] = useSaveUserMutation();
  const {
    data: roleList = {
      data: [],
    },
  } = useGetAllRolesQuery(
    {},
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  console.log("roleList", roleList?.data);
  const {
    data: hotelList = {
      data: [],
    },
  } = useGetHotelListByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    selectedRole: null,
    selectedRoleInputVal: "",
    selectedHotel: null,
    selectedHotelInputVal: "",
    phoneNo: "",
  });

  // const handleChange = React.useCallback((e) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [e.target.name]:
  //       e.target.name === "email"
  //         ? e.target.value.toLowerCase()
  //         : e.target.value,
  //   }));
  // }, []);
  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;

    if (name === "phoneNo") {
      const numericRegex = /^[0-9]*$/;
      if (!numericRegex.test(value)) {
        return;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      name: "",
      email: "",
      selectedRole: null,
      selectedRoleInputVal: "",
      selectedHotel: null,
      selectedHotelInputVal: "",
      phoneNo: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      saveUser({
        userName: formData.name,
        role: formData.selectedRole,
        email: formData.email,
        hotelId: formData.selectedHotel.id,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
        phoneNo: formData.phoneNo,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            severity: "success",
            message: res.message,
          });
          handleResetForm();
        })
        .catch((err) => {
          setSnack({
            open: true,
            severity: "error",
            message: err.data?.message || err.data,
          });
        });
    },
    [formData, handleResetForm, saveUser]
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.name.trim() &&
        formData.email.trim() &&
        formData.phoneNo.trim() &&
        formData.selectedRole &&
        formData.selectedHotel
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
                  Name{" "}
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Email{" "}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Phone No{" "}
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
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              inputProps={{
                maxLength: 10,
              }}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={roleList.data}
              // options={roleList.data.filter((item) => item !== "Customer")}
              value={formData.selectedRole}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedRole", value: newVal },
                })
              }
              inputValue={formData.selectedRoleInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedRoleInputVal",
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
                      Select Role{" "}
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
              options={hotelList.data}
              value={formData.selectedHotel}
              getOptionLabel={(option) => `${option.name} (${option.address})`}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedHotel", value: newVal },
                })
              }
              inputValue={formData.selectedHotelInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedHotelInputVal",
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
                      Select Hotel{" "}
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
            Add User
          </Button>
        </Box>
      </Box>
      <EmployeeListTable roleList={roleList.data} hotelList={hotelList.data} />
      <LoadingComponent open={saveUserRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default Employee;
