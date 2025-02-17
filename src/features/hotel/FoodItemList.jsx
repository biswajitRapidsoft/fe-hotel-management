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
  IconButton,
  DialogTitle,
  DialogContent,
  // Link,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AttachmentIcon from "@mui/icons-material/Attachment";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";

import { BootstrapDialog } from "../header/Header";

import InfoIcon from "@mui/icons-material/Info";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  useCreateMasterDiningTypeMutation,
  useGetAllMasterDiningTypeQuery,
  useAddFoodItemsMutation,
  useGetFoodTypeQuery,
} from "../../services/dashboard";
import { useUploadFileMutation } from "../../services/hotel";

const FoodItemList = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [formData, setFormData] = React.useState({
    diningType: "",
  });

  const [itemsDialog, setItemsDialog] = React.useState(null);
  const handleCloseViewItemsDialog = React.useCallback(() => {
    setItemsDialog(null);
  }, []);
  const [addMasterDiningType, addMasterDiningTypeMutationRes] =
    useCreateMasterDiningTypeMutation();

  const isFormValid = React.useCallback(() => {
    return Boolean(formData.diningType.trim());
  }, [formData]);

  const handleResetForm = React.useCallback(() => {
    setFormData({
      diningType: "",
    });
  }, []);

  const handleChange = React.useCallback((e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const {
    data: diningTypeList = {
      data: [],
    },
    isLoading,
  } = useGetAllMasterDiningTypeQuery(
    sessionStorage.getItem("hotelIdForFoodItem")
  );

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      addMasterDiningType({
        type: formData.diningType,
        companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
        hotelId: sessionStorage.getItem("hotelIdForFoodItem"),
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
    [addMasterDiningType, formData, handleResetForm]
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
                  Dining Type
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
              name="diningType"
              value={formData.diningType}
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
            Add Dining Type
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
            Dining Type List
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
                <TableCell>Master Dining Type</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {diningTypeList.data.map((item, index) => {
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
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ display: "block" }}
                        size="small"
                        onClick={() => setItemsDialog(item)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent
        open={isLoading || addMasterDiningTypeMutationRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
      <ItemDialog
        open={Boolean(itemsDialog)}
        itemsDialog={itemsDialog}
        handleClose={handleCloseViewItemsDialog}
        setSnack={setSnack}
        // item={item}
      />
    </Container>
  );
};

const ItemDialog = ({ open, itemsDialog, handleClose, setSnack }) => {
  const imageRef = React.useRef(null);
  const [formData, setFormData] = React.useState({
    itemName: "",
    description: "",
    perUnitPrice: "",
    Image: "",
    ImageUrl: "",
    selectedFoodType: null,
    selectedFoodTypeInputVal: "",
  });
  const [uploadedImageArr, setUploadedImageArr] = React.useState([]);

  const [itemToUpdate, setItemToUpdate] = React.useState(null);
  console.log("itemToUpdate", itemToUpdate);

  const {
    data: diningType = {
      data: [],
    },
  } = useGetFoodTypeQuery();

  React.useEffect(() => {
    if (Boolean(itemToUpdate)) {
      setFormData({
        itemName: itemToUpdate.itemName,
        description: itemToUpdate.descriptions,
        perUnitPrice: itemToUpdate.perUnitPrice,
        selectedFoodType: itemToUpdate.foodtype,
        selectedFoodTypeInputVal: itemToUpdate.foodtype,
        ImageUrl: itemToUpdate.image,
      });
      if (itemToUpdate.imageList && itemToUpdate.imageList.length > 0) {
        setUploadedImageArr(itemToUpdate.imageList);
      } else if (itemToUpdate.image) {
        setUploadedImageArr([itemToUpdate.image]);
      }
    }
  }, [itemToUpdate]);

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData?.itemName?.trim() &&
        formData?.description?.trim() &&
        formData?.perUnitPrice &&
        formData?.selectedFoodType
    );
  }, [formData]);

  // const handleClearImage = React.useCallback(() => {
  //   setFormData({
  //     ...formData,
  //     Image: "",
  //     ImageUrl: "",
  //   });
  // }, [formData]);
  const [uploadFile, uploadFileRes] = useUploadFileMutation();
  const [addFoodItem, addFoodItemRes] = useAddFoodItemsMutation();

  const handleChange = React.useCallback((e) => {
    if (e.target.name === "perUnitPrice") {
      setFormData((prevData) => ({
        ...prevData,
        // [e.target.name]: e.target.value.replace(/\D/g, ""),
        [e.target.name]: e.target.value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*?)\..*/g, "$1"),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
  }, []);
  const handleAttachmentClick = React.useCallback(() => {
    if (imageRef.current) {
      imageRef.current.value = "";
    }

    imageRef.current.click();
  }, []);
  const handleResetFormItem = React.useCallback(() => {
    setFormData({
      itemName: "",
      description: "",
      perUnitPrice: "",
      Image: "",
      ImageUrl: "",
      selectedFoodType: null,
      selectedFoodTypeInputVal: "",
    });
    setUploadedImageArr([]);
  }, []);

  const handleUploadImage = React.useCallback(
    (e) => {
      if (Boolean(e.target.files[0])) {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        uploadFile(formData)
          .unwrap()
          .then((res) => {
            setUploadedImageArr((prevData) => [...prevData, res.data]);

            setFormData((prev) => ({
              ...prev,
              ImageUrl: res.data,
            }));
            setSnack({
              open: true,
              message: res.message,
              severity: "success",
            });

            if (imageRef.current) {
              imageRef.current.value = "";
            }
          })
          .catch((err) => {
            setSnack({
              open: true,
              message: err.data?.message || err.data,
              severity: "error",
            });
          });
        if (imageRef.current) {
          imageRef.current.value = "";
        }
      }
    },
    [uploadFile, setSnack]
  );

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      if (Boolean(itemToUpdate)) {
        addFoodItem({
          companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
          hotelId: sessionStorage.getItem("hotelIdForFoodItem"),
          itemName: formData.itemName,
          description: formData.description,
          perUnitPrice: formData.perUnitPrice,
          // imageUrl: formData.ImageUrl,
          imageUrl: uploadedImageArr.join(","),
          masterTypeId: itemsDialog.masterTypeId,
          foodType: formData.selectedFoodType,
          id: itemToUpdate.id,
          isActive: itemsDialog?.isActive,
        })
          .unwrap()
          .then((res) => {
            handleResetFormItem();
            setItemToUpdate(null);

            setSnack({
              open: true,
              severity: "success",
              message: res.message,
            });
            handleClose();
          })
          .catch((err) => {
            setSnack({
              open: true,
              severity: "error",
              message: err.data?.message || err.data,
            });
          });
      } else {
        addFoodItem({
          companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
          hotelId: sessionStorage.getItem("hotelIdForFoodItem"),
          itemName: formData.itemName,
          description: formData.description,
          perUnitPrice: formData.perUnitPrice,
          // imageUrl: formData.ImageUrl,
          imageUrl: uploadedImageArr.join(","),
          masterTypeId: itemsDialog.masterTypeId,
          foodType: formData.selectedFoodType,
        })
          .unwrap()
          .then((res) => {
            handleResetFormItem();
            setSnack({
              open: true,
              severity: "success",
              message: res.message,
            });
            handleClose();
          })
          .catch((err) => {
            setSnack({
              open: true,
              severity: "error",
              message: err.data?.message || err.data,
            });
          });
      }
    },
    [
      addFoodItem,
      formData,
      handleResetFormItem,
      setSnack,
      itemsDialog?.masterTypeId,
      handleClose,
      itemToUpdate,
      uploadedImageArr,
      itemsDialog?.isActive,
    ]
  );

  const handleDeleteImageFromArray = React.useCallback((imgUrl) => {
    setUploadedImageArr((prevImg) => prevImg.filter((url) => url !== imgUrl));

    if (imageRef.current) {
      imageRef.current.value = "";
    }
  }, []);

  const handleDialogClose = React.useCallback(() => {
    handleResetFormItem();
    setItemToUpdate(null);
    setUploadedImageArr([]);
    handleClose();
  }, [handleResetFormItem, handleClose]);

  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="lg"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 5,
            py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.9rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Add Food Item
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleDialogClose}
          sx={{
            position: "absolute",
            right: 30,
            top: 16,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>

        <DialogContent dividers>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 2 }}>
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
                    color: (theme) =>
                      `${theme.palette.primary.main} !important`,
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
                          Item Name
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
                      name="itemName"
                      value={formData.itemName}
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
                          Per unit price
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
                      name="perUnitPrice"
                      value={formData.perUnitPrice}
                      onChange={handleChange}
                      inputProps={{
                        maxLength: 10,
                      }}
                      variant="standard"
                    />
                  </Grid>
                  <Grid size={3}>
                    <Autocomplete
                      // disabled={Boolean(hotelToUpdate)}
                      options={diningType?.data}
                      getOptionLabel={(option) => option}
                      disabled={Boolean(itemToUpdate) ? true : false}
                      value={formData.selectedFoodType}
                      onChange={(e, newVal) =>
                        handleChange({
                          target: { name: "selectedFoodType", value: newVal },
                        })
                      }
                      inputValue={formData.selectedFoodTypeInputVal}
                      onInputChange={(e, newVal) =>
                        handleChange({
                          target: {
                            name: "selectedFoodTypeInputVal",
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
                          disabled={Boolean(itemToUpdate) ? true : false}
                          label={
                            <React.Fragment>
                              Select Food Type{" "}
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
                  {/* <Grid size={3}>
                    {formData?.ImageUrl ? (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Link
                            href={formData.hotelImageUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(formData.ImageUrl, "_blank");
                            }}
                            sx={{ fontSize: 18 }}
                          >
                            Image Logo
                          </Link>
                          <IconButton onClick={handleClearImage}>
                            <ClearIcon
                            //   color={
                            //     Boolean(hotelToUpdate) ? "disabled" : "error"
                            //   }
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
                            accept: "image/*",
                          },

                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  color="primary"
                                  onClick={handleAttachmentClick}
                                >
                                  <AttachmentIcon
                                    sx={{ transform: "rotate(45deg)" }}
                                  />
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                        onChange={handleUploadImage}
                        label={
                          <React.Fragment>
                            Item image{" "}
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
                  </Grid> */}

                  <Grid size={3}>
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
                          accept: "image/*",
                        },

                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                color="primary"
                                onClick={handleAttachmentClick}
                              >
                                <AttachmentIcon
                                  sx={{ transform: "rotate(45deg)" }}
                                />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      onChange={handleUploadImage}
                      label={
                        <React.Fragment>
                          Item image{" "}
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
                  </Grid>
                  <Grid size={12}>
                    <Grid container spacing={2}>
                      {uploadedImageArr.map((item, index) => {
                        return (
                          <Grid
                            size={3}
                            key={item}
                            sx={{ position: "relative" }}
                          >
                            <Box
                              component="img"
                              src={item}
                              alt={`image ${index}`}
                              sx={{
                                width: "100%",
                                height: "100%",
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
                    {Boolean(itemToUpdate)
                      ? "Update Food Item"
                      : "Add Food Item"}
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
                    Item List
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
                        <TableCell>Item Name</TableCell>
                        <TableCell>Food Type</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsDialog?.itemData?.map((item, index) => {
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
                            <TableCell>{item?.itemName}</TableCell>
                            <TableCell>{item?.foodtype}</TableCell>
                            <TableCell>{item?.perUnitPrice}</TableCell>
                            <TableCell>
                              {item?.imageList?.length > 0 ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    //   width: 230,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={item?.imageList[0]}
                                    sx={{ width: 50, height: 50 }}
                                  />
                                  {item.name}
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    //   width: 230,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={item?.image}
                                    sx={{ width: 50, height: 50 }}
                                  />
                                  {item.name}
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => setItemToUpdate(item)}>
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
      </BootstrapDialog>
      <LoadingComponent
        open={uploadFileRes.isLoading || addFoodItemRes.isLoading}
      />
    </>
  );
};

export default FoodItemList;
