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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import {
  useGetAllExtraItemsQuery,
  useAddExtraItemMutation,
} from "../../services/extraItem";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { ADMIN } from "../../helper/constants";

const ExtraItem = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [addExtraItem, addExtraItemRes] = useAddExtraItemMutation();
  const [formData, setFormData] = React.useState({
    extraItemName: "",
    price: "",
    isReusable: false,
  });
  const {
    data: extraItemList = {
      data: [],
    },
    isLoading,
  } = useGetAllExtraItemsQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(formData.extraItemName.trim() && formData.price);
  }, [formData]);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      extraItemName: "",
      price: "",
      isReusable: false,
    });
  }, []);

  const handleChange = React.useCallback((e) => {
    if (e.target.type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.checked,
      }));
    } else if (e.target.name === "price") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/\D/g, ""),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        // [e.target.name]: e.target.value.trim(),
        [e.target.name]: e.target.value,
      }));
    }
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();

      if (JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN) {
        setSnack({
          open: true,
          severity: "warning",
          message: "User Not Allowed",
        });
        return;
      }
      addExtraItem({
        name: formData.extraItemName,
        // price: formData.price,
        price: Number(formData.price),
        company: {
          id: JSON.parse(sessionStorage.getItem("data")).companyId,
        },
        isReusable: formData.isReusable,
      })
        .unwrap()
        .then((res) => {
          handleResetForm();
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
    [addExtraItem, formData, handleResetForm]
  );

  const handleChangeReUsable = React.useCallback(
    (e, extraItem) => {
      addExtraItem({
        id: extraItem.id,
        name: extraItem.name,
        company: {
          id: JSON.parse(sessionStorage.getItem("data")).companyId,
        },
        isReusable: e.target.checked,
      });
    },
    [addExtraItem]
  );

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
                  Inventory Item Name{" "}
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
              name="extraItemName"
              value={formData.extraItemName}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Price
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
              name="price"
              value={formData.price}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={6}>
            <FormGroup sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isReusable}
                    name="isReusable"
                    onChange={handleChange}
                  />
                }
                label="Is Reusable"
              />
            </FormGroup>
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
            disabled={!Boolean(isFormValid())}
          >
            Add Inventory Item
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
            Inventory List
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
                <TableCell>Inventory Item Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Is Reusable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {extraItemList.data.map((item, index) => {
                return (
                  <TableRow
                    sx={{
                      "& > *": { borderBottom: "unset" },
                      ".MuiTableCell-root": {
                        fontSize: "1rem",
                        letterSpacing: 1,
                      },
                    }}
                    key={item.id}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={item.isReusable}
                        onChange={(e) => handleChangeReUsable(e, item)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={isLoading || addExtraItemRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default ExtraItem;
