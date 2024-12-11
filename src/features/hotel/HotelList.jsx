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
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Table,
  InputAdornment,
  Link,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachmentIcon from "@mui/icons-material/Attachment";
import {
  useGetCityListQuery,
  useGetStateListQuery,
  useUploadFileMutation,
  useAddHotelMutation,
  useUpdateHotelMutation,
} from "../../services/hotel";
import { useGetAllRoomTypesByCompanyQuery } from "../../services/roomType";
import { v4 as uuidv4 } from "uuid";
import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
import HotelListTable from "./HotelListTable";

const HotelList = () => {
  const [hotelToUpdate, setHotelToUpdate] = React.useState(null);
  console.log(hotelToUpdate, "hotelToUpdate");
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [uploadFile, uploadFileRes] = useUploadFileMutation();
  const [addHotel, addHotelRes] = useAddHotelMutation();
  const [updateHotel, updateHotelRes] = useUpdateHotelMutation();
  const [formData, setFormData] = React.useState({
    hotelName: "",
    selectedState: null,
    selectedStateInputVal: "",
    selectedCity: null,
    selectedCityInputVal: "",
    address: "",
    hotelImage: "",
    hotelImageUrl: "",
    gstIn: "",
    email: "",
    phoneNumber: "",
  });
  const imageRef = React.useRef(null);
  const [floorList, setFloorList] = React.useState([
    {
      id: uuidv4(),
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
  const {
    data: roomTypeByCompany = {
      data: [],
    },
  } = useGetAllRoomTypesByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId
  );

  const handleResetForm = React.useCallback(() => {
    setFormData({
      hotelName: "",
      selectedState: null,
      selectedStateInputVal: "",
      selectedCity: null,
      selectedCityInputVal: "",
      address: "",
      hotelImageUrl: "",
      gstIn: "",
      email: "",
      phoneNumber: "",
    });
    setFloorList([
      {
        id: uuidv4(),
        roomList: [],
      },
    ]);
    // imageRef.current.value = "";
  }, []);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      if (Boolean(hotelToUpdate)) {
        updateHotel({
          id: hotelToUpdate.id,
          name: formData.hotelName,
          logoUrl: formData.hotelImageUrl,
          gstIn: formData.gstIn,
          email: formData.email,
          contactNo: formData.phoneNumber,
          company: {
            id: JSON.parse(sessionStorage.getItem("data")).companyId,
          },
          createdByUser: {
            id: JSON.parse(sessionStorage.getItem("data")).id,
          },
          city: {
            id: formData.selectedCity.id,
          },
          state: {
            id: formData.selectedState.id,
          },

          address: formData.address,
          noOfFloors: floorList.length,
          floorRoomMapData: floorList.map((floor, index) => {
            return {
              floorNo: index + 1,
              noOfRooms: floor.roomList.length,
              roomData: floor.roomList.map((room) => ({
                roomNo: room.roomNumber,
                roomType: {
                  id: room.roomType.id,
                },
              })),
            };
          }),
        })
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
      } else {
        addHotel({
          name: formData.hotelName,
          logoUrl: formData.hotelImageUrl,
          gstIn: formData.gstIn,
          email: formData.email,
          contactNo: formData.phoneNumber,
          company: {
            id: JSON.parse(sessionStorage.getItem("data")).companyId,
          },
          createdByUser: {
            id: JSON.parse(sessionStorage.getItem("data")).id,
          },
          city: {
            id: formData.selectedCity.id,
          },
          state: {
            id: formData.selectedState.id,
          },

          address: formData.address,
          noOfFloors: floorList.length,
          floorRoomMapData: floorList.map((floor, index) => {
            return {
              floorNo: index + 1,
              noOfRooms: floor.roomList.length,
              roomData: floor.roomList.map((room) => ({
                roomNo: room.roomNumber,
                roomType: {
                  id: room.roomType.id,
                },
              })),
            };
          }),
        })
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
      }
    },
    [formData, addHotel, updateHotel, floorList, handleResetForm, hotelToUpdate]
  );

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "selectedState") {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
        selectedCity: null,
        selectedCityInputVal: "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  }, []);

  const handleAddFloor = React.useCallback(() => {
    setFloorList((prevData) => [...prevData, { id: uuidv4(), roomList: [] }]);
  }, []);

  const handleDeleteFloor = React.useCallback(
    (id) => {
      const floorListToSet = floorList.filter((item) => item.id !== id);
      setFloorList(floorListToSet);
    },
    [floorList, setFloorList]
  );

  const isFormValid = React.useCallback(() => {
    const {
      hotelName,
      selectedState,
      selectedCity,
      address,
      email,
      phoneNumber,
      gstIn,
    } = formData;
    return (
      Boolean(
        hotelName &&
          selectedState &&
          selectedCity &&
          address &&
          isValidGSTNo(gstIn) &&
          email &&
          phoneNumber
      ) && !floorList.map((item) => item.roomList.length).includes(0)
    );
  }, [formData, floorList]);

  const handleAttachmentClick = React.useCallback(() => {
    imageRef.current.click();
  }, []);

  const handleUploadImage = React.useCallback(
    (e) => {
      if (Boolean(e.target.files[0])) {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        uploadFile(formData)
          .unwrap()
          .then((res) => {
            setFormData((prev) => ({
              ...prev,
              hotelImageUrl: res.data,
            }));
            setSnack({
              open: true,
              message: res.message,
              severity: "success",
            });
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: err.data?.message || err.data,
              severity: "error",
            });
          });
      }
    },
    [uploadFile]
  );

  const handleClearImage = React.useCallback(() => {
    setFormData({
      ...formData,
      hotelImage: "",
      hotelImageUrl: "",
    });
  }, [formData]);

  // React.useEffect(() => {
  //   if (formData.hotelImage && imageRef.current) {
  //     handleUploadImage();
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       hotelImage: "",
  //       hotelImageUrl: "",
  //     }));
  //   }
  // }, [formData.hotelImage, handleUploadImage]);

  React.useEffect(() => {
    if (Boolean(hotelToUpdate)) {
      setFormData({
        hotelName: hotelToUpdate.name,
        selectedState:
          stateList.data.find((state) => state.id === hotelToUpdate.state.id) ||
          null,
        selectedStateInputVal:
          stateList.data.find((state) => state.id === hotelToUpdate.state.id)
            ?.name || "",
        selectedCity:
          cityList.data.find((city) => city.id === hotelToUpdate.city.id) ||
          null,
        selectedCityInputVal:
          cityList.data.find((city) => city.id === hotelToUpdate.city.id)
            ?.name || "",
        address: hotelToUpdate.address,
        hotelImage: "",
        hotelImageUrl: hotelToUpdate.logoUrl || "",
        gstIn: hotelToUpdate.gstIn || "",
        email: hotelToUpdate.email,
        phoneNumber: hotelToUpdate.contactNos
          ? hotelToUpdate.contactNos[0]
          : "",
      });
      setFloorList(
        hotelToUpdate.floorRoomMapData.map((floor) => {
          return {
            id: floor.floorNo,
            roomList: floor.roomDto.map((room) => {
              return {
                id: room.id,
                roomNumber: room.roomNo,
                roomType: room.roomType,
              };
            }),
          };
        })
      );
    }
  }, [hotelToUpdate, stateList.data, cityList.data]);

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
              disabled={Boolean(hotelToUpdate)}
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              disabled={Boolean(hotelToUpdate)}
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
              disabled={Boolean(hotelToUpdate)}
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
              disabled={Boolean(hotelToUpdate)}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  GST IN{" "}
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
              name="gstIn"
              value={formData.gstIn}
              onChange={handleChange}
              variant="standard"
              disabled={Boolean(hotelToUpdate)}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Email{" "}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="standard"
              disabled={Boolean(hotelToUpdate)}
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Phone Number{" "}
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
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              variant="standard"
              disabled={Boolean(hotelToUpdate)}
            />
          </Grid>
          <Grid size={3}>
            {formData.hotelImageUrl ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Link
                    href={formData.hotelImageUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(formData.hotelImageUrl, "_blank");
                    }}
                    sx={{ fontSize: 18 }}
                  >
                    Hotel Image
                  </Link>
                  <IconButton
                    onClick={handleClearImage}
                    disabled={Boolean(hotelToUpdate)}
                  >
                    <ClearIcon
                      color={Boolean(hotelToUpdate) ? "disabled" : "error"}
                    />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <TextField
                type="file"
                name="hotelImage"
                slotProps={{
                  htmlInput: {
                    style: {
                      // opacity: formData.hotelImage ? 1 : 0,
                      opacity: 0,
                    },
                    ref: imageRef,
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={handleAttachmentClick}
                        >
                          <AttachmentIcon sx={{ transform: "rotate(45deg)" }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                onChange={handleUploadImage}
                label={
                  <React.Fragment>
                    Hotel Image{" "}
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
          </Grid>
        </Grid>
        <Box>
          {floorList.map((floor, index) => {
            return (
              <FloorFormComponent
                key={floor.id}
                floor={floor}
                isLastIndex={index + 1 === floorList.length}
                handleAddFloor={handleAddFloor}
                roomTypeList={roomTypeByCompany.data}
                floorList={floorList}
                setFloorList={setFloorList}
                handleDeleteFloor={handleDeleteFloor}
                floorIndex={index}
                setSnack={setSnack}
              />
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
            disabled={!isFormValid()}
            type="submit"
          >
            {Boolean(hotelToUpdate) ? "Update Hotel" : "Add Hotel"}
          </Button>
        </Box>
      </Box>
      <HotelListTable setHotelToUpdate={setHotelToUpdate} />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <LoadingComponent
        open={
          uploadFileRes.isLoading ||
          addHotelRes.isLoading ||
          updateHotelRes.isLoading
        }
      />
    </Container>
  );
};

function FloorFormComponent({
  floor,
  isLastIndex,
  handleAddFloor,
  roomTypeList,
  floorList,
  setFloorList,
  handleDeleteFloor,
  floorIndex,
  setSnack,
}) {
  const [formData, setFormData] = React.useState({
    roomNumber: "",
    selectedRoomType: null,
    selectedRoomTypeInputVal: "",
  });

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      roomNumber: "",
      selectedRoomType: null,
      selectedRoomTypeInputVal: "",
    });
  }, []);

  const handleAddRoomForCurrentFloor = React.useCallback(() => {
    const roomNameArr = [];

    floorList.forEach((item) => {
      item.roomList.forEach((val) => {
        roomNameArr.push(val.roomNumber.toLowerCase());
      });
    });

    if (roomNameArr.includes(formData.roomNumber.trim().toLocaleLowerCase())) {
      return setSnack({
        open: true,
        message: "Room number already exists.",
        severity: "error",
      });
    }

    const floorListToSet = [];
    floorList.forEach((item) => {
      if (item.id === floor.id) {
        floorListToSet.push({
          id: floor.id,
          roomList: [
            ...item.roomList,
            {
              // id: item.roomList.length + 1,
              id: uuidv4(),
              roomNumber: formData.roomNumber,
              roomType: formData.selectedRoomType,
            },
          ],
        });
      } else {
        floorListToSet.push(item);
      }
    });
    setFloorList(floorListToSet);
    handleResetForm();
  }, [floorList, setFloorList, floor, handleResetForm, formData, setSnack]);

  const handleDeleteRoomForCurrentFloor = React.useCallback(
    (id) => {
      const floorListToSet = [];
      floorList.forEach((item) => {
        if (item.id === floor.id) {
          floorListToSet.push({
            ...item,
            roomList: item.roomList.filter((room) => room.id !== id),
          });
        } else {
          floorListToSet.push(item);
        }
      });
      setFloorList(floorListToSet);
    },
    [floor.id, floorList, setFloorList]
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
          {`Floor ${floorIndex + 1}`}
        </Typography>
        <Box>
          {floorIndex !== 0 && typeof floor.id === "string" && (
            <IconButton
              sx={{
                color: "#fff",
                backgroundColor: (theme) => theme.palette.error.main,
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.error.main,
                },
                mt: 0.4,
              }}
              onClick={() => handleDeleteFloor(floor.id)}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          {isLastIndex && (
            <IconButton
              sx={{
                ml: 1,
                color: "#fff",
                backgroundColor: (theme) => theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.secondary.main,
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
      </Box>
      <Divider sx={{ borderColor: "#BDBDBD" }} />
      <Box sx={{ p: 2, border: "1px solid #BDBDBD" }}>
        <Grid container columnSpacing={2}>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Room Number{" "}
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
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={roomTypeList}
              getOptionLabel={(option) => option.type}
              value={formData.selectedRoomType}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedRoomType", value: newVal },
                })
              }
              inputValue={formData.selectedRoomTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedRoomTypeInputVal",
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
                      Select Room Type{" "}
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
          <Grid size={6}>
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
              disabled={
                !(
                  Boolean(formData.roomNumber.trim()) &&
                  Boolean(formData.selectedRoomType)
                )
              }
              onClick={handleAddRoomForCurrentFloor}
            >
              Add Room
            </Button>
          </Grid>

          {Boolean(floor.roomList.length) && (
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
                        <TableCell>Room Number</TableCell>
                        <TableCell>Room Type</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {floor.roomList.map((room, index) => {
                        return (
                          <TableRow
                            sx={{
                              "& > *": { borderBottom: "unset" },
                              ".MuiTableCell-root": {
                                color: "#747474",
                              },
                            }}
                            key={room.id}
                          >
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{room.roomNumber}</TableCell>
                            <TableCell>{room.roomType.type}</TableCell>
                            <TableCell>
                              {typeof room.id === "string" && (
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteRoomForCurrentFloor(room.id)
                                  }
                                >
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
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
          )}
        </Grid>
      </Box>
    </React.Fragment>
  );
}

function isValidGSTNo(str) {
  if (str) {
    let regex = new RegExp(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    );

    return regex.test(str);
  }
  return false;
}

export default HotelList;
