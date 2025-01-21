import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Collapse,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LiquorIcon from "@mui/icons-material/Liquor";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import RestaurantIcon from "@mui/icons-material/Restaurant";

import Grid from "@mui/material/Grid2";
import {
  AVAILABLE,
  BEING_SERVICED,
  FRONTDESK,
  NOT_AVAILABLE,
  OCCUPIED,
  RESERVED,
} from "../../helper/constants";
import {
  DatePicker,
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { styled } from "@mui/system";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TbBed } from "react-icons/tb";
import { PiBedFill } from "react-icons/pi";
import { MdOutlineDisabledByDefault } from "react-icons/md";
import { MdBookmarkAdded } from "react-icons/md";
import { MdCleaningServices } from "react-icons/md";
import { BsFillBuildingFill } from "react-icons/bs";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useBookingByFrontDeskStaffMutation,
  useFinalRoomCheckOutMutation,
  useGetAllGovtIdsQuery,
  useGetAllPaymentMethodsQuery,
  useGetAllRoomListByHotelIdQuery,
  useGetPendingBookingRequestCountsQuery,
  useGetTodayCheckoutRoomsByHotelIdQuery,
  useRequestRoomCheckoutMutation,
  useRoomCleanRequestMutation,
  useRoomtypeByHotelIdQuery,
  useSaveCustomerCheckInMutation,
} from "../../services/dashboard";
import { checkRoomStatusType } from "../../helper/helperFunctions";
import moment from "moment";
import { BootstrapDialog } from "../header/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOM from "react-dom";
import dayjs from "dayjs";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import Swal from "sweetalert2";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useNavigate } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";
import { PaymentDialog } from "./GuestDashboard";
import { useCancelRoomBookingFromBookingHistoryMutation } from "../../services/frontdeskBookingHistory";

export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

const styles = {
  headerText: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: 0.7,
    padding: "5px 5px",
  },
  frontPolygonContainer: {
    position: "absolute",
    width: "85%",
    height: "100%",
    zIndex: 1,
  },
  foldLineShape: (foldLineShapeBgColor) => ({
    backgroundColor: foldLineShapeBgColor,
    width: "100%",
    height: "30%",
    clipPath: `polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0% 100%`,
  }),

  bottomPolygonShape: (bottomPolygonShapeBgColor) => ({
    backgroundColor: bottomPolygonShapeBgColor,
    width: "100%",
    height: "70%",
    clipPath: `polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0% 100%)`,
  }),
  headerShape: () => ({
    backgroundColor: "white",
    // width: "100%",
    // height: "90%",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "none",
    width: "100%",
    height: "100%",
    position: "relative",
    clipPath: `polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0% 100%)`,
  }),

  topPolygonShape: (topPolygonBgImage) => ({
    backgroundImage: topPolygonBgImage,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    height: "73%",
    position: "absolute",
    zIndex: 2,
    clipPath: `polygon(0 0, calc(100% - 10px) 0, calc(100% - 30px) 100%, 0% 100%)`,
  }),
};

export const CustomPolygonHeader = ({
  text,
  // topPolygonBgImage = "linear-gradient(to bottom, #b16aff, #9a58e8, #8347d1, #6c35ba, #5624a4)",
  topPolygonBgImage = "linear-gradient(to bottom, #b463ff, #944ddf, #7539c0, #5624a1, #380f83)",
  foldLineShapeBgColor = "#40187F",
  bottomPolygonShapeBgColor = "#c289ff",
}) => {
  return (
    <Paper
      elevation={4}
      style={{
        ...styles.headerShape(),
      }}
    >
      <div style={styles.frontPolygonContainer}>
        <div
          style={{
            ...styles.topPolygonShape(topPolygonBgImage),
          }}
        >
          <Typography style={styles.headerText}>{text}</Typography>
        </div>
        <div
          style={{
            ...styles.foldLineShape(foldLineShapeBgColor),
          }}
        />
      </div>

      <div style={{ width: "100%", height: "30%" }} />

      <div
        style={{
          ...styles.bottomPolygonShape(bottomPolygonShapeBgColor),
        }}
      />
    </Paper>
  );
};

function getRoomStatusColor(key) {
  switch (key) {
    case "Available":
      return { color: "#3db7ff", bgcolor: "#c9ebff" };
    case "Reserved":
      return { color: "#ffa83a", bgcolor: "#ffe3c0" };
    case "Occupied":
      return { color: "#14b85c", bgcolor: "#b4ffd6" };
    case "Not Available":
      return { color: "#ff5353", bgcolor: "#ffc0c0" };
    case "Being Serviced":
      return { color: "#b200ff", bgcolor: "#efcaff" };
    default:
      return { color: "#cccccc", bgcolor: "#ffffff" };
  }
}

function calculateNumberOfDaysOfStay({ checkOutDate, fromDate, toDate }) {
  if (checkOutDate) {
    const startDate = dayjs().startOf("day");
    const endDate = dayjs(checkOutDate).startOf("day");
    const diff = endDate.diff(startDate, "day") + 1;
    return diff > 0 ? diff : 0;
  } else if (fromDate && toDate) {
    const startDate = dayjs(fromDate).startOf("day");
    const endDate = dayjs(toDate).startOf("day");
    const diff = endDate.diff(startDate, "day") + 1;
    return diff > 0 ? diff : 0;
  }
  return 0;
}

function calculateAccumulatedRoomCharge({ basePrice, daysOfStay }) {
  const finalBasePrice = basePrice || 0;
  return finalBasePrice * daysOfStay;
}

const tempRoomFilterVisibleButtonData = [
  { id: 6, icon: <BsFillBuildingFill />, name: "All" },
  { id: 2, icon: <PiBedFill />, name: AVAILABLE?.key },
  { id: 3, icon: <MdBookmarkAdded />, name: RESERVED?.key },
  { id: 4, icon: <TbBed />, name: OCCUPIED?.key },
  { id: 5, icon: <MdCleaningServices />, name: BEING_SERVICED?.key },
  { id: 6, icon: <MdOutlineDisabledByDefault />, name: NOT_AVAILABLE?.key },
];

const CustomInventoryTable = memo(function ({ inventoryData }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        overflow: "auto",
        maxHeight: {
          xs: "135px",
          // xl: "calc(100vh - 280px)",
          "&::-webkit-scrollbar": {
            // height: "14px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#ffffff00",
            width: "none",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#280071",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#3b0b92",
          },
        },
      }}
    >
      <Table aria-label="simple table" stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                color: "white",
                backgroundColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Sl No.
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                backgroundColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Product
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                backgroundColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Quantity
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                color: "white",
                backgroundColor: "primary.main",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Price
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventoryData?.map((item, index) => {
            return (
              <TableRow key={`tr-${index}`}>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.itemName || ""}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.noOfItems || 0}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.totalPrice || 0}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell
              colSpan={2}
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                minHeight: "100%",
                borderTop: "1px solid #ccc",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                  // borderTop: "1px solid #ccc",
                  minHeight: "24.9px",
                }}
              >
                {" "}
              </Typography>
            </TableCell>
            <TableCell
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                borderTop: "1px solid #ccc",
              }}
              colSpan={1}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  // borderTop: "1px solid #ccc",
                }}
              >
                Total
              </Typography>
            </TableCell>
            <TableCell
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                borderTop: "1px solid #ccc",
              }}
              colSpan={1}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "13px",
                  // borderTop: "1px solid #ccc",
                }}
              >
                {inventoryData?.reduce(
                  (sum, item) => sum + (item?.totalPrice || 0),
                  0
                )}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
});

