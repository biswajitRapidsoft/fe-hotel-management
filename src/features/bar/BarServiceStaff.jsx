import React from "react";
import {
  Box,
  Grid2 as Grid,
  TableBody,
  TableHead,
  DialogTitle,
  DialogContent,
  Typography,
  TableContainer,
  TableRow,
  Table,
  TableCell,
  Button,
} from "@mui/material";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { BootstrapDialog } from "../header/Header";
import {
  useGetAllServiceRequestsForBarServiceStaffQuery,
  useDeliverBarOrdersByServiceStaffMutation,
} from "../../services/bar";

const BarServiceStaff = () => {
  const [serviceDetailsDialog, setServiceDetailsDialog] = React.useState(null);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const { data: orderListForServiceStaff = { data: [] }, isLoading } =
    useGetAllServiceRequestsForBarServiceStaffQuery({
      userId: JSON.parse(sessionStorage.getItem("data")).id,
    });
  const handleCloseServiceDetailsDialog = React.useCallback(() => {
    setServiceDetailsDialog(null);
  }, []);

  const [deliverBarByServiceStaff, deliverBarByServiceStaffRes] =
    useDeliverBarOrdersByServiceStaffMutation();
  return (
    <>
      <div>
        <OrderCardForBarServiceStaff
          orderListForServiceStaff={orderListForServiceStaff}
          setServiceDetailsDialog={setServiceDetailsDialog}
        />
      </div>
      <ServiceDetailsDialogRequests
        serviceDetailsDialog={serviceDetailsDialog}
        setServiceDetailsDialog={setServiceDetailsDialog}
        deliverBarByServiceStaff={deliverBarByServiceStaff}
        handleCloseServiceDetailsDialog={handleCloseServiceDetailsDialog}
        setSnack={setSnack}
      />
      <LoadingComponent
        open={isLoading || deliverBarByServiceStaffRes.isLoading}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

const ServiceDetailsDialogRequests = ({
  serviceDetailsDialog,
  deliverBarByServiceStaff,
  handleCloseServiceDetailsDialog,
  setSnack,
}) => {
  const handleDeliverOrderByServiceStaff = React.useCallback(() => {
    deliverBarByServiceStaff({
      orderId: serviceDetailsDialog?.orderId,
    })
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        handleCloseServiceDetailsDialog();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [deliverBarByServiceStaff, serviceDetailsDialog]);

  console.log("serviceDetailsDialog", serviceDetailsDialog);
  return (
    <>
      <BootstrapDialog
        open={Boolean(serviceDetailsDialog)}
        onClose={handleCloseServiceDetailsDialog}
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
              Service Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
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
                  {serviceDetailsDialog?.trailData?.map((item, index) => {
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
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Grid container rowSpacing={2}>
              <Grid size={6}>
                <Box sx={{ py: 2 }}>
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
                    onClick={handleDeliverOrderByServiceStaff}
                  >
                    Deliver Order
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

const OrderCardForBarServiceStaff = ({
  orderListForServiceStaff,
  setServiceDetailsDialog,
}) => {
  console.log("orderListForServiceStaff", orderListForServiceStaff);
  return (
    <>
      <Grid container spacing={2}>
        {orderListForServiceStaff?.data?.map((item, index) => {
          return (
            <Grid size={{ xs: 2 }}>
              <Box
                sx={{
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)",
                  minHeight: "9rem",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  borderRadius: "8px",
                  backgroundColor: "#00CED1",
                  fontSize: "18px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                }}
                onClick={() => {
                  setServiceDetailsDialog(item);
                }}
              >
                <span>Room No. </span>
                <span> {item?.bookingDetails?.roomDto?.roomNo}</span>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
export default BarServiceStaff;
