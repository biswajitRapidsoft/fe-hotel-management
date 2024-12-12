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
} from "@mui/material";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import { useAddHallMutation, useGetAllHallsQuery } from "../../services/hotel";

const HallList = () => {
  const [formData, setFormData] = React.useState({
    hallName: "",
    capacity: "",
    pricePerHour: "",
    pricePerDay: "",
  });

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [addHall, addHallRes] = useAddHallMutation();
  const {
    data: hallListData = {
      data: [],
    },
    isLoading,
    isFetching,
  } = useGetAllHallsQuery(sessionStorage.getItem("hotelIdForHall"), {
    skip:
      !Boolean(sessionStorage.getItem("hotelIdForHall")) ||
      JSON.parse(sessionStorage.getItem("data"))?.roleType !== "Admin",
  });
  console.log("hallListData", hallListData);
  const handleResetForm = React.useCallback(() => {
    setFormData({
      hallName: "",
      capacity: "",
      pricePerHour: "",
      pricePerDay: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();

      const payload = {
        hotel: {
          id: Boolean(sessionStorage.getItem("hotelIdForHall"))
            ? sessionStorage.getItem("hotelIdForHall")
            : "",
        },
        hallName: formData.hallName,
        capacity: formData.capacity,
        pricePerHour: formData.pricePerHour,
        pricePerDay: formData.pricePerDay,
      };
      addHall(payload)
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
    [formData, addHall, handleResetForm]
  );

  const handleChange = React.useCallback((e) => {
    if (["capacity", "pricePerHour", "pricePerDay"].includes(e.target.name)) {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/\D/g, ""),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  }, []);

  const isFormValid = React.useCallback(() => {
    const { hallName, capacity, pricePerHour, pricePerDay } = formData;
    return Boolean(hallName && capacity && pricePerHour && pricePerDay);
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
                  Hall Name
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
              name="hallName"
              value={formData.hallName}
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
                  Capacity
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
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Price per Hour
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
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Price per day
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
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
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
            Add Hall
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
            Hall List
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
                <TableCell>Hall Name</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Price per hour</TableCell>
                <TableCell>Price per day</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hallListData.data.map((item, index) => {
                return (
                  <TableRow
                    sx={{
                      "& > *": { borderBottom: "unset" },
                      ".MuiTableCell-root": {
                        fontSize: "1rem",
                        letterSpacing: 1,
                      },
                    }}
                  >
                    <TableCell> {index + 1}</TableCell>
                    <TableCell>{item?.hallName}</TableCell>
                    <TableCell>{item?.capacity}</TableCell>
                    <TableCell>{item?.pricePerHour}</TableCell>
                    <TableCell>{item?.pricePerDay}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent
        open={isLoading || isFetching || addHallRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default HallList;
