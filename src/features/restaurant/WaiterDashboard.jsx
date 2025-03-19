import React from "react";
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  Typography,
  Grid2 as Grid,
  // TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { BootstrapDialog } from "../header/Header";
import ChairIcon from "@mui/icons-material/Chair";
import {
  useGetAllTablesForWaiterQuery,
  useDeliverFoodByWaiterMutation,
} from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const WaiterDashboard = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [deliverFood, deliverFoodRes] = useDeliverFoodByWaiterMutation();
  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(null);
  const handleCloseOrderDetailsDialog = React.useCallback(() => {
    setOrderDetailsDialog(null);
  }, []);
  const {
    data: tableListForWaiter = {
      data: [],
    },
    isLoading,
    isFetching,
  } = useGetAllTablesForWaiterQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    userId: JSON.parse(sessionStorage.getItem("data")).id,
  });

  console.log("tableListForWaiter", tableListForWaiter);

  return (
    <>
      <Box>
        <TableCardsForWaiter
          tableListForWaiter={tableListForWaiter}
          setOrderDetailsDialog={setOrderDetailsDialog}
        />
      </Box>
      <OrderDetailsDialog
        orderDetailsDialog={orderDetailsDialog}
        handleCloseOrderDetailsDialog={handleCloseOrderDetailsDialog}
        deliverFood={deliverFood}
        setSnack={setSnack}
      />
      <LoadingComponent
        open={isLoading || isFetching || deliverFoodRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const TableCardsForWaiter = ({ tableListForWaiter, setOrderDetailsDialog }) => {
  const navigate = useNavigate();

  const getChairDistribution = (capacity) => {
    if (capacity === 4) {
      return { top: 2, right: 0, bottom: 2, left: 0 };
    } else if (capacity === 8) {
      return { top: 4, right: 0, bottom: 4, left: 0 };
    } else if (capacity === 2) {
      return { top: 1, right: 0, bottom: 1, left: 0 };
    } else if (capacity === 6) {
      return { top: 3, right: 0, bottom: 3, left: 0 };
    } else if (capacity === 3) {
      return { top: 2, right: 0, bottom: 1, left: 0 };
    } else if (capacity === 5) {
      return { top: 3, right: 0, bottom: 2, left: 0 };
    } else if (capacity === 7) {
      return { top: 4, right: 0, bottom: 3, left: 0 };
    } else {
      // Default for other capacities
      const half = Math.floor(capacity / 2);
      const remainder = capacity % 2;
      return {
        top: half + remainder,
        right: 0,
        bottom: half,
        left: 0,
      };
    }
  };

  //   const calculateGridSize = (capacity) => {
  //     const sizeMappings = {
  //       1: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       2: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       3: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       4: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       5: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       6: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       7: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 },
  //       8: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
  //       9: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
  //       10: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
  //       11: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
  //       12: { xs: 12, sm: 6, md: 3, lg: 2, xl: 2 },
  //       13: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       14: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       15: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       16: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       17: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       18: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       19: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //       20: { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 },
  //     };

  //     return sizeMappings[capacity] || { xs: 12, sm: 6, md: 3, lg: 2, xl: 1 };
  //   };

  const calculateGridSize = (capacity) => {
    const sizeMappings = {
      1: 1.2,
      2: { xs: 12, sm: 6, md: 4, lg: 1.2, xl: 1.2 },
      3: 1.3,
      4: 1.3,
      5: 1.4,
      6: 1.4,
      7: 1.5,
      8: 1.8,
      9: 1.8,
      10: 2,
      11: 2.4,
      12: 2.4,
      13: 2.6,
      14: 2.6,
      15: 2.8,
      16: 2.8,
      17: 3,
      18: 3,
      19: 3.1,
      20: 3.2,
    };

    if (sizeMappings[capacity]) {
      return sizeMappings[capacity];
    }

    const calculatedSize = 1.0 + (capacity - 2) * 0.05;
    return Math.min(calculatedSize, 3.2);
  };

  const generateChairs = (count, rotation) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <ChairIcon
          key={index}
          sx={{
            transform: `rotate(${rotation}deg)`,
            color: "#888",
            mx: 1,
            fontSize: "1.6rem",
          }}
        />
      ));
  };

  // const handleNavigateToFoodOrder = ()=>{

  // }
  return (
    <>
      <Grid container spacing={2}>
        {tableListForWaiter?.data?.map((item, index) => {
          const noOfSeats = item?.noOfSeats;
          const distribution = getChairDistribution(noOfSeats);
          const gridSize = calculateGridSize(noOfSeats);

          return (
            <Grid size={gridSize} key={index}>
              <Box
                sx={{
                  position: "relative",
                  padding: "25px",
                  marginY: "10px",
                }}
              >
                {/* Top chairs */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    top: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {generateChairs(distribution.top, 0)}
                </Box>

                {/* Table */}
                <Box
                  sx={{
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)",
                    minHeight: "7rem",
                    transition: "background-color 0.3s ease",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    fontSize: "18px",
                    fontWeight: "600",
                    backgroundColor: Boolean(
                      item?.bookingRequestDto?.foodBookingStatus ===
                        "Ready_to_serve"
                    )
                      ? "#EE82EE"
                      : Boolean(item?.bookingRequestDto)
                      ? "#FFAC1C"
                      : "#17B169",
                    opacity: 0.7,
                    cursor: "pointer",
                    mt: 1,
                    mb: 1,
                  }}
                  // onClick={() => handleNavigateToFoodOrder(item)}
                  onClick={() => {
                    if (Boolean(item?.bookingRequestDto)) {
                      setOrderDetailsDialog(item);
                    } else {
                      sessionStorage.setItem("tableId", item?.id);
                      sessionStorage.setItem("isStayingGuest", false);
                      sessionStorage.setItem(
                        "orderTakenBy",
                        JSON.parse(sessionStorage.getItem("data")).id
                      );
                      navigate("/resturant");
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                      }}
                    >
                      {item?.tableNo}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Capacity:
                    </Typography>
                    <Typography sx={{ color: "#fff" }}>
                      {item?.noOfSeats}
                    </Typography>
                  </Box>
                </Box>

                {/* Bottom chairs */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {generateChairs(distribution.bottom, 180)}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

const OrderDetailsDialog = ({
  orderDetailsDialog,
  handleCloseOrderDetailsDialog,
  deliverFood,
  setSnack,
}) => {
  const navigate = useNavigate();
  console.log(
    "orderDetailsDialog",
    orderDetailsDialog?.bookingRequestDto?.orderId
  );

  const handleDeliverOrder = React.useCallback(() => {
    deliverFood({
      orderId: orderDetailsDialog?.bookingRequestDto?.orderId,
    })
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        handleCloseOrderDetailsDialog();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [deliverFood, orderDetailsDialog?.bookingRequestDto?.orderId]);
  return (
    <>
      <BootstrapDialog
        open={Boolean(orderDetailsDialog)}
        onClose={handleCloseOrderDetailsDialog}
        aria-labelledby="password-change-dialog-title"
        maxWidth="md"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            // px: 5,
            // py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: "1.9rem",
                fontFamily: "'Times New Roman', Times, serif",
                color: (theme) => theme.palette.primary.main,
              }}
            >
              Order Details
            </Typography>{" "}
            <Button
              color="secondary"
              variant="contained"
              size="small"
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
              onClick={() => {
                sessionStorage.setItem("tableId", orderDetailsDialog?.id);
                sessionStorage.setItem(
                  "orderIdFromWaiter",
                  orderDetailsDialog?.bookingRequestDto?.orderId
                );
                sessionStorage.setItem("isStayingGuest", false);
                sessionStorage.setItem(
                  "orderTakenBy",
                  JSON.parse(sessionStorage.getItem("data")).id
                );
                navigate("/resturant");
              }}
            >
              Place new Order
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography
                sx={{
                  fontWeight: "bold",
                }}
              >
                Order Id:
              </Typography>
              <Typography>
                {orderDetailsDialog?.bookingRequestDto?.orderId}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography sx={{ fontWeight: "bold" }}>Order Date:</Typography>
              <Typography>
                {moment(orderDetailsDialog?.bookingRequestDto?.bookedOn).format(
                  "DD/MM/YYYY hh:mma"
                )}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography sx={{ fontWeight: "bold", color: "secondary" }}>
                Order Status:
              </Typography>
              <Typography>
                {orderDetailsDialog?.bookingRequestDto?.foodBookingStatus
                  .split("_")
                  .join(" ")}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                }}
              >
                Order Sub-total:
              </Typography>
              <Typography>
                ₹ {orderDetailsDialog?.bookingRequestDto?.totalPrice}
              </Typography>
            </Box>
            {Boolean(
              orderDetailsDialog?.bookingRequestDto?.foodBookingStatus ===
                "Ready_to_serve"
            ) && (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  color="secondary"
                  variant="contained"
                  size="small"
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
                  onClick={handleDeliverOrder}
                >
                  Deliver Order
                </Button>
              </Box>
            )}

            <Box sx={{ py: 2 }}>
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
                      <TableCell>Sl. No.</TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Delivered</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetailsDialog?.bookingRequestDto?.trailData?.map(
                      (item, index) => {
                        return (
                          <>
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item?.itemName}</TableCell>
                              <TableCell>{item?.noOfItems}</TableCell>
                              <TableCell>
                                {Boolean(item?.isDelivered) ? "Yes" : "No"}
                              </TableCell>
                            </TableRow>
                          </>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default WaiterDashboard;
