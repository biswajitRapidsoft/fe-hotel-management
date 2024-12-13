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

import {
  useAddBanquetMutation,
  useGetAllBanquetQuery,
} from "../../services/hotel";
import { ADMIN } from "../../helper/constants";

const BanquetList = () => {
  const [formData, setFormData] = React.useState({
    banquetType: "",
    perPlatePrice: "",
  });
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [addBanquet, addBanquetRes] = useAddBanquetMutation();

  const {
    data: banquetListData = {
      data: [],
    },
    isLoading,
    isFetching,
  } = useGetAllBanquetQuery(sessionStorage.getItem("hotelIdForBanquet"), {
    skip:
      !Boolean(sessionStorage.getItem("hotelIdForBanquet")) ||
      JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN,
  });

  const handleResetForm = React.useCallback(() => {
    setFormData({
      banquetType: "",
      perPlatePrice: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();

      const payload = {
        hotel: {
          id: Boolean(sessionStorage.getItem("hotelIdForBanquet"))
            ? sessionStorage.getItem("hotelIdForBanquet")
            : "",
        },
        perPlatePrice: formData.perPlatePrice,
        type: formData.banquetType,
      };
      addBanquet(payload)
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
    [formData, handleResetForm, addBanquet]
  );

  const handleChange = React.useCallback((e) => {
    if (["perPlatePrice"].includes(e.target.name)) {
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
    const { banquetType, perPlatePrice } = formData;
    return Boolean(banquetType && perPlatePrice);
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
                  Banquet Type
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
              name="banquetType"
              value={formData.banquetType}
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
                  Per plate price
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
              name="perPlatePrice"
              value={formData.perPlatePrice}
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
            Add Banquet
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
            Banquet List
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
                <TableCell> Banquet Type</TableCell>
                <TableCell>Price per plate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banquetListData.data.map((item, index) => {
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
                    <TableCell>{item?.type}</TableCell>
                    <TableCell>{item?.perPlatePrice}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <LoadingComponent
        open={isLoading || isFetching || addBanquetRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default BanquetList;