const CustomRoomFilters = memo(function ({
  roomFilters,
  handleChangeRoomFilters,
  floorData,
  roomTypes,
  roomData,
}) {
  const navigate = useNavigate();
  const handleChangeRoomFiltersOnChange = useCallback(
    (name, value) => {
      handleChangeRoomFilters(name, value);
    },
    [handleChangeRoomFilters]
  );

  const checkStatusTypeRoomCount = useCallback(() => {
    const allRooms = roomData?.flatMap((floor) => floor?.roomDto) || [];

    const counts = {
      All: 0,
      [AVAILABLE?.key]: 0,
      [RESERVED?.key]: 0,
      [OCCUPIED?.key]: 0,
      [BEING_SERVICED?.key]: 0,
      [NOT_AVAILABLE?.key]: 0,
    };
    counts.All = allRooms?.length || 0;

    allRooms.forEach((room) => {
      const status = checkRoomStatusType(room);

      if (status && status.key) {
        counts[status.key] = (counts[status.key] || 0) + 1;
      }
    });

    return counts;
  }, [roomData]);

  const finalCount = checkStatusTypeRoomCount();

  return (
    <Box
      sx={{
        // marginTop: "1rem",
        width: "100%",
      }}
    >
      <Grid container size={12} columnSpacing={0.5} rowSpacing={1}>
        {/* <Grid size={{ xs: 3, lg: 2.2, xl: 1.7 }}> */}
        <Grid>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={roomFilters?.toDate}
              onChange={(newVal) =>
                handleChangeRoomFiltersOnChange("toDate", newVal)
              }
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  // readOnly: true,
                  clearable: true,
                  onKeyDown: (e) => {
                    e.preventDefault();
                  },
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      width: 200,
                      height: 35,
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      color: "#B4B4B4",
                    },
                    "& .MuiTextField-root": {
                      width: "100%",
                      backgroundColor: "transparent",
                    },
                    "& .MuiFormLabel-root": {
                      color: (theme) => theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: 18,
                    },
                  },
                },
              }}
              slots={{
                openPickerIcon: StyledCalendarIcon,
              }}
              format="DD/MM/YYYY"
            />
          </LocalizationProvider>
        </Grid>
        <Grid>
          <Box
            sx={{
              ".MuiTextField-root": {
                width: "100%",
                backgroundColor: "transparent",
                ".MuiInputBase-root": {
                  color: "#B4B4B4",
                  background: "rgba(255, 255, 255, 0.25)",
                },
              },
              ".MuiFormLabel-root": {
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
                fontSize: 14,
              },
              ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              "& .MuiOutlinedInput-root": {
                height: "35px",
                minHeight: "35px",
              },
              "& .MuiInputBase-input": {
                padding: "13px",
                height: "100%",
                boxSizing: "border-box",
                fontSize: "13px",
              },
            }}
          >
            <Autocomplete
              options={floorData || []}
              disableClearable
              fullWidth
              value={
                roomFilters.floor ||
                (floorData.length > 0 ? floorData[0] : null)
              }
              onChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("floor", newVal)
              }
              inputValue={roomFilters.floorInputVal}
              onInputChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("floorInputVal", newVal)
              }
              getOptionLabel={(option) =>
                option?.key === "all"
                  ? option?.name
                  : `Floor ${option?.floorNo}`
              }
              clearOnEscape
              disablePortal
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
                // width: 200,
                ".MuiInputBase-root": {
                  color: "#fff",
                },
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
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      maxHeight: "150px",
                      overflow: "auto",
                    },
                    "& .MuiAutocomplete-option": {
                      fontSize: "13px",
                    },
                  },
                },
              }}
              size="small"
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      width: 200,
                      height: 35,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid>
          <Box
            sx={{
              ".MuiTextField-root": {
                width: "100%",
                backgroundColor: "transparent",
                ".MuiInputBase-root": {
                  color: "#B4B4B4",
                  background: "rgba(255, 255, 255, 0.25)",
                },
              },
              ".MuiFormLabel-root": {
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
                fontSize: 14,
              },
              ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                borderBottom: (theme) =>
                  `1px solid ${theme.palette.primary.main}`,
              },
              "& .MuiOutlinedInput-root": {
                height: "35px",
                minHeight: "35px",
              },
              "& .MuiInputBase-input": {
                padding: "13px",
                height: "100%",
                boxSizing: "border-box",
                fontSize: "13px",
              },
            }}
          >
            <Autocomplete
              options={roomTypes || []}
              // disableClearable
              fullWidth
              value={roomFilters?.roomType || null}
              onChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("roomType", newVal)
              }
              inputValue={roomFilters.roomTypeInputVal}
              onInputChange={(e, newVal) =>
                handleChangeRoomFiltersOnChange("roomTypeInputVal", newVal)
              }
              getOptionLabel={(option) =>
                option?.type
                  ?.replace(/_/g, " ")
                  ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                  ?.replace(/\b\w/g, (char) => char.toUpperCase()) || ""
              }
              clearOnEscape
              disablePortal
              popupIcon={<KeyboardArrowDownIcon color="primary" />}
              sx={{
                // width: 200,
                ".MuiInputBase-root": {
                  color: "#fff",
                },
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
              componentsProps={{
                popper: {
                  sx: {
                    "& .MuiAutocomplete-listbox": {
                      maxHeight: "150px",
                      overflow: "auto",
                    },
                    "& .MuiAutocomplete-option": {
                      fontSize: "13px",
                    },
                  },
                },
              }}
              size="small"
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
                  label="Room Type"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      width: 200,
                      height: 35,
                    },
                  }}
                />
              )}
            />
          </Box>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/frontdeskBookingHistory")}
            sx={{
              fontSize: "10px",
              // wordWrap: "break-word",
              // wordBreak: "break-all",
              // whiteSpace: "none",
              // paddingX: "0.65px",
              paddingY: "8px",
              backgroundImage:
                "linear-gradient(to right, #a4508b 0%, #5f0a87 100%)",
              color: "white",
              "&:hover": {
                backgroundImage:
                  "linear-gradient(to right, #a4508b 10%, #5f0a87 90%)",
              },
            }}
          >
            Booking History
          </Button>
        </Grid>
        {/* <Grid size={{ xs: 0, xl: 1 }} /> */}
        <Grid size={12}>
          <Box
            sx={{
              width: "100%",
              // bgcolor: { sm: "red", md: "orange", lg: "cyan", xl: "red" },
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {tempRoomFilterVisibleButtonData?.map((item, index) => {
              return (
                <Box
                  key={`Floor Filter ${index}`}
                  sx={{
                    minHeight: "35px",
                    display: "flex",
                    fontWeight: 600,
                    userSelect: "none",
                    paddingX: "7px",
                    whiteSpace: "nowrap",
                    borderLeft: "1px solid #A9A9A9",
                    gap: "5px",
                    bgcolor:
                      item?.name === "All"
                        ? ""
                        : roomFilters?.selectedRoomStatus === item?.name
                        ? "#eedeff"
                        : "",
                    height: "100%",
                    "&:hover": {
                      cursor: "pointer",
                      bgcolor:
                        item?.name === "All"
                          ? "#f1e4ff"
                          : roomFilters?.selectedRoomStatus === item?.name
                          ? "#eedeff"
                          : "#f1e4ff",
                      userSelect: "none",
                    },
                  }}
                  onClick={() =>
                    handleChangeRoomFiltersOnChange(
                      "selectedRoomStatus",
                      item?.name
                    )
                  }
                >
                  <Box
                    sx={{
                      overflow: "hidden", // Prevents content from visually overflowing
                      maxWidth: "100%",
                      // bgcolor: "red",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        letterSpacing: 1,
                        fontSize: "13.5px",
                        fontWeight: 550,
                        // whiteSpace: "normal", // Ensures text wraps properly
                        // wordWrap: "break-word",
                        // wordBreak: "break-word",
                        // overflowWrap: "break-word",
                      }}
                    >
                      {item?.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          // flexDirection: "column",
                          fontSize: "20px",
                          // bgcolor: "cyan",
                          justifyContent: "flex-start",
                          // alignItems: "center",
                          color:
                            item?.name === AVAILABLE.key
                              ? "hsla(202, 100%, 73%, 0.99)"
                              : item?.name === RESERVED.key
                              ? "hsla(32, 98%, 65%, 0.99)"
                              : item?.name === OCCUPIED.key
                              ? "hsla(140, 100%, 36%, 0.99)"
                              : item?.name === NOT_AVAILABLE.key
                              ? "hsla(0, 100%, 65%, 0.99)"
                              : item?.name === BEING_SERVICED.key
                              ? "hsla(281, 100%, 63%, 0.99)"
                              : "hsla(0, 0%, 17%, 0.99)",
                        }}
                      >
                        {item?.icon}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 550,
                          lineHeight: 0.1,
                          // marginTop: "-8px",
                          color:
                            item?.name === AVAILABLE.key
                              ? "hsla(202, 100%, 73%, 0.99)"
                              : item?.name === RESERVED.key
                              ? "hsla(32, 98%, 65%, 0.99)"
                              : item?.name === OCCUPIED.key
                              ? "hsla(140, 100%, 36%, 0.99)"
                              : item?.name === NOT_AVAILABLE.key
                              ? "hsla(0, 100%, 65%, 0.99)"
                              : item?.name === BEING_SERVICED.key
                              ? "hsla(281, 100%, 63%, 0.99)"
                              : "hsla(0, 0%, 17%, 0.99)",
                          letterSpacing: 1,
                        }}
                      >
                        {finalCount[item?.name] || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

const CustomFloorAccordion = memo(function ({
  floorData,
  isSelectedRoom,
  handleRoomSelect,
  roomFilters,
}) {
  console.log("floor row Data : ", floorData);
  return (
    <>
      <Box sx={{ width: "100" }}>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "none",
            "&.Mui-expanded": {
              boxShadow: "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
              gap: 2,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                left: 1,
                width: 24,
                height: 24,
                boxShadow: "1.5px 1.5px 3px 0px rgba(197, 51, 255, 0.6)",
                backgroundImage:
                  "linear-gradient(to right bottom, #d139fc, #b32edc, #9722bc, #7b179d, #610b7f)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: "4px",
                zIndex: 2,
              }}
            />
            <Box sx={{ width: "98.5%", ml: 1.3 }}>
              <Paper
                elevation={3}
                sx={{
                  position: "relative",
                  py: "5px",
                  pl: 2.5,
                  borderRadius: "5px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  sx={{
                    // borderBottom: "2px solid #ccc",
                    minHeight: "unset",
                    height: "35px",
                    maxHeight: "35px",
                    "&.Mui-expanded": {
                      minHeight: "unset",
                      height: "35px",
                      maxHeight: "35px",
                    },
                  }}
                >
                  <Typography
                    sx={{ fontWeight: 550, letterSpacing: 1, fontSize: "18px" }}
                  >
                    {`Floor ${floorData?.floorNo}`}
                  </Typography>
                </AccordionSummary>
              </Paper>
            </Box>
          </Box>
          {/* <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{
              // borderBottom: "2px solid #ccc",
              minHeight: "unset",
              height: "35px",
              maxHeight: "35px",
              bgcolor: "#e3e3e3",
              "&.Mui-expanded": {
                minHeight: "unset",
                height: "35px",
                maxHeight: "35px",
              },
            }}
          >
            <Typography
              sx={{ fontWeight: 550, letterSpacing: 1, fontSize: "18px" }}
            >
              {`Floor ${floorData?.floorNo}`}
            </Typography>
          </AccordionSummary> */}
          <AccordionDetails>
            <Box sx={{ width: "100%", mt: 1 }}>
              <Grid container size={12} spacing={2}>
                {Boolean(floorData?.roomDto?.length) &&
                  floorData?.roomDto
                    ?.filter((room) => {
                      console.log("somya room : ", room);
                      const matchesRoomStatus =
                        roomFilters?.selectedRoomStatus &&
                        !Boolean(roomFilters?.selectedRoomStatus === "All")
                          ? checkRoomStatusType(room)?.key ===
                            roomFilters?.selectedRoomStatus
                          : true;

                      const matchesRoomType = roomFilters?.roomType
                        ? room?.roomType?.id === roomFilters?.roomType?.id
                        : true;

                      const matchesSearchKey = roomFilters?.searchKey
                        ? room?.roomNumber
                            ?.toString()
                            ?.includes(roomFilters?.searchKey) ||
                          room?.occupier
                            ?.toLowerCase()
                            ?.includes(roomFilters?.searchKey?.toLowerCase())
                        : true;

                      const matchesDate = roomFilters?.toDate
                        ? new Date(room?.availableDate) <=
                          new Date(roomFilters?.toDate)
                        : true;

                      return (
                        matchesRoomStatus &&
                        matchesRoomType &&
                        matchesSearchKey &&
                        matchesDate
                      );
                    })
                    ?.map((roomDetailsItem, index) => {
                      return (
                        <Grid
                          key={`room ${index}`}
                          size={{ xs: 6, sm: 4, md: 2.5, lg: 2 }}
                        >
                          <CustomRoomCard
                            roomDetails={roomDetailsItem}
                            isSelectedRoom={
                              isSelectedRoom?.roomNo === roomDetailsItem?.roomNo
                                ? true
                                : false
                            }
                            handleRoomSelect={handleRoomSelect}
                          />
                        </Grid>
                      );
                    })}
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  );
});

const CustomRoomCard = memo(function ({
  roomDetails,
  isSelectedRoom,
  handleRoomSelect,
}) {
  const handleRoomSelectOnClick = useCallback(
    (roomValue) => {
      handleRoomSelect(roomValue);
    },
    [handleRoomSelect]
  );
  return (
    <Paper
      id={`room-${roomDetails?.roomNo}`}
      elevation={1}
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        height: 87,
        position: "relative",
        overflow: "hidden",
        bgcolor: getRoomStatusColor(checkRoomStatusType(roomDetails)?.key)
          ?.bgcolor,
        boxShadow: isSelectedRoom
          ? "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px"
          : "rgba(0, 0, 0, 0.1) 0px 4px 12px",
        // "&::before": {
        //   content: '""',
        //   position: "absolute",
        //   top: 0,
        //   left: 0,
        //   right: 0,
        //   height: 20,
        //   backgroundColor: getRoomStatusColor(
        //     checkRoomStatusType(roomDetails)?.key
        //   )?.bgcolor,
        //   pointerEvents: "none",
        // },
        "&:hover": {
          cursor: "pointer",
        },
      }}
      onClick={() => handleRoomSelectOnClick(roomDetails)}
    >
      <Box
        sx={{
          // backgroundColor: "hsla(180, 91%, 92%, 1)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          px: 2,
          pt: 1,
          gap: 0.2,
        }}
      >
        <Typography sx={{ fontSize: "17px", fontWeight: 550 }}>
          {roomDetails?.roomNo}
        </Typography>
        <Typography
          sx={{
            fontSize: "13.5px",
            textAlign: "center",
            lineHeight: 1.2, // This will reduce the vertical spacing
            letterSpacing: "normal",
          }}
        >
          {roomDetails?.roomType?.type
            ?.replace(/_/g, " ")
            ?.replace(/([a-z])([A-Z])/g, "$1 $2")
            ?.replace(/\b\w/g, (char) => char.toUpperCase()) || ""}
        </Typography>
        {/* <Typography sx={{ fontWeight: 550 }}>
          {roomDetails?.occupier}
        </Typography> */}
      </Box>
    </Paper>
  );
});

const CustomAlertCard = memo(function ({ alertChipData, alertData }) {
  const navigate = useNavigate();

  const handleNavigateToBookingHistoryByAlert = useCallback(
    (selectedFilteration) => {
      if (Boolean(selectedFilteration)) {
        sessionStorage.setItem(
          selectedFilteration?.sessionStorageKey,
          JSON.stringify(selectedFilteration?.filterationKey)
        );
        navigate(selectedFilteration?.navigationPath);
      }
    },
    [navigate]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "100%", height: "45px" }}>
        <CustomPolygonHeader
          text="ALERTS"
          // bottomPolygonShapeBgColor="#6fe1f5"
          // foldLineShapeBgColor="#27599f"
          // topPolygonBgImage="linear-gradient(to bottom, #3edce5, #00c7e9, #00b1e9, #0098e3, #407ed4)"
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          mt: 1,
          // height: "100px",
          overflowY: "auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
        }}
      >
        {alertChipData?.map((item, index) => {
          if (Boolean(alertData?.[item?.key]) || true) {
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                  border: `2px solid ${item?.customColor}`,
                  borderRadius: "5px",
                  maxHeight: "35px",
                  overflow: "hidden",
                  userSelect: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    "& .leftBox": {
                      bgcolor: "#ffffff",
                      color: `${item?.customColor}`,
                    },
                    "& .rightBox": {
                      bgcolor: `${item?.customColor}`,
                      color: "#ffffff",
                    },
                    "& .rightBox .MuiTypography-root": {
                      color: "#ffffff",
                    },
                  },
                }}
                onClick={() => handleNavigateToBookingHistoryByAlert(item)}
              >
                <Box
                  className="leftBox"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    paddingX: "3px",
                    bgcolor: `${item?.customColor}`,
                    color: "#ffffff",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "13px", fontWeight: 600, lineHeight: "1" }}
                  >
                    {item?.label}
                  </Typography>
                </Box>
                <Box
                  className="rightBox"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingX: "12px",
                    minWidth: "40px",
                    color: `${item?.customColor}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Typography sx={{ fontWeight: 550 }}>
                    {alertData?.[item?.key] || "0"}
                  </Typography>
                </Box>
              </Box>
            );
          }
          return null;
        })}
      </Box>
    </Box>
  );
});

const DayCheckoutCard = memo(function ({
  dayCheckoutData,
  handleChangeSelectedRoomForDayCheckout,
}) {
  console.log("dayCheckoutData", dayCheckoutData);
  const handleChangeSelectedRoomForDayCheckoutOnClick = useCallback(
    (checkoutRoomData) => {
      handleChangeSelectedRoomForDayCheckout(checkoutRoomData);
    },
    [handleChangeSelectedRoomForDayCheckout]
  );

  // const isCheckoutDateExceedingToday = (checkoutDate) => {
  //   console.log("checkoutDate", checkoutDate);
  //   if (!checkoutDate) return false;
  //   const today = new Date();
  //   console.log("today", today);
  //   const formattedCheckoutDate = new Date(checkoutDate);
  //   console.log("formattedCheckoutDate", formattedCheckoutDate);
  //   return formattedCheckoutDate > today;
  // };
  const isCheckoutDateExceedingToday = (checkoutDate) => {
    if (!checkoutDate) return false;

    const today = new Date();
    // Set to beginning of current day
    today.setHours(0, 0, 0, 0);

    const checkoutDateTime = new Date(checkoutDate);
    // Set to beginning of checkout day
    checkoutDateTime.setHours(0, 0, 0, 0);

    // If checkout date is before today, it's delayed (should be red)
    return checkoutDateTime < today;
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ width: "100%", height: "45px" }}>
          <CustomPolygonHeader text="CHECKOUTS " />
        </Box>

        <Box sx={{ width: "100%", height: "90px", overflowY: "auto", mt: 1 }}>
          <Grid container size={12} spacing={1}>
            {Boolean(dayCheckoutData?.length) &&
              dayCheckoutData?.map((dayCheckoutItem, index) => {
                const isExceeding = isCheckoutDateExceedingToday(
                  dayCheckoutItem.checkOutDateInUtc
                );
                return (
                  <Grid key={`Day-Checkout-${index}`}>
                    <Button
                      variant="contained"
                      size="small"
                      // color="error"
                      sx={{
                        minWidth: "unset",
                        width: "37px",
                        backgroundColor: isExceeding ? "red" : "orange",
                      }}
                      onClick={() =>
                        handleChangeSelectedRoomForDayCheckoutOnClick(
                          dayCheckoutItem
                        )
                      }
                    >
                      {dayCheckoutItem?.roomDto?.roomNo}
                    </Button>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
        <Box
          sx={{
            display: "flex",
            // , justifyContent: "space-between"
            gap: 1,
          }}
        >
          {/* in time  */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.8,
            }}
          >
            <Box
              sx={{
                borderRadius: "50%",
                backgroundColor: "orange",
                height: "0.7rem",
                width: "0.7rem",
              }}
            />
            <Typography sx={{ color: "gray" }}>Today's Checkout</Typography>
          </Box>
          {/* delayed */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.8,
            }}
          >
            <Box
              sx={{
                borderRadius: "50%",
                backgroundColor: "red",
                height: "0.7rem",
                width: "0.7rem",
              }}
            />
            <Typography sx={{ color: "gray" }}>Delayed Checkout</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
});

const RoomServiceCard = memo(function ({
  handleOpenShowcaseModalForInventory,
  handleOpenShowcaseModalForFood,
  isSelectedRoom,
  handleOpenCustomFormDrawer,
  handleOpenShowcaseModalForCheckout,
  handleRequestRoomCheckout,
  handleRoomCleanRequest,
  handleOpenShowcaseModalForLaundry,
}) {
  const navigate = useNavigate();
  const [customerGstNumber, setCustomerGstNumber] = React.useState("");
  console.log("customerGstNumber", customerGstNumber);
  console.log("RoomServiceCard isSelectedRoom : ", isSelectedRoom);
  const selectedRoomStatusType = checkRoomStatusType(isSelectedRoom);
  const [selectedInvoice, setSelectedInvoice] = useState("Final Invoice");

  const handleOpenShowcaseModalForInventoryOnClick = useCallback(
    (inventoryList) => {
      handleOpenShowcaseModalForInventory(inventoryList);
    },
    [handleOpenShowcaseModalForInventory]
  );

  const handleOpenShowcaseModalForFoodOnClick = useCallback(
    (foodData) => {
      handleOpenShowcaseModalForFood(foodData);
    },
    [handleOpenShowcaseModalForFood]
  );

  const handleOpenShowcaseModalForLaundryOnClick = useCallback(
    (laundryData) => {
      handleOpenShowcaseModalForLaundry(laundryData);
    },
    [handleOpenShowcaseModalForLaundry]
  );

  const handleOpenCustomFormDrawerOnClick = useCallback(
    (open = true, title = "", type = null) => {
      handleOpenCustomFormDrawer(open, title, type);
    },
    [handleOpenCustomFormDrawer]
  );

  const handleOpenShowcaseModalForCheckoutOnClick = useCallback(() => {
    handleOpenShowcaseModalForCheckout();
  }, [handleOpenShowcaseModalForCheckout]);

  const handleRequestRoomCheckoutOnClick = useCallback(() => {
    handleRequestRoomCheckout();
  }, [handleRequestRoomCheckout]);

  const handleRoomCleanRequestOnClick = useCallback(
    (roomId) => {
      handleRoomCleanRequest(roomId);
    },
    [handleRoomCleanRequest]
  );

  const getUniqueFoodItems = useCallback((foodDataList = []) => {
    if (!foodDataList || foodDataList.length === 0) {
      return [];
    }

    const allItems = foodDataList.flatMap((item) => item.itemsList || []);
    const uniqueItems = Array.from(
      new Set(
        allItems.filter((item) => item?.itemName).map((item) => item.itemName)
      )
    );

    return uniqueItems;
  }, []);

  const getUniqueExtraItems = useCallback((extraInventoryList = []) => {
    if (!extraInventoryList || extraInventoryList.length === 0) {
      return [];
    }

    const uniqueItems = Array.from(
      new Set(
        extraInventoryList
          .filter((item) => item?.itemName)
          .map((item) => item.itemName)
      )
    );

    return uniqueItems;
  }, []);

  const getUniqueLaudryItems = useCallback((laundryList = []) => {
    if (!laundryList || laundryList.length === 0) {
      return [];
    }

    const allItems = laundryList.flatMap((item) => item.itemsDto || []);
    const uniqueItems = Array.from(
      new Set(allItems.filter((item) => item?.name).map((item) => item.name))
    );

    return uniqueItems;
  }, []);

  const uniqueFoodItems = useMemo(
    () =>
      getUniqueFoodItems(isSelectedRoom?.bookingDto?.foodDataList).slice(0, 2),
    [isSelectedRoom?.bookingDto?.foodDataList, getUniqueFoodItems]
  );

  const uniqueInventoryItems = useMemo(
    () =>
      getUniqueExtraItems(isSelectedRoom?.bookingDto?.extraItemsList).slice(
        0,
        2
      ),
    [isSelectedRoom?.bookingDto?.extraItemsList, getUniqueExtraItems]
  );

  const uniqueLaundryItems = useMemo(
    () =>
      getUniqueLaudryItems(isSelectedRoom?.bookingDto?.laundryDataList).slice(
        0,
        2
      ),
    [isSelectedRoom?.bookingDto?.laundryDataList, getUniqueLaudryItems]
  );

  const handleViewHotelBillInvoice = useCallback(
    (roomData) => {
      const bookingRefNumber = roomData?.bookingDto?.bookingRefNumber;

      if (bookingRefNumber) {
        sessionStorage.setItem(
          `hotelBillInvoice-${bookingRefNumber}`,
          JSON.stringify(roomData)
        );

        window.open(`/hotelBillInvoice/${bookingRefNumber}`, "_blank");
      }
    },
    [customerGstNumber]
  );
  const handleViewHotelGstBillInvoice = useCallback(
    (roomData) => {
      const bookingRefNumber = roomData?.bookingDto?.bookingRefNumber;

      if (bookingRefNumber) {
        sessionStorage.setItem(
          `hotelBillInvoice-${bookingRefNumber}`,
          JSON.stringify(roomData)
        );
        sessionStorage.setItem("customerGstNumber", customerGstNumber);

        window.open(`/hotelBillInvoice/${bookingRefNumber}`, "_blank");
      }
    },
    [customerGstNumber]
  );
  React.useEffect(() => {
    // useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (
        performance.navigation.type === 1 ||
        event.currentTarget.performance.navigation.type !== 0
      ) {
        sessionStorage.removeItem("customerGstNumber");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // }, []);
  }, []);
  //
  const handleViewBarBillInvoice = useCallback((roomData) => {
    const bookingRefNumber = roomData?.bookingDto?.bookingRefNumber;

    if (bookingRefNumber) {
      sessionStorage.setItem(
        `barBillInvoice-${bookingRefNumber}`,
        JSON.stringify(roomData)
      );

      window.open(`/BarInvoice/${bookingRefNumber}`, "_blank");
    }
  }, []);
  const handleViewSpaBillInvoice = useCallback((roomData) => {
    const bookingRefNumber = roomData?.bookingDto?.bookingRefNumber;

    if (bookingRefNumber) {
      sessionStorage.setItem(
        `spaBillInvoice-${bookingRefNumber}`,
        JSON.stringify(roomData)
      );

      window.open(`/SpaInvoiceForFrontesk/${bookingRefNumber}`, "_blank");
    }
  }, []);

  const handleViewFoodBillInvoice = useCallback((roomData) => {
    const bookingRefNumber = roomData?.bookingDto?.bookingRefNumber;

    if (bookingRefNumber) {
      sessionStorage.setItem(
        `foodBillInvoice-${bookingRefNumber}`,
        JSON.stringify(roomData)
      );

      window.open(`/foodBillInvoice/${bookingRefNumber}`, "_blank");
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* <Box
          sx={{
            borderBottom: "2px solid #ccc",
            bgcolor: "#e3e3e3",
            py: 0.2,
            px: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 550, letterSpacing: 1, fontSize: "18px" }}
          >
            {`Room Details`}
          </Typography>
        </Box> */}
        <Box sx={{ width: "100%", height: "45px" }}>
          <CustomPolygonHeader text="ROOM DETAILS" />
        </Box>
        <Box
          sx={{
            width: "100",
            overflowY: "auto",
            // height: "310px",
            mt: 1,
          }}
        >
          {/* OCCUPIED ROOM CASE */}
          {selectedRoomStatusType?.key === OCCUPIED?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* GUEST DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "16.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Guest Details :
                      </Typography>
                    </Grid>
                    <Grid size={9}>
                      <Grid container size={12}>
                        {/* NAME */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {Boolean(isSelectedRoom?.bookingDto?.firstName) &&
                                `${isSelectedRoom?.bookingDto?.firstName}`}
                              {Boolean(
                                isSelectedRoom?.bookingDto?.middleName
                              ) && ` ${isSelectedRoom?.bookingDto?.middleName}`}
                              {Boolean(isSelectedRoom?.bookingDto?.lastName) &&
                                ` ${isSelectedRoom?.bookingDto?.lastName}`}{" "}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CAPACITY */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Capacity
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.capacity || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* Phone Number */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Phone Number
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.phoneNumber || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* BOOKING DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Booking Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.bookedOn &&
                                moment(
                                  isSelectedRoom?.bookingDto?.bookedOn
                                ).format("DD-MM-YYYY hh:mm A")}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* FROM DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            From
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.fromDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* TO DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            To
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.toDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CHECK-IN DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Check-In Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {(isSelectedRoom?.bookingDto?.checkInDate &&
                                moment(
                                  convertDateFormat(
                                    isSelectedRoom?.bookingDto?.checkInDate
                                  ) + " utc"
                                ).format("DD/MM/YYYY hh:mma")) ||
                                "NA"}
                              {/* {isSelectedRoom?.bookingDto?.checkInDate} */}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CHECK-OUT DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Check-Out Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {/* {isSelectedRoom?.bookingDto?.checkOutDate || "NA"} */}
                              {/* {(isSelectedRoom?.bookingDto?.checkOutDate &&
                                moment(
                                  isSelectedRoom?.bookingDto?.checkOutDate +
                                    " utc"
                                ).format("DD/MM/YYYY hh:mma")) ||
                                "NA"} */}
                              {(isSelectedRoom?.bookingDto?.checkOutDate &&
                                moment(
                                  convertDateFormat(
                                    isSelectedRoom?.bookingDto?.checkOutDate
                                  ) + " utc"
                                ).format("DD/MM/YYYY hh:mma")) ||
                                "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* Occupancy */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Occupancy
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.noOfPeoples || "0"}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={3}>
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXp3DxP80ArpRzsB0XWBG9Ow5GeuefbLrUHw&s"
                        alt="person"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ROOM OPERATIONS */}
                {Boolean(
                  Boolean(
                    isSelectedRoom?.bookingDto?.isCheckoutProceed === false
                  ) &&
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                        null
                    )
                ) && (
                  <Box sx={{ width: "100%", mt: 1 }}>
                    <Grid container size={12}>
                      <Grid size={12}>
                        <Typography
                          sx={{
                            fontSize: "16.5px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          Room Operations :
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Grid container size={12}>
                          {/* Services */}
                          <Grid size={3.8}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              Services
                            </Typography>
                          </Grid>
                          <Grid size={8.2}>
                            <Box
                              sx={{
                                width: "100%",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  fontWeight: 600,
                                  marginRight: "5px",
                                }}
                              >
                                :
                              </Typography>
                              <Tooltip title={"Request Room Cleaning"} arrow>
                                <Button
                                  variant="contained"
                                  sx={{ minWidth: "unset", width: "15px" }}
                                  onClick={() =>
                                    handleRoomCleanRequestOnClick(
                                      isSelectedRoom?.id
                                    )
                                  }
                                  disabled={Boolean(
                                    isSelectedRoom?.isRoomCleaningRequested
                                  )}
                                  // disabled={true}
                                >
                                  <CleaningServicesIcon
                                    sx={{ fontSize: "17px" }}
                                  />
                                </Button>
                              </Tooltip>
                              <Tooltip title={"Order Food"} arrow>
                                <Button
                                  variant="contained"
                                  sx={{ minWidth: "unset", width: "15px" }}
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "bookingRefNumber",
                                      isSelectedRoom?.bookingDto
                                        ?.bookingRefNumber
                                    );
                                    sessionStorage.setItem(
                                      "hotelId",
                                      isSelectedRoom?.bookingDto?.hotel?.id
                                    );
                                    navigate("/resturant");
                                  }}
                                >
                                  <RestaurantIcon sx={{ fontSize: "17px" }} />
                                </Button>
                              </Tooltip>
                              <Tooltip title={"Order Beverages"} arrow>
                                <Button
                                  variant="contained"
                                  sx={{ minWidth: "unset", width: "15px" }}
                                  onClick={() => {
                                    sessionStorage.setItem(
                                      "bookingRefNumber",
                                      isSelectedRoom?.bookingDto
                                        ?.bookingRefNumber
                                    );
                                    sessionStorage.setItem(
                                      "hotelId",
                                      isSelectedRoom?.bookingDto?.hotel?.id
                                    );
                                    navigate("/bar");
                                  }}
                                >
                                  <LiquorIcon sx={{ fontSize: "17px" }} />
                                </Button>
                              </Tooltip>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* FOOD DETAILS */}
                {Boolean(uniqueFoodItems?.length) && (
                  <Box sx={{ width: "100%", mt: 1 }}>
                    <Grid container size={12}>
                      <Grid size={12}>
                        <Typography
                          sx={{
                            fontSize: "16.5px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          Food Details :
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Grid container size={12}>
                          {/* Used Items */}
                          <Grid size={3.8}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              Ordered Foods
                            </Typography>
                          </Grid>
                          <Grid size={8.2}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  fontWeight: 600,
                                  marginRight: "5px",
                                }}
                              >
                                :
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  // fontWeight: 600,
                                }}
                              >
                                {uniqueFoodItems.map((item, index) => (
                                  <React.Fragment key={`food-item-${index}`}>
                                    <span>{item}</span>
                                    {index !== uniqueFoodItems.length - 1 && (
                                      <span>, </span>
                                    )}
                                  </React.Fragment>
                                ))}
                                {uniqueFoodItems.length > 0 && (
                                  <>
                                    <span> &nbsp;</span>
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        position: "relative",
                                      }}
                                      onClick={() =>
                                        handleOpenShowcaseModalForFoodOnClick(
                                          isSelectedRoom?.bookingDto
                                            ?.foodDataList
                                        )
                                      }
                                    >
                                      <InfoIcon
                                        sx={{
                                          fontSize: 16,
                                          position: "absolute",
                                          top: 1,
                                        }}
                                      />
                                    </span>
                                  </>
                                )}
                              </Typography>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* LAUNDRY DETAILS */}
                {Boolean(uniqueLaundryItems?.length) && (
                  <Box
                    sx={{
                      width: "100%",
                      mt: 1,
                      // , backgroundColor: "red"
                    }}
                  >
                    <Grid container size={12}>
                      <Grid size={12}>
                        <Typography
                          sx={{
                            fontSize: "16.5px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          LaundryDetails :
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Grid container size={12}>
                          {/* Used Items */}
                          <Grid size={3.8}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              Items
                            </Typography>
                          </Grid>
                          <Grid size={8.2}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  fontWeight: 600,
                                  marginRight: "5px",
                                }}
                              >
                                :
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  // fontWeight: 600,
                                }}
                              >
                                {uniqueLaundryItems.map((item, index) => (
                                  <React.Fragment key={`food-item-${index}`}>
                                    <span>{item}</span>
                                    {index !==
                                      uniqueLaundryItems.length - 1 && (
                                      <span>, </span>
                                    )}
                                  </React.Fragment>
                                ))}
                                {uniqueLaundryItems.length > 0 && (
                                  <>
                                    <span> &nbsp;</span>
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        position: "relative",
                                      }}
                                      onClick={() =>
                                        handleOpenShowcaseModalForLaundryOnClick(
                                          isSelectedRoom?.bookingDto
                                            ?.laundryDataList
                                        )
                                      }
                                    >
                                      <InfoIcon
                                        sx={{
                                          fontSize: 16,
                                          position: "absolute",
                                          top: 1,
                                        }}
                                      />
                                    </span>
                                  </>
                                )}
                              </Typography>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* EXTRA ITEMS DETAILS */}
                {Boolean(uniqueInventoryItems?.length) && (
                  <Box sx={{ width: "100%", mt: 1 }}>
                    <Grid container size={12}>
                      <Grid size={12}>
                        <Typography
                          sx={{
                            fontSize: "16.5px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          Inventory Details :
                        </Typography>
                      </Grid>

                      <Grid size={12}>
                        <Grid container size={12}>
                          {/* Used Items */}
                          <Grid size={3.8}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              Extra Items
                            </Typography>
                          </Grid>
                          <Grid size={8.2}>
                            <Typography
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  fontWeight: 600,
                                  marginRight: "5px",
                                }}
                              >
                                :
                              </Typography>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: "15.5px",
                                  // color: "#707070",
                                  // fontWeight: 600,
                                }}
                              >
                                {uniqueInventoryItems.map((item, index) => (
                                  <React.Fragment key={`food-item-${index}`}>
                                    <span>{item}</span>
                                    {index !==
                                      uniqueInventoryItems.length - 1 && (
                                      <span>, </span>
                                    )}
                                  </React.Fragment>
                                ))}
                                {uniqueInventoryItems.length > 0 && (
                                  <>
                                    <span> &nbsp;</span>
                                    <span
                                      style={{
                                        cursor: "pointer",
                                        position: "relative",
                                      }}
                                      onClick={() =>
                                        handleOpenShowcaseModalForInventoryOnClick(
                                          isSelectedRoom?.bookingDto
                                            ?.extraItemsList
                                        )
                                      }
                                    >
                                      <InfoIcon
                                        sx={{
                                          fontSize: 16,
                                          position: "absolute",
                                          top: 1,
                                        }}
                                      />
                                    </span>
                                  </>
                                )}
                              </Typography>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* RESERVED ROOM CASE */}
          {selectedRoomStatusType?.key === RESERVED?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* GUEST DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "16.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Guest Details :
                      </Typography>
                    </Grid>
                    <Grid size={9}>
                      <Grid container size={12}>
                        {/* NAME */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {Boolean(isSelectedRoom?.bookingDto?.firstName) &&
                                `${isSelectedRoom?.bookingDto?.firstName}`}
                              {Boolean(
                                isSelectedRoom?.bookingDto?.middleName
                              ) && ` ${isSelectedRoom?.bookingDto?.middleName}`}
                              {Boolean(isSelectedRoom?.bookingDto?.lastName) &&
                                ` ${isSelectedRoom?.bookingDto?.lastName}`}{" "}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* CAPACITY */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Capacity
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.capacity || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* BOOKING DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Booking Date
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.bookedOn &&
                                moment(
                                  isSelectedRoom?.bookingDto?.bookedOn
                                ).format("DD-MM-YYYY hh:mm A")}
                            </Typography>
                          </Typography>
                        </Grid>
                        {/* FROM DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            From
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.fromDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* TO DATE */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            To
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.toDate || "NA"}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* STAYERS */}
                        <Grid size={5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Stayers
                          </Typography>
                        </Grid>
                        <Grid size={7}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.bookingDto?.noOfPeoples || "0"}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid size={3}>
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXp3DxP80ArpRzsB0XWBG9Ow5GeuefbLrUHw&s"
                        alt="person"
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </>
          )}

          {/* AVAILABLE ROOM CASE */}
          {selectedRoomStatusType?.key === AVAILABLE?.key && (
            <>
              <Box sx={{ width: "100%", pl: 1 }}>
                {/* ROOM DETAILS */}
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Grid container size={12}>
                        {/* ROOM NO */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room No
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomNo || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* FLOOR NO */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Floor No
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.floorNo || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM TYPE */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Room Type
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.type
                                ?.replace(/_/g, " ")
                                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                                ?.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                ) || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* CAPACITY */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Capacity
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {isSelectedRoom?.roomType?.capacity || ""}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* ROOM STATUS */}
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Status
                          </Typography>
                        </Grid>
                        <Grid size={8.5}>
                          <Typography
                            sx={{
                              fontSize: "15.5px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15.5px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {checkRoomStatusType(isSelectedRoom)?.key}
                            </Typography>
                          </Typography>
                        </Grid>

                        {/* <Grid size={12}></Grid> */}
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",

            justifyContent: "center",
            width: "100%",
            // bgcolor: "red",
            bottom: 0,
            gap: 2,
            mt: 1,
          }}
        >
          {/* AVAILABLE ROOM CASE */}
          {selectedRoomStatusType?.key === AVAILABLE?.key && (
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleOpenCustomFormDrawerOnClick(true, "Booking", "booking")
              }
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                color: "white",
                "&:hover": {
                  backgroundImage:
                    "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                },
              }}
            >
              BOOK NOW
            </Button>
          )}

          {/* RESERVED ROOM CASE */}
          {selectedRoomStatusType?.key === RESERVED?.key && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  handleOpenCustomFormDrawerOnClick(true, "Check-In", "checkIn")
                }
                sx={{
                  backgroundImage:
                    "linear-gradient(to right, #2ba409, #4fb009, #6dbc0b, #88c810, #a3d417)", // Multi-tone gradient
                  color: "white",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(to right, #2ba409, #4fb009, #6dbc0b, #88c810, #a3d417)", // Same gradient for hover
                  },
                }}
              >
                CHECK-IN
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  handleOpenCustomFormDrawerOnClick(
                    true,
                    "Cancel Booking",
                    "cancelBooking"
                  )
                }
                sx={{
                  backgroundImage:
                    "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                  color: "white",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                  },
                }}
              >
                CANCEL BOOKING
              </Button>
            </>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            {Boolean(
              Boolean(
                isSelectedRoom?.bookingDto?.isCheckoutProceed === false
              ) &&
                Boolean(
                  isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff === true
                )
            ) && (
              <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    ".MuiTextField-root": {
                      width: "100%",
                      backgroundColor: "transparent",
                      ".MuiInputBase-root": {
                        color: "#B4B4B4",
                        background: "rgba(255, 255, 255, 0.25)",
                      },
                    },
                    ".MuiFormLabel-root": {
                      color: (theme) => theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: 14,
                    },
                    ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.primary.main}`,
                    },
                    ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.primary.main}`,
                    },
                    "& .MuiOutlinedInput-root": {
                      height: "35px",
                      minHeight: "35px",
                    },
                    "& .MuiInputBase-input": {
                      padding: "13px",
                      height: "100%",
                      boxSizing: "border-box",
                      fontSize: "13px",
                    },
                  }}
                >
                  <Autocomplete
                    options={[
                      // "Parking Invoice",
                      "Food Invoice",
                      "Final Invoice",
                      "Bar Invoice",
                      "Spa Invoice",
                    ]}
                    // disableClearable
                    fullWidth
                    value={selectedInvoice}
                    onChange={(e, newValue) => setSelectedInvoice(newValue)}
                    getOptionLabel={(option) => option || ""}
                    clearOnEscape
                    // disablePortal
                    popupIcon={<KeyboardArrowDownIcon color="primary" />}
                    sx={{
                      // width: 200,
                      ".MuiInputBase-root": {
                        color: "#fff",
                      },
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
                    componentsProps={{
                      popper: {
                        sx: {
                          "& .MuiAutocomplete-listbox": {
                            maxHeight: "150px",
                            overflow: "auto",
                          },
                          "& .MuiAutocomplete-option": {
                            fontSize: "13px",
                          },
                        },
                      },
                    }}
                    size="small"
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
                        label="Select Invoice"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            width: 200,
                            height: 35,
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    if (selectedInvoice === "Final Invoice") {
                      handleViewHotelBillInvoice(isSelectedRoom);
                    } else if (selectedInvoice === "Food Invoice") {
                      handleViewFoodBillInvoice(isSelectedRoom);
                    } else if (selectedInvoice === "Bar Invoice") {
                      handleViewBarBillInvoice(isSelectedRoom);
                    } else if (selectedInvoice === "Spa Invoice") {
                      handleViewSpaBillInvoice(isSelectedRoom);
                    } else {
                      alert("Please select an option to view the bill.");
                    }
                  }}
                >
                  View
                </Button>
              </Box>
            )}

            {Boolean(
              Boolean(
                isSelectedRoom?.bookingDto?.isCheckoutProceed === false
              ) &&
                Boolean(
                  isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff === true
                )
            ) &&
              selectedInvoice === "Final Invoice" && (
                <Box sx={{ width: "100%", gap: 1 }}>
                  <Box
                    sx={{
                      ".MuiTextField-root": {
                        width: "100%",
                        backgroundColor: "transparent",
                        ".MuiInputBase-root": {
                          color: "#B4B4B4",
                          background: "rgba(255, 255, 255, 0.25)",
                        },
                      },
                      ".MuiFormLabel-root": {
                        color: (theme) => theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: 14,
                      },
                      ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.primary.main}`,
                      },
                      ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                        borderBottom: (theme) =>
                          `1px solid ${theme.palette.primary.main}`,
                      },
                      "& .MuiOutlinedInput-root": {
                        height: "35px",
                        minHeight: "35px",
                      },
                      "& .MuiInputBase-input": {
                        padding: "13px",
                        height: "100%",
                        boxSizing: "border-box",
                        fontSize: "13px",
                      },
                      width: "70%",
                    }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="customerGstNumber"
                      label="Gst Number"
                      name="customerGstNumber"
                      // autoComplete="noOfPeoples"
                      inputProps={{
                        maxLength: 15,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      sx={{
                        // "& .MuiInputBase-root": {
                        //   height: "23px",
                        // },
                        "& .MuiTextField-root": {
                          maxHeight: "10px",
                          backgroundColor: "transparent",
                        },
                      }}
                      variant="standard"
                      value={customerGstNumber}
                      onChange={(e) => setCustomerGstNumber(e.target.value)}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      handleViewHotelGstBillInvoice(isSelectedRoom);
                    }}
                  >
                    View GST Invoice
                  </Button>
                </Box>
              )}

            {/* OCCUPIED ROOM CASE */}
            {selectedRoomStatusType?.key === OCCUPIED?.key && (
              <Box sx={{ width: "100%" }}>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  disabled={Boolean(
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckoutProceed === true
                    ) &&
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                          false
                      )
                  )}
                  // onClick={() => handleOpenShowcaseModalForCheckoutOnClick()}
                  onClick={() => {
                    if (
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckoutProceed ===
                          false &&
                          isSelectedRoom?.bookingDto
                            ?.isCheckedByKeepingStaff === null
                      )
                    ) {
                      handleRequestRoomCheckoutOnClick();
                    } else if (
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckoutProceed ===
                          false &&
                          isSelectedRoom?.bookingDto
                            ?.isCheckedByKeepingStaff === true
                      )
                    ) {
                      handleOpenShowcaseModalForCheckoutOnClick();
                    }
                  }}
                >
                  {Boolean(
                    Boolean(
                      isSelectedRoom?.bookingDto?.isCheckoutProceed === false
                    ) &&
                      Boolean(
                        isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff ===
                          null
                      )
                  )
                    ? "Request CHECK-OUT"
                    : Boolean(
                        Boolean(
                          isSelectedRoom?.bookingDto?.isCheckoutProceed ===
                            false
                        ) &&
                          Boolean(
                            isSelectedRoom?.bookingDto
                              ?.isCheckedByKeepingStaff === true
                          )
                      )
                    ? "CHECK-OUT"
                    : Boolean(
                        Boolean(
                          isSelectedRoom?.bookingDto?.isCheckoutProceed === true
                        ) &&
                          Boolean(
                            isSelectedRoom?.bookingDto
                              ?.isCheckedByKeepingStaff === false
                          )
                      )
                    ? "Checkout Requested"
                    : ""}
                </Button>

                {/* {Boolean(
                Boolean(
                  isSelectedRoom?.bookingDto?.isCheckoutProceed === false
                ) &&
                  Boolean(
                    isSelectedRoom?.bookingDto?.isCheckedByKeepingStaff === true
                  )
              ) && (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundImage:
                      "linear-gradient(to right, #009688, #00897b, #00796b, #00695c)", // Lighter to darker teal
                    color: "white",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(to right, #00796b, #00695c, #005b50)", // Slightly darker shades on hover
                    },
                  }}
                  onClick={() => handleViewHotelBillInvoice(isSelectedRoom)}
                >
                  View Invoice
                </Button>
              )} */}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
});

