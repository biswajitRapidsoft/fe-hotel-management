import React from "react";

import {
  useGetAllInventoryItemsByHotelIdQuery,
  useUpdateInventoryStockMutation,
} from "../../services/inventory";
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
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import { v4 } from "uuid";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const InventoryManagement = () => {
  const [search, setSearch] = React.useState("");
  const [snack, setSnack] = React.useState({
    open: false,
    severity: "",
    message: "",
  });
  const {
    data: inventoryList = {
      data: [],
    },
    isLoading,
  } = useGetAllInventoryItemsByHotelIdQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId
  );

  const [updateInventoryStock, updateInventoryStockRes] =
    useUpdateInventoryStockMutation();

  const [formData, setFormData] = React.useState({
    selectedInventory: null,
    selectedInventoryInputVal: "",
    quantity: "",
    isRemove: false,
  });

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "quantity") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/^0|\D/, ""),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]:
          e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));
    }
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      selectedInventory: null,
      selectedInventoryInputVal: "",
      quantity: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      updateInventoryStock({
        extraItemDto: {
          id: formData.selectedInventory.extraItemDto.id,
        },
        quantity: formData.quantity,
        hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
        isAdded: formData.isRemove ? false : true,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
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
    [formData, updateInventoryStock, handleResetForm]
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(formData.selectedInventory && formData.quantity);
  }, [formData]);

  return (
    <React.Fragment>
      <Box
        onSubmit={handleSubmit}
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
      >
        <Grid container columnSpacing={5} rowSpacing={3}>
          <Grid size={3}>
            <Autocomplete
              options={inventoryList.data}
              getOptionLabel={(option) => option.extraItemDto.itemName}
              value={formData.selectedInventory}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedInventory", value: newVal },
                })
              }
              inputValue={formData.selectedInventoryInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedInventoryInputVal",
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
                      Select Item{" "}
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
            <TextField
              label={
                <React.Fragment>
                  Quantity{" "}
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
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={6}>
            <FormGroup sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isRemove}
                    name="isRemove"
                    onChange={handleChange}
                  />
                }
                label="Is Remove"
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
            disabled={!isFormValid()}
            type="submit"
          >
            Add Stock
          </Button>
        </Box>
      </Box>
      <Paper>
        <Toolbar
          sx={[
            {
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              justifyContent: { xs: "space-between" },
            },
          ]}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Inventory List
          </Typography>
          <Box>
            <TextField
              label="Search"
              size="small"
              sx={{ width: 250 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
        </Toolbar>
        <TableContainer sx={{ height: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                    letterSpacing: 1,
                  },
                }}
              >
                <TableCell>SL No.</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryList.data.map((inventoryItem, index) => {
                if (
                  inventoryItem.extraItemDto.itemName
                    .toLowerCase()
                    .includes(search.toLocaleLowerCase())
                ) {
                  return (
                    <TableRow
                      sx={{
                        ".MuiTableCell-root": {
                          fontSize: 18,
                          letterSpacing: 1,
                        },
                      }}
                      key={v4()}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {inventoryItem.extraItemDto.itemName}
                      </TableCell>
                      <TableCell>{inventoryItem.quantity}</TableCell>
                    </TableRow>
                  );
                } else {
                  return null;
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={updateInventoryStockRes.isLoading || isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

export default InventoryManagement;
