import React, { useMemo } from "react";

import {
  Box,
  Button,
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
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

import {
  useGetLaundryItemByHotelIdQuery,
  useSaveLaundryItemMutation,
} from "../../services/hotel";
import LoadingComponent from "../../components/LoadingComponent";

import SnackAlert from "../../components/Alert";

const LaundryItemList = () => {
  const {
    data: laundryList = {
      data: [],
    },
    isLoading,
  } = useGetLaundryItemByHotelIdQuery({
    hotelId: sessionStorage.getItem("hotelIdForLaundryItem"),
  });

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const initialFormData = useMemo(
    () => ({
      id: null,
      laundryItem: "",
      laundryPrice: "",
    }),
    []
  );
  const [formData, setFormData] = React.useState(initialFormData);
  const [laundryItemToUpdate, setLaundryItemToUpdate] = React.useState(null);

  React.useEffect(() => {
    if (Boolean(laundryItemToUpdate)) {
      setFormData({
        ...initialFormData,
        laundryItem: laundryItemToUpdate?.name,
        laundryPrice: laundryItemToUpdate?.price,
      });
    } else if (!Boolean(laundryItemToUpdate)) {
      setFormData(initialFormData);
    }
  }, [laundryItemToUpdate, initialFormData]);

  const [saveLaundryItem, saveLaundryItemRes] = useSaveLaundryItemMutation();

  const isFormValid = React.useCallback(() => {
    return (
      formData.laundryItem.trim() !== "" &&
      formData.laundryPrice &&
      Number(formData.laundryPrice) > 0
    );
  }, [formData]);
  const handleResetForm = React.useCallback(() => {
    setFormData(initialFormData);
    setLaundryItemToUpdate(null);
  }, [initialFormData]);

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "laundryPrice" ? value.replace(/\D/g, "") : value, // Ensure only numbers
    }));
  }, []);

  const handleChangeStatus = React.useCallback(
    (e, item) => {
      const payload = {
        ...item,
        isActive: e.target.checked,
        company: {
          id: JSON.parse(sessionStorage.getItem("data")).companyId,
        },
        hotel: {
          id: JSON.parse(sessionStorage.getItem("hotelIdForLaundryItem")),
        },
      };
      saveLaundryItem(payload)
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
    [saveLaundryItem]
  );

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      let payload = null;

      if (laundryItemToUpdate) {
        payload = {
          ...laundryItemToUpdate,
          name: formData?.laundryItem || "",
          price: formData?.laundryPrice ? Number(formData?.laundryPrice) : 0,
          company: {
            id: JSON.parse(sessionStorage.getItem("data")).companyId,
          },
          hotel: {
            id: JSON.parse(sessionStorage.getItem("hotelIdForLaundryItem")),
          },
        };
      } else if (!laundryItemToUpdate) {
        payload = {
          name: formData?.laundryItem || "",
          price: formData?.laundryPrice ? Number(formData?.laundryPrice) : 0,
          company: {
            id: JSON.parse(sessionStorage.getItem("data")).companyId,
          },
          hotel: {
            id: JSON.parse(sessionStorage.getItem("hotelIdForLaundryItem")),
          },
        };
      }
      saveLaundryItem(payload)
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
    [saveLaundryItem, formData, handleResetForm, laundryItemToUpdate]
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
                  Laundry Item
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
              name="laundryItem"
              value={formData.laundryItem}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Laundry Price
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
              name="laundryPrice"
              value={formData.laundryPrice}
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
            disabled={!Boolean(isFormValid())}
          >
            {Boolean(laundryItemToUpdate)
              ? "Update Laundry Item"
              : "Add Laundry Item"}
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
            Laundry Item List
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
                <TableCell>Laundry Item</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {laundryList.data.map((item, index) => {
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
                    <TableCell>{item?.name}</TableCell>
                    <TableCell>{item?.price}</TableCell>
                    <TableCell>
                      <Switch
                        color="success"
                        checked={item?.isActive}
                        onChange={(e) => handleChangeStatus(e, item)}
                      />
                      <IconButton
                        onClick={() => {
                          if (laundryItemToUpdate?.id === item?.id) {
                            setLaundryItemToUpdate(null);
                          } else {
                            setLaundryItemToUpdate(item);
                          }
                        }}
                      >
                        {laundryItemToUpdate?.id === item?.id ? (
                          <CloseIcon />
                        ) : (
                          <EditIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={isLoading || saveLaundryItemRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default LaundryItemList;
