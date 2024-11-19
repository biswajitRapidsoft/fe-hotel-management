import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Grid2 as Grid,
  TextField,
  Paper,
  Typography,
  IconButton,
  Divider,
  Container,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import {
  useGetCityListQuery,
  useGetStateListQuery,
} from "../../services/hotel";

const HotelList = () => {
  const [formData, setFormData] = React.useState({
    hotelName: "",
    selectedState: null,
    selectedStateInputVal: "",
    selectedCity: null,
    selectedCityInputVal: "",
    address: "",
  });
  const [floorList, setFloorList] = React.useState([
    {
      id: 1,
      roomList: [],
    },
  ]);
  const {
    data: stateList = {
      data: [],
    },
  } = useGetStateListQuery();
  const {
    data: cityList = {
      data: [],
    },
  } = useGetCityListQuery(formData.selectedState?.id, {
    skip: !Boolean(formData.selectedState),
  });
  const handleSubmit = React.useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleAddFloor = React.useCallback((e) => {
    setFloorList((prevData) => [
      ...prevData,
      { id: prevData.length + 1, roomList: [] },
    ]);
  }, []);

  return (
    <Container>
      <Box
        component="form"
        onSubmit={handleSubmit}
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
            <TextField
              label={
                <React.Fragment>
                  Hotel Name{" "}
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
              name="hotelName"
              value={formData.hotelName}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={stateList.data}
              getOptionLabel={(option) => option.name}
              value={formData.selectedState}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedState", value: newVal },
                })
              }
              inputValue={formData.selectedStateInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedStateInputVal",
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
                      Select State{" "}
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
            <Autocomplete
              options={cityList.data}
              getOptionLabel={(option) => option.name}
              value={formData.selectedCity}
              onChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedCity",
                    value: newVal,
                  },
                })
              }
              inputValue={formData.selectedCityInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedCityInputVal",
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
                      Select City{" "}
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
                  Address{" "}
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
              name="address"
              value={formData.address}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
        </Grid>
        <Box>
          {floorList.map((floor, index) => {
            return (
              <React.Fragment key={floor.id}>
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
                    {`Floor ${floor.id}`}
                  </Typography>
                  {index + 1 === floorList.length && (
                    <IconButton
                      sx={{
                        color: "#fff",
                        backgroundColor: (theme) =>
                          theme.palette.secondary.main,
                        "&:hover": {
                          backgroundColor: (theme) =>
                            theme.palette.secondary.main,
                        },
                        mt: 0.4,
                      }}
                      onClick={handleAddFloor}
                      size="small"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Divider sx={{ borderColor: "#BDBDBD" }} />
                <Box sx={{ p: 2, border: "1px solid #BDBDBD" }}>
                  <Grid container columnSpacing={2}>
                    <Grid size={3}>
                      <TextField
                        label={
                          <React.Fragment>
                            Hotel Name{" "}
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
                        name="hotelName"
                        value={formData.hotelName}
                        onChange={handleChange}
                        variant="standard"
                      />
                    </Grid>
                    <Grid size={3}>
                      <Autocomplete
                        options={stateList.data}
                        getOptionLabel={(option) => option.name}
                        value={formData.selectedState}
                        onChange={(e, newVal) =>
                          handleChange({
                            target: { name: "selectedState", value: newVal },
                          })
                        }
                        inputValue={formData.selectedStateInputVal}
                        onInputChange={(e, newVal) =>
                          handleChange({
                            target: {
                              name: "selectedStateInputVal",
                              value: newVal,
                            },
                          })
                        }
                        clearOnEscape
                        disablePortal
                        popupIcon={<KeyboardArrowDownIcon color="primary" />}
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
                                Select State{" "}
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
                </Box>
              </React.Fragment>
            );
          })}
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
            // disabled={!isFormValid()}
            type="submit"
          >
            Add Hotel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HotelList;
