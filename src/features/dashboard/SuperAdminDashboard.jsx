import React from "react";
import {
  Box,
  Button,
  Container,
  Grid2 as Grid,
  Link,
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useNavigate, Link as RouterLink } from "react-router-dom";

import SnackAlert from "../../components/Alert";

import {
  useSaveCompanyMutation,
  useGetAllCompanyQuery,
} from "../../services/dashboard";

import LoadingComponent from "../../components/LoadingComponent";
import moment from "moment";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const {
    data: companyList = {
      data: [],
    },
    isLoading,
  } = useGetAllCompanyQuery();
  const [companyName, setCompanyName] = React.useState("");
  const [checkInTime, setCheckInTime] = React.useState(null);
  const [checkOutTime, setCheckOutTime] = React.useState(null);
  const [saveCompany, saveCompanyRes] = useSaveCompanyMutation();

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      saveCompany({
        name: companyName,
        checkInTime: moment(checkInTime.$d).format("hh:mm A"),
        checkOutTime: moment(checkOutTime.$d).format("hh:mm A"),
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setCompanyName("");
          setCheckInTime(null);
          setCheckOutTime(null);
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [companyName, saveCompany, checkInTime, checkOutTime]
  );

  const handleChangeCompanyStatus = React.useCallback(
    (e, company) => {
      saveCompany({
        ...company,
        isActive: e.target.checked,
      })
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
    [saveCompany]
  );

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
                    Company Name{" "}
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
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                variant="standard"
              />
            </Grid>
            <Grid size={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Check-In Time"
                  slotProps={{
                    textField: { variant: "standard", readOnly: true },
                  }}
                  value={checkInTime}
                  onChange={(newVal) => setCheckInTime(newVal)}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Check-Out Time"
                  slotProps={{
                    textField: { variant: "standard", readOnly: true },
                  }}
                  value={checkOutTime}
                  onChange={(newVal) => setCheckOutTime(newVal)}
                />
              </LocalizationProvider>
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
              disabled={
                !Boolean(companyName.trim() && checkInTime && checkOutTime)
              }
            >
              Add Company
            </Button>
          </Box>
        </Box>
        {/* company List table  */}
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
              }}
            >
              Company List
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
                  <TableCell>Check-In / Check-Out</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companyList.data.map((company, index) => {
                  return (
                    <TableRow
                      sx={{
                        "& > *": { borderBottom: "unset" },
                        ".MuiTableCell-root": {
                          fontSize: "1rem",
                          letterSpacing: 1,
                        },
                      }}
                      key={company.id}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={`/employee-list/${company.id}`}
                        >
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Grid container>
                          <Grid size={12}>
                            <Grid container>
                              <Grid size={4}>
                                <Typography sx={{ fontWeight: "bold" }}>
                                  Check-In:{" "}
                                </Typography>
                              </Grid>
                              <Grid size={8}>
                                <Typography>{company.checkInTime}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid size={12}>
                            <Grid container>
                              <Grid size={4}>
                                <Typography sx={{ fontWeight: "bold" }}>
                                  Check-Out:{" "}
                                </Typography>
                              </Grid>
                              <Grid size={8}>
                                <Typography>{company.checkOutTime}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={company.isActive}
                          onChange={(e) =>
                            handleChangeCompanyStatus(e, company)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
      <LoadingComponent open={saveCompanyRes.isLoading || isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export default SuperAdminDashboard;
