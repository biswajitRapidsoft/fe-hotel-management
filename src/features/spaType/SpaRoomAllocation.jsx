import React from "react";

import {
  Autocomplete,
  Box,
  Checkbox,
  Container,
  Grid2 as Grid,
  TextField,
  Paper,
  Button,
  TableContainer,
  Toolbar,
  Typography,
  Table,
  TableCell,
  TableBody,
  TableRow,
  TableHead,
  Chip,
  Stack,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

import { checkedIcon, icon } from "./SpaType";
import {
  useGetAllSpaTypeQuery,
  useSaveSpaRoomMutation,
  useGetSpaRoomsQuery,
} from "../../services/spa";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const SpaRoomAllocation = () => {
  const {
    data: spaRooms = {
      data: [],
    },
    isLoading,
  } = useGetSpaRoomsQuery(sessionStorage.getItem("hotelIdForSpaType"));
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [saveSpaRoom, saveSpaRomRes] = useSaveSpaRoomMutation();
  const {
    data: spaTypeList = {
      data: [],
    },
  } = useGetAllSpaTypeQuery({
    hotelId: JSON.parse(sessionStorage.getItem("hotelIdForSpaType")),
    isActive: null,
  });

  const [formData, setFormData] = React.useState({
    name: "",
    spaTypeList: [],
  });

  const handleResetForm = React.useCallback(() => {
    setFormData({
      name: "",
      spaTypeList: [],
    });
  }, []);

  const handleChange = React.useCallback((name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const isFormValid = React.useCallback(() => {
    return Boolean(formData.name.trim() && formData.spaTypeList.length);
  }, [formData]);

  const handleSubmit = React.useCallback(
    (e) => {
      e.preventDefault();
      saveSpaRoom({
        hotelId: JSON.parse(sessionStorage.getItem("hotelIdForSpaType")),
        name: formData.name,
        capacity: 1,
        spaIds: formData.spaTypeList.map((spaType) => spaType.id),
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
    [saveSpaRoom, formData, handleResetForm]
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
                  Room Name{" "}
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
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              variant="standard"
            />
          </Grid>
          <Grid size={3}>
            <Autocomplete
              multiple
              limitTags={1}
              disableCloseOnSelect
              options={spaTypeList.data}
              getOptionLabel={(option) => option.name}
              value={formData.spaTypeList}
              onChange={(e, newVal) => handleChange("spaTypeList", newVal)}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.name}
                </li>
              )}
              // renderTags={(list) => list.map((item) => item.name).join(", ")}
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
                      Select Spa Types{" "}
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
            Add Room
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Spa Room List
            </Typography>
          </Box>
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
                <TableCell>Room Name</TableCell>
                <TableCell>Spa Types</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaRooms.data.map((spaRoom, index) => {
                return (
                  <TableRow key={spaRoom.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{spaRoom.name}</TableCell>
                    <TableCell>
                      <Stack gap={1} direction="row">
                        {spaRoom.spaTypeList.map((spaType) => {
                          return (
                            <Chip label={spaType.name} key={spaType.name} />
                          );
                        })}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={saveSpaRomRes.isLoading || isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Container>
  );
};

export default SpaRoomAllocation;
