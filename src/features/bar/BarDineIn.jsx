import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Grid2 as Grid,
  Rating,
  Collapse,
  Divider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
} from "@mui/material";

import React, { useCallback, useEffect, useState } from "react";
import { BootstrapDialog } from "../header/Header";
import { jsPDF } from "jspdf";

import ReceiptIcon from "@mui/icons-material/Receipt";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ClearIcon from "@mui/icons-material/Clear";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import moment from "moment";
import {
  CANCELLED,
  DELIVERED,
  ORDER_PLACED,
  READY_TO_SERVE,
  REJECTED,
} from "../../helper/constants";
import { useNavigate } from "react-router-dom";
import { PaymentDialog } from "../dashboard/GuestDashboard";
import { useGetBookingDetailsFromRoomNumberMutation } from "../../services/restaurant";
import {
  useAssosciateBarOrderWithRoomMutation,
  useCompleteBarOrderMutation,
} from "../../services/bar";

const BarDineIn = () => {
  const navigate = useNavigate();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [updateStatusDialog, setUpdateStatusDialog] = React.useState();

  const [isSplit, setIsSplit] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = React.useState(false);
  const [makePartialPaymentPayload, setMakePartialPaymentPayload] =
    React.useState(null);
  const [orderMapDtos, setOrderMapDtos] = useState([]);
  const [customOrderMapDtos, setCustomOrderMapDtos] = useState([]);
  const [formDataForDialog, setFormDataForDialog] = React.useState({
    isAssosciateWithRoom: false,
    isProceedToPayment: false,
    roomNumber: "",
    paymentType: null,
  });
  const handleCloseOrderDetailsDialog = React.useCallback(() => {
    setFormDataForDialog({
      isAssosciateWithRoom: false,
      isProceedToPayment: false,
      roomNumber: "",
      paymentType: null,
    });

    setIsSplit(false);
    setOrderMapDtos([]);
    setCustomOrderMapDtos([]);

    setOrderDetailsDialog(null);
  }, []);

  const [orderDetailsDialog, setOrderDetailsDialog] = React.useState(null);

  const handleOpenPaymentDialog = React.useCallback(() => {
    const totalPrice = orderDetailsDialog?.bookingRequestDto?.totalPrice || 0;
    const gstPrice = orderDetailsDialog?.bookingRequestDto?.gstPrice || 0;

    const payload = {
      paidAmount: totalPrice + gstPrice,
      orderId: orderDetailsDialog?.bookingRequestDto?.orderId,
    };

    setMakePartialPaymentPayload(payload);
    setOpenPaymentDialog(true);
  }, [orderDetailsDialog]);

  const [bookingDetails, bookingDetailsRes] =
    useGetBookingDetailsFromRoomNumberMutation();

  const [assosciateWithRoom, assosciateWithRoomRes] =
    useAssosciateBarOrderWithRoomMutation();
  const [completeOrder, completeOrderRes] = useCompleteBarOrderMutation();

  return (
    <React.Fragment>
      <Paper>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
              Room Dine-In List
            </Typography>
          </Toolbar>

          <Box>
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
                sessionStorage.setItem("isStayingGuest", false);
                sessionStorage.setItem("OrderCreatedByCounterStaff", true);
                navigate("/resturant");
              }}
            >
              Place Order
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    fontWeight: "bold",
                    letterSpacing: 1,
                    backgroundColor: "#3F3C87",
                    color: "#fff",
                    fontSize: 18,
                  },
                }}
              >
                <TableCell>SL No.</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Phone no.</TableCell>
                <TableCell>Dine Type</TableCell>
                <TableCell>Room No.(Floor)</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {roomDineInTableList?.data?.map((item, index) => {
                return (
                  <Row
                    key={item.id}
                    item={item}
                    index={index}
                    setUpdateStatusDialog={setUpdateStatusDialog}
                    setMakePartialPaymentPayload={setMakePartialPaymentPayload}
                    setOpenPaymentDialog={setOpenPaymentDialog}
                    handlePayment={handlePayment}
                    setAssignStaffDialog={setAssignStaffDialog}
                    setOrderDetailsDialog={setOrderDetailsDialog}
                  />
                );
              })} */}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </React.Fragment>
  );
};

export default BarDineIn;
