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
import { BootstrapDialog } from "../header/Header";
import ChairIcon from "@mui/icons-material/Chair";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  useGetAllTablesForBarWaiterQuery,
  useDeliverBarByWaiterMutation,
} from "../../services/bar";

const BarWaiterDashboard = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(null);

  const handleCloseOrderDetailsDialog = React.useCallback(() => {
    setOrderDetailsDialog(null);
  }, []);

  const {
    data: tableListForBarWaiter = {
      data: [],
    },
    isLoading,
  } = useGetAllTablesForBarWaiterQuery(
    {
      hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
      userId: JSON.parse(sessionStorage.getItem("data")).id,
    },
    {
      pollingInterval: 10000,
    }
  );

  const [deliverBar, deliverBarRes] = useDeliverBarByWaiterMutation();
  return (
    <>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
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
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#EE82EE",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Ready to serve
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#007FFF",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Recieved By Waiter
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#00CED1",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                Delivered
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#FFAC1C",
                }}
              />
              <Typography variant="body2" color="textPrimary">
                To be taken
              </Typography>
            </Box>
          </Box>
        </Box>

        <TableCardsForBarWaiter
          tableListForBarWaiter={tableListForBarWaiter}
          setOrderDetailsDialog={setOrderDetailsDialog}
        />
        <OrderDetailsDialog
          orderDetailsDialog={orderDetailsDialog}
          handleCloseOrderDetailsDialog={handleCloseOrderDetailsDialog}
          setSnack={setSnack}
          deliverBar={deliverBar}
        />
      </Box>
      <LoadingComponent open={isLoading || deliverBarRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const TableCardsForBarWaiter = ({
  tableListForBarWaiter,
  setOrderDetailsDialog,
}) => {
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

  return (
    <>
      <Grid container spacing={2}>
        {tableListForBarWaiter?.data?.map((item, index) => {
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
                      : item?.bookingRequestDto?.foodBookingStatus ===
                        "Received_by_Waiter"
                      ? "#007FFF"
                      : item?.bookingRequestDto?.foodBookingStatus ===
                        "Delivered"
                      ? "#00CED1"
                      : Boolean(item?.bookingRequestDto)
                      ? "#FFAC1C"
                      : "#17B169",
                    // backgroundColor: Boolean(
                    //   item?.bookingRequestDto?.foodBookingStatus ===
                    //     "Ready_to_serve"
                    // )
                    //   ? "#EE82EE"
                    //   : Boolean(item?.bookingRequestDto)
                    //   ? "#FFAC1C"
                    //   : "#17B169",
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
                      sessionStorage.setItem("barTableId", item?.id);
                      sessionStorage.setItem("isStayingGuest", false);
                      sessionStorage.setItem(
                        "barorderTakenBy",
                        JSON.parse(sessionStorage.getItem("data")).id
                      );
                      sessionStorage.setItem(
                        "hotelIdFromBarWaiter",
                        item?.hotelId
                      );
                      navigate("/bar");
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
  deliverBar,
  setSnack,
}) => {
  const navigate = useNavigate();
  console.log("orderDetailsDialog", orderDetailsDialog);

  const handleDeliverOrder = React.useCallback(() => {
    deliverBar({
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
  }, [
    deliverBar,
    orderDetailsDialog?.bookingRequestDto?.orderId,
    handleCloseOrderDetailsDialog,
    setSnack,
  ]);
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
            </Typography>
            {Boolean(
              orderDetailsDialog?.bookingRequestDto?.orderStatus === "Delivered"
            ) && (
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
                  sessionStorage.setItem("barTableId", orderDetailsDialog?.id);
                  sessionStorage.setItem(
                    "orderIdFromBarWaiter",
                    orderDetailsDialog?.bookingRequestDto?.orderId
                  );
                  sessionStorage.setItem("isStayingGuest", false);
                  sessionStorage.setItem(
                    "barorderTakenBy",
                    JSON.parse(sessionStorage.getItem("data")).id
                  );
                  sessionStorage.setItem(
                    "hotelIdFromBarWaiter",
                    orderDetailsDialog?.hotelId
                  );
                  navigate("/bar");
                }}
              >
                Place new Order
              </Button>
            )}
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
              <Typography
                sx={{
                  fontWeight: "bold",
                }}
              >
                Table No:
              </Typography>
              <Typography>{orderDetailsDialog?.tableNo}</Typography>
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
                {orderDetailsDialog?.bookingRequestDto?.orderStatus
                  ?.split("_")
                  ?.join(" ")}
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
                ₹ {orderDetailsDialog?.bookingRequestDto?.totalAmount}
              </Typography>
            </Box>
            {Boolean(
              orderDetailsDialog?.bookingRequestDto?.orderStatus ===
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
                              <TableCell>{item?.name}</TableCell>
                              <TableCell>{item?.quantity}</TableCell>
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

export default BarWaiterDashboard;
