import React, { memo } from "react";
import {
  useGetAllLaundryHistoryQuery,
  useGetAllLaundryStatusQuery,
  useChangeLaundryStatusMutation,
  useLaundryRequestMutation,
  useAddRatingForLaundryMutation,
} from "../../services/dashboard";
import SnackAlert from "../../components/Alert";

import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  TableBody,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete,
  DialogActions,
  Rating,
} from "@mui/material";
import { StyledTableRow, StyledTableCell } from "./HouseKeeperDashboard";
import Grid from "@mui/material/Grid2";
import moment from "moment";
import LoadingComponent from "../../components/LoadingComponent";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import {
  CUSTOMER,
  //  ADMIN,
  // FRONTDESK,
  HOUSEKEEPER,
} from "../../helper/constants";
import { useNavigate } from "react-router-dom";

const LaundryHistory = () => {
  const navigate = useNavigate();
  const LaundryHistoryTableHeaders = React.useMemo(() => {
    const roleType = JSON.parse(sessionStorage.getItem("data"))?.roleType;
    // const isCustomer = roleType === CUSTOMER;

    return [
      { label: "Sl. No.", key: "sno" },
      { label: "Booking Ref.No.", key: "bookingRefNo" },
      { label: "Items", key: "" },
      { label: "Room No.", key: "room.roomNo" },
      { label: "Created At", key: "createdAt" },
      { label: "Laundry Status", key: "laundryStatus" },
      ...(roleType === "Customer"
        ? [{ label: "Rating", key: "rating" }]
        : roleType === "Housekeeping_Staff"
        ? [
            { label: "Rating", key: "rating" },
            { label: "Rating Message", key: "ratingMessage" },
            { label: "Action", key: "laundryAction" },
          ]
        : []),
    ];
  }, []);

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const initialLaundryHistoryTableFilters = React.useMemo(
    () => ({
      LaundryStatus: null,
      LaundryStatusInputVal: "",
      pageNo: 0,
      pageSize: 10,
    }),
    []
  );

  const [
    laundryHistoryTableFilters,
    //  setLaundryHistoryTableFilters
  ] = React.useState(initialLaundryHistoryTableFilters);

  const {
    data: laundryHistory = {
      paginationData: {
        numberOfElements: 0,
        totalElements: 0,
        totalPages: 0,
        data: [],
      },
    },
    isLoading: isLaundryHistoryLoading,
    isSuccess: isLaundryHistorySuccess,
  } = useGetAllLaundryHistoryQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
      bookingRefNo: sessionStorage.getItem("bookingRefNumberForLaundry"),
      assignedPerson: JSON.parse(sessionStorage.getItem("data"))?.id,
      pageNo: laundryHistoryTableFilters?.pageNo,
      pageSize: laundryHistoryTableFilters?.pageSize,
    },
    {
      refetchOnMountOrArgChange: true,
      // skip: !JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    }
  );

  const [laundryHistoryTableData, setLaundryHistoryTableData] = React.useState({
    numberOfElements: 0,
    totalElements: 0,
    totalPages: 0,
    data: [],
  });

  console.log("laundryHistoryTableData", laundryHistoryTableData);
  const [laundryHistoryTablePageNo, setLaundryHistoryTablePageNo] =
    React.useState(0);
  const [laundryHistoryTableRowsPerPage, setLaundryHistoryTableRowsPerPage] =
    React.useState(10);

  const [laundryRequest, laundryRequestRes] = useLaundryRequestMutation();

  const handleChangeLaundryHistoryTablePageNo = React.useCallback(
    (event, newpage) => {
      setLaundryHistoryTablePageNo(newpage);
    },
    []
  );

  const handleChangeLaundryHistoryTableRowsPerPage = React.useCallback(
    (event) => {
      setLaundryHistoryTableRowsPerPage(parseInt(event.target.value, 10));
      setLaundryHistoryTablePageNo(0);
    },
    []
  );

  React.useEffect(() => {
    if (isLaundryHistorySuccess) {
      setLaundryHistoryTableData(laundryHistory?.paginationData?.data);
    }
  }, [isLaundryHistorySuccess, laundryHistory]);

  const handleRequestLaundryService = React.useCallback(() => {
    const payload = {
      bookingRefNo: sessionStorage.getItem("bookingRefNumberForLaundry"),
    };
    laundryRequest(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res?.message || "Laundry Request sent ",
          severity: "success",
        });
      })
      .catch((err) => {
        setSnack({
          open: true,
          message:
            err?.data?.message ||
            err?.data ||
            "Unable to submit laundry request",
          severity: "error",
        });
      });
  }, [laundryRequest]);

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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FaArrowAltCircleLeft
              style={{
                color: "#164e80",
                marginRight: "5px",
                cursor: "pointer",
                fontSize: "20px",
              }}
              onClick={() => {
                navigate(-1);
              }}
            />
            <Typography
              variant="h5"
              display="inline-block"
              fontWeight="500"
              marginX="0"
            >
              Laundry History
            </Typography>
          </Box>
          {Boolean(
            JSON.parse(sessionStorage.getItem("data"))?.roleType === "Customer"
          ) && (
            <Box>
              {/* Filters */}
              <Button
                variant="contained"
                sx={{
                  backgroundImage:
                    "linear-gradient(to right, #32cd32 0%, #228b22 100%)",
                  color: "white",
                  "&:hover": {
                    backgroundImage:
                      "linear-gradient(to right, #32cd32 10%, #228b22 90%)",
                  },
                }}
                onClick={handleRequestLaundryService}
              >
                Laundry Request
              </Button>
            </Box>
          )}
        </Box>
        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 250px)",
                  xl: "calc(100vh - 200px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <CustomLaundryHistoryTableContainer
                tableHeaders={LaundryHistoryTableHeaders}
                tableData={laundryHistory?.paginationData}
                pageNo={laundryHistoryTablePageNo}
                pageSize={laundryHistoryTableRowsPerPage}
                handlePageChange={handleChangeLaundryHistoryTablePageNo}
                handleChangeRowsPerPage={
                  handleChangeLaundryHistoryTableRowsPerPage
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <LoadingComponent
        open={isLaundryHistoryLoading || laundryRequestRes.isLoading || false}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

//  "data": [
//       "Requested",
//       "Approved",
//       "In_Progress",
//       "Ready_For_Delivery",
//       "Completed"
//   ]

function getBookingStatusColor(key) {
  switch (key) {
    case "Approved":
      return { color: "#01a837", bgcolor: "#c7ffd9" };
    case "Requested":
      return { color: "#cd5000", bgcolor: "#ffe3d1" };
    // case "In_Progress":
    //   return { color: "#0068b7", bgcolor: "#d3ecff" };
    // case "Ready_For_Delivery":
    //   return { color: "#6101a8", bgcolor: "#f0ddff" };
    // case "Completed":
    //   return { color: "#c60000", bgcolor: "#ffd6d6" };
    case "Delivered":
      return { color: "#6101a8", bgcolor: "#f0ddff" };
    default:
      return { color: "inherit", bgcolor: "inherit" };
  }
}
function calculateSerialNumber(index, pageNumber, rowsPerPage) {
  index = index ?? 0;
  pageNumber = pageNumber ?? 0;
  rowsPerPage = rowsPerPage ?? 10;

  index = Number(index);
  pageNumber = Number(pageNumber);
  rowsPerPage = Number(rowsPerPage);

  return pageNumber * rowsPerPage + index + 1;
}

const CustomRow = memo(function ({ tableHeaders, rowSerialNumber, row }) {
  const roleType = JSON.parse(sessionStorage.getItem("data"))?.roleType;
  const isAdmin = roleType === HOUSEKEEPER;

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [reviewDialog, setReviewDialog] = React.useState(null);
  const [rateLaundry, rateLaundryRes] = useAddRatingForLaundryMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const handleItemsClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleActionButtonClick = () => {
    setStatusDialogOpen(true);
  };
  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 60,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        {tableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell
              key={`table-body-cell=${subIndex}`}
              align="center"
              onClick={subitem?.key === "" ? handleItemsClick : undefined}
            >
              <Box>
                {subitem?.key === "sno" ? (
                  <Typography
                    sx={{
                      fontSize: "13px",
                      cursor: subitem?.key === "" ? "pointer" : "default",
                    }}
                    // onClick={subitem?.key === "" ? handleItemsClick : undefined}
                  >
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "createdAt" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.createdAt &&
                      moment(row?.createdAt).format("DD-MM-YYYY hh:mm A")}
                  </Typography>
                ) : subitem?.key === "laundryStatus" ? (
                  <Box
                    sx={{
                      color: getBookingStatusColor(row?.laundryStatus)?.color,
                      backgroundColor: getBookingStatusColor(row?.laundryStatus)
                        ?.bgcolor,
                      fontWeight: "600",
                      border: `0.5px solid ${
                        getBookingStatusColor(row?.laundryStatus)?.color
                      }`,
                      py: 0.7,
                      textAlign: "center",
                      width: "178px",
                      borderRadius: 2,
                      margin: "auto",
                    }}
                  >
                    {row?.laundryStatus?.replace(/_/g, " ")}
                  </Box>
                ) : subitem?.key === "laundryAction" &&
                  isAdmin &&
                  !Boolean(
                    // JSON.parse(sessionStorage.getItem("data"))?.roleType ===
                    //   CUSTOMER
                    // row?.laundryStatus === "Completed"
                    row?.laundryStatus === "Delivered"
                  ) ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{ minWidth: "unset", width: "11px" }}
                        onClick={handleActionButtonClick}
                      >
                        <EventAvailableIcon
                          sx={{ fontSize: "14px", fontWeight: 600 }}
                        />
                      </Button>
                    </Box>
                  </>
                ) : subitem?.key === "rating" &&
                  Boolean(
                    JSON.parse(sessionStorage.getItem("data"))?.roleType ===
                      CUSTOMER ||
                      JSON.parse(sessionStorage.getItem("data"))?.roleType ===
                        HOUSEKEEPER
                  ) &&
                  Boolean(row?.laundryStatus === "Delivered") ? (
                  <Box>
                    {Boolean(row?.isRated) ? (
                      <Rating value={row?.ratingPoints} disabled size="large" />
                    ) : (
                      <Box>
                        {JSON.parse(sessionStorage.getItem("data"))
                          ?.roleType === HOUSEKEEPER ? (
                          "-"
                        ) : (
                          <Button
                            color="secondary"
                            variant="contained"
                            sx={{
                              color: "#fff",
                              letterSpacing: 1,
                              textTransform: "none",
                              "&.Mui-disabled": {
                                background: "#B2E5F6",
                                color: "#FFFFFF",
                              },
                            }}
                            onClick={() => setReviewDialog(row)}
                          >
                            Review
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "13px" }}>
                    {getCellValue(row, subitem?.key)}
                  </Typography>
                )}
              </Box>
            </TableCell>
          );
        })}
      </TableRow>

      <ReviewDialog
        open={Boolean(reviewDialog)}
        handleClose={() => setReviewDialog(null)}
        rateLaundry={rateLaundry}
        setSnack={setSnack}
        orderObj={reviewDialog}
      />
      <LaundryItemsDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        items={row.itemsDto}
      />

      <LaundryStatusDialog
        open={statusDialogOpen}
        onClose={handleStatusDialogClose}
        items={row}
      />
      <LoadingComponent open={rateLaundryRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
});

