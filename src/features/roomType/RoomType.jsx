import React from "react";
import {
  Autocomplete,
  Box,
  Container,
  Grid2 as Grid,
  Paper,
  TextField,
  Typography,
  Divider,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import RoomTypeTable from "./RoomTypeTable";

import { useGetAllExtraItemsQuery } from "../../services/extraItem";

import { useAddRoomTypeMutation } from "../../services/roomType";

import LoadingComponent from "../../components/LoadingComponent";

const RoomType = () => {
  const [addRoomType, addRoomTypeRes] = useAddRoomTypeMutation();
  const [formData, setFormData] = React.useState({
    roomType: "",
    description: "",
    capacity: "",
    basePrice: "",
    advanceAmount: "",
    isAdvance: false,
  });
  const [extraItemsArr, setExtraItemsArr] = React.useState([]);
  const {
    data: extraItemList = {
      data: [],
    },
    isLoading,
  } = useGetAllExtraItemsQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId
  );

  const handleChange = React.useCallback((e) => {
    if (["capacity", "basePrice", "advanceAmount"].includes(e.target.name)) {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/\D/g, ""),
      }));
    } else if (e.target.type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      roomType: "",
      description: "",
      capacity: "",
      basePrice: "",
      advanceAmount: "",
      isAdvance: false,
    });
    setExtraItemsArr([]);
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.roomType.trim() &&
        formData.description.trim() &&
        formData.capacity.trim() &&
        formData.basePrice.trim() &&
        formData.advanceAmount.trim()
    );
  }, [formData]);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      addRoomType({
        type: formData.roomType,
        description: formData.description,
        capacity: formData.capacity,
        basePrice: formData.basePrice,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
        isAdvanceRequired: formData.isAdvance,
        advanceAmount: formData.advanceAmount,
        extraItemsList: extraItemsArr.map((extra) => ({
          extraItems: {
            id: extra.extraItem.id,
          },
          noOfItems: extra.quantity,
          isReusable: extra.isReusable,
        })),
      })
        .unwrap()
        .then((res) => {
          console.log(res, "res");
        })
        .catch((err) => {
          console.log(err, "err");
        });
      handleResetForm();
    },
    [formData, handleResetForm, addRoomType, extraItemsArr]
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
                  Room Type{" "}
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
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Description{" "}
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
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Capacity{" "}
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
                  Base Price{" "}
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
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAdvance}
                    name="isAdvance"
                    onChange={handleChange}
                  />
                }
                label="Is Advance"
              />
            </FormGroup>
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Advance Amount{" "}
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
              name="advanceAmount"
              value={formData.advanceAmount}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
        </Grid>
        <Box>
          <ExtraItemFormComponent
            extraItemList={extraItemList.data}
            extraItemsArr={extraItemsArr}
            setExtraItemsArr={setExtraItemsArr}
          />
        </Box>
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
            Add Room Type
          </Button>
        </Box>
      </Box>
      <RoomTypeTable />
      <LoadingComponent open={isLoading || addRoomTypeRes.isLoading} />
    </Container>
  );
};

function ExtraItemFormComponent({
  extraItemList,
  extraItemsArr,
  setExtraItemsArr,
}) {
  const [formData, setFormData] = React.useState({
    selectedExtraItem: null,
    selectedExtraItemInputVal: "",
    quantity: "",
    isReusable: false,
  });

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.selectedExtraItem &&
        formData.selectedExtraItemInputVal &&
        formData.quantity
    );
  }, [formData]);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      selectedExtraItem: null,
      selectedExtraItemInputVal: "",
      quantity: "",
      isReusable: false,
    });
  }, []);

  const handleAddExtraItemToArray = React.useCallback(() => {
    setExtraItemsArr((preVal) => [
      ...preVal,
      {
        extraItem: formData.selectedExtraItem,
        quantity: formData.quantity,
        isReusable: formData.isReusable,
      },
    ]);
    handleResetForm();
  }, [setExtraItemsArr, handleResetForm, formData]);

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "quantity") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/[^\d]|^0\d*/g, ""),
      }));
    } else if (e.target.type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  }, []);

  const handleDeleteExtraItem = React.useCallback(
    (itemId) => {
      setExtraItemsArr((prevVal) =>
        prevVal.filter((val) => val.extraItem.id !== itemId)
      );
    },
    [setExtraItemsArr]
  );

  return (
    <React.Fragment>
      <Box
        sx={{
          mt: 2,
          px: 1,
          py: 0.5,
          // borderBottom: (theme) => `3px solid ${theme.palette.primary.main}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#BDBDBD",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            letterSpacing: 1,
            //   color: (theme) => theme.palette.primary.main,
            color: "#FFFFFF",
            fontWeight: 600,
          }}
          // gutterBottom
        >
          Add Extra Items
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#BDBDBD" }} />
      <Box sx={{ p: 2, border: "1px solid #BDBDBD" }}>
        <Grid container columnSpacing={2}>
          <Grid size={3}>
            <Autocomplete
              options={extraItemList.filter(
                (item) =>
                  !extraItemsArr.some((val) => val.extraItem.id === item.id)
              )}
              getOptionLabel={(option) => option.name}
              value={formData.selectedExtraItem}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedExtraItem", value: newVal },
                })
              }
              inputValue={formData.selectedExtraItemInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedExtraItemInputVal",
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
                      Select Extra Item{" "}
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
          <Grid size={3}>
            <FormGroup>
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
          <Grid size={3}>
            <Button
              color="secondary"
              variant="contained"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 15,
                mt: 1.5,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              size="small"
              onClick={handleAddExtraItemToArray}
              disabled={!isFormValid()}
            >
              Add Extra Item
            </Button>
          </Grid>

          <Grid size={12}>
            <Box sx={{ mt: 3, mb: 2 }}>
              {Boolean(extraItemsArr.length) && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          ".MuiTableCell-root": {
                            fontSize: "1rem",
                            backgroundColor: "#E9E5F1",
                          },
                        }}
                      >
                        <TableCell>S.No.</TableCell>
                        <TableCell>Extra Item</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Is Reusable</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extraItemsArr.map((item, index) => {
                        return (
                          <TableRow
                            sx={{
                              "& > *": { borderBottom: "unset" },
                              ".MuiTableCell-root": {
                                color: "#747474",
                              },
                            }}
                            key={item.extraItem.name}
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.extraItem.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              {item.isReusable ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteExtraItem(item.extraItem.id)
                                }
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default RoomType;