const CustomFormDrawer = memo(function ({
  customDrawerOpen,
  title,
  type,
  handleToggleCustomFormDrawer,
  customFormDrawerData,
  handleChangeCustomFormDrawerData,
  isSelectedRoom,
  allGovtIdsData,
  allPaymentMethods,
  handleSubmitRoomCheckIn,
  handleSubmitRoomBookingCanelation,
  handleSubmitBookingForGuestByFrontDesk,
}) {
  console.log("CustomFormDrawer customDrawerOpen : ", customDrawerOpen, type);

  // const numberOfDaysOfStay = useMemo(() => {
  //   if (customFormDrawerData?.checkOutDate) {
  //     const startDate = dayjs().startOf("day");
  //     const endDate = dayjs(customFormDrawerData.checkOutDate).startOf("day");
  //     const diff = endDate.diff(startDate, "day") + 1;
  //     return diff > 0 ? diff : 0;
  //   } else if (customFormDrawerData?.fromDate && customFormDrawerData?.toDate) {
  //     const startDate = dayjs(customFormDrawerData.fromDate).startOf("day");
  //     const endDate = dayjs(customFormDrawerData.toDate).startOf("day");
  //     const diff = endDate.diff(startDate, "day") + 1;
  //     return diff > 0 ? diff : 0;
  //   }
  //   return 0;
  // }, [
  //   customFormDrawerData?.checkOutDate,
  //   customFormDrawerData?.fromDate,
  //   customFormDrawerData?.toDate,
  // ]);

  // const accumulatedRoomCharge = useMemo(() => {
  //   const basePrice = isSelectedRoom?.roomType?.basePrice || 0;
  //   return basePrice * numberOfDaysOfStay;
  // }, [isSelectedRoom, numberOfDaysOfStay]);

  const handleToggleCustomFormDrawerOnChange = useCallback(() => {
    handleToggleCustomFormDrawer();
  }, [handleToggleCustomFormDrawer]);

  const handleChangeCustomFormDrawerDataOnChange = useCallback(
    (name, value, subIndex) => {
      handleChangeCustomFormDrawerData(name, value, subIndex);
    },
    [handleChangeCustomFormDrawerData]
  );
  const handleChangeCustomFormDrawerDataOnOpen = useCallback(() => {
    handleChangeCustomFormDrawerData("fullCheckIn", isSelectedRoom);
  }, [handleChangeCustomFormDrawerData, isSelectedRoom]);

  const handleSubmitRoomCheckInOnClick = useCallback(() => {
    handleSubmitRoomCheckIn();
  }, [handleSubmitRoomCheckIn]);

  const handleSubmitRoomBookingCanelationOnClick = useCallback(() => {
    handleSubmitRoomBookingCanelation();
  }, [handleSubmitRoomBookingCanelation]);

  const handleChangeCustomFormDrawerDataForBookingOnOpen = useCallback(() => {
    handleChangeCustomFormDrawerData("fullBooking", isSelectedRoom);
  }, [handleChangeCustomFormDrawerData, isSelectedRoom]);

  const handleSubmitBookingForGuestByFrontDeskOnClick = useCallback(() => {
    handleSubmitBookingForGuestByFrontDesk();
  }, [handleSubmitBookingForGuestByFrontDesk]);

  useEffect(() => {
    if (customDrawerOpen && isSelectedRoom && type === "checkIn") {
      handleChangeCustomFormDrawerDataOnOpen();
    }
  }, [
    isSelectedRoom,
    handleChangeCustomFormDrawerDataOnOpen,
    customDrawerOpen,
    type,
  ]);

  useEffect(() => {
    if (customDrawerOpen && isSelectedRoom && type === "booking") {
      handleChangeCustomFormDrawerDataForBookingOnOpen();
    }
  }, [
    isSelectedRoom,
    handleChangeCustomFormDrawerDataForBookingOnOpen,
    customDrawerOpen,
    type,
  ]);

  return (
    <Drawer
      anchor="right"
      open={customDrawerOpen}
      onClose={() => handleToggleCustomFormDrawerOnChange()}
      sx={{ zIndex: 1300 }}
    >
      <Box sx={{ width: 500, paddingBottom: "15px" }} role="presentation">
        <Box
          sx={{
            px: 2,

            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 550, fontSize: "1.5em" }}>
            {title}
          </Typography>
          <IconButton onClick={() => handleToggleCustomFormDrawerOnChange()}>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* <Divider /> */}
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ px: 2 }}>
          {type === "checkIn" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12}>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Booking Ref. No.
                    </Typography>
                  </Grid>
                  <Grid size={8}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.bookingRefNumber || ""}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      From
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.fromDate || ""}
                      </Typography>
                    </Typography>
                  </Grid>

                  <Grid size={1}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      To
                    </Typography>
                  </Grid>

                  <Grid size={3}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.toDate || ""}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={12}></Grid>
                  {/* STAYERS */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Stayers
                    </Typography>
                  </Grid>
                  <Grid size={1}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.noOfPeoples || 0}
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="noOfPeoples"
                  label="Stayer"
                  name="noOfPeoples"
                  // autoComplete="noOfPeoples"
                  inputProps={{
                    maxLength: 3,
                    style: {
                      fontSize: "14px",
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      fontSize: "13px",
                    },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "23px",
                    },
                    "& .MuiTextField-root": {
                      maxHeight: "30px",
                      backgroundColor: "transparent",
                    },
                  }}
                  variant="standard"
                  value={customFormDrawerData?.noOfPeoples || ""}
                  onChange={(e) =>
                    handleChangeCustomFormDrawerDataOnChange(
                      "noOfPeoples",
                      e?.target?.value
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "7px",
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      disablePast
                      value={customFormDrawerData?.checkOutDate || null}
                      onChange={(newVal) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "checkOutDate",
                          newVal
                        )
                      }
                      slotProps={{
                        textField: {
                          variant: "standard",
                          size: "small",
                          readOnly: true,
                          label: "Check-Out Date",
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: "rgba(255, 255, 255, 0.25)",
                              color: "#B4B4B4",
                            },
                            "& .MuiTextField-root": {
                              width: "100%",
                              backgroundColor: "transparent",
                            },
                            "& .MuiFormLabel-root": {
                              fontSize: 15,
                              mt: 0.5,
                            },
                            "& input": {
                              fontSize: "13px",
                            },
                          },
                        },
                      }}
                      slots={{
                        openPickerIcon: StyledCalendarIcon,
                      }}
                      // format="DD-MM-YYYY"
                      format="DD-MM-YYYY hh:mm A"
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>

              <Grid size={12}>
                <Grid container size={12}>
                  {/* STAYERS */}
                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Guests Verification Details :
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    width: "100%",
                    // maxHeight: "calc(100vh - 550px)",
                    maxHeight: "270px",
                    overflowX: "hidden",
                    overflowY: "auto",
                  }}
                >
                  {customFormDrawerData?.bookingMapDatas?.map((item, index) => {
                    return (
                      <Box
                        key={`verification-${index}`}
                        sx={{ width: "100%", marginBottom: "10px" }}
                      >
                        <Grid container size={12} columnSpacing={1}>
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                fontWeight: 600,
                                width: "100%",
                                bgcolor: "#e8e8e8",
                              }}
                            >
                              Customer {index + 1} :
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id={`customerName${index}`}
                              label="Guest Name"
                              name="customerName"
                              inputProps={{
                                maxLength: 100,
                                style: {
                                  fontSize: "14px",
                                },
                              }}
                              InputLabelProps={{
                                style: {
                                  fontSize: "13px",
                                },
                              }}
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "23px",
                                },
                                "& .MuiTextField-root": {
                                  maxHeight: "30px",
                                  backgroundColor: "transparent",
                                },
                              }}
                              // autoComplete="noOfPeoples"
                              variant="standard"
                              value={item?.customerName || ""}
                              onChange={(e) =>
                                handleChangeCustomFormDrawerDataOnChange(
                                  "customerName",
                                  e?.target?.value,
                                  index
                                )
                              }
                            />
                          </Grid>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <Box
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "end",
                                paddingBottom: "7px",
                                ".MuiTextField-root": {
                                  width: "100%",
                                  backgroundColor: "transparent",
                                  ".MuiInputBase-root": {
                                    color: "#B4B4B4",
                                    background: "rgba(255, 255, 255, 0.25)",
                                  },
                                },
                                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                                "& .MuiInputLabel-root": {
                                  fontSize: "13px",
                                },
                                "& .MuiOutlinedInput-root": {
                                  height: "35px",
                                  minHeight: "35px",
                                },
                                "& .MuiInputBase-input": {
                                  padding: "13px",
                                  height: "100%",
                                  boxSizing: "border-box",
                                  fontSize: "13px",
                                },
                              }}
                            >
                              <Autocomplete
                                fullWidth
                                options={
                                  allGovtIdsData?.data?.map((item) => ({
                                    key: item,
                                    name: item.replace(/_/g, " "),
                                  })) || []
                                }
                                disableClearable
                                value={item?.govtIdType || null}
                                onChange={(e, newVal) =>
                                  handleChangeCustomFormDrawerDataOnChange(
                                    "govtIdType",
                                    newVal,
                                    index
                                  )
                                }
                                inputValue={item?.govtIdTypeInputValue}
                                onInputChange={(e, newVal) =>
                                  handleChangeCustomFormDrawerDataOnChange(
                                    "govtIdTypeInputValue",
                                    newVal,
                                    index
                                  )
                                }
                                getOptionLabel={(option) => option?.name}
                                clearOnEscape
                                // disablePortal
                                popupIcon={
                                  <KeyboardArrowDownIcon color="primary" />
                                }
                                sx={{
                                  // width: 200,
                                  ".MuiInputBase-root": {
                                    color: "#fff",
                                  },
                                }}
                                componentsProps={{
                                  popper: {
                                    sx: {
                                      "& .MuiAutocomplete-listbox": {
                                        maxHeight: "150px",
                                        overflow: "auto",
                                      },
                                      "& .MuiAutocomplete-option": {
                                        fontSize: "13px", // Specifically targeting individual options
                                      },
                                      "& .MuiAutocomplete-listbox .MuiAutocomplete-option:hover":
                                        {
                                          backgroundColor: "#E9E5F1 !important",
                                          color: "#280071 !important",
                                          fontWeight: 600,
                                        },
                                      "& .MuiAutocomplete-listbox .MuiAutocomplete-option[aria-selected='true']":
                                        {
                                          backgroundColor: "#E9E5F1 !important",
                                          color: "#280071 !important",
                                          fontWeight: 600,
                                        },
                                    },
                                  },
                                }}
                                size="small"
                                clearIcon={<ClearIcon color="primary" />}
                                PaperComponent={(props) => (
                                  <Paper
                                    sx={{
                                      background: "#fff",
                                      color: "#B4B4B4",
                                      // borderRadius: "10px",
                                    }}
                                    {...props}
                                  />
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Govt. ID Type"
                                    variant="standard"
                                    // sx={{
                                    //   "& .MuiOutlinedInput-root": {
                                    //     borderRadius: 2,
                                    //   },
                                    // }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 6, md: 4 }}>
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              disabled={!Boolean(item?.govtIdType)}
                              id={`govtIdNo${index}`}
                              label="Govt. Id"
                              name="govtIdNo"
                              autoComplete="govtIdNo"
                              variant="standard"
                              inputProps={{
                                maxLength: 50,
                                style: {
                                  fontSize: "14px",
                                },
                              }}
                              InputLabelProps={{
                                style: {
                                  fontSize: "13px",
                                },
                              }}
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "23px",
                                },
                                "& .MuiTextField-root": {
                                  maxHeight: "30px",
                                  backgroundColor: "transparent",
                                },
                              }}
                              value={item?.govtIdNo || ""}
                              onChange={(e) =>
                                handleChangeCustomFormDrawerDataOnChange(
                                  "govtIdNo",
                                  e?.target?.value,
                                  index
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    );
                  })}
                  {/* <Grid size={{ xs: 12 }}></Grid> */}
                </Box>
              </Grid>

              {/* PAYMENTS */}
              <Grid size={12}>
                <Grid container size={12}>
                  {/* STAYERS */}
                  <Grid size={12}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Payment Details :
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Advance Paid
                    </Typography>
                  </Grid>

                  <Grid size={8}>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.transactionDetails
                          ?.filter((item) => Boolean(item?.isCredit))
                          ?.reduce((sum, item) => sum + (item?.amount || 0), 0)}
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Grid container size={12} spacing={2}>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "end",
                        paddingBottom: "8px",
                        ".MuiTextField-root": {
                          width: "100%",
                          backgroundColor: "transparent",
                          ".MuiInputBase-root": {
                            color: "#B4B4B4",
                            background: "rgba(255, 255, 255, 0.25)",
                          },
                        },
                        ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                          borderBottom: (theme) =>
                            `1px solid ${theme.palette.primary.main}`,
                        },
                        ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                          borderBottom: (theme) =>
                            `1px solid ${theme.palette.primary.main}`,
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "13px",
                        },
                        "& .MuiOutlinedInput-root": {
                          height: "35px",
                          minHeight: "35px",
                        },
                        "& .MuiInputBase-input": {
                          padding: "13px",
                          height: "100%",
                          boxSizing: "border-box",
                          fontSize: "13px",
                        },
                      }}
                    >
                      <Autocomplete
                        fullWidth
                        options={
                          allPaymentMethods?.data
                            ?.filter((item) =>
                              ["Cash", "Online"].includes(item)
                            )
                            ?.map((item) => ({
                              key: item,
                              name: item.replace(/_/g, " "),
                            })) || []
                        }
                        // disableClearable
                        value={customFormDrawerData?.paymentMethod || null}
                        onChange={(e, newVal) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "paymentMethod",
                            newVal
                          )
                        }
                        inputValue={
                          customFormDrawerData?.paymentMethodInputValue || ""
                        }
                        onInputChange={(e, newVal) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "paymentMethodInputValue",
                            newVal
                          )
                        }
                        getOptionLabel={(option) => option?.name}
                        clearOnEscape
                        disablePortal
                        popupIcon={<KeyboardArrowDownIcon color="primary" />}
                        sx={{
                          // width: 200,
                          ".MuiInputBase-root": {
                            color: "#fff",
                          },
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
                        componentsProps={{
                          popper: {
                            sx: {
                              "& .MuiAutocomplete-listbox": {
                                maxHeight: "150px",
                                overflow: "auto",
                              },
                              "& .MuiAutocomplete-option": {
                                fontSize: "13px", // Specifically targeting individual options
                              },
                            },
                          },
                        }}
                        size="small"
                        clearIcon={<ClearIcon color="primary" />}
                        PaperComponent={(props) => (
                          <Paper
                            sx={{
                              background: "#fff",
                              color: "#B4B4B4",
                              // borderRadius: "10px",
                            }}
                            {...props}
                          />
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Payment Method"
                            variant="standard"
                            // sx={{
                            //   "& .MuiOutlinedInput-root": {
                            //     borderRadius: 2,
                            //   },
                            // }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  {customFormDrawerData?.paymentMethod &&
                    !(customFormDrawerData?.paymentMethod?.key === "Cash") &&
                    !(
                      customFormDrawerData?.paymentMethod?.key === "Online"
                    ) && (
                      <Grid size={{ xs: 6, md: 4 }}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id={`transactionReferenceNo`}
                          label="Transaction ref. No."
                          name="transactionReferenceNo"
                          autoComplete="transactionReferenceNo"
                          variant="standard"
                          value={
                            customFormDrawerData?.transactionReferenceNo || ""
                          }
                          inputProps={{
                            maxLength: 80,
                            style: {
                              fontSize: "14px",
                            },
                          }}
                          InputLabelProps={{
                            style: {
                              fontSize: "13px",
                            },
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              height: "23px",
                            },
                            "& .MuiTextField-root": {
                              maxHeight: "30px",
                              backgroundColor: "transparent",
                            },
                          }}
                          onChange={(e) =>
                            handleChangeCustomFormDrawerDataOnChange(
                              "transactionReferenceNo",
                              e?.target?.value
                            )
                          }
                        />
                      </Grid>
                    )}

                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      margin="normal"
                      fullWidth
                      disabled={!Boolean(customFormDrawerData?.paymentMethod)}
                      id={`paidAmount`}
                      label="Amount"
                      name="paidAmount"
                      autoComplete="paidAmount"
                      variant="standard"
                      inputProps={{
                        maxLength: 20,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                      value={customFormDrawerData?.paidAmount || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "paidAmount",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      margin="normal"
                      // required
                      fullWidth
                      id={`remarks`}
                      label="Remarks"
                      name="remarks"
                      autoComplete="remarks"
                      variant="standard"
                      inputProps={{
                        maxLength: 120,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                      value={customFormDrawerData?.remarks || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "remarks",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundImage:
                      "linear-gradient(to right, #2ba409, #4fb009, #6dbc0b, #88c810, #a3d417)", // Multi-tone gradient
                    color: "white",
                    "&:hover": {
                      backgroundImage:
                        "linear-gradient(to right, #2ba409, #4fb009, #6dbc0b, #88c810, #a3d417)", // Same gradient for hover
                    },
                  }}
                  onClick={() => handleSubmitRoomCheckInOnClick()}
                >
                  Check-In
                </Button>
              </Grid>
            </Grid>
          )}

          {type === "cancelBooking" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12} spacing={2}>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Booking Ref. No.
                    </Typography>
                  </Grid>
                  <Grid size={8}>
                    <Typography
                      sx={{
                        fontSize: "17px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "17px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {isSelectedRoom?.bookingDto?.bookingRefNumber || ""}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={4}
                      inputProps={{ maxLength: 150 }}
                      id="cancelBookingReason"
                      label="Reason"
                      name="cancelBookingReason"
                      // autoComplete="noOfPeoples"
                      variant="standard"
                      value={customFormDrawerData?.cancelBookingReason || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "cancelBookingReason",
                          e?.target?.value
                        )
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                        color: "white",
                        "&:hover": {
                          backgroundImage:
                            "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                        },
                      }}
                      onClick={() => handleSubmitRoomBookingCanelationOnClick()}
                    >
                      Cancel Booking
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}

          {type === "booking" && (
            <Grid container size={12} spacing={1}>
              <Grid size={12}>
                <Grid container size={12} columnSpacing={1} rowSpacing={0.6}>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      name="firstName"
                      // autoComplete="firstName"
                      variant="standard"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={customFormDrawerData?.firstName || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "firstName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      // required
                      fullWidth
                      id="middleName"
                      label="Middle Name"
                      name="middleName"
                      // autoComplete="middleName"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      variant="standard"
                      value={customFormDrawerData?.middleName || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "middleName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      // required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      // autoComplete="lastName"
                      variant="standard"
                      inputProps={{
                        maxLength: 30,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={customFormDrawerData?.lastName || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "lastName",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="phoneNumber"
                      label="Phone No."
                      name="phoneNumber"
                      inputProps={{
                        maxLength: 10,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      // autoComplete="phoneNumber"
                      variant="standard"
                      value={customFormDrawerData?.phoneNumber || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "phoneNumber",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      id="email"
                      label="Email"
                      name="email"
                      // autoComplete="email"
                      variant="standard"
                      inputProps={{
                        maxLength: 120,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={customFormDrawerData?.email || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "email",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      required
                      fullWidth
                      id="address"
                      label="Address"
                      name="address"
                      // autoComplete="address"
                      variant="standard"
                      inputProps={{
                        maxLength: 150,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={customFormDrawerData?.address || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "address",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "80%",
                          display: "flex",
                          alignItems: "center",
                          paddingY: "6px",
                          paddingX: "7px",
                          borderRadius: "5px",
                          bgcolor: "#fff1c6",
                          color: "#9c5208",
                        }}
                      >
                        <Typography sx={{ fontSize: "13px", fontWeight: 550 }}>
                          Room Capacity:{" "}
                          {isSelectedRoom?.roomType?.capacity || "0"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      required
                      fullWidth
                      id="noOfPeoples"
                      label="Stayer"
                      name="noOfPeoples"
                      // autoComplete="noOfPeoples"
                      variant="standard"
                      inputProps={{
                        maxLength: 3,
                        style: {
                          fontSize: "14px",
                        },
                      }}
                      InputLabelProps={{
                        style: {
                          fontSize: "13px",
                        },
                      }}
                      value={customFormDrawerData?.noOfPeoples || ""}
                      onChange={(e) =>
                        handleChangeCustomFormDrawerDataOnChange(
                          "noOfPeoples",
                          e?.target?.value
                        )
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "23px",
                        },
                        "& .MuiTextField-root": {
                          maxHeight: "30px",
                          backgroundColor: "transparent",
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box
                      sx={{
                        width: "100%",
                        paddingTop: "9px",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={customFormDrawerData?.isBookingForToday}
                            onChange={(e) =>
                              handleChangeCustomFormDrawerDataOnChange(
                                "isBookingForToday",
                                e?.target?.checked
                              )
                            }
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontSize: "14px", color: "#666666" }}
                          >
                            Book For Today
                          </Typography>
                        }
                        labelPlacement="end"
                      />
                    </Box>
                  </Grid>

                  {Boolean(customFormDrawerData?.isBookingForToday) && (
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                          // paddingBottom: "8px",
                        }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateTimePicker
                            disablePast
                            value={customFormDrawerData?.checkOutDate || null}
                            onChange={(newVal) =>
                              handleChangeCustomFormDrawerDataOnChange(
                                "checkOutDate",
                                newVal
                              )
                            }
                            slotProps={{
                              textField: {
                                variant: "standard",
                                size: "small",
                                readOnly: true,
                                label: "Check-Out Date",
                                sx: {
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.25)",
                                    color: "#B4B4B4",
                                  },
                                  "& .MuiTextField-root": {
                                    width: "100%",
                                    backgroundColor: "transparent",
                                  },
                                  "& .MuiFormLabel-root": {
                                    fontSize: 15,
                                    mt: 0.5,
                                  },
                                  "& input": {
                                    fontSize: "13px", // Date font size
                                  },
                                },
                              },
                            }}
                            slots={{
                              openPickerIcon: StyledCalendarIcon,
                            }}
                            format="DD-MM-YYYY hh:mm A"
                          />
                        </LocalizationProvider>
                      </Box>
                    </Grid>
                  )}

                  {!Boolean(customFormDrawerData?.isBookingForToday) && (
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            disablePast
                            shouldDisableDate={(date) => {
                              // if (customFormDrawerData?.isBookingForToday) {
                              //   return false;
                              // }
                              return (
                                new Date(date.toString()).toDateString() ===
                                new Date().toDateString()
                              );
                            }}
                            value={customFormDrawerData?.fromDate || null}
                            onChange={(newVal) =>
                              handleChangeCustomFormDrawerDataOnChange(
                                "fromDate",
                                newVal
                              )
                            }
                            slotProps={{
                              textField: {
                                variant: "standard",
                                size: "small",
                                readOnly: true,
                                label: "From Date",
                                sx: {
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.25)",
                                    color: "#B4B4B4",
                                  },
                                  "& .MuiTextField-root": {
                                    width: "100%",
                                    backgroundColor: "transparent",
                                  },
                                  "& .MuiFormLabel-root": {
                                    fontSize: 15,
                                    mt: 0.5,
                                  },
                                  "& input": {
                                    fontSize: "13px", // Date font size
                                  },
                                },
                              },
                            }}
                            slots={{
                              openPickerIcon: StyledCalendarIcon,
                            }}
                            format="DD-MM-YYYY"
                          />
                        </LocalizationProvider>
                      </Box>
                    </Grid>
                  )}

                  {!Boolean(customFormDrawerData?.isBookingForToday) && (
                    <Grid size={{ xs: 4 }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            disablePast
                            value={customFormDrawerData?.toDate || null}
                            shouldDisableDate={(date) => {
                              if (customFormDrawerData?.fromDate) {
                                return date.isBefore(
                                  dayjs(customFormDrawerData.fromDate).startOf(
                                    "day"
                                  )
                                );
                              }
                              return false;
                            }}
                            onChange={(newVal) =>
                              handleChangeCustomFormDrawerDataOnChange(
                                "toDate",
                                newVal
                              )
                            }
                            slotProps={{
                              textField: {
                                variant: "standard",
                                size: "small",
                                readOnly: true,
                                label: "To Date",
                                sx: {
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor:
                                      "rgba(255, 255, 255, 0.25)",
                                    color: "#B4B4B4",
                                  },
                                  "& .MuiTextField-root": {
                                    width: "100%",
                                    backgroundColor: "transparent",
                                  },
                                  "& .MuiFormLabel-root": {
                                    fontSize: 15,
                                    mt: 0.5,
                                  },
                                  "& input": {
                                    fontSize: "13px", // Date font size
                                  },
                                },
                              },
                            }}
                            slots={{
                              openPickerIcon: StyledCalendarIcon,
                            }}
                            format="DD-MM-YYYY"
                          />
                        </LocalizationProvider>
                      </Box>
                    </Grid>
                  )}
                  {customFormDrawerData?.isBookingForToday && (
                    <React.Fragment>
                      <Grid size={12}>
                        <Grid container size={12}>
                          {/* STAYERS */}
                          <Grid size={12}>
                            <Typography
                              sx={{
                                fontSize: "16px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginTop: "5px",
                              }}
                            >
                              Guests Verification Details :
                            </Typography>
                            <Divider />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            width: "100%",
                            // maxHeight: "calc(100vh - 550px)",
                            maxHeight: "270px",
                            overflowX: "hidden",
                            overflowY: "auto",
                            marginTop: "10px",
                          }}
                        >
                          {customFormDrawerData?.bookingMapDatas?.map(
                            (item, index) => {
                              return (
                                <Box
                                  key={`verification-${index}`}
                                  sx={{ width: "100%", marginBottom: "10px" }}
                                >
                                  <Grid container size={12} columnSpacing={1}>
                                    <Grid size={12}>
                                      <Typography
                                        sx={{
                                          fontSize: "15px",
                                          // color: "#707070",
                                          fontWeight: 600,
                                          width: "100%",
                                          bgcolor: "#e8e8e8",
                                        }}
                                      >
                                        Customer {index + 1} :
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 4 }}>
                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id={`customerName${index}`}
                                        label="Guest Name"
                                        name="customerName"
                                        inputProps={{
                                          maxLength: 90,
                                          style: {
                                            fontSize: "14px",
                                          },
                                        }}
                                        InputLabelProps={{
                                          style: {
                                            fontSize: "13px",
                                          },
                                        }}
                                        // autoComplete="noOfPeoples"
                                        variant="standard"
                                        value={item?.customerName || ""}
                                        onChange={(e) =>
                                          handleChangeCustomFormDrawerDataOnChange(
                                            "customerName",
                                            e?.target?.value,
                                            index
                                          )
                                        }
                                        sx={{
                                          "& .MuiInputBase-root": {
                                            height: "23px",
                                          },
                                          "& .MuiTextField-root": {
                                            maxHeight: "30px",
                                            backgroundColor: "transparent",
                                          },
                                        }}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 4 }}>
                                      <Box
                                        sx={{
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "end",
                                          paddingBottom: "7px",
                                          ".MuiTextField-root": {
                                            width: "100%",
                                            backgroundColor: "transparent",
                                            ".MuiInputBase-root": {
                                              color: "#B4B4B4",
                                              background:
                                                "rgba(255, 255, 255, 0.25)",
                                            },
                                          },
                                          ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                                            {
                                              borderBottom: (theme) =>
                                                `1px solid ${theme.palette.primary.main}`,
                                            },
                                          ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                                            {
                                              borderBottom: (theme) =>
                                                `1px solid ${theme.palette.primary.main}`,
                                            },
                                          "& .MuiInputLabel-root": {
                                            fontSize: "13px",
                                          },
                                          "& .MuiOutlinedInput-root": {
                                            height: "35px",
                                            minHeight: "35px",
                                          },
                                          "& .MuiInputBase-input": {
                                            padding: "13px",
                                            height: "100%",
                                            boxSizing: "border-box",
                                            fontSize: "13px",
                                          },
                                        }}
                                      >
                                        <Autocomplete
                                          fullWidth
                                          options={
                                            allGovtIdsData?.data?.map(
                                              (item) => ({
                                                key: item,
                                                name: item.replace(/_/g, " "),
                                              })
                                            ) || []
                                          }
                                          disableClearable
                                          value={item?.govtIdType || null}
                                          onChange={(e, newVal) =>
                                            handleChangeCustomFormDrawerDataOnChange(
                                              "govtIdType",
                                              newVal,
                                              index
                                            )
                                          }
                                          inputValue={
                                            item?.govtIdTypeInputValue
                                          }
                                          onInputChange={(e, newVal) =>
                                            handleChangeCustomFormDrawerDataOnChange(
                                              "govtIdTypeInputValue",
                                              newVal,
                                              index
                                            )
                                          }
                                          getOptionLabel={(option) =>
                                            option?.name
                                          }
                                          clearOnEscape
                                          // disablePortal
                                          popupIcon={
                                            <KeyboardArrowDownIcon color="primary" />
                                          }
                                          sx={{
                                            // width: 200,
                                            ".MuiInputBase-root": {
                                              color: "#fff",
                                            },
                                          }}
                                          componentsProps={{
                                            popper: {
                                              sx: {
                                                "& .MuiAutocomplete-listbox": {
                                                  maxHeight: "150px",
                                                  overflow: "auto",
                                                },
                                                "& .MuiAutocomplete-option": {
                                                  fontSize: "13px", // Specifically targeting individual options
                                                },
                                                "& .MuiAutocomplete-listbox .MuiAutocomplete-option:hover":
                                                  {
                                                    backgroundColor:
                                                      "#E9E5F1 !important",
                                                    color: "#280071 !important",
                                                    fontWeight: 600,
                                                  },
                                                "& .MuiAutocomplete-listbox .MuiAutocomplete-option[aria-selected='true']":
                                                  {
                                                    backgroundColor:
                                                      "#E9E5F1 !important",
                                                    color: "#280071 !important",
                                                    fontWeight: 600,
                                                  },
                                              },
                                            },
                                          }}
                                          size="small"
                                          clearIcon={
                                            <ClearIcon color="primary" />
                                          }
                                          PaperComponent={(props) => (
                                            <Paper
                                              sx={{
                                                background: "#fff",
                                                color: "#B4B4B4",
                                                // borderRadius: "10px",
                                              }}
                                              {...props}
                                            />
                                          )}
                                          renderInput={(params) => (
                                            <TextField
                                              {...params}
                                              label="Govt. ID Type"
                                              variant="standard"
                                            />
                                          )}
                                        />
                                      </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 4 }}>
                                      <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        disabled={!Boolean(item?.govtIdType)}
                                        id={`govtIdNo${index}`}
                                        label="Govt. Id"
                                        name="govtIdNo"
                                        autoComplete="govtIdNo"
                                        variant="standard"
                                        inputProps={{
                                          maxLength: 50,
                                          style: {
                                            fontSize: "14px",
                                          },
                                        }}
                                        InputLabelProps={{
                                          style: {
                                            fontSize: "13px",
                                          },
                                        }}
                                        value={item?.govtIdNo || ""}
                                        onChange={(e) =>
                                          handleChangeCustomFormDrawerDataOnChange(
                                            "govtIdNo",
                                            e?.target?.value,
                                            index
                                          )
                                        }
                                        sx={{
                                          "& .MuiInputBase-root": {
                                            height: "23px",
                                          },
                                          "& .MuiTextField-root": {
                                            maxHeight: "30px",
                                            backgroundColor: "transparent",
                                          },
                                        }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              );
                            }
                          )}
                          {/* <Grid size={{ xs: 12 }}></Grid> */}
                        </Box>
                      </Grid>
                    </React.Fragment>
                  )}
                </Grid>

                <Grid size={12}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <Typography
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginTop: "5px",
                        }}
                      >
                        Room Charges Details :
                      </Typography>
                      <Divider />
                    </Grid>
                  </Grid>
                </Grid>

                {/* ROOM CHARGES */}
                <Grid size={{ xs: 12 }}>
                  <Grid container size={12} rowSpacing={0.5}>
                    <Grid size={5}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        Room Base Price (per day)
                      </Typography>
                    </Grid>
                    <Grid size={7}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            fontWeight: 600,
                            marginRight: "5px",
                          }}
                        >
                          :
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            // fontWeight: 600,
                          }}
                        >
                          {customFormDrawerData?.roomBasePrice || 0}
                        </Typography>
                      </Typography>
                    </Grid>

                    <Grid size={5}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        Total Charge
                      </Typography>
                    </Grid>
                    <Grid size={7}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            fontWeight: 600,
                            marginRight: "5px",
                          }}
                        >
                          :
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            // fontWeight: 600,
                          }}
                        >
                          {customFormDrawerData?.accumulatedRoomCharge}{" "}
                          {Boolean(customFormDrawerData?.numberOfDaysOfStay) &&
                            `(${customFormDrawerData?.numberOfDaysOfStay} day${
                              Boolean(
                                customFormDrawerData?.numberOfDaysOfStay > 1
                              )
                                ? "s"
                                : ""
                            } of stay)`}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid size={5}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        Advance Required
                      </Typography>
                    </Grid>
                    <Grid size={7}>
                      <Typography
                        sx={{
                          fontSize: "14px",
                          // color: "#707070",
                          fontWeight: 600,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            fontWeight: 600,
                            marginRight: "5px",
                          }}
                        >
                          :
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: "14px",
                            // color: "#707070",
                            // fontWeight: 600,
                          }}
                        >
                          {Boolean(customFormDrawerData?.isAdvanceRequired)
                            ? customFormDrawerData?.accumulatedAdvanceRequired ||
                              0
                            : 0}{" "}
                          {!Boolean(customFormDrawerData?.isAdvanceRequired)
                            ? "(No advance is required.)"
                            : ""}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* PAYMENTS */}
                <Grid size={{ xs: 12 }}>
                  <Grid container size={12} spacing={2}>
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "end",
                          paddingBottom: "7px",
                          ".MuiTextField-root": {
                            width: "100%",
                            backgroundColor: "transparent",
                            ".MuiInputBase-root": {
                              color: "#B4B4B4",
                              background: "rgba(255, 255, 255, 0.25)",
                            },
                          },
                          ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                            {
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                            },
                          ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                            {
                              borderBottom: (theme) =>
                                `1px solid ${theme.palette.primary.main}`,
                            },
                          "& .MuiInputLabel-root": {
                            fontSize: "13px",
                          },
                          "& .MuiOutlinedInput-root": {
                            height: "35px",
                            minHeight: "35px",
                          },
                          "& .MuiInputBase-input": {
                            padding: "13px",
                            height: "100%",
                            boxSizing: "border-box",
                            fontSize: "13px",
                          },
                        }}
                      >
                        <Autocomplete
                          fullWidth
                          options={
                            allPaymentMethods?.data
                              ?.filter((item) =>
                                ["Cash", "Online"].includes(item)
                              )
                              ?.map((item) => ({
                                key: item,
                                name: item.replace(/_/g, " "),
                              })) || []
                          }
                          // disableClearable
                          value={customFormDrawerData?.paymentMethod || null}
                          onChange={(e, newVal) =>
                            handleChangeCustomFormDrawerDataOnChange(
                              "paymentMethod",
                              newVal
                            )
                          }
                          inputValue={
                            customFormDrawerData?.paymentMethodInputValue || ""
                          }
                          onInputChange={(e, newVal) =>
                            handleChangeCustomFormDrawerDataOnChange(
                              "paymentMethodInputValue",
                              newVal
                            )
                          }
                          getOptionLabel={(option) => option?.name}
                          clearOnEscape
                          disablePortal
                          popupIcon={<KeyboardArrowDownIcon color="primary" />}
                          sx={{
                            // width: 200,
                            ".MuiInputBase-root": {
                              color: "#fff",
                            },
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
                          componentsProps={{
                            popper: {
                              sx: {
                                "& .MuiAutocomplete-listbox": {
                                  maxHeight: "150px",
                                  overflow: "auto",
                                },
                                "& .MuiAutocomplete-option": {
                                  fontSize: "13px", // Specifically targeting individual options
                                },
                              },
                            },
                          }}
                          size="small"
                          clearIcon={<ClearIcon color="primary" />}
                          PaperComponent={(props) => (
                            <Paper
                              sx={{
                                background: "#fff",
                                color: "#B4B4B4",
                                // borderRadius: "10px",
                              }}
                              {...props}
                            />
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Payment Method"
                              variant="standard"
                              // sx={{
                              //   "& .MuiOutlinedInput-root": {
                              //     borderRadius: 2,
                              //   },
                              // }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    {customFormDrawerData?.paymentMethod &&
                      !(customFormDrawerData?.paymentMethod?.key === "Cash") &&
                      !(
                        customFormDrawerData?.paymentMethod?.key === "Online"
                      ) && (
                        <Grid size={{ xs: 6, md: 4 }}>
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            id={`transactionReferenceNo`}
                            label="Transaction ref. No."
                            name="transactionReferenceNo"
                            autoComplete="transactionReferenceNo"
                            variant="standard"
                            value={
                              customFormDrawerData?.transactionReferenceNo || ""
                            }
                            inputProps={{
                              maxLength: 80,
                              style: {
                                fontSize: "14px",
                              },
                            }}
                            InputLabelProps={{
                              style: {
                                fontSize: "13px",
                              },
                            }}
                            onChange={(e) =>
                              handleChangeCustomFormDrawerDataOnChange(
                                "transactionReferenceNo",
                                e?.target?.value
                              )
                            }
                            sx={{
                              "& .MuiInputBase-root": {
                                height: "23px",
                              },
                              "& .MuiTextField-root": {
                                maxHeight: "30px",
                                backgroundColor: "transparent",
                              },
                            }}
                          />
                        </Grid>
                      )}

                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        margin="normal"
                        fullWidth
                        required={
                          customFormDrawerData?.isAdvanceRequired || false
                        }
                        disabled={!Boolean(customFormDrawerData?.paymentMethod)}
                        id={`paidAmount`}
                        label="Amount"
                        name="paidAmount"
                        autoComplete="paidAmount"
                        variant="standard"
                        inputProps={{
                          maxLength: 20,
                          style: {
                            fontSize: "14px",
                          },
                        }}
                        InputLabelProps={{
                          style: {
                            fontSize: "13px",
                          },
                        }}
                        value={customFormDrawerData?.paidAmount || ""}
                        onChange={(e) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "paidAmount",
                            e?.target?.value
                          )
                        }
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "23px",
                          },
                          "& .MuiTextField-root": {
                            maxHeight: "30px",
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 6, md: 4 }}>
                      <TextField
                        margin="normal"
                        // required
                        fullWidth
                        id={`remarks`}
                        label="Remarks"
                        name="remarks"
                        autoComplete="remarks"
                        variant="standard"
                        inputProps={{
                          maxLength: 120,
                          style: {
                            fontSize: "14px",
                          },
                        }}
                        InputLabelProps={{
                          style: {
                            fontSize: "13px",
                          },
                        }}
                        value={customFormDrawerData?.remarks || ""}
                        onChange={(e) =>
                          handleChangeCustomFormDrawerDataOnChange(
                            "remarks",
                            e?.target?.value
                          )
                        }
                        sx={{
                          "& .MuiInputBase-root": {
                            height: "23px",
                          },
                          "& .MuiTextField-root": {
                            maxHeight: "30px",
                            backgroundColor: "transparent",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundImage:
                        "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                      color: "white",
                      "&:hover": {
                        backgroundImage:
                          "linear-gradient(to right, #0acffe 10%, #495aff 90%)", // Optional hover adjustment
                      },
                    }}
                    onClick={() =>
                      handleSubmitBookingForGuestByFrontDeskOnClick()
                    }
                  >
                    Book Now
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </Drawer>
  );
});

