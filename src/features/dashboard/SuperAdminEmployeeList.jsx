import React from "react";
import {
  Box,
  Button,
  Container,
  Grid2 as Grid,
  IconButton,
  Paper,
  Switch,
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
import EditIcon from "@mui/icons-material/Edit";
import { useParams } from "react-router-dom";

import {
  useSaveUserMutation,
  useGetAllUsersByCompanyQuery,
} from "../../services/users";

import { ADMIN, SUPER_ADMIN } from "../../helper/constants";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const SuperAdminEmployeeList = () => {
  const { companyId } = useParams();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    data: employeeList = {
      data: [],
    },
    isLoading,
  } = useGetAllUsersByCompanyQuery(companyId, {
    skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== SUPER_ADMIN,
  });

  const [employeeToUpdate, setEmployeeToUpdate] = React.useState(null);

  const [saveUser, saveUserRes] = useSaveUserMutation();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phoneNo: "",
  });

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phoneNo: "",
    });
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.name.trim() && formData.email.trim() && formData.phoneNo.trim()
    );
  }, [formData]);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();

      saveUser({
        id: employeeToUpdate ? employeeToUpdate.id : null,
        userName: formData.name,
        role: SUPER_ADMIN,
        email: formData.email,
        hotelId: null,
        companyId: companyId,
        phoneNo: formData.phoneNo,
        isActive: employeeToUpdate ? employeeToUpdate.isActive : true,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            severity: "success",
            message: res.message,
          });
          handleResetForm();
          setEmployeeToUpdate(null);
        })
        .catch((err) => {
          setSnack({
            open: true,
            severity: "error",
            message: err.data?.message || err.data,
          });
        });
    },
    [saveUser, formData, companyId, employeeToUpdate, handleResetForm]
  );

  const handleUpdateEmployeeStatus = React.useCallback(
    (e, employee) => {
      saveUser({
        id: employee.id,
        userName: employee.name,
        role: ADMIN,
        email: employee.email,
        companyId: companyId,
        phoneNo: employee.phoneNo,
        isActive: e.target.checked,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            severity: "success",
            message: res.message,
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            severity: "error",
            message: err.data?.message || err.data,
          });
        });
    },
    [saveUser, companyId]
  );

  React.useEffect(() => {
    if (employeeToUpdate) {
      setFormData((prevData) => ({
        ...prevData,
        name: employeeToUpdate.name || "",
        email: employeeToUpdate.email || "",
        phoneNo: employeeToUpdate.phoneNumber || "",
      }));
    }
  }, [employeeToUpdate]);

  return (
    <React.Fragment>
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
              {Boolean(employeeToUpdate) ? "Update User" : "Add User"}
            </Button>
          </Box>
        </Box>
        {/* employees table list  */}
        <Paper>
          <Toolbar
            sx={[
              {
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                gap: { xs: 1 },
                flexDirection: { xs: "column", md: "row" },
              },
            ]}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                letterSpacing: 1,
                width: {
                  xs: "100%",
                  md: "auto",
                },
              }}
            >
              Users List
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone No.</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeList.data
                  .filter((item) => item.role === ADMIN)
                  .map((employee, index) => {
                    return (
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          ".MuiTableCell-root": {
                            fontSize: "1rem",
                            letterSpacing: 1,
                          },
                        }}
                        key={employee.id}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phoneNumber}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography>{employee.hotelDto?.name}</Typography>
                            <Typography variant="body2">
                              {employee.hotelDto?.address}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              onClick={() => setEmployeeToUpdate(employee)}
                            >
                              <EditIcon />
                            </IconButton>
                            <Switch
                              checked={employee.isActive}
                              onChange={(e) =>
                                handleUpdateEmployeeStatus(e, employee)
                              }
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
      <LoadingComponent open={isLoading || saveUserRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export default SuperAdminEmployeeList;
