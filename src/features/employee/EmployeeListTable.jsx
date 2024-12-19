import React from "react";

import {
  Box,
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
  Autocomplete,
  TextField,
} from "@mui/material";

import { useGetAllUsersByCompanyQuery } from "../../services/users";
import LoadingComponent from "../../components/LoadingComponent";
import { ADMIN } from "../../helper/constants";

const EmployeeListTable = ({ roleList, hotelList }) => {
  const [filterData, setFilterData] = React.useState({
    selectedRole: null,
    selectedRoleInputVal: "",
    selectedHotel: null,
    selectedHotelInputVal: "",
    searchKey: "",
  });
  const {
    data: employeeList = {
      data: [],
    },
    isLoading,
  } = useGetAllUsersByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const handleChange = React.useCallback((name, value) => {
    setFilterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const filterdEmployeeList = React.useMemo(
    () =>
      employeeList.data.filter(
        (employee) =>
          (filterData.selectedRole === null ||
            employee.role === filterData.selectedRole) &&
          (filterData.selectedHotel === null ||
            employee.hotelDto?.name === filterData.selectedHotel.name) &&
          (filterData.searchKey === "" ||
            new RegExp(filterData.searchKey, "i").test(employee.name) ||
            new RegExp(filterData.searchKey, "i").test(employee.phoneNumber) ||
            new RegExp(filterData.searchKey, "i").test(employee.email))
      ),
    [filterData, employeeList.data]
  );
  console.log(filterData, "filterData");

  return (
    <React.Fragment>
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
          <Box
            sx={{
              // backgroundColor: "red",
              flexGrow: 1,
              alignItems: "center",
              width: {
                xs: "100%",
                md: "auto",
              },
              ".MuiTextField-root": {
                backgroundColor: "transparent",
                ".MuiInputBase-root": {
                  // color: "#B4B4B4",
                },
              },
              ".MuiFormLabel-root": {
                color: (theme) => theme.palette.primary.main,
                // fontWeight: 600,
                // fontSize: 18,
              },
              ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
            }}
          >
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 3 }} />
              <Grid size={{ xs: 4, md: 3 }}>
                <Autocomplete
                  disablePortal
                  size="small"
                  options={roleList}
                  value={filterData.selectedRole}
                  onChange={(e, newVal) => handleChange("selectedRole", newVal)}
                  inputValue={filterData.selectedRoleInputVal}
                  onInputChange={(e, newVal) =>
                    handleChange("selectedRoleInputVal", newVal)
                  }
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
                  renderInput={(params) => (
                    <TextField {...params} label="Select Role" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <Autocomplete
                  disablePortal
                  size="small"
                  options={hotelList}
                  getOptionLabel={(option) => option.name}
                  value={filterData.selectedHotel}
                  onChange={(e, newVal) =>
                    handleChange("selectedHotel", newVal)
                  }
                  inputValue={filterData.selectedHotelInputVal}
                  onInputChange={(e, newVal) =>
                    handleChange("selectedHotelInputVal", newVal)
                  }
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
                  renderInput={(params) => (
                    <TextField {...params} label="Select Hotel" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 4, md: 3 }}>
                <TextField
                  size="small"
                  name="searchKey"
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
                  label="Search"
                  fullWidth
                />
              </Grid>
            </Grid>
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
                <TableCell>Sl No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone No.</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Hotel</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterdEmployeeList.map((employee, index) => {
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
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography>{employee.hotelDto?.name}</Typography>
                        <Typography variant="body2">
                          {employee.hotelDto?.address}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={isLoading} />
    </React.Fragment>
  );
};

export default EmployeeListTable;
