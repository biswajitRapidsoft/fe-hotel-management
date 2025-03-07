import React from "react";

import {
  Autocomplete,
  Box,
  Button,
  Container,
  DialogContent,
  DialogTitle,
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
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import AttachmentIcon from "@mui/icons-material/Attachment";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditIcon from "@mui/icons-material/Edit";

import {
  useGetBarItemTypeByCompanyIdQuery,
  useAddBarMasterDiningTypeMutation,
  useGetBarSubmenuTypeByMenuIdQuery,
  useUploadFileMutation,
  useSaveBarItemMutation,
} from "../../services/hotel";
import LoadingComponent from "../../components/LoadingComponent";

import SnackAlert from "../../components/Alert";
import { BootstrapDialog } from "../header/Header";

const BarItemList = () => {
  const {
    data: barMenuTypeList = {
      data: [],
    },
    isLoading,
  } = useGetBarItemTypeByCompanyIdQuery({
    hotelId: sessionStorage.getItem("hotelIdForBarItem"),
    companyId: JSON.parse(sessionStorage.getItem("data")).companyId,
  });

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [formData, setFormData] = React.useState({
    diningType: "",
  });
  const [barItemTypeToUpdate, setBarItemTypeToUpdate] = React.useState(null);

  React.useEffect(() => {
    if (Boolean(barItemTypeToUpdate)) {
      setFormData({
        diningType: barItemTypeToUpdate?.menuName,
      });
    }
  }, [barItemTypeToUpdate]);
  const [itemsDialog, setItemsDialog] = React.useState(null);

  const [addBarMasterDineType, addBarMasterDineTypeRes] =
    useAddBarMasterDiningTypeMutation();

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

  const handleCloseItemsDialog = React.useCallback(() => {
    setItemsDialog(null);
  }, []);

  const handleChangeStatus = React.useCallback(
    (e, item) => {
      const payload = {
        menuName: item?.menuName,
        company: JSON.parse(sessionStorage.getItem("data")).companyId,
        id: item?.id,
        isActive: e.target.checked,
      };
      addBarMasterDineType(payload)
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
    [addBarMasterDineType, barItemTypeToUpdate]
  );

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      addBarMasterDineType({
        menuName: formData.diningType,
        // hotelId: { id: sessionStorage.getItem("hotelIdForBarItem") },
        company: JSON.parse(sessionStorage.getItem("data")).companyId,
        id: Boolean(barItemTypeToUpdate) ? barItemTypeToUpdate?.id : "",
        isActive: Boolean(barItemTypeToUpdate)
          ? barItemTypeToUpdate?.isActive
          : "",
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
    [addBarMasterDineType, formData, handleResetForm]
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
                  Bar Item Type
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
            {Boolean(barItemTypeToUpdate)
              ? "Update Bar Item Type"
              : "Add Bar Item Type"}
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
            Bar Item Type List
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
                <TableCell>Bar Item Type</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {barMenuTypeList.data.map((item, index) => {
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
                    <TableCell>{item.menuName}</TableCell>
                    <TableCell>
                      <IconButton
                        sx={{ display: "block" }}
                        size="small"
                        onClick={() => setItemsDialog(item)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Switch
                        color="success"
                        checked={item?.isActive}
                        onChange={(e) => handleChangeStatus(e, item)}
                      />
                      <IconButton onClick={() => setBarItemTypeToUpdate(item)}>
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
      <ItemDialog
        open={Boolean(itemsDialog)}
        itemsDialog={itemsDialog}
        handleClose={handleCloseItemsDialog}
        setSnack={setSnack}
      />
      <LoadingComponent open={isLoading || addBarMasterDineTypeRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

const ItemDialog = ({ open, itemsDialog, handleClose, setSnack }) => {
  const {
    data: barSubMenuList = {
      data: [],
    },
  } = useGetBarSubmenuTypeByMenuIdQuery(itemsDialog?.id || null, {
    skip: !Boolean(itemsDialog),
  });

  const [saveBarItem, saveBarItemRes] = useSaveBarItemMutation();

  const [uploadFile, uploadFileRes] = useUploadFileMutation();

  const [itemToUpdate, setItemToUpdate] = React.useState(null);

  const imageRef = React.useRef(null);
  const [formData, setFormData] = React.useState({
    itemName: "",
    perUnitPrice: "",
    Image: "",
    ImageUrl: "",
    selectedFoodType: null,
    selectedFoodTypeInputVal: "",
    // consumeType: null,
    // consumeTypeInputVal: "",
    consumeType: "Food",
  });

  const [uploadedImageArr, setUploadedImageArr] = React.useState([]);

  const handleCheckboxChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      consumeType: e.target.value,
    }));
  };
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
      perUnitPrice: "",
      Image: "",
      ImageUrl: "",
      selectedFoodType: null,
      selectedFoodTypeInputVal: "",
      consumeType: null,
      consumeTypeInputVal: "",
    });
    setUploadedImageArr([]);
  }, []);

  const handleDeleteImageFromArray = React.useCallback((imgUrl) => {
    setUploadedImageArr((prevImg) => prevImg.filter((url) => url !== imgUrl));

    if (imageRef.current) {
      imageRef.current.value = "";
    }
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

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.itemName.trim() &&
        formData.perUnitPrice &&
        // formData.selectedFoodType &&
        formData.consumeType
    );
  }, [formData]);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      saveBarItem({
        id: itemToUpdate ? itemToUpdate.id : null,
        name: formData.itemName,
        imageUrl: uploadedImageArr.join(", "),
        price: formData.perUnitPrice,
        consumeType: formData.consumeType,
        // foodType: "Alcoholic",
        // subMenuId: formData.selectedFoodType.id,
        subMenuId: 1,
        hotelId: sessionStorage.getItem("hotelIdForBarItem"),
        isActive: itemToUpdate ? itemToUpdate.isActive : null,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleResetFormItem();
          setItemToUpdate(null);
          handleClose();
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
      formData,
      saveBarItem,
      uploadedImageArr,
      setSnack,
      handleResetFormItem,
      handleClose,
      itemToUpdate,
    ]
  );

  React.useEffect(() => {
    if (itemToUpdate) {
      setFormData({
        itemName: itemToUpdate.name,
        perUnitPrice: itemToUpdate.price,
        Image: "",
        ImageUrl: "",
        selectedFoodType:
          barSubMenuList.data.find(
            (foodType) => foodType.id === itemToUpdate.barSubMenuCategory.id
          ) || null,
        selectedFoodTypeInputVal:
          barSubMenuList.data.find(
            (foodType) => foodType.id === itemToUpdate.barSubMenuCategory.id
          )?.name || "",
        consumeType: itemToUpdate.consumeType,
        consumeTypeInputVal: itemToUpdate.consumeType,
      });
      setUploadedImageArr(
        itemToUpdate.imageUrl ? itemToUpdate.imageUrl.split(", ") : []
      );
    }
  }, [itemToUpdate, barSubMenuList.data]);

  return (
    <BootstrapDialog
      open={open}
      onClose={handleClose}
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
            fontSize: "1.5rem",
            fontFamily: "sans-serif",
          }}
        >
          Add Bar Item
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
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
        <Box sx={{ p: 3 }}>
          {/* form section */}
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
              {/* <Grid size={3}>
                <Autocomplete
                  // disabled={Boolean(hotelToUpdate)}
                  options={barSubMenuList.data}
                  getOptionLabel={(option) => option.name}
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
                      //   disabled={Boolean(itemToUpdate) ? true : false}
                      label={
                        <React.Fragment>
                          Select Item Type{" "}
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

              <Grid size={6}>
                {/* <FormGroup row> */}
                <Box
                  sx={{
                    display: "flex",
                    //  justifyContent: "space-evenly"
                    gap: 2,
                    pl: 2,
                    alignItems: "center",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.consumeType === "Drink"}
                        onChange={handleCheckboxChange}
                        value="Drink"
                      />
                    }
                    label="Drink"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.consumeType === "Food"}
                        onChange={handleCheckboxChange}
                        value="Food"
                      />
                    }
                    label="Food"
                  />
                </Box>
                {/* </FormGroup> */}
              </Grid>
              {/* <Grid size={3}>
                <Autocomplete
                  // disabled={Boolean(hotelToUpdate)}
                  options={["Drink", "Food"]}
                  getOptionLabel={(option) => option}
                  disabled={Boolean(itemToUpdate) ? true : false}
                  value={formData.consumeType}
                  onChange={(e, newVal) =>
                    handleChange({
                      target: { name: "consumeType", value: newVal },
                    })
                  }
                  inputValue={formData.consumeTypeInputVal}
                  onInputChange={(e, newVal) =>
                    handleChange({
                      target: {
                        name: "consumeTypeInputVal",
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
                      //   disabled={Boolean(itemToUpdate) ? true : false}
                      label={
                        <React.Fragment>
                          Select Consume Type{" "}
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
                      <Grid size={3} key={item} sx={{ position: "relative" }}>
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
                {Boolean(itemToUpdate) ? "Update Bar Item" : "Add Bar Item"}
              </Button>
            </Box>

            {/* table section */}
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
                      <TableCell>Item Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Image</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemsDialog?.barItemList?.map((item, index) => {
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
                          <TableCell>
                            {item?.barSubMenuCategory?.name}
                          </TableCell>
                          <TableCell>{item?.price}</TableCell>
                          <TableCell>
                            {item?.imageUrl ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  //   width: 230,
                                }}
                              >
                                {item.imageUrl.split(", ").map((imgUrl) => {
                                  return (
                                    <Box
                                      key={imgUrl}
                                      component="img"
                                      src={item?.imageUrl.split(", ")[0]}
                                      sx={{ width: 50, height: 50 }}
                                    />
                                  );
                                })}
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
      <LoadingComponent
        open={uploadFileRes.isLoading || saveBarItemRes.isLoading}
      />
    </BootstrapDialog>
  );
};

export default BarItemList;
