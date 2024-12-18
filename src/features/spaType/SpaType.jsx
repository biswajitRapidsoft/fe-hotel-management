import React from "react";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  Paper,
  TextField,
} from "@mui/material";

import { useGetHotelListByCompanyQuery } from "../../services/hotel";

import { useSaveSpaTypeMutation } from "../../services/spa";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import { useUploadFileMutation } from "../../services/hotel";

import SnackAlert from "../../components/Alert";

import { UploadImageFormComponent } from "../roomType/RoomType";

import { ADMIN } from "../../helper/constants";
import LoadingComponent from "../../components/LoadingComponent";
import SpaTypeListTable from "./SpaTypeListTable";

const SpaType = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    severity: "",
    message: "",
  });
  const [formData, setFormData] = React.useState({
    spaType: "",
    selectedHotel: null,
    selectedHotelInputVal: "",
    basePrice: "",
    isAdvance: false,
  });

  const [saveSpaType, saveSpaTypeRes] = useSaveSpaTypeMutation();

  const [uploadImage, uploadImageRes] = useUploadFileMutation();
  const [uploadedImageArr, setUploadedImageArr] = React.useState([]);
  const {
    data: hotelList = {
      data: [],
    },
    isLoading,
  } = useGetHotelListByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "basePrice") {
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
      spaType: "",
      selectedHotel: null,
      selectedHotelInputVal: "",
      basePrice: "",
      isAdvance: false,
    });
    setUploadedImageArr([]);
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(formData.spaType.trim() && formData.basePrice);
  }, [formData]);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      saveSpaType({
        name: formData.spaType,
        price: formData.basePrice,
        hotelId: formData.selectedHotel.id,
        isAdvanceNeeded: formData.isAdvance,
        images: uploadedImageArr,
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
    [saveSpaType, formData, uploadedImageArr, handleResetForm]
  );

  const handleUploadImage = React.useCallback(
    (imgSource) => {
      const formData = new FormData();
      formData.append("file", imgSource);
      uploadImage(formData)
        .unwrap()
        .then((res) => {
          setUploadedImageArr((prevData) => [...prevData, res.data]);
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
    [uploadImage]
  );

  const handleDeleteImageFromArray = React.useCallback((imgUrl) => {
    setUploadedImageArr((prevImg) => prevImg.filter((url) => url !== imgUrl));
  }, []);

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
                  Spa Type{" "}
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
              name="spaType"
              value={formData.spaType}
              onChange={handleChange}
              variant="standard"
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
            <FormGroup sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAdvance}
                    name="isAdvance"
                    onChange={handleChange}
                  />
                }
                label="Is Advance Required"
              />
            </FormGroup>
          </Grid>
        </Grid>
        <Box>
          <UploadImageFormComponent
            uploadedImageArr={uploadedImageArr}
            handleUploadImage={handleUploadImage}
            handleDeleteImageFromArray={handleDeleteImageFromArray}
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
            Add Spa Type
          </Button>
        </Box>
      </Box>
      <SpaTypeListTable saveSpaType={saveSpaType} />
      <LoadingComponent
        open={uploadImageRes.isLoading || saveSpaTypeRes.isLoading || isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default SpaType;
