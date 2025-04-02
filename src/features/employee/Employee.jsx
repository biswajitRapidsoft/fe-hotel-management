import {
  Autocomplete,
  Box,
  Button,
  Container,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from "@mui/material";
import React from "react";
import EmployeeListTable from "./EmployeeListTable";
import AttachmentIcon from "@mui/icons-material/Attachment";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";

import { useGetAllRolesQuery, useSaveUserMutation } from "../../services/users";
import { useGetHotelListByCompanyQuery } from "../../services/hotel";
import CloseIcon from "@mui/icons-material/Close";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { ADMIN, SUPER_ADMIN } from "../../helper/constants";
// import { UploadImageFormComponent } from "../roomType/RoomType";
import { useUploadFileMutation } from "../../services/hotel";

const Employee = () => {
  const [employeeToUpdate, setEmployeeToUpdate] = React.useState(null);
  console.log("employeeToUpdate", employeeToUpdate);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [saveUser, saveUserRes] = useSaveUserMutation();

  const [uploadImage, uploadImageRes] = useUploadFileMutation();
  // const [uploadedImageArr, setUploadedImageArr] = React.useState([]);

  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = React.useState("");

  const imageRef = React.useRef(null);

  const handleAttachmentClick = React.useCallback(() => {
    imageRef.current.click();
  }, []);

  const {
    data: roleList = {
      data: [],
    },
  } = useGetAllRolesQuery(
    {},
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const {
    data: hotelList = {
      data: [],
    },
  } = useGetHotelListByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    selectedRole: null,
    selectedRoleInputVal: "",
    selectedHotel: null,
    selectedHotelInputVal: "",
    phoneNo: "",
  });

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;

    if (name === "phoneNo") {
      const numericRegex = /^[0-9]*$/;
      if (!numericRegex.test(value)) {
        return;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
  }, []);
  const handleUploadImage = React.useCallback(
    (imgSource) => {
      const formData = new FormData();
      formData.append("file", imgSource);
      uploadImage(formData)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            severity: "success",
            message: res.message,
          });
          setUploadedImageUrl(res.data);
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

  const uploadHandler = React.useCallback(() => {
    if (imageFile) {
      handleUploadImage(imageFile);
    }
  }, [handleUploadImage, imageFile]);

  const handleImageChange = React.useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        setSnack({
          open: true,
          severity: "error",
          message: "Only PNG, JPEG, and JPG files are allowed.",
        });
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Store the file
      setImageFile(file);
      // Reset uploaded image URL when a new file is selected
      setUploadedImageUrl("");
    }
  }, []);
  // const handleDeleteImageFromArray = React.useCallback((imgUrl) => {
  //   setUploadedImageArr((prevImg) => prevImg.filter((url) => url !== imgUrl));
  // }, []);
  const handleDeleteImage = React.useCallback(() => {
    // Reset image states
    setImageFile(null);
    setImagePreviewUrl("");
    setUploadedImageUrl("");

    // Clear the file input
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  }, []);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      name: "",
      email: "",
      selectedRole: null,
      selectedRoleInputVal: "",
      selectedHotel: null,
      selectedHotelInputVal: "",
      phoneNo: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      saveUser({
        id: employeeToUpdate ? employeeToUpdate.id : null,
        userName: formData.name,
        role: formData.selectedRole,
        email: formData.email,
        hotelId: formData.selectedHotel.id,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
        phoneNo: formData.phoneNo,
        isActive: employeeToUpdate ? employeeToUpdate.isActive : true,
        imageUrl: uploadedImageUrl,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            severity: "success",
            message: res.message,
          });
          handleResetForm();
          handleDeleteImage();
          setEmployeeToUpdate(null);
        })
        .catch((err) => {
          setSnack({
            open: true,
            severity: "error",
            message: err.data?.message || err.data,
          });
        });
    },
    [
      formData,
      handleResetForm,
      saveUser,
      employeeToUpdate,
      uploadedImageUrl,
      handleDeleteImage,
    ]
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData?.name?.trim() &&
        formData?.email?.trim() &&
        formData?.phoneNo?.trim() &&
        formData.selectedRole &&
        formData.selectedHotel
    );
  }, [formData]);

  React.useEffect(() => {
    if (employeeToUpdate) {
      const hotelToSet =
        hotelList.data.find(
          (hotel) => hotel.id === employeeToUpdate.hotelDto.id
        ) || null;
      const roleToSet = roleList.data.find(
        (role) => role === employeeToUpdate.role
      );
      setFormData((prevData) => ({
        ...prevData,
        name: employeeToUpdate.name,
        email: employeeToUpdate.email,
        selectedRole: roleToSet || null,
        selectedRoleInputVal: roleToSet || null,
        selectedHotel: hotelToSet || null,
        selectedHotelInputVal: hotelToSet.name || "",
        phoneNo: employeeToUpdate.phoneNumber,
      }));

      if (employeeToUpdate.imageUrl) {
        setUploadedImageUrl(employeeToUpdate.imageUrl);
        setImagePreviewUrl(employeeToUpdate.imageUrl);
      } else {
        setUploadedImageUrl("");
        setImagePreviewUrl("");
      }
    }
  }, [employeeToUpdate, hotelList.data, roleList.data]);

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
                  Name{" "}
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
            />
          </Grid>
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Phone No{" "}
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
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              inputProps={{
                maxLength: 10,
              }}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              options={roleList.data.filter((item) => item !== SUPER_ADMIN)}
              // options={roleList.data.filter((item) => item !== "Customer")}
              value={formData.selectedRole}
              onChange={(e, newVal) =>
                handleChange({
                  target: { name: "selectedRole", value: newVal },
                })
              }
              inputValue={formData.selectedRoleInputVal}
              onInputChange={(e, newVal) =>
                handleChange({
                  target: {
                    name: "selectedRoleInputVal",
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
                      Select Role{" "}
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
              label={<React.Fragment>Attach document</React.Fragment>}
              type="file"
              name="attachDocument"
              inputProps={{
                style: {
                  opacity: imageFile ? 1 : 0,
                },
                ref: imageRef,
                accept: "image/*",
              }}
              onChange={handleImageChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="primary" onClick={handleAttachmentClick}>
                      <AttachmentIcon sx={{ transform: "rotate(45deg)" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="standard"
              autoComplete="off"
              helperText={
                <>
                  <span style={{ color: "red" }}>*</span> png,jpeg,jpg
                  extensions allowed
                </>
              }
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
              onClick={uploadHandler}
              disabled={!Boolean(imageFile)}
            >
              Upload
            </Button>
          </Grid>
          {uploadedImageUrl && (
            <Grid size={3} sx={{ position: "relative", mt: 2 }}>
              <Box
                component="img"
                src={uploadedImageUrl}
                alt="Uploaded Image"
                sx={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  border: "1px solid #ddd",
                }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "rgba(255,255,255,0.7)",
                }}
                color="error"
                onClick={handleDeleteImage}
              >
                <CloseIcon />
              </IconButton>
            </Grid>
          )}
        </Grid>

        <Box>
          {/* <UploadImageFormComponent
            uploadedImageArr={uploadedImageArr}
            handleUploadImage={handleUploadImage}
            handleDeleteImageFromArray={handleDeleteImageFromArray}
          /> */}
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
            {Boolean(employeeToUpdate) ? "Update User" : "Add User"}
          </Button>
        </Box>
      </Box>
      <EmployeeListTable
        roleList={roleList.data}
        hotelList={hotelList.data}
        setEmployeeToUpdate={setEmployeeToUpdate}
        saveUser={saveUser}
        setSnack={setSnack}
      />
      <LoadingComponent
        open={saveUserRes.isLoading || uploadImageRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default Employee;
