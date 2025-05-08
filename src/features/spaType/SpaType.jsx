import React from "react";

import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid2 as Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  Paper,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import {
  useSaveSpaTypeMutation,
  useGetAllTherapistByHotelIdQuery,
} from "../../services/spa";

import { useUploadFileMutation } from "../../services/hotel";

import SnackAlert from "../../components/Alert";

import { UploadImageFormComponent } from "../roomType/RoomType";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import LoadingComponent from "../../components/LoadingComponent";
import SpaTypeListTable from "./SpaTypeListTable";
import { v4 as uuidv4 } from "uuid";

export const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
export const checkedIcon = (
  <CheckBoxIcon fontSize="small" sx={{ color: "#280071" }} />
);

const SpaType = () => {
  const {
    data: therapistList = {
      data: [],
    },
  } = useGetAllTherapistByHotelIdQuery(
    sessionStorage.getItem("hotelIdForSpaType")
  );
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
    advancePercentage: "",
    description: "",
    therapistList: [],
  });

  const [saveSpaType, saveSpaTypeRes] = useSaveSpaTypeMutation();
  const [uploadImage, uploadImageRes] = useUploadFileMutation();
  const [spaBreakDownArr, setSpaBreakDownArr] = React.useState([]);
  const [uploadedImageArr, setUploadedImageArr] = React.useState([]);
  // console.log("uploadedImageArr in spa update", uploadedImageArr);

  // state to manage updation of spa type
  const [spaToUpdate, setSpaToUpdate] = React.useState(null);

  console.log("spaToUpdate", spaToUpdate);

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "basePrice") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/\D/g, ""),
      }));
    } else if (e.target.name === "advancePercentage") {
      setFormData((prevData) => {
        const numericValue = e.target.value.replace(/\D/g, "");
        const cappedValue = Math.min(parseInt(numericValue || "0", 10), 100);
        return {
          ...prevData,
          [e.target.name]: cappedValue,
        };
      });
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
      advancePercentage: "",
      description: "",
      therapistList: [],
    });
    setSpaBreakDownArr([]);
    setUploadedImageArr([]);
  }, []);

  // const isFormValid = React.useCallback(() => {
  //   return Boolean(formData.spaType.trim() && formData.basePrice);
  // }, [formData]);
  const isFormValid = React.useCallback(() => {
    if (
      !formData.spaType.trim() ||
      !formData.basePrice ||
      !formData.description.trim() ||
      !Boolean(formData.therapistList.length) ||
      !Boolean(spaBreakDownArr.length)
    ) {
      return false;
    }

    if (formData.isAdvance && !formData.advancePercentage) {
      return false;
    }

    return true;
  }, [formData, spaBreakDownArr]);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      saveSpaType({
        name: formData.spaType,
        price: formData.basePrice,
        // hotelId: formData.selectedHotel.id,
        hotelId: sessionStorage.getItem("hotelIdForSpaType"),
        isAdvanceNeeded: formData.isAdvance,
        images: uploadedImageArr,
        advancePaymentPercentage: formData.advancePercentage,
        id: Boolean(spaToUpdate) ? spaToUpdate.id : "",
        isActive: Boolean(spaToUpdate) ? spaToUpdate.isActive : true,
        description: formData.description,
        therapistId: formData.therapistList.map((therapist) => therapist.id),
        spaTypeDetailsList: spaBreakDownArr.map((breakDown) => ({
          id: typeof breakDown.id === "string" ? null : breakDown.id,
          serviceName: breakDown.name,
          serviceDescription: breakDown.description,
          durationMinutes: breakDown.time,
        })),
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
    [
      saveSpaType,
      formData,
      uploadedImageArr,
      handleResetForm,
      spaToUpdate,
      spaBreakDownArr,
    ]
  );

  React.useEffect(() => {
    if (Boolean(spaToUpdate)) {
      setFormData({
        spaType: spaToUpdate?.name,
        basePrice: spaToUpdate?.price,
        isAdvance: Boolean(spaToUpdate?.isAdvanceNeeded),
        advancePercentage: spaToUpdate?.advancePaymentPercentage,
        description: spaToUpdate.description,
        therapistList: spaToUpdate.therapistUserList
          ? therapistList.data.filter((therapist) =>
              spaToUpdate.therapistUserList.some(
                (someTherapist) => someTherapist.id === therapist.id
              )
            )
          : [],
      });
      setSpaBreakDownArr(
        spaToUpdate?.spaTypeDetailsList?.map((spaDetail) => ({
          id: spaDetail.id,
          name: spaDetail.serviceName,
          description: spaDetail.serviceDescription,
          time: spaDetail.durationMinutes,
        }))
      );

      if (spaToUpdate.images && Array.isArray(spaToUpdate.images)) {
        setUploadedImageArr(spaToUpdate.images);
      }
    }
  }, [spaToUpdate, therapistList.data]);

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
                  Spa Name{" "}
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
          {/* <Grid size={3}>
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
          </Grid> */}
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
              inputProps={{
                maxLength: 10,
              }}
              variant="standard"
            />
          </Grid>{" "}
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Description
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
              inputProps={{ maxLength: 50 }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          {formData.isAdvance && (
            <Grid size={3}>
              <TextField
                label={
                  <React.Fragment>
                    Advance Percentage{" "}
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
                name="advancePercentage"
                value={formData.advancePercentage}
                onChange={handleChange}
                variant="standard"
              />
            </Grid>
          )}
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
          <Grid size={3}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={therapistList.data}
              getOptionLabel={(option) => option.name}
              value={formData.therapistList}
              onChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "therapistList",
                    value: newVal,
                  },
                })
              }
              renderOption={(props, option, { selected }) => {
                return (
                  <li {...props} key={props.key}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.name}
                  </li>
                );
              }}
              renderTags={(list) => list.map((item) => item.name).join(", ")}
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
                      Select Therapist{" "}
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
        </Grid>
        <Box>
          <AddSpaBreakDownForm
            spaBreakDownArr={spaBreakDownArr}
            setSpaBreakDownArr={setSpaBreakDownArr}
            setSnack={setSnack}
          />
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
            {/* Add Spa Type */}
            {Boolean(spaToUpdate) ? "Update Spa Type" : "Add Spa Type"}
          </Button>
        </Box>
      </Box>
      <SpaTypeListTable
        saveSpaType={saveSpaType}
        setSpaToUpdate={setSpaToUpdate}
      />
      <LoadingComponent
        open={uploadImageRes.isLoading || saveSpaTypeRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

function AddSpaBreakDownForm({
  spaBreakDownArr,
  setSpaBreakDownArr,
  setSnack,
}) {
  const [formData, setFormData] = React.useState({
    name: "",
    time: "",
    description: "",
  });

  const [breakDownToUpdate, setBreakDownToUpdate] = React.useState(null);

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]:
        e.target.name === "time"
          ? e.target.value.replace(/\D|^0/g, "")
          : e.target.value,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      name: "",
      description: "",
      time: "",
    });
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.name.trim() &&
        formData.time.trim() &&
        formData.description.trim()
    );
  }, [formData]);

  const handleAddSpaBreakDown = React.useCallback(() => {
    if (
      Boolean(
        spaBreakDownArr.find(
          (breakDown) =>
            breakDown.name.trim().toLowerCase() ===
              formData.name.trim().toLocaleLowerCase() &&
            (breakDownToUpdate
              ? breakDownToUpdate.name.trim().toLowerCase() !==
                formData.name.trim().toLowerCase()
              : true)
        )
      )
    ) {
      return setSnack({
        open: true,
        message: "Spa breakdown name already exists.",
        severity: "error",
      });
    }
    if (breakDownToUpdate) {
      const spaBreakDownArrToSet = [];
      spaBreakDownArr.forEach((item) => {
        if (item.id === breakDownToUpdate.id) {
          spaBreakDownArrToSet.push({
            ...item,
            name: formData.name,
            description: formData.description,
            time: formData.time,
          });
        } else {
          spaBreakDownArrToSet.push(item);
        }
      });
      setSpaBreakDownArr(spaBreakDownArrToSet);
    } else {
      setSpaBreakDownArr((prevData) => [
        ...prevData,
        {
          id: uuidv4(),
          name: formData.name,
          time: formData.time,
          description: formData.description,
        },
      ]);
    }
    handleResetForm();
  }, [
    setSpaBreakDownArr,
    formData,
    handleResetForm,
    spaBreakDownArr,
    setSnack,
  ]);

  const handleDeleteSpaBreakDown = React.useCallback(
    (uid) => {
      setSpaBreakDownArr((prevData) =>
        prevData.filter((data) => data.id !== uid)
      );
      if (breakDownToUpdate && breakDownToUpdate.id === uid) {
        handleResetForm();
        setBreakDownToUpdate(null);
      }
    },
    [setSpaBreakDownArr, handleResetForm, breakDownToUpdate]
  );

  React.useEffect(() => {
    if (breakDownToUpdate) {
      setFormData((prevData) => ({
        ...prevData,
        name: breakDownToUpdate.name,
        time: breakDownToUpdate.time,
        description: breakDownToUpdate.description,
      }));
    }
  }, [breakDownToUpdate]);

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
          Add Spa Breakdown
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#BDBDBD" }} />
      <Box sx={{ p: 2, pr: 2, pb: 2, border: "1px solid #BDBDBD" }}>
        <Grid container columnSpacing={2}>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Name
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
                  Description
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
                  Time
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
              name="time"
              value={formData.time}
              onChange={handleChange}
              variant="standard"
            />
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
              onClick={handleAddSpaBreakDown}
              disabled={!Boolean(isFormValid())}
            >
              {Boolean(breakDownToUpdate) ? "Update" : "Add"}
            </Button>
          </Grid>
          <Grid size={12}>
            <Box sx={{ mt: 3, mb: 2 }}>
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
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {spaBreakDownArr.map((breakDown, index) => {
                      return (
                        <TableRow
                          key={breakDown.id}
                          sx={{
                            "& > *": { borderBottom: "unset" },
                            ".MuiTableCell-root": {
                              color: "#747474",
                            },
                          }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{breakDown.name}</TableCell>
                          <TableCell>{breakDown.description}</TableCell>
                          <TableCell>{breakDown.time}</TableCell>
                          <TableCell>
                            {typeof breakDown.id === "string" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteSpaBreakDown(breakDown.id)
                                  }
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                                <IconButton
                                  onClick={() =>
                                    setBreakDownToUpdate(breakDown)
                                  }
                                >
                                  <EditIcon />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default SpaType;