const getCellValue = (obj, key, fallback = "") => {
  if (!key) return undefined;
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
      obj
    );
};
const CustomBarTableParentCollapseTableRow = memo(function ({
  barListTableHeaders,
  rowSerialNumber,
  key,
  row,
  barListItemsTableHeaders,
  isForCheckOut = false,
}) {
  const [openCollapseTable, setOpenCollapseTable] = useState(
    isForCheckOut ? false : true
  );

  const handleChangeOpenCollapseTable = useCallback(() => {
    setOpenCollapseTable((prev) => !prev);
  }, []);

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 35,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        {barListTableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell key={`table-body-cell=${subIndex}`} align="center">
              <Typography sx={{ fontSize: "12px" }}>
                {subitem?.key === "sno" ? (
                  <Typography sx={{ fontSize: "12px" }}>
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "orderedOn" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.createdAt &&
                      moment(row?.createdAt).format("DD-MM-YYYY hh:mm A")}
                  </Typography>
                ) : subitem?.key === "orderId" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      wordBreak: "break-all",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.orderId}
                  </Typography>
                ) : subitem?.key === "serving" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.dinningType
                      ?.replace(/_/g, " ")
                      ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                ) : subitem?.key === "bookingStatus" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.orderStatus
                      ?.replace(/_/g, " ")
                      ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                ) : subitem?.key === "barListAction" ? (
                  // <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <IconButton
                    sx={{
                      width: "20px",
                      height: "20px",
                      transition: "transform 0.3s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeOpenCollapseTable();
                    }}
                  >
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        transform: openCollapseTable
                          ? "rotate(180deg)" // Rotated when true
                          : "rotate(0deg)", // Default position when false
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                ) : (
                  // </Box>
                  <Typography sx={{ fontSize: "12px", wordWrap: "break-word" }}>
                    {getCellValue(row, subitem?.key)}
                  </Typography>
                )}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{
            paddingBottom: 0,
            paddingTop: 0,
            padding: "0 !important",
          }}
          colSpan={
            Boolean(barListTableHeaders?.length)
              ? barListTableHeaders?.length
              : 1
          }
        >
          <Collapse in={openCollapseTable} timeout="auto">
            <Table size="small" aria-label="bookedGuests">
              <TableHead>
                <TableRow>
                  {barListItemsTableHeaders?.map((item, index) => {
                    return (
                      <TableCell
                        key={`child-table-head-${index}`}
                        align="center"
                        sx={{
                          color: "white",
                          backgroundColor: "#454545",
                          fontWeight: "bold",
                          // paddingY: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {item?.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Boolean(row?.ordersList?.length) ? (
                  row?.ordersList?.map((childItem, childIndex) => (
                    <TableRow key={`child-row-${childIndex}`}>
                      {barListItemsTableHeaders?.map(
                        (subHeaderitem, subIndex) => {
                          return (
                            <TableCell
                              key={`table-body-cell=${subIndex}`}
                              align="center"
                            >
                              <Typography sx={{ fontSize: "13px" }}>
                                {subHeaderitem?.key === "sno" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childIndex + 1}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {getCellValue(
                                      childItem,
                                      subHeaderitem?.key
                                    )}
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={
                        Boolean(barListItemsTableHeaders?.length)
                          ? barListItemsTableHeaders?.length
                          : 1
                      }
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const CustomBarListTableContainer = memo(function ({
  barListTableData,
  barListTableHeaders,
  barListItemsTableHeaders,
  isForCheckOut = false,
}) {
  console.log(
    "CustomBarListTableContainer barListTableData : ",
    barListTableData
  );
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: isForCheckOut ? "220px" : "310px",
            // xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {
              // height: "14px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#ffffff00",
              width: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#280071",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3b0b92",
            },
          },
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {barListTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      // paddingY: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(barListTableData?.length > 0) ? (
              barListTableData?.map((row, index) => (
                <CustomBarTableParentCollapseTableRow
                  barListTableHeaders={barListTableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                  barListItemsTableHeaders={barListItemsTableHeaders}
                  isForCheckOut={isForCheckOut}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(barListTableHeaders?.length)
                      ? barListTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell
                colSpan={5}
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  minHeight: "100%",
                  borderTop: "1px solid #ccc",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                    minHeight: "24.9px",
                  }}
                >
                  {" "}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  Total
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  {barListTableData?.reduce(
                    (sum, item) => sum + (item?.totalAmount || 0),
                    0
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

const CustomParentCollapseTableRow = memo(function ({
  foodListTableHeaders,
  rowSerialNumber,
  key,
  row,
  foodListItemsTableHeaders,
  isForCheckOut = false,
}) {
  const [openCollapseTable, setOpenCollapseTable] = useState(
    isForCheckOut ? false : true
  );

  const handleChangeOpenCollapseTable = useCallback(() => {
    setOpenCollapseTable((prev) => !prev);
  }, []);

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 35,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        {foodListTableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell key={`table-body-cell=${subIndex}`} align="center">
              <Typography sx={{ fontSize: "12px" }}>
                {subitem?.key === "sno" ? (
                  <Typography sx={{ fontSize: "12px" }}>
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "orderedOn" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.bookingDetails?.bookedOn &&
                      moment(row?.bookingDetails?.bookedOn).format(
                        "DD-MM-YYYY hh:mm A"
                      )}
                  </Typography>
                ) : subitem?.key === "orderId" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      wordBreak: "break-all",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.bookingDetails?.orderId}
                  </Typography>
                ) : subitem?.key === "serving" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.bookingDetails?.dinningType
                      ?.replace(/_/g, " ")
                      ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                ) : subitem?.key === "foodBookingStatus" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.bookingDetails?.foodBookingStatus
                      ?.replace(/_/g, " ")
                      ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                ) : subitem?.key === "foodListAction" ? (
                  // <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <IconButton
                    sx={{
                      width: "20px",
                      height: "20px",
                      transition: "transform 0.3s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeOpenCollapseTable();
                    }}
                  >
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        transform: openCollapseTable
                          ? "rotate(180deg)" // Rotated when true
                          : "rotate(0deg)", // Default position when false
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                ) : (
                  // </Box>
                  <Typography sx={{ fontSize: "12px", wordWrap: "break-word" }}>
                    {getCellValue(row, subitem?.key)}
                  </Typography>
                )}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{
            paddingBottom: 0,
            paddingTop: 0,
            padding: "0 !important",
          }}
          colSpan={
            Boolean(foodListTableHeaders?.length)
              ? foodListTableHeaders?.length
              : 1
          }
        >
          <Collapse in={openCollapseTable} timeout="auto">
            <Table size="small" aria-label="bookedGuests">
              <TableHead>
                <TableRow>
                  {foodListItemsTableHeaders?.map((item, index) => {
                    return (
                      <TableCell
                        key={`child-table-head-${index}`}
                        align="center"
                        sx={{
                          color: "white",
                          backgroundColor: "#454545",
                          fontWeight: "bold",
                          // paddingY: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {item?.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Boolean(row?.itemsList?.length) ? (
                  row?.itemsList?.map((childItem, childIndex) => (
                    <TableRow key={`child-row-${childIndex}`}>
                      {foodListItemsTableHeaders?.map(
                        (subHeaderitem, subIndex) => {
                          return (
                            <TableCell
                              key={`table-body-cell=${subIndex}`}
                              align="center"
                            >
                              <Typography sx={{ fontSize: "13px" }}>
                                {subHeaderitem?.key === "sno" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childIndex + 1}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {getCellValue(
                                      childItem,
                                      subHeaderitem?.key
                                    )}
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={
                        Boolean(foodListItemsTableHeaders?.length)
                          ? foodListItemsTableHeaders?.length
                          : 1
                      }
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const CustomFoodListTableContainer = memo(function ({
  foodListTableHeaders,
  foodListTableData,
  foodListItemsTableHeaders,
  isForCheckOut = false,
}) {
  console.log(
    "CustomFoodListTableContainer foodListTableData : ",
    foodListTableData
  );
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: isForCheckOut ? "220px" : "310px",
            // xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {
              // height: "14px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#ffffff00",
              width: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#280071",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3b0b92",
            },
          },
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {foodListTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      // paddingY: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(foodListTableData?.length > 0) ? (
              foodListTableData?.map((row, index) => (
                <CustomParentCollapseTableRow
                  foodListTableHeaders={foodListTableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                  foodListItemsTableHeaders={foodListItemsTableHeaders}
                  isForCheckOut={isForCheckOut}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(foodListTableHeaders?.length)
                      ? foodListTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
            {/* <TableRow>
              <TableCell
                colSpan={5}
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  minHeight: "100%",
                  borderTop: "1px solid #ccc",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                    minHeight: "24.9px",
                  }}
                >
                  {" "}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  Total
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  {foodListTableData?.reduce(
                    (sum, item) =>
                      sum + (item?.bookingDetails?.totalPrice || 0),
                    0
                  )}
                </Typography>
              </TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
      <Paper
        sx={{
          width: "100%",
          // backgroundColor: "yellow",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
          {/* <Box sx={{ display: "flex", p: 0.4 }}>
            <Typography>Gst </Typography>
            <Typography>98</Typography>
          </Box>
          <Box sx={{ display: "flex", p: 0.4 }}>
            <Typography>Total</Typography>
            <Typography>1000</Typography>
          </Box> */}
          <Grid container size={12}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography sx={{ fontWeight: "bold" }}>Gst :</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  // , justifyContent: "flex-end"
                  ml: 1,
                }}
              >
                Rs.{" "}
                <Typography>
                  {foodListTableData?.reduce(
                    (sum, item) => sum + (item?.bookingDetails?.gstPrice || 0),
                    0
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography sx={{ fontWeight: "bold" }}>Total :</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  // , justifyContent: "flex-end"
                  ml: 1,
                }}
              >
                Rs.{" "}
                {foodListTableData?.reduce(
                  (sum, item) => sum + (item?.bookingDetails?.totalPrice || 0),
                  0
                )}
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Typography sx={{ fontWeight: "bold" }}>Sub-Total :</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  display: "flex",
                  // , justifyContent: "flex-end"
                  ml: 1,
                }}
              >
                Rs.{" "}
                {(foodListTableData?.reduce(
                  (sum, item) => sum + (item?.bookingDetails?.totalPrice || 0),
                  0
                ) || 0) +
                  (foodListTableData?.reduce(
                    (sum, item) => sum + (item?.bookingDetails?.gstPrice || 0),
                    0
                  ) || 0)}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </React.Fragment>
  );
});

const CustomParentCollapseTableRowForLaundry = memo(function ({
  laundryListTableHeaders,
  rowSerialNumber,
  key,
  row,
  laundryListItemsTableHeaders,
  isForCheckOut = false,
}) {
  const [openCollapseTable, setOpenCollapseTable] = useState(
    isForCheckOut ? false : true
  );

  const handleChangeOpenCollapseTable = useCallback(() => {
    setOpenCollapseTable((prev) => !prev);
  }, []);

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 35,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        {laundryListTableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell key={`table-body-cell=${subIndex}`} align="center">
              <Typography sx={{ fontSize: "12px" }}>
                {subitem?.key === "sno" ? (
                  <Typography sx={{ fontSize: "12px" }}>
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "createdAt" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.createdAt &&
                      moment(row?.createdAt).format("DD-MM-YYYY hh:mm A")}
                  </Typography>
                ) : subitem?.key === "laundryStatus" ? (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      wordWrap: "break-word",
                      whiteSpace: "none",
                    }}
                  >
                    {row?.laundryStatus
                      ?.replace(/_/g, " ")
                      ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                      ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Typography>
                ) : subitem?.key === "laundryListAction" ? (
                  // <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <IconButton
                    sx={{
                      width: "20px",
                      height: "20px",
                      transition: "transform 0.3s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChangeOpenCollapseTable();
                    }}
                  >
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: "20px",
                        fontWeight: 600,
                        transform: openCollapseTable
                          ? "rotate(180deg)" // Rotated when true
                          : "rotate(0deg)", // Default position when false
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </IconButton>
                ) : (
                  // </Box>
                  <Typography sx={{ fontSize: "12px", wordWrap: "break-word" }}>
                    {getCellValue(row, subitem?.key)}
                  </Typography>
                )}
              </Typography>
            </TableCell>
          );
        })}
      </TableRow>
      <TableRow>
        <TableCell
          sx={{
            paddingBottom: 0,
            paddingTop: 0,
            padding: "0 !important",
          }}
          colSpan={
            Boolean(laundryListTableHeaders?.length)
              ? laundryListTableHeaders?.length
              : 1
          }
        >
          <Collapse in={openCollapseTable} timeout="auto">
            <Table size="small" aria-label="bookedGuests">
              <TableHead>
                <TableRow>
                  {laundryListItemsTableHeaders?.map((item, index) => {
                    return (
                      <TableCell
                        key={`child-table-head-${index}`}
                        align="center"
                        sx={{
                          color: "white",
                          backgroundColor: "#454545",
                          fontWeight: "bold",
                          // paddingY: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {item?.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Boolean(row?.itemsDto?.length) ? (
                  row?.itemsDto?.map((childItem, childIndex) => (
                    <TableRow key={`child-row-${childIndex}`}>
                      {laundryListItemsTableHeaders?.map(
                        (subHeaderitem, subIndex) => {
                          return (
                            <TableCell
                              key={`table-body-cell=${subIndex}`}
                              align="center"
                            >
                              <Typography sx={{ fontSize: "13px" }}>
                                {subHeaderitem?.key === "sno" ? (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {childIndex + 1}
                                  </Typography>
                                ) : (
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {getCellValue(
                                      childItem,
                                      subHeaderitem?.key
                                    )}
                                  </Typography>
                                )}
                              </Typography>
                            </TableCell>
                          );
                        }
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={
                        Boolean(laundryListItemsTableHeaders?.length)
                          ? laundryListItemsTableHeaders?.length
                          : 1
                      }
                    >
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

const CustomLaundryListTableContainer = memo(function ({
  laundryListTableHeaders,
  laundryListTableData,
  laundryListItemsTableHeaders,
  isForCheckOut = false,
}) {
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: isForCheckOut ? "220px" : "310px",
            // xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {
              // height: "14px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#ffffff00",
              width: "none",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#280071",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#3b0b92",
            },
          },
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {laundryListTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      // paddingY: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(laundryListTableData?.length > 0) ? (
              laundryListTableData?.map((row, index) => (
                <CustomParentCollapseTableRowForLaundry
                  laundryListTableHeaders={laundryListTableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                  laundryListItemsTableHeaders={laundryListItemsTableHeaders}
                  isForCheckOut={isForCheckOut}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(laundryListTableHeaders?.length)
                      ? laundryListTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell
                colSpan={3}
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  minHeight: "100%",
                  borderTop: "1px solid #ccc",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                    minHeight: "24.9px",
                  }}
                >
                  {" "}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  Total
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  {laundryListTableData?.reduce(
                    (sum, item) => sum + (item?.totalPrice || 0),
                    0
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

const ShowcaseDialog = memo(function ({
  openShowcaseDialog,
  handleCloseShowcaseDialog,
  title = "",
  type,
  inventoryData = [],
  foodData = [],
  laundryData = [],
  checkOutRoomData,
  showcaseDialogFormData,
  allPaymentMethods,
  handleChangeShowcaseDialogFormData,
  handleConfirmFinalCheckout,
  foodListTableHeaders,
  foodListItemsTableHeaders,
  laundryListTableHeaders,
  laundryListItemsTableHeaders,
  barListTableHeaders,
  barListItemsTableHeaders,
}) {
  // console.log("type : ", type);
  console.log("ShowcaseDialog foodData : ", foodData);

  const handleCloseShowcaseDialogOnClose = useCallback(() => {
    handleCloseShowcaseDialog();
  }, [handleCloseShowcaseDialog]);

  const handleChangeShowcaseDialogFormDataOnChange = useCallback(
    (name, value) => {
      handleChangeShowcaseDialogFormData(name, value);
    },
    [handleChangeShowcaseDialogFormData]
  );

  const handleConfirmFinalCheckoutOnClick = useCallback(() => {
    handleConfirmFinalCheckout();
  }, [handleConfirmFinalCheckout]);

  useEffect(() => {
    if (openShowcaseDialog && checkOutRoomData && type === "checkout") {
      handleChangeShowcaseDialogFormDataOnChange(
        "fullChange",
        checkOutRoomData
      );
    }
  }, [
    openShowcaseDialog,
    checkOutRoomData,
    type,
    handleChangeShowcaseDialogFormDataOnChange,
  ]);
  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={openShowcaseDialog}
        onClose={handleCloseShowcaseDialogOnClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="sm"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 2,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle
          id="password-change-dialog-title"
          sx={{
            // Reduce padding (default is larger)
            fontSize: "20px", // Adjust font size to suit smaller title
            lineHeight: "0.2", // Reduce line-height
            fontWeight: 600,
          }}
        >
          {title}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseShowcaseDialogOnClose}
          sx={{
            position: "absolute",
            right: 5,
            top: 1,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 27 }} />
        </IconButton>
        <DialogContent>
          <Box sx={{ width: "100%" }}>
            {type === "inventory" && (
              <>
                {Boolean(inventoryData?.length) && (
                  <CustomInventoryTable inventoryData={inventoryData} />
                )}
              </>
            )}
            {type === "food" && (
              <>
                {Boolean(foodData?.length) && (
                  <CustomFoodListTableContainer
                    foodListTableHeaders={foodListTableHeaders}
                    foodListTableData={foodData}
                    foodListItemsTableHeaders={foodListItemsTableHeaders}
                  />
                )}
              </>
            )}

            {type === "laundry" && (
              <>
                {Boolean(laundryData?.length) && (
                  <CustomLaundryListTableContainer
                    laundryListTableHeaders={laundryListTableHeaders}
                    laundryListTableData={laundryData}
                    laundryListItemsTableHeaders={laundryListItemsTableHeaders}
                  />
                )}
              </>
            )}

            {type === "checkout" && (
              <>
                <Box sx={{ width: "100%" }}>
                  <Grid container size={12} spacing={1}>
                    <Grid size={12}>
                      {Boolean(
                        checkOutRoomData?.bookingDto?.extraItemsList
                      ) && (
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Inventory Details :
                          </Typography>
                          <Box
                            sx={{
                              width: "100%",
                              overflow: "auto",
                            }}
                          >
                            <CustomInventoryTable
                              inventoryData={
                                checkOutRoomData?.bookingDto?.extraItemsList ||
                                []
                              }
                            />
                          </Box>
                        </Box>
                      )}

                      {Boolean(
                        checkOutRoomData?.bookingDto?.foodDataList?.length
                      ) && (
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Food Details :
                          </Typography>
                          <CustomFoodListTableContainer
                            foodListTableHeaders={foodListTableHeaders}
                            foodListTableData={
                              checkOutRoomData?.bookingDto?.foodDataList
                            }
                            foodListItemsTableHeaders={
                              foodListItemsTableHeaders
                            }
                            isForCheckOut={type === "checkout" ? true : false}
                          />
                        </Box>
                      )}

                      {Boolean(
                        checkOutRoomData?.bookingDto?.barOrderDtos?.length
                      ) && (
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Bar Orders :
                          </Typography>
                          <CustomBarListTableContainer
                            barListTableHeaders={barListTableHeaders}
                            barListTableData={
                              checkOutRoomData?.bookingDto?.barOrderDtos
                            }
                            barListItemsTableHeaders={barListItemsTableHeaders}
                            isForCheckOut={type === "checkout" ? true : false}
                          />
                        </Box>
                      )}

                      {Boolean(
                        checkOutRoomData?.bookingDto?.laundryDataList?.length
                      ) && (
                        <Box sx={{ width: "100%" }}>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Laundry Details :
                          </Typography>
                          <CustomLaundryListTableContainer
                            laundryListTableHeaders={laundryListTableHeaders}
                            laundryListTableData={
                              checkOutRoomData?.bookingDto?.laundryDataList
                            }
                            laundryListItemsTableHeaders={
                              laundryListItemsTableHeaders
                            }
                            isForCheckOut={type === "checkout" ? true : false}
                          />
                        </Box>
                      )}
                    </Grid>
                    <Grid size={12}>
                      <Grid container size={12} columnSpacing={1}>
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Subtotal Expense
                          </Typography>
                        </Grid>
                        <Grid size={2.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {showcaseDialogFormData?.subTotalExpense}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid size={1.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Paid
                          </Typography>
                        </Grid>
                        <Grid size={4.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {showcaseDialogFormData?.subTotalAmountPaid}
                            </Typography>
                          </Typography>
                        </Grid>
                        <Grid size={3.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            Due Amount
                          </Typography>
                        </Grid>
                        <Grid size={2.5}>
                          <Typography
                            sx={{
                              fontSize: "15px",
                              // color: "#707070",
                              fontWeight: 600,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                fontWeight: 600,
                                marginRight: "5px",
                              }}
                            >
                              :
                            </Typography>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "15px",
                                // color: "#707070",
                                // fontWeight: 600,
                              }}
                            >
                              {showcaseDialogFormData?.subTotalAmountRemaining >
                              0
                                ? showcaseDialogFormData?.subTotalAmountRemaining
                                : 0}
                            </Typography>
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid size={12}>
                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining > 0
                      ) && (
                        <Grid container size={12} columnSpacing={1}>
                          <Grid size={4}>
                            <Box
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "end",
                                paddingBottom: "7px",
                                ".MuiTextField-root": {
                                  width: "100%",
                                  backgroundColor: "transparent",
                                  ".MuiInputBase-root": {
                                    color: "#B4B4B4",
                                    background: "rgba(255, 255, 255, 0.25)",
                                  },
                                },
                                // ".MuiFormLabel-root": {
                                //   color: (theme) => theme.palette.primary.main,
                                //   fontWeight: 600,
                                //   fontSize: 18,
                                // },
                                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before":
                                  {
                                    borderBottom: (theme) =>
                                      `1px solid ${theme.palette.primary.main}`,
                                  },
                              }}
                            >
                              <Autocomplete
                                fullWidth
                                // options={
                                //   allPaymentMethods?.data?.map((item) => ({
                                //     key: item,
                                //     name: item.replace(/_/g, " "),
                                //   })) || []
                                // }
                                options={
                                  allPaymentMethods?.data
                                    ?.filter((item) =>
                                      ["Cash", "Online"].includes(item)
                                    )
                                    ?.map((item) => ({
                                      key: item,
                                      name: item.replace(/_/g, " "),
                                    })) || []
                                }
                                disableClearable
                                value={
                                  showcaseDialogFormData?.paymentMethod || null
                                }
                                onChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethod",
                                    newVal
                                  )
                                }
                                inputValue={
                                  showcaseDialogFormData?.paymentMethodInputValue ||
                                  ""
                                }
                                onInputChange={(e, newVal) =>
                                  handleChangeShowcaseDialogFormDataOnChange(
                                    "paymentMethodInputValue",
                                    newVal
                                  )
                                }
                                getOptionLabel={(option) => option?.name}
                                clearOnEscape
                                disablePortal
                                popupIcon={
                                  <KeyboardArrowDownIcon color="primary" />
                                }
                                sx={{
                                  // width: 200,
                                  ".MuiInputBase-root": {
                                    color: "#fff",
                                  },
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
                                size="small"
                                clearIcon={<ClearIcon color="primary" />}
                                PaperComponent={(props) => (
                                  <Paper
                                    sx={{
                                      background: "#fff",
                                      color: "#B4B4B4",
                                      // borderRadius: "10px",
                                    }}
                                    {...props}
                                  />
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Payment Method"
                                    variant="standard"
                                    // sx={{
                                    //   "& .MuiOutlinedInput-root": {
                                    //     borderRadius: 2,
                                    //   },
                                    // }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          {showcaseDialogFormData?.paymentMethod &&
                            !(
                              showcaseDialogFormData?.paymentMethod?.key ===
                              "Cash"
                            ) &&
                            !(
                              showcaseDialogFormData?.paymentMethod?.key ===
                              "Online"
                            ) && (
                              <Grid size={4}>
                                <TextField
                                  margin="normal"
                                  required
                                  fullWidth
                                  id={`transactionReferenceNo`}
                                  label="Transaction ref. No."
                                  name="transactionReferenceNo"
                                  autoComplete="transactionReferenceNo"
                                  variant="standard"
                                  value={
                                    showcaseDialogFormData?.transactionReferenceNo ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleChangeShowcaseDialogFormDataOnChange(
                                      "transactionReferenceNo",
                                      e?.target?.value
                                    )
                                  }
                                />
                              </Grid>
                            )}

                          <Grid size={4}>
                            <TextField
                              margin="normal"
                              fullWidth
                              // disabled={
                              //   !Boolean(showcaseDialogFormData?.paymentMethod)
                              // }
                              disabled
                              id={`paidAmount`}
                              label="Amount"
                              name="paidAmount"
                              autoComplete="paidAmount"
                              variant="standard"
                              value={showcaseDialogFormData?.paidAmount || ""}
                              onChange={(e) =>
                                handleChangeShowcaseDialogFormDataOnChange(
                                  "paidAmount",
                                  e?.target?.value
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      )}

                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining === 0
                      ) && <Typography>Bills Are Cleared Till Now</Typography>}

                      {Boolean(
                        showcaseDialogFormData?.subTotalAmountRemaining < 0
                      ) && (
                        <Typography>
                          An Amount Of{" "}
                          {Math.abs(
                            showcaseDialogFormData?.subTotalAmountRemaining
                          )}{" "}
                          Has To Be Paid To Customer.
                        </Typography>
                      )}
                    </Grid>

                    {/* <Grid size={12}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id={`remarks`}
                        label="Remarks"
                        name="remarks"
                        autoComplete="remarks"
                        variant="standard"
                        value={showcaseDialogFormData?.remarks || ""}
                        onChange={(e) =>
                          handleChangeShowcaseDialogFormDataOnChange(
                            "remarks",
                            e?.target?.value
                          )
                        }
                      />
                    </Grid> */}
                    <Grid size={12}>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            fontSize: "13px",
                            paddingX: "5px",
                            backgroundImage:
                              "linear-gradient(to right, #ff416c 0%, #ff4b2b 100%)",
                            color: "white",
                            "&:hover": {
                              backgroundImage:
                                "linear-gradient(to right, #ff416c 10%, #ff4b2b 90%)",
                            },
                          }}
                          onClick={() => handleConfirmFinalCheckoutOnClick()}
                        >
                          Confirm Check-Out
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
      </BootstrapDialog>
      {/* <LoadingComponent open={changePasswordRes.isLoading} /> */}
    </React.Fragment>,
    document.getElementById("portal")
  );
});

const Dashboard = () => {
  const [roomFilters, setRoomFilters] = React.useState({
    roomStatus: null,
    searchKey: "",
    toDate: null,
    floor: null,
    floorInputVal: "",
    roomType: null,
    roomTypeInputVal: "",
    selectedRoomStatus: null,
  });
  console.log("roomFilters : ", roomFilters);
  const [saveCustomerCheckIn, saveCustomerCheckInRes] =
    useSaveCustomerCheckInMutation();
  const [cancelReservation, cancelReservtionRes] =
    useCancelRoomBookingFromBookingHistoryMutation();
  const [requestRoomCheckout, requestRoomCheckoutRes] =
    useRequestRoomCheckoutMutation();
  const [finalRoomCheckOut, finalRoomCheckOutRes] =
    useFinalRoomCheckOutMutation();
  const [roomCleanRequest, roomCleanRequestRes] = useRoomCleanRequestMutation();
  const [bookingByFrontDeskStaff, bookingByFrontDeskStaffRes] =
    useBookingByFrontDeskStaffMutation();
  const {
    data: apiTodayCheckoutRoomData = {
      data: [],
    },
    isFetching: isApiTodayCheckoutRoomDataFetching,
  } = useGetTodayCheckoutRoomsByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("apiTodayCheckoutRoomData : ", apiTodayCheckoutRoomData);

  const {
    data: apiRoomData = {
      data: {
        name: "",
        floorRoomMapData: [],
      },
    },
    // isLoading: isApiRoomDataLoading,
    // isSuccess: isApiRoomDataSuccess,
    isFetching: isApiRoomDataFetching,
  } = useGetAllRoomListByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      dateFilterKey:
        roomFilters?.toDate &&
        moment(roomFilters.toDate.$d).format("DD-MM-YYYY"),
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("apiRoomData : ", apiRoomData);

  const {
    data: allGovtIdsData = { data: [] },
    isFetching: isAllGovtIdsDataFetching,
  } = useGetAllGovtIdsQuery(
    {},
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("allGovtIdsData : ", allGovtIdsData);

  const {
    data: allPaymentMethods = { data: [] },
    isFetching: isAllPaymentMethodsFetching,
  } = useGetAllPaymentMethodsQuery(
    {},
    {
      skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("allPaymentMethods : ", allPaymentMethods);

  const {
    data: roomtypeByHotelIdData = {
      data: [],
    },
    isFetching: isRoomtypeByHotelIdDataFetching,
  } = useRoomtypeByHotelIdQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log("roomtypeByHotelIdData : ", roomtypeByHotelIdData);

  const {
    data: pendingBookingRequestCountsData = {
      data: { noOfBookingRequestCount: 0, noOfCancellationRequstCount: 0 },
    },
    isLoading: isPendingBookingRequestCountsDataLoading,
  } = useGetPendingBookingRequestCountsQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: 50000,
      skip:
        !Boolean(JSON.parse(sessionStorage.getItem("data"))?.hotelId) ||
        JSON.parse(sessionStorage.getItem("data"))?.roleType !== FRONTDESK,
    }
  );
  console.log(
    "pendingBookingRequestCountsData : ",
    pendingBookingRequestCountsData
  );

  const floorOptions = React.useMemo(
    () =>
      apiRoomData?.data?.floorRoomMapData?.map((item) => {
        return {
          floorNo: item?.floorNo,
          noOfRooms: item?.noOfRooms,
        };
      }),
    [apiRoomData?.data?.floorRoomMapData]
  );

  const initialShowcaseDialogData = useMemo(
    () => ({
      open: false,
      title: "",
      type: null,
      inventoryData: [],
      foodData: [],
    }),
    []
  );

  const initialCustomFormDrawerData = useMemo(
    () => ({
      fromDate: null,
      toDate: null,
      checkOutDate: null,
      noOfPeoples: "1",
      bookingRefNumber: "",
      bookingMapDatas: [],
      paymentMethod: null,
      paymentMethodInputValue: "",
      transactionReferenceNo: "",
      paidAmount: "",
      remarks: "",
      specialRequirements: "",
      cancelBookingReason: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      address: "",
      roomDto: null,
      isBookingForToday: false,
      roomBasePrice: 0,
      advanceAmount: 0,
      amountReceived: 0,
      numberOfDaysOfStay: 0,
      accumulatedRoomCharge: 0,
      accumulatedAdvanceRequired: 0,
      isAdvanceRequired: false,
    }),
    []
  );

  const initialShowcaseDialogFormData = useMemo(
    () => ({
      bookingRefNumber: "",
      subTotalExpense: 0,
      subTotalAmountPaid: 0,
      subTotalAmountRemaining: 0,
      paymentMethod: null,
      paymentMethodInputValue: "",
      transactionReferenceNo: "",
      paidAmount: "",
      remarks: "",
    }),
    []
  );

  const foodListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Order Id", key: "orderId" },
      { label: "Order On", key: "orderedOn" },
      { label: "Serving", key: "serving" },
      { label: "Status", key: "foodBookingStatus" },
      { label: "Price", key: "bookingDetails.totalPrice" },
      { label: "Action", key: "foodListAction" },
    ],
    []
  );

  const foodListItemsTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Item", key: "itemName" },
      { label: "Quantity", key: "noOfItems" },
    ],
    []
  );

  const laundryListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Order On", key: "createdAt" },
      { label: "Status", key: "laundryStatus" },
      { label: "Charges", key: "totalPrice" },
      { label: "Action", key: "laundryListAction" },
    ],
    []
  );

  const laundryListItemsTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Item", key: "name" },
      { label: "Quantity", key: "qty" },
      { label: "Price", key: "price" },
    ],
    []
  );

  const barListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Order Id", key: "orderId" },
      { label: "Order On", key: "orderedOn" },
      { label: "Serving", key: "serving" },
      { label: "Status", key: "bookingStatus" },
      { label: "Price", key: "totalAmount" },
      { label: "Action", key: "barListAction" },
    ],
    []
  );

  const barListItemsTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Item", key: "item.name" },
      { label: "Quantity", key: "noOfQty" },
    ],
    []
  );

  const customBookingAlertChips = useMemo(
    () => [
      {
        label: "Pending Room Bookings",
        key: "noOfBookingRequestCount",
        filterationKey: "Pending_Confirmation",
        navigationPath: "/frontdeskBookingHistory",
        sessionStorageKey: "customBookingHistoryAlertFilter",
        customColor: "#e65d1d",
      },
      {
        label: "Refund Requests",
        key: "noOfCancellationRequstCount",
        filterationKey: "Booking_Cancellation_Requested",
        navigationPath: "/frontdeskBookingHistory",
        sessionStorageKey: "customBookingHistoryAlertFilter",
        customColor: "#5a1de6",
      },
      {
        label: "Checkout Requested",
        key: "noOfCheckOutRequestSubmitted",
        filterationKey: "Room_Checkout_Requested",
        navigationPath: "/frontdeskBookingHistory",
        sessionStorageKey: "customBookingHistoryAlertFilter",
        customColor: "#6A9C89",
      },
      {
        label: "Checkout Request Apprroved",
        key: "noOfCheckOutRequestApproved",
        filterationKey: "Room_Checkout_Request_Approved",
        navigationPath: "/frontdeskBookingHistory",
        sessionStorageKey: "customBookingHistoryAlertFilter",
        customColor: "#648816",
      },
      {
        label: "Laundry Service Requested",
        key: "noOfLaundryServiceRequestedCount",
        filterationKey: "Laundry_Service",
        navigationPath: "/HouseKeepingHistory",
        sessionStorageKey: "customHouseKeepingHistoryAlertFilter",
        customColor: "#982B1C",
      },
      {
        label: "Room Cleaning Requested",
        key: "noOfRoomCleaningRequestedCount",
        filterationKey: "Room_Cleaning",
        navigationPath: "/HouseKeepingHistory",
        sessionStorageKey: "customHouseKeepingHistoryAlertFilter",
        customColor: "#c693e6",
      },
    ],
    []
  );

  // console.log("tempRoomData", tempRoomData);
  const [roomData, setRoomData] = useState([]);
  console.log("roomData : ", roomData);
  const [isSelectedRoom, setIsSelectedRoom] = useState(null);
  console.log("isSelectedRoom : ", isSelectedRoom);
  // const [isSelectedFloor, setIsSelectedFloor] = useState(null);
  // console.log("isSelectedFloor : ", isSelectedFloor);
  // const [isBookNowSelected, setIsBookNowSelected] = useState(false);
  const [customFormDrawerOpen, setCustomFormDrawerOpen] = useState({
    open: false,
    title: "",
    type: null,
  });

  console.log("customFormDrawerOpen : ", customFormDrawerOpen);
  const [customFormDrawerData, setCustomFormDrawerData] = useState(
    initialCustomFormDrawerData
  );

  console.log("customFormDrawerData : ", customFormDrawerData);
  const [showcaseDialogData, setShowcaseDialogData] = useState(
    initialShowcaseDialogData
  );
  console.log("showcaseDialogData : ", showcaseDialogData);
  const [showcaseDialogFormData, setShowcaseDialogFormData] = useState(
    initialShowcaseDialogFormData
  );
  console.log("showcaseDialogFormData : ", showcaseDialogFormData);

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const [paymentDialogFinalPayload, setPaymentDialogFinalPayload] =
    useState(null);

  const [paymentDialogMutationType, setPaymentDialogMutationType] =
    useState("");

  // const handleFloorSelect = useCallback((selectedFloor) => {
  //   setIsSelectedFloor(selectedFloor || null);
  // }, []);

  const handleChangeSetPaymentDialogFinalPayload = useCallback(
    ({ open = false, mutationType = "", payloadValue = null } = {}) => {
      setOpenPaymentDialog(open || false);
      setPaymentDialogFinalPayload(payloadValue || null);
      setPaymentDialogMutationType(mutationType || "");
    },
    []
  );

  const handleRoomSelect = useCallback((selectedRoom) => {
    setIsSelectedRoom((prevState) => {
      if (!selectedRoom || prevState?.id === selectedRoom?.id) {
        return null;
      }
      return selectedRoom;
    });
  }, []);

  const handleChangeRoomFilters = useCallback((name, value) => {
    console.log("handleChangeRoomFilters value : ", value);
    if (name === "floor") {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value,
        };
      });
    } else if (name === "selectedRoomStatus") {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value !== prevData?.selectedRoomStatus ? value : null,
        };
      });
    } else {
      setRoomFilters((prevData) => {
        return {
          ...prevData,
          [name]: value,
        };
      });
    }
  }, []);

  const handleUpdateRoomDataByFloor = useCallback(
    (roomFilters) => {
      setRoomData(() => {
        return apiRoomData?.data?.floorRoomMapData?.filter((floor) => {
          const filteredFloors =
            roomFilters?.floor && !Boolean(roomFilters?.floor?.key)
              ? floor?.floorNo === roomFilters?.floor?.floorNo
              : true;

          console.log("filteredFloorsss : ", filteredFloors);
          return filteredFloors;
        });
      });
    },
    [apiRoomData?.data?.floorRoomMapData]
  );

  const handleOpenShowcaseModalForInventory = useCallback((inventoryData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Inventory",
      type: "inventory",
      inventoryData: inventoryData,
    }));
  }, []);

  const handleOpenShowcaseModalForFood = useCallback((foodData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Foods",
      type: "food",
      foodData: foodData,
    }));
  }, []);

  const handleOpenShowcaseModalForLaundry = useCallback((laundryData) => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Laundry",
      type: "laundry",
      laundryData: laundryData,
    }));
  }, []);

  const handleOpenShowcaseModalForCheckout = useCallback(() => {
    setShowcaseDialogData((prevData) => ({
      ...prevData,
      open: true,
      title: "Confirm Checkout",
      type: "checkout",
      inventoryData: [],
      foodData: [],
      laundryData: [],
    }));
  }, []);

  const handleCloseShowcaseDialog = useCallback(() => {
    setShowcaseDialogData(initialShowcaseDialogData);
  }, [initialShowcaseDialogData]);

  const handleChangeCustomFormDrawerData = useCallback(
    (name, inputValue, subIndex) => {
      console.log(
        "handleChangeCustomFormDrawerData inputValue : ",
        name,
        inputValue,
        subIndex
      );

      if (name) {
        if (name === "noOfPeoples") {
          const numericRegex = /^[0-9]*$/;

          if (numericRegex.test(inputValue)) {
            // const modifiedInputValue =
            //   inputValue === "" ? "" : Number(inputValue);
            const modifiedInputValue = Math.min(
              inputValue === "" ? 0 : Number(inputValue),
              isSelectedRoom?.roomType?.capacity || 1 //
            );

            setCustomFormDrawerData((prevData) => {
              const currentLength = prevData.bookingMapDatas.length;

              let updatedBookingMapDatas = [...prevData.bookingMapDatas];
              if (modifiedInputValue > currentLength) {
                // Add only the required number of items lazily
                updatedBookingMapDatas.push(
                  ...Array.from(
                    { length: modifiedInputValue - currentLength },
                    () => ({
                      customerName: "",
                      govtIdType: null,
                      govtIdTypeInputValue: "",
                      govtIdNo: "",
                    })
                  )
                );
              } else if (modifiedInputValue < currentLength) {
                // Trim the array
                updatedBookingMapDatas = updatedBookingMapDatas.slice(
                  0,
                  modifiedInputValue
                );
              }

              return {
                ...prevData,
                noOfPeoples: modifiedInputValue,
                bookingMapDatas: updatedBookingMapDatas,
              };
            });
          }
        } else if (name === "customerName") {
          const modifiedCustomerName = inputValue
            .replace(/ {2,}/g, " ")
            .replace(/^\s+/g, "");
          if (/^[a-zA-Z\s]*$/.test(modifiedCustomerName)) {
            setCustomFormDrawerData((prevData) => {
              return {
                ...prevData,
                bookingMapDatas: prevData?.bookingMapDatas?.map(
                  (subItem, index) => {
                    if (index === subIndex) {
                      return {
                        ...subItem,
                        customerName: modifiedCustomerName,
                      };
                    } else {
                      return subItem;
                    }
                  }
                ),
              };
            });
          }
        } else if (name === "govtIdType") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    const shouldClearGovtId =
                      !inputValue ||
                      inputValue?.key !==
                        prevData?.bookingMapDatas[index]?.govtIdType?.key;
                    return {
                      ...subItem,
                      govtIdType: inputValue,
                      govtIdNo: shouldClearGovtId ? "" : subItem?.govtIdNo,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "govtIdTypeInputValue") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    return {
                      ...subItem,
                      govtIdTypeInputValue: inputValue,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "govtIdNo") {
          const modifiedGovtId = inputValue?.trim();
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              bookingMapDatas: prevData?.bookingMapDatas?.map(
                (subItem, index) => {
                  if (index === subIndex) {
                    return {
                      ...subItem,
                      govtIdNo: modifiedGovtId,
                    };
                  } else {
                    return subItem;
                  }
                }
              ),
            };
          });
        } else if (name === "paymentMethod") {
          setCustomFormDrawerData((prevData) => {
            const shouldClearPaymentAmount =
              !inputValue || inputValue?.key !== prevData?.paymentMethod?.key;
            return {
              ...prevData,
              paymentMethod: inputValue,
              paidAmount: shouldClearPaymentAmount ? "" : prevData?.paidAmount,
            };
          });
        } else if (name === "paymentMethodInputValue") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              paymentMethodInputValue: inputValue,
            };
          });
        } else if (name === "transactionReferenceNo") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              transactionReferenceNo: inputValue,
            };
          });
        } else if (name === "paidAmount") {
          const sanitizedValue = inputValue.replace(/[^0-9.]/g, "");

          const validValue =
            sanitizedValue.split(".").length > 2
              ? sanitizedValue.slice(0, sanitizedValue.lastIndexOf("."))
              : sanitizedValue;

          const restrictedValue = validValue.includes(".")
            ? validValue.split(".")[0] +
              "." +
              validValue.split(".")[1].slice(0, 3)
            : validValue;
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              paidAmount: restrictedValue,
            };
          });
        } else if (name === "remarks") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              remarks: inputValue,
            };
          });
        } else if (name === "fromDate") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              [name]: inputValue,
              toDate: null,
              numberOfDaysOfStay: 0,
              accumulatedRoomCharge: 0,
              accumulatedAdvanceRequired: 0,
            };
          });
        } else if (name === "toDate") {
          setCustomFormDrawerData((prevData) => {
            const dayResult = calculateNumberOfDaysOfStay({
              fromDate: prevData?.fromDate,
              toDate: inputValue,
            });
            return {
              ...prevData,
              [name]: inputValue,
              numberOfDaysOfStay: dayResult,
              accumulatedRoomCharge: calculateAccumulatedRoomCharge({
                basePrice: prevData?.roomBasePrice,
                daysOfStay: dayResult,
              }),
              accumulatedAdvanceRequired: calculateAccumulatedRoomCharge({
                basePrice: prevData?.advanceAmount,
                daysOfStay: dayResult,
              }),
            };
          });
        } else if (name === "checkOutDate") {
          setCustomFormDrawerData((prevData) => {
            const dayResult = calculateNumberOfDaysOfStay({
              checkOutDate: inputValue,
            });
            return {
              ...prevData,
              [name]: inputValue,
              numberOfDaysOfStay: dayResult,
              accumulatedRoomCharge: calculateAccumulatedRoomCharge({
                basePrice: prevData?.roomBasePrice,
                daysOfStay: dayResult,
              }),
              accumulatedAdvanceRequired: calculateAccumulatedRoomCharge({
                basePrice: prevData?.advanceAmount,
                daysOfStay: dayResult,
              }),
            };
          });
        } else if (name === "isBookingForToday") {
          setCustomFormDrawerData((prevData) => {
            return {
              ...prevData,
              [name]: inputValue,
              fromDate: null,
              toDate: null,
              checkOutDate: null,
              numberOfDaysOfStay: 0,
              accumulatedRoomCharge: 0,
              accumulatedAdvanceRequired: 0,
            };
          });
        } else if (name === "fullCheckIn") {
          if (inputValue) {
            setCustomFormDrawerData((prevData) => ({
              ...prevData,
              fromDate: inputValue?.bookingDto?.fromDate,
              toDate: inputValue?.bookingDto?.toDate,
              checkOutDate: inputValue?.bookingDto?.toDate
                ? dayjs(inputValue?.bookingDto?.toDate, "DD-MM-YYYY")
                : null,
              noOfPeoples: inputValue?.bookingDto?.noOfPeoples || 0,
              bookingRefNumber: inputValue?.bookingDto?.bookingRefNumber || "",
              bookingMapDatas: inputValue?.bookingDto?.noOfPeoples
                ? Array.from(
                    { length: inputValue?.bookingDto?.noOfPeoples },
                    () => ({
                      customerName: "",
                      govtIdType: null,
                      govtIdTypeInputValue: "",
                      govtIdNo: "",
                    })
                  )
                : [],
              paymentMethod: null,
              paymentMethodInputValue: "",
              transactionReferenceNo: "",
              paidAmount: "",
              remarks: "",
            }));
          }

          // else if (name === "clearUp") {
          //   setCustomFormDrawerData(initialCustomFormDrawerData);
          // } else {
          //   setCustomFormDrawerData((prevData) => ({
          //     ...prevData,
          //     [name]: inputValue,
          //   }));
          // }
        } else if (name === "fullBooking") {
          if (inputValue) {
            setCustomFormDrawerData((prevData) => ({
              ...prevData,
              bookingMapDatas: Boolean(
                prevData?.noOfPeoples && Number(prevData?.noOfPeoples)
              )
                ? Array.from({ length: Number(prevData?.noOfPeoples) }, () => ({
                    customerName: "",
                    govtIdType: null,
                    govtIdTypeInputValue: "",
                    govtIdNo: "",
                  }))
                : [],
              roomDto: inputValue,
              isAdvanceRequired:
                inputValue?.roomType?.isAdvanceRequired || false,
              roomBasePrice: inputValue?.roomType?.basePrice || 0,
              advanceAmount: inputValue?.roomType?.advanceAmount || 0,
            }));
          }

          // else if (name === "clearUp") {
          //   setCustomFormDrawerData(initialCustomFormDrawerData);
          // } else {
          //   setCustomFormDrawerData((prevData) => ({
          //     ...prevData,
          //     [name]: inputValue,
          //   }));
          // }
        } else if (
          name === "firstName" ||
          name === "middleName" ||
          name === "lastName"
        ) {
          const modifiedName = inputValue.trim();
          if (/^[a-zA-Z\s]*$/.test(modifiedName)) {
            setCustomFormDrawerData((prevData) => {
              return {
                ...prevData,
                [name]: modifiedName,
              };
            });
          }
        } else if (name === "phoneNumber") {
          const numericRegex = /^[0-9]*$/;
          if (numericRegex.test(inputValue)) {
            setCustomFormDrawerData((prevData) => {
              return {
                ...prevData,
                [name]: inputValue,
              };
            });
          }
        } else {
          setCustomFormDrawerData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setCustomFormDrawerData(initialCustomFormDrawerData);
      }
    },
    [initialCustomFormDrawerData, isSelectedRoom]
  );

  const handleOpenCustomFormDrawer = useCallback(
    (open = false, title = "", type = "") => {
      setCustomFormDrawerOpen({
        open: open || false,
        title: title || "",
        type: type || null,
      });
      if (!open) {
        handleChangeCustomFormDrawerData();
      }
    },
    [handleChangeCustomFormDrawerData]
  );

  const handleChangeSelectedRoomForDayCheckout = useCallback(
    (checkOutRoomData) => {
      console.log(
        "handleChangeSelectedRoomForDayCheckout checkOutRoomData : ",
        checkOutRoomData
      );
      const flatMappedRoomData =
        apiRoomData?.data?.floorRoomMapData?.flatMap((item) =>
          Array.isArray(item?.roomDto) ? item.roomDto : []
        ) ?? [];

      console.log("flatMappedRoomData : ", flatMappedRoomData);
      const foundCheckoutRoom =
        flatMappedRoomData?.find(
          (item) =>
            item?.bookingDto?.bookingRefNumber &&
            item?.bookingDto?.bookingRefNumber ===
              checkOutRoomData?.bookingRefNumber
        ) || null;

      console.log("foundCheckoutRoom : ", foundCheckoutRoom);
      handleRoomSelect(foundCheckoutRoom);
      let targetedRoomCard = document.getElementById(
        `room-${foundCheckoutRoom?.roomNo}`
      );
      if (targetedRoomCard)
        targetedRoomCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    },
    [handleRoomSelect, apiRoomData]
  );

  const handleChangeShowcaseDialogFormData = useCallback(
    (name, inputValue) => {
      if (name) {
        if (name === "fullChange") {
          setShowcaseDialogFormData((prevData) => {
            const totalExpense = inputValue?.bookingDto?.transactionDetails
              ?.filter((item) => !Boolean(item?.isCredit))
              ?.reduce((sum, item) => sum + (item.amount || 0), 0);
            const totalAmountPaid = inputValue?.bookingDto?.transactionDetails
              ?.filter((item) => Boolean(item?.isCredit))
              ?.reduce((sum, item) => sum + (item.amount || 0), 0);

            const remainingAmount = totalExpense - totalAmountPaid;
            const parsedRemainingAmount =
              parseFloat(remainingAmount).toFixed(3);

            return {
              ...prevData,
              bookingRefNumber: inputValue?.bookingDto?.bookingRefNumber,
              subTotalExpense: parseFloat(totalExpense).toFixed(3),
              subTotalAmountPaid: parseFloat(totalAmountPaid).toFixed(3),
              subTotalAmountRemaining: parsedRemainingAmount,
              paymentMethod: null,
              paymentMethodInputValue: "",
              transactionReferenceNo: "",
              paidAmount: parsedRemainingAmount > 0 ? parsedRemainingAmount : 0,
              remarks: "",
            };
          });
        } else {
          setShowcaseDialogFormData((prevData) => ({
            ...prevData,
            [name]: inputValue,
          }));
        }
      } else {
        setShowcaseDialogFormData(initialShowcaseDialogFormData);
      }
    },
    [initialShowcaseDialogFormData]
  );

  const HandleDynamicFinalApiMutationForPaymentDialog = useCallback(
    (submitType = "") => {
      let mutationFunction = () => {};
      let afterMutationSuccessFunction = () => {};

      if (submitType === "saveCheckIn") {
        mutationFunction = saveCustomerCheckIn;

        afterMutationSuccessFunction = () => {
          handleOpenCustomFormDrawer();
          handleChangeCustomFormDrawerData();
          handleRoomSelect();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      } else if (submitType === "roomBooking") {
        mutationFunction = bookingByFrontDeskStaff;

        afterMutationSuccessFunction = () => {
          handleOpenCustomFormDrawer();
          handleRoomSelect();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      } else if (submitType === "finalCheckout") {
        mutationFunction = finalRoomCheckOut;

        afterMutationSuccessFunction = () => {
          handleCloseShowcaseDialog();
          handleChangeShowcaseDialogFormData();
          handleRoomSelect();
          handleChangeSetPaymentDialogFinalPayload(); // MANDATORY FUNCTION
        };
      }

      return {
        mutationFunction,
        afterMutationSuccessFunction,
      };
    },
    [
      saveCustomerCheckIn,
      bookingByFrontDeskStaff,
      finalRoomCheckOut,
      handleOpenCustomFormDrawer,
      handleChangeCustomFormDrawerData,
      handleRoomSelect,
      handleChangeSetPaymentDialogFinalPayload,
      handleCloseShowcaseDialog,
      handleChangeShowcaseDialogFormData,
    ]
  );

  const handleSubmitRoomCheckIn = useCallback(() => {
    if (!Boolean(customFormDrawerData?.noOfPeoples)) {
      setSnack({
        open: true,
        message: "Atleat 1 guest is required to Check-In",
        severity: "warning",
      });
      return;
    } else if (
      customFormDrawerData?.bookingMapDatas?.some(
        (item) =>
          !item?.customerName?.trim() ||
          !item?.govtIdType?.key ||
          !item?.govtIdNo?.trim()
      )
    ) {
      setSnack({
        open: true,
        message: "Guest Verification Details are required",
        severity: "warning",
      });
      return;
    }
    // else if (!Boolean(customFormDrawerData?.remarks?.trim())) {
    //   setSnack({
    //     open: true,
    //     message: "Please add a remark",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (!Boolean(customFormDrawerData?.checkOutDate)) {
      setSnack({
        open: true,
        message: "Please provide a valid Checkout date",
        severity: "warning",
      });
      return;
    }
    // else if (
    //   customFormDrawerData?.paymentMethod?.key &&
    //   customFormDrawerData?.paymentMethod?.key !== "Cash" &&
    //   customFormDrawerData?.paymentMethod?.key.trim() !== "" &&
    //   !customFormDrawerData?.transactionReferenceNo?.trim()
    // ) {
    //   setSnack({
    //     open: true,
    //     message:
    //       "Please provide a valid transaction reference for the selected payment method.",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (
      Boolean(customFormDrawerData?.paymentMethod?.key) !==
      Boolean(parseFloat(customFormDrawerData?.paidAmount))
    ) {
      setSnack({
        open: true,
        message:
          "Please provide both payment method and advance amount to proceed.",
        severity: "warning",
      });
      return;
    }

    const payload = {
      bookingRefNumber: customFormDrawerData?.bookingRefNumber || "",
      noOfPeoples: !Boolean(customFormDrawerData?.noOfPeoples)
        ? 0
        : Number(customFormDrawerData?.noOfPeoples),
      paidAmount: !Boolean(customFormDrawerData?.paidAmount)
        ? 0
        : Number(customFormDrawerData?.paidAmount),
      paymentMethod: customFormDrawerData?.paymentMethod?.key,
      // transactionReferenceNo: customFormDrawerData?.transactionReferenceNo,
      ...(customFormDrawerData?.paymentMethod?.key !== "Cash" &&
        customFormDrawerData?.transactionReferenceNo?.trim() && {
          transactionReferenceNo: customFormDrawerData?.transactionReferenceNo,
        }),
      remarks: customFormDrawerData?.remarks,
      // checkOutDate: customFormDrawerData?.checkOutDate
      //   ? moment(customFormDrawerData?.checkOutDate.$d).format("DD-MM-YYYY")
      //   : null,
      checkOutDate: customFormDrawerData?.checkOutDate
        ? moment(customFormDrawerData?.checkOutDate.$d).format(
            "DD-MM-YYYY HH:mm:ss"
          )
        : null,

      bookingMapDatas: customFormDrawerData?.bookingMapDatas?.map((item) => {
        return {
          customerName: item?.customerName,
          govtIdType: item?.govtIdType?.key,
          govtIdNo: item?.govtIdNo,
        };
      }),
    };

    console.log("handleSubmitRoomCheckIn payload : ", payload);

    if (customFormDrawerData?.paymentMethod?.key === "Online") {
      handleChangeSetPaymentDialogFinalPayload({
        open: true,
        mutationType: "saveCheckIn",
        payloadValue: payload,
      });
    } else {
      saveCustomerCheckIn(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Check-In Success",
            severity: "success",
          });
          handleOpenCustomFormDrawer();
          handleChangeCustomFormDrawerData();
          handleRoomSelect();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err?.data?.message || err?.data || "Check-In Failed",
            severity: "error",
          });
        });
    }
  }, [
    customFormDrawerData,
    handleChangeSetPaymentDialogFinalPayload,
    saveCustomerCheckIn,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleRoomSelect,
  ]);

  const handleSubmitRoomBookingCanelation = useCallback(() => {
    if (!Boolean(customFormDrawerData?.cancelBookingReason?.trim())) {
      setSnack({
        open: true,
        message: "Please give a valid Reason",
        severity: "warning",
      });
      return;
    }
    const payload = {
      bookingRefNumber: isSelectedRoom?.bookingDto?.bookingRefNumber,
      rejectionReason: customFormDrawerData?.cancelBookingReason,
    };

    cancelReservation(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res?.message || "Check-In Success",
          severity: "success",
        });
        handleOpenCustomFormDrawer();
        handleRoomSelect();
        handleChangeCustomFormDrawerData();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err?.data?.message || err?.data || "Check-In Failed",
          severity: "error",
        });
      });
  }, [
    customFormDrawerData,
    cancelReservation,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleRoomSelect,
    isSelectedRoom,
  ]);

  const handleRequestRoomCheckout = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          bookingRefNumber: isSelectedRoom?.bookingDto?.bookingRefNumber,
        };
        requestRoomCheckout(payload)
          .unwrap()
          .then((res) => {
            setSnack({
              open: true,
              message: res?.message || "Check-Out Request Success",
              severity: "success",
            });
            handleOpenCustomFormDrawer();
            handleChangeCustomFormDrawerData();
            handleRoomSelect();
          })
          .catch((err) => {
            setSnack({
              open: true,
              message:
                err?.data?.message || err?.data || "Check-Out Request Failed",
              severity: "error",
            });
          });
      }
    });
  }, [
    requestRoomCheckout,
    isSelectedRoom,
    handleOpenCustomFormDrawer,
    handleChangeCustomFormDrawerData,
    handleRoomSelect,
  ]);

  const handleConfirmFinalCheckout = useCallback(() => {
    if (
      Boolean(showcaseDialogFormData?.subTotalAmountRemaining > 0) &&
      !showcaseDialogFormData?.paymentMethod?.key
    ) {
      setSnack({
        open: true,
        message: "Please Select A Payment Method",
        severity: "warning",
      });
      return;
    }
    //  else if (
    //   showcaseDialogFormData?.paymentMethod?.key &&
    //   showcaseDialogFormData?.paymentMethod?.key !== "Cash" &&
    //   showcaseDialogFormData?.paymentMethod?.key.trim() !== "" &&
    //   !showcaseDialogFormData?.transactionReferenceNo?.trim()
    // ) {
    //   setSnack({
    //     open: true,
    //     message:
    //       "Please provide a valid transaction reference for the selected payment method.",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (
      Boolean(showcaseDialogFormData?.subTotalAmountRemaining > 0) &&
      Boolean(showcaseDialogFormData?.paymentMethod?.key) !==
        Boolean(parseFloat(showcaseDialogFormData?.paidAmount))
    ) {
      setSnack({
        open: true,
        message: "Please provide both payment method and amount to proceed.",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(showcaseDialogFormData?.subTotalAmountRemaining > 0) &&
      Boolean(
        parseFloat(showcaseDialogFormData?.paidAmount) !==
          parseFloat(showcaseDialogFormData?.subTotalAmountRemaining)
      )
    ) {
      setSnack({
        open: true,
        message: "please provide remaining amount.",
        severity: "warning",
      });
      return;
    }

    const payload = {
      bookingRefNumber: showcaseDialogFormData?.bookingRefNumber,
      paidAmount: showcaseDialogFormData?.paidAmount,
      paymentMethod: showcaseDialogFormData?.paymentMethod?.key,
      ...(showcaseDialogFormData?.paymentMethod?.key !== "Cash" &&
        showcaseDialogFormData?.transactionReferenceNo?.trim() && {
          transactionReferenceNo:
            showcaseDialogFormData?.transactionReferenceNo,
        }),
    };

    if (showcaseDialogFormData?.paymentMethod?.key === "Online") {
      handleChangeSetPaymentDialogFinalPayload({
        open: true,
        mutationType: "finalCheckout",
        payloadValue: payload,
      });
    } else {
      finalRoomCheckOut(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Final Check-Out Success",
            severity: "success",
          });
          handleCloseShowcaseDialog();
          handleChangeShowcaseDialogFormData();
          handleRoomSelect();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message:
              err?.data?.message ||
              err?.data ||
              "Final Check-Out Request Failed",
            severity: "error",
          });
        });
    }
  }, [
    finalRoomCheckOut,
    showcaseDialogFormData,
    handleCloseShowcaseDialog,
    handleChangeShowcaseDialogFormData,
    handleRoomSelect,
    handleChangeSetPaymentDialogFinalPayload,
  ]);

  const handleRoomCleanRequest = useCallback(
    (roomId) => {
      Swal.fire({
        title: "Send Request For Room Cleaning?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          const payload = {
            id: roomId,
            hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
          };
          roomCleanRequest(payload)
            .unwrap()
            .then((res) => {
              setSnack({
                open: true,
                message: res?.message || "Room Clean Request Success",
                severity: "success",
              });
              handleOpenCustomFormDrawer();
              handleChangeCustomFormDrawerData();
              handleRoomSelect();
            })
            .catch((err) => {
              setSnack({
                open: true,
                message:
                  err?.data?.message || err?.data || "Check-Out Request Failed",
                severity: "error",
              });
            });
        }
      });
    },
    [
      roomCleanRequest,
      handleOpenCustomFormDrawer,
      handleChangeCustomFormDrawerData,
      handleRoomSelect,
    ]
  );

  const handleSubmitBookingForGuestByFrontDesk = useCallback(() => {
    if (!Boolean(customFormDrawerData?.firstName)) {
      setSnack({
        open: true,
        message: "First name is required!",
        severity: "warning",
      });
      return;
    } else if (!/^\d{10}$/.test(String(customFormDrawerData?.phoneNumber))) {
      setSnack({
        open: true,
        message: "Please provide a valid phone number",
        severity: "warning",
      });
      return;
    }
    //  else if (!Boolean(customFormDrawerData?.email?.trim())) {
    //   setSnack({
    //     open: true,
    //     message: "Please provide a valid email",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (!Boolean(customFormDrawerData?.address?.trim())) {
      setSnack({
        open: true,
        message: "Please provide guest address",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(customFormDrawerData?.isBookingForToday) &&
      !Boolean(customFormDrawerData?.checkOutDate)
    ) {
      setSnack({
        open: true,
        message: "Please provide a valid Checkout date",
        severity: "warning",
      });
      return;
    } else if (
      !Boolean(customFormDrawerData?.isBookingForToday) &&
      !Boolean(customFormDrawerData?.fromDate)
    ) {
      setSnack({
        open: true,
        message: "Please provide a valid From date",
        severity: "warning",
      });
      return;
    } else if (
      !Boolean(customFormDrawerData?.isBookingForToday) &&
      !Boolean(customFormDrawerData?.toDate)
    ) {
      setSnack({
        open: true,
        message: "Please provide a valid To date",
        severity: "warning",
      });
      return;
    } else if (!Boolean(customFormDrawerData?.noOfPeoples)) {
      setSnack({
        open: true,
        message: "Atleat 1 guest is required to Check-In",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(customFormDrawerData?.isBookingForToday) &&
      customFormDrawerData?.bookingMapDatas?.some(
        (item) =>
          !item?.customerName?.trim() ||
          !item?.govtIdType?.key ||
          !item?.govtIdNo?.trim()
      )
    ) {
      setSnack({
        open: true,
        message: "Guest Verification Details are required",
        severity: "warning",
      });
      return;
    } else if (
      !Boolean(customFormDrawerData?.isBookingForToday) &&
      customFormDrawerData?.bookingMapDatas?.some((item) => {
        const hasPartialEntry =
          item?.customerName?.trim() ||
          item?.govtIdType?.key ||
          item?.govtIdNo?.trim();

        const isEntryIncomplete =
          !item?.customerName?.trim() ||
          !item?.govtIdType?.key ||
          !item?.govtIdNo?.trim();

        return hasPartialEntry && isEntryIncomplete; // Trigger error if any key is filled but others are missing
      })
    ) {
      setSnack({
        open: true,
        message: "Guest Verification should be completed if required.",
        severity: "warning",
      });
      return;
    } else if (
      Boolean(customFormDrawerData?.isAdvanceRequired) &&
      !Boolean(customFormDrawerData?.paymentMethod?.key)
    ) {
      setSnack({
        open: true,
        message: "Please select a valid payment method",
        severity: "warning",
      });
      return;
    }
    //  else if (
    //   Boolean(customFormDrawerData?.isAdvanceRequired) &&
    //   Boolean(customFormDrawerData?.paymentMethod?.key !== "Cash") &&
    //   !Boolean(customFormDrawerData?.transactionReferenceNo?.trim())
    // ) {
    //   setSnack({
    //     open: true,
    //     message: "Please provide a valid transacion ref. no.",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (
      Boolean(customFormDrawerData?.isAdvanceRequired) &&
      (isNaN(parseFloat(customFormDrawerData?.paidAmount)) ||
        parseFloat(customFormDrawerData?.paidAmount) <
          parseFloat(customFormDrawerData?.accumulatedAdvanceRequired))
    ) {
      setSnack({
        open: true,
        message: "please proceed with required advance amount",
        severity: "warning",
      });
      return;
    }
    //  else if (
    //   customFormDrawerData?.paymentMethod?.key &&
    //   customFormDrawerData?.paymentMethod?.key !== "Cash" &&
    //   customFormDrawerData?.paymentMethod?.key.trim() !== "" &&
    //   !customFormDrawerData?.transactionReferenceNo?.trim()
    // ) {
    //   setSnack({
    //     open: true,
    //     message:
    //       "Please provide a valid transaction reference for the selected payment method.",
    //     severity: "warning",
    //   });
    //   return;
    // }
    else if (
      Boolean(customFormDrawerData?.paymentMethod?.key) !==
      Boolean(parseFloat(customFormDrawerData?.paidAmount))
    ) {
      setSnack({
        open: true,
        message:
          "Please provide both payment method and advance amount to proceed.",
        severity: "warning",
      });
      return;
    }
    const payload = {
      roomTypeId: customFormDrawerData?.roomDto?.roomType?.id,
      isBookingForToday: customFormDrawerData?.isBookingForToday,
      firstName: customFormDrawerData?.firstName,
      middleName: customFormDrawerData?.middleName,
      lastName: customFormDrawerData?.lastName,
      phoneNumber: customFormDrawerData?.phoneNumber,
      email: customFormDrawerData?.email,
      address: customFormDrawerData?.address,
      // checkOutDate: customFormDrawerData?.checkOutDate
      //   ? moment(customFormDrawerData?.checkOutDate.$d).format("DD-MM-YYYY")
      //   : null,
      ...(customFormDrawerData?.isBookingForToday
        ? {
            checkOutDate: customFormDrawerData?.checkOutDate
              ? moment(customFormDrawerData?.checkOutDate.$d).format(
                  "DD-MM-YYYY HH:mm:ss"
                )
              : null,
          }
        : {
            fromDate: customFormDrawerData?.fromDate
              ? moment(customFormDrawerData?.fromDate.$d).format("DD-MM-YYYY")
              : null,
            toDate: customFormDrawerData?.toDate
              ? moment(customFormDrawerData?.toDate.$d).format("DD-MM-YYYY")
              : null,
          }),
      noOfPeoples: customFormDrawerData?.noOfPeoples,
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      roomDto: {
        id: customFormDrawerData?.roomDto?.id,
      },
      bookingMapDatas: customFormDrawerData?.isBookingForToday
        ? customFormDrawerData?.bookingMapDatas?.map((item) => {
            return {
              customerName: item?.customerName?.trim(),
              govtIdType: item?.govtIdType?.key,
              govtIdNo: item?.govtIdNo,
            };
          })
        : customFormDrawerData?.bookingMapDatas?.some(
            (item) =>
              item?.customerName?.trim() ||
              item?.govtIdType?.key ||
              item?.govtIdNo?.trim()
          )
        ? customFormDrawerData?.bookingMapDatas?.map((item) => {
            return {
              customerName: item?.customerName,
              govtIdType: item?.govtIdType?.key,
              govtIdNo: item?.govtIdNo,
            };
          })
        : [],
      paidAmount: !Boolean(customFormDrawerData?.paidAmount)
        ? 0
        : Number(customFormDrawerData?.paidAmount),
      paymentMethod: customFormDrawerData?.paymentMethod?.key,
      // transactionReferenceNo: customFormDrawerData?.transactionReferenceNo,
      ...(customFormDrawerData?.paymentMethod?.key !== "Cash" &&
        customFormDrawerData?.transactionReferenceNo?.trim() && {
          transactionReferenceNo: customFormDrawerData?.transactionReferenceNo,
        }),
      bookingAmount: customFormDrawerData?.accumulatedRoomCharge,
      remarks: customFormDrawerData?.remarks,
    };

    console.log("handleSubmitBookingForGuestByFrontDesk payload : ", payload);

    if (customFormDrawerData?.paymentMethod?.key === "Online") {
      handleChangeSetPaymentDialogFinalPayload({
        open: true,
        mutationType: "roomBooking",
        payloadValue: payload,
      });
    } else {
      bookingByFrontDeskStaff(payload)
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res?.message || "Booking Success",
            severity: "success",
          });
          handleOpenCustomFormDrawer();
          handleRoomSelect();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err?.data?.message || err?.data || "Booking Failed",
            severity: "error",
          });
        });
    }
  }, [
    customFormDrawerData,
    handleChangeSetPaymentDialogFinalPayload,
    bookingByFrontDeskStaff,
    handleOpenCustomFormDrawer,
    handleRoomSelect,
  ]);

  useEffect(() => {
    if (Boolean(apiRoomData?.data?.floorRoomMapData?.length)) {
      handleUpdateRoomDataByFloor(roomFilters);
    }
  }, [
    roomFilters,
    handleUpdateRoomDataByFloor,
    apiRoomData?.data?.floorRoomMapData,
  ]);

  useEffect(() => {
    sessionStorage.removeItem("customBookingHistoryAlertFilter");
    sessionStorage.removeItem("customHouseKeepingHistoryAlertFilter");
  }, []);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              // marginTop: "1rem",
            }}
          >
            <CustomRoomFilters
              roomFilters={roomFilters}
              handleChangeRoomFilters={handleChangeRoomFilters}
              floorData={[
                { id: 0, floorNumber: null, key: "all", name: "All Floors" },
                ...floorOptions,
              ]}
              roomTypes={roomtypeByHotelIdData?.data || []}
              roomData={roomData}
            />
          </Box>
          {/* <Box
            sx={{
              display: "flex",
              overflow: "auto",
              bgcolor: "#e2e6ff",
            }}
          >
            {floorData?.map((floorDetailsItem, index) => {
              return (
                <CustomFloorSelectSection
                  key={`Floor ${index}`}
                  floorDetails={floorDetailsItem}
                  isSelectedFloor={
                    isSelectedFloor?.floorNumber ===
                    floorDetailsItem?.floorNumber
                      ? true
                      : false
                  }
                  handleFloorSelect={handleFloorSelect}
                />
              );
            })}
          </Box> */}
        </Box>

        <Grid container size={12} columnSpacing={1.5} rowSpacing={2}>
          {/* ROOM LIST  */}

          <Grid size={{ md: 9, sm: 7, xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 230px)",
                  xl: "calc(100vh - 200px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
                pt: "3px",
              }}
            >
              <Grid container size={12} spacing={2}>
                {roomData?.map((floorDetailsItem, index) => {
                  return (
                    <Grid key={`Floor ${index}`} size={12}>
                      <CustomFloorAccordion
                        floorData={floorDetailsItem}
                        isSelectedRoom={isSelectedRoom}
                        handleRoomSelect={handleRoomSelect}
                        roomFilters={roomFilters}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Grid>

          {/* EXTRA DETAILS COLUMN */}

          <Grid size={{ md: 3, sm: 5, xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 230px)",
                  xl: "calc(100vh - 200px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
                pt: "3px",
              }}
            >
              <Grid container size={12} spacing={1.5}>
                <Grid size={12}>
                  <CustomAlertCard
                    alertChipData={customBookingAlertChips}
                    alertData={pendingBookingRequestCountsData?.data}
                  />
                </Grid>
                {Boolean(apiTodayCheckoutRoomData?.data?.length) && (
                  <Grid size={12}>
                    <DayCheckoutCard
                      dayCheckoutData={apiTodayCheckoutRoomData?.data}
                      handleChangeSelectedRoomForDayCheckout={
                        handleChangeSelectedRoomForDayCheckout
                      }
                    />
                  </Grid>
                )}

                {isSelectedRoom && (
                  <Grid size={12}>
                    <RoomServiceCard
                      handleOpenShowcaseModalForInventory={
                        handleOpenShowcaseModalForInventory
                      }
                      handleOpenShowcaseModalForFood={
                        handleOpenShowcaseModalForFood
                      }
                      isSelectedRoom={isSelectedRoom}
                      handleOpenCustomFormDrawer={handleOpenCustomFormDrawer}
                      handleOpenShowcaseModalForCheckout={
                        handleOpenShowcaseModalForCheckout
                      }
                      handleRequestRoomCheckout={handleRequestRoomCheckout}
                      handleRoomCleanRequest={handleRoomCleanRequest}
                      handleOpenShowcaseModalForLaundry={
                        handleOpenShowcaseModalForLaundry
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <ShowcaseDialog
        openShowcaseDialog={showcaseDialogData?.open}
        title={showcaseDialogData?.title}
        type={showcaseDialogData?.type}
        inventoryData={showcaseDialogData?.inventoryData || []}
        foodData={showcaseDialogData?.foodData || []}
        laundryData={showcaseDialogData?.laundryData || []}
        checkOutRoomData={isSelectedRoom}
        handleCloseShowcaseDialog={handleCloseShowcaseDialog}
        showcaseDialogFormData={showcaseDialogFormData}
        allPaymentMethods={allPaymentMethods}
        handleChangeShowcaseDialogFormData={handleChangeShowcaseDialogFormData}
        handleConfirmFinalCheckout={handleConfirmFinalCheckout}
        foodListTableHeaders={foodListTableHeaders}
        foodListItemsTableHeaders={foodListItemsTableHeaders}
        laundryListTableHeaders={laundryListTableHeaders}
        laundryListItemsTableHeaders={laundryListItemsTableHeaders}
        barListTableHeaders={barListTableHeaders}
        barListItemsTableHeaders={barListItemsTableHeaders}
      />
      <CustomFormDrawer
        customDrawerOpen={customFormDrawerOpen?.open}
        title={customFormDrawerOpen?.title}
        type={customFormDrawerOpen?.type}
        handleToggleCustomFormDrawer={handleOpenCustomFormDrawer}
        customFormDrawerData={customFormDrawerData}
        handleChangeCustomFormDrawerData={handleChangeCustomFormDrawerData}
        isSelectedRoom={isSelectedRoom}
        allGovtIdsData={allGovtIdsData}
        allPaymentMethods={allPaymentMethods}
        handleSubmitRoomCheckIn={handleSubmitRoomCheckIn}
        handleSubmitRoomBookingCanelation={handleSubmitRoomBookingCanelation}
        handleSubmitBookingForGuestByFrontDesk={
          handleSubmitBookingForGuestByFrontDesk
        }
      />
      <LoadingComponent
        open={
          isApiRoomDataFetching ||
          saveCustomerCheckInRes?.isLoading ||
          cancelReservtionRes?.isLoading ||
          isApiTodayCheckoutRoomDataFetching ||
          requestRoomCheckoutRes?.isLoading ||
          finalRoomCheckOutRes?.isLoading ||
          roomCleanRequestRes?.isLoading ||
          isRoomtypeByHotelIdDataFetching ||
          isAllGovtIdsDataFetching ||
          isAllPaymentMethodsFetching ||
          bookingByFrontDeskStaffRes?.isLoading ||
          isPendingBookingRequestCountsDataLoading ||
          false
        }
      />

      <PaymentDialog
        openPaymentDialog={openPaymentDialog}
        handlePaymentDialogClose={() => setOpenPaymentDialog(false)}
        reservationPayload={paymentDialogFinalPayload}
        setSnack={setSnack}
        reserveHotelRoom={
          HandleDynamicFinalApiMutationForPaymentDialog(
            paymentDialogMutationType
          )?.mutationFunction
        }
        handleAfterSuccessFunction={
          HandleDynamicFinalApiMutationForPaymentDialog(
            paymentDialogMutationType
          )?.afterMutationSuccessFunction
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

function convertDateFormat(input) {
  // Split the input date and time
  const [date, time] = input.split(" ");

  // Split the date into day, month, and year
  const [day, month, year] = date.split("-");

  // Return the new format: MM-DD-YYYY hh:mm
  console.log(time + " : " + time + "timeeeeeee");
  return `${month}-${day}-${year} ${time}`;
}

export default Dashboard;