function ReviewDialog({ open, handleClose, rateLaundry, setSnack, orderObj }) {
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState("");

  const handleSubmitReview = React.useCallback(
    (event) => {
      event.preventDefault();
      rateLaundry({
        id: orderObj.id,
        ratingPoints: rating,
        ratingMessage: review,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          setRating(0);
          setReview("");
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
    [rateLaundry, setSnack, rating, review, handleClose, orderObj]
  );

  return (
    <React.Fragment>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmitReview,
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
          Review Your Order
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid size={12}>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={rating}
                onChange={(e, newVal) => setRating(newVal)}
                size="large"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                autoFocus
                margin="dense"
                name="review"
                label="Review Message"
                fullWidth
                variant="standard"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            sx={{
              color: "#fff",
              display: "block",
              mx: "auto",
              letterSpacing: 1,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 18,
              "&.Mui-disabled": {
                background: "#B2E5F6",
                color: "#FFFFFF",
              },
            }}
            disabled={!Boolean(rating)}
            type="submit"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

const LaundryItemsDialog = ({ open, onClose, items, totalPrice }) => {
  console.log("items", items);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography
          sx={{
            fontWeight: "bold",
            fontSize: "1.4rem",
            fontFamily: "'Times New Roman', Times, serif",
          }}
        >
          Laundry Items Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell>Item Name</StyledTableCell>
                <StyledTableCell align="right">Quantity</StyledTableCell>
                <StyledTableCell align="right">Price per Item</StyledTableCell>
                <StyledTableCell align="right">
                  Total Item Price
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell align="center">{item.name}</TableCell>
                  <TableCell align="center">{item.qty}</TableCell>
                  <TableCell align="center">
                    ₹{item.price?.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    ₹{(item.qty * item.price)?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

const LaundryStatusDialog = ({ open, onClose, items }) => {
  console.log("items", items);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [selectedStatus, setSelectedStatus] = React.useState(null);
  const {
    data: statusList = {
      data: [],
    },
    // isLoading: isLaundryStatusLoading,
  } = useGetAllLaundryStatusQuery({
    skip: Boolean(
      JSON.parse(sessionStorage.getItem("data"))?.roleType === CUSTOMER
    ),
  });
  const [
    changeLaundryStatus,
    // , changeLaundryStatusRes
  ] = useChangeLaundryStatusMutation();

  const handleChangeLaundryStatus = () => {
    if (!selectedStatus) {
      setSnack({
        open: true,
        message: "Please select a status",
        severity: "error",
      });
      return;
    }
    const payload = {
      id: items?.id,
      laundryStatus: selectedStatus.key,
    };

    changeLaundryStatus(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        onClose();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  };
  // const statusProgression = {
  //   Requested: ["Approved", "In_Progress"],
  //   Approved: ["In_Progress"],
  //   In_Progress: ["Ready_For_Delivery"],
  //   Ready_For_Delivery: ["Completed"],
  //   Completed: [],
  // };

  const statusProgression = {
    Requested: ["Approved"],
    Approved: ["Delivered"],
    Delivered: [],
  };

  React.useEffect(() => {
    const roleType = JSON.parse(sessionStorage.getItem("data"))?.roleType;

    // Skip state update if role type is "Customer"
    if (roleType === "Customer") return;

    if (items?.laundryStatus && statusList?.data) {
      const currentStatusObj = {
        key: items.laundryStatus,
        name: items.laundryStatus.replace(/_/g, " "),
      };
      setSelectedStatus(currentStatusObj);
    }
  }, [items, statusList]);

  const isOptionDisabled = (option) => {
    if (!items?.laundryStatus) return false;
    const allowedNextStatuses = statusProgression[items.laundryStatus] || [];
    return !allowedNextStatuses.includes(option);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        // maxWidth="md"
        // fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "450px", minWidth: "700px" } }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.4rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Update Laundry Status
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
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
                  fontSize: 18,
                },
                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                  borderBottom: (theme) =>
                    `1px solid ${theme.palette.primary.main}`,
                },
                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                  borderBottom: (theme) =>
                    `1px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <Autocomplete
                options={
                  statusList?.data?.map((item) => ({
                    key: item,
                    name: item.replace(/_/g, " "),
                  })) || []
                }
                value={selectedStatus}
                onChange={(event, newValue) => setSelectedStatus(newValue)}
                fullWidth
                getOptionLabel={(option) => option?.name}
                clearOnEscape
                disablePortal
                isOptionDisabled={(option) => isOptionDisabled(option.key)}
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    style={{
                      backgroundColor: isOptionDisabled(option.key)
                        ? "rgba(0,0,0,0.12)"
                        : "inherit",
                      color: isOptionDisabled(option.key)
                        ? "rgba(0,0,0,0.38)"
                        : "inherit",
                      cursor: isOptionDisabled(option.key)
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {option.name}
                  </li>
                )}
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
                    label="Booking Status"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleChangeLaundryStatus}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const getCellValue = (obj, key, fallback = "") => {
  if (!key) {
    // Return length of itemsDto array for Items column
    return obj.itemsDto ? obj.itemsDto.length : 0;
  }
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
      obj
    );
};
const CustomLaundryHistoryTableContainer = memo(function ({
  tableHeaders,
  tableData,
  pageNo,
  pageSize,
  handlePageChange,
  handleChangeRowsPerPage,
}) {
  // const roleType = JSON.parse(sessionStorage.getItem("data"))?.roleType;
  console.log("tableHeaders", tableHeaders);
  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          maxHeight: {
            xs: "calc(100vh - 310px)",
            xl: "calc(100vh - 280px)",
            "&::-webkit-scrollbar": {},
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
              {tableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`table-head-${index}`}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: "primary.main",
                      fontWeight: "bold",
                      paddingY: item?.key === "sno" ? "15px" : "auto",

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
            {Boolean(tableData?.data?.length > 0) ? (
              tableData?.data?.map((row, index) => (
                <CustomRow
                  tableHeaders={tableHeaders}
                  rowSerialNumber={calculateSerialNumber(
                    index,
                    pageNo,
                    pageSize
                  )}
                  key={row.id}
                  row={row}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(tableHeaders?.length) ? tableHeaders?.length : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={tableData?.totalElements || 0}
        rowsPerPage={pageSize}
        page={pageNo}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleChangeRowsPerPage}
        // rowsPerPageOptions={[5, 10, 20, 50, 100]}
      />
    </>
  );
});

export default LaundryHistory;
