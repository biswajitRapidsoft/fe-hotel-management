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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  FormGroup,
} from "@mui/material";
import AttachmentIcon from "@mui/icons-material/Attachment";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import RoomTypeTable from "./RoomTypeTable";

import { useGetAllExtraItemsQuery } from "../../services/extraItem";

import { useUploadFileMutation } from "../../services/hotel";

import {
  useAddRoomTypeMutation,
  useGetPerRewardPointValueQuery,
} from "../../services/roomType";

import LoadingComponent from "../../components/LoadingComponent";

import SnackAlert from "../../components/Alert";
import { ADMIN } from "../../helper/constants";

const RoomType = () => {
  const {
    data: pricePerPoint = {
      data: 0,
    },
  } = useGetPerRewardPointValueQuery();
  const [uploadImage, uploadImageRes] = useUploadFileMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    severity: "",
    message: "",
  });
  const [addRoomType, addRoomTypeRes] = useAddRoomTypeMutation();
  const [formData, setFormData] = React.useState({
    roomType: "",
    description: "",
    capacity: "",
    basePrice: "",
    advanceAmount: "",
    isAdvance: false,
    rewardPoints: "",
  });

  console.log("formDataMain", formData);
  const [extraItemsArr, setExtraItemsArr] = React.useState([]);
  const [uploadedImageArr, setUploadedImageArr] = React.useState([]);
  const {
    data: extraItemList = {
      data: [],
    },
    isLoading,
  } = useGetAllExtraItemsQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
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

  const handleChange = React.useCallback((e) => {
    if (
      ["capacity", "basePrice", "advanceAmount", "rewardPoints"].includes(
        e.target.name
      )
    ) {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value.replace(/\D/g, ""),
      }));
    } else if (e.target.type === "checkbox") {
      if (e.target.name === "isAdvance") {
        setFormData((prevData) => ({
          ...prevData,
          advanceAmount: "",
          [e.target.name]: e.target.checked,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [e.target.name]: e.target.checked,
        }));
      }
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
    setUploadedImageArr([]);
  }, []);

  // const isFormValid = React.useCallback(() => {
  //   return Boolean(
  //     formData.roomType.trim() &&
  //       formData.description.trim() &&
  //       formData.capacity.trim() &&
  //       formData.basePrice.trim() &&
  //       formData.isAdvance
  //       ? formData.advanceAmount.trim()
  //       : true && formData.rewardPoints
  //   );
  // }, [formData]);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.roomType.trim() &&
        formData.description.trim() &&
        formData.capacity.trim() &&
        formData.basePrice.trim() &&
        formData.rewardPoints.trim() &&
        (!formData.isAdvance || formData.advanceAmount.trim())
    );
  }, [formData]);

  console.log("isFormValid", isFormValid);
  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      if (parseInt(formData.rewardPoints) > 200) {
        return setSnack({
          open: true,
          severity: "error",
          message: "Reward Points can be up to 200.",
        });
      } else if (
        parseInt(formData.advanceAmount) > parseInt(formData.basePrice)
      ) {
        return setSnack({
          open: true,
          severity: "error",
          message: "Advance amount cannot be greater than base price.",
        });
      }

      addRoomType({
        type: formData.roomType,
        description: formData.description,
        capacity: formData.capacity,
        basePrice: formData.basePrice,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
        isAdvanceRequired: formData.isAdvance,
        advanceAmount: formData.advanceAmount,
        rewardsPoints: formData.rewardPoints,
        imageUrl: uploadedImageArr.join(","),
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
      handleResetForm();
    },
    [formData, handleResetForm, addRoomType, extraItemsArr, uploadedImageArr]
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
          {formData.isAdvance && (
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
          )}
          <Grid size={3}>
            <TextField
              label={
                <React.Fragment>
                  Reward Points{" "}
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
              name="rewardPoints"
              value={formData.rewardPoints}
              onChange={handleChange}
              variant="standard"
              helperText={
                formData.rewardPoints &&
                `Rs. ${(
                  parseFloat(formData.rewardPoints) * pricePerPoint.data
                ).toFixed(2)}`
              }
            />
          </Grid>
        </Grid>
        <Box>
          <ExtraItemFormComponent
            extraItemList={extraItemList.data}
            extraItemsArr={extraItemsArr}
            setExtraItemsArr={setExtraItemsArr}
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
            Add Room Type
          </Button>
        </Box>
      </Box>
      <RoomTypeTable />
      <LoadingComponent
        open={isLoading || addRoomTypeRes.isLoading || uploadImageRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export function UploadImageFormComponent({
  uploadedImageArr,
  handleUploadImage,
  handleDeleteImageFromArray,
}) {
  const [image, setImage] = React.useState("");
  const imageRef = React.useRef(null);
  const handleAttachmentClick = React.useCallback(() => {
    imageRef.current.click();
  }, []);

  const uploadHandler = React.useCallback(() => {
    handleUploadImage(imageRef.current.files[0]);
    imageRef.current.value = "";
    setImage("");
  }, [handleUploadImage]);
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
          Upload Image
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "#BDBDBD" }} />
      <Box sx={{ p: 2, border: "1px solid #BDBDBD" }}>
        <Grid container spacing={2}>
          <Grid size={3}>
            <TextField
              label={<React.Fragment>Attach document</React.Fragment>}
              type="file"
              name="attachDocument"
              inputProps={{
                style: {
                  opacity: image ? 1 : 0,
                },
                ref: imageRef,
                accept: "image/*",
              }}
              onChange={(e) => setImage(e.target.value)}
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
            />
          </Grid>
          <Grid size={9}>
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
              disabled={!Boolean(image)}
            >
              Upload
            </Button>
          </Grid>
          <Grid size={12}>
            <Grid container spacing={2}>
              {uploadedImageArr.map((item, index) => {
                return (
                  <Grid size={3} key={item} sx={{ position: "relative" }}>
                    <Box
                      component="img"
                      src={item}
                      alt={`image ${index}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "red",
                      }}
                    />
                    <IconButton
                      sx={{ position: "absolute", right: 1 }}
                      color="error"
                      onClick={() => handleDeleteImageFromArray(item)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
}

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
          {/* <Grid size={3}>
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
          </Grid> */}
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
