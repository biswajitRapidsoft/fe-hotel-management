import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid2";
import HouseIcon from "@mui/icons-material/House";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import styled from "@emotion/styled";

import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";

import {
  useGetServiceableRoomDataQuery,
  useApproveHouseKeepingServiceMutation,
} from "../../services/dashboard";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    // backgroundColor: "#164e80",
    backgroundColor: "#C7E3FF",
    padding: "15px !important",
    color: "#000",
    fontSize: "16px",
    fontWeight: 550,
    width: "fit-content",
    whiteSpace: "nowrap",
    borderTop: "1px solid #ddd8d8 !important",
    textAlign: "center",
  },
  "&.MuiTableCell-body": {
    fontSize: 14,
    fontWeight: 400,
    padding: "5px !important",
    color: "#555",
    width: "fit-content",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
  p: {
    padding: "0px 10px",
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#fff",
  },
}));

const HouseKeeperDashboard = () => {
  const [roomServiceDialogOpen, setRoomServiceDialogOpen] =
    React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState("");

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    data: serviceableRoomData = {
      data: [],
    },
    isLoading,
  } = useGetServiceableRoomDataQuery(
    JSON.parse(sessionStorage.getItem("data")).hotelId
  );

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setRoomServiceDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRoomServiceDialogOpen(false);
    setSelectedRoom(null);
  };
  const houseKeepingFilterButtons = [
    { id: 1, icon: <HouseIcon />, name: "All Rooms", color: "" },
    { id: 1, icon: <CleaningServicesIcon />, name: "Service", color: "" },
    { id: 1, icon: <WavingHandIcon />, name: "Checkout", color: "" },
  ];

  return (
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
        }}
      >
        <HouseKeepingFilters
          houseKeepingFilterButtons={houseKeepingFilterButtons}
        />
      </Box>
      <Box>
        <Grid container size={12} spacing={2}>
          {serviceableRoomData?.data?.map((item, index) => {
            return (
              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 2, xl: 2 }}
                key={`room ${index}`}
              >
                <Box
                  sx={{
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    backgroundColor: "#fff",
                    minHeight: "10rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  onClick={() => handleRoomClick(item)}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        backgroundColor: "green",
                        height: "1.5rem",
                      }}
                    ></Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{item?.roomNo}</Typography>
                      <Typography>{item?.roomType?.type}</Typography>
                      <Typography sx={{ color: "gray" }}>
                        {item?.serviceTypeStatus}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      <HouseKeepingDialog
        open={roomServiceDialogOpen}
        onClose={handleDialogClose}
        selectedRoom={selectedRoom}
        snack={snack}
        setSnack={setSnack}
      />
      <LoadingComponent open={isLoading} />
    </Box>
  );
};
const HouseKeepingFilters = ({ houseKeepingFilterButtons }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {houseKeepingFilterButtons.map((filter, index) => (
        <React.Fragment key={filter.id}>
          {index !== 0 && (
            <Box
              sx={{
                width: "1px",
                height: "40px",
                backgroundColor: "#ddd",
                margin: "0 16px",
              }}
            />
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: 1,
              "&:hover": {
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              },
            }}
          >
            {filter.icon}
            <Typography variant="caption" sx={{ fontWeight: "bold", mt: 1 }}>
              {filter.name}
            </Typography>
          </Box>
        </React.Fragment>
      ))}
    </Box>
  );
};

const HouseKeepingDialog = ({
  open,
  onClose,
  selectedRoom,
  snack,
  setSnack,
}) => {
  const [checkboxStates, setCheckboxStates] = React.useState({});
  const [itemCounts, setItemCounts] = React.useState({});
  const [remarks, setRemarks] = React.useState("");
  const [approveService, approveServiceRes] =
    useApproveHouseKeepingServiceMutation();

  const handleCheckboxChange = (rowId, isUnavailableChecked) => {
    setCheckboxStates((prev) => ({
      ...prev,
      [rowId]: isUnavailableChecked,
    }));
  };
  const handleItemCountChange = (rowId, value) => {
    setItemCounts((prev) => ({
      ...prev,
      [rowId]: value,
    }));
  };
  const handleSubmit = () => {
    const extraItemsList =
      selectedRoom?.serviceTypeStatus === "Room_Cleaning"
        ? []
        : selectedRoom.extraItemsList.map((item) => ({
            id: item.id,
            noOfItemsRequired: item.noOfItemsRequired || 1,
            noOfItems: Number(itemCounts[item.id]) || 0,
            isAvailable: !checkboxStates[item.id],
          }));

    const payload = {
      isForCheckoutRequest: selectedRoom?.serviceTypeStatus !== "Room_Cleaning",
      roomDto: {
        id: selectedRoom.id,
      },
      extraItemsList,
      remarks,
    };
    approveService(payload)
      .unwrap()
      .then((res) => {
        onClose();
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  };

  return (
    <>
      <Dialog
        TransitionComponent={Transition}
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography
            sx={{ fontWeight: "bold", fontSize: "1.4rem", color: "" }}
          >
            House Keeping Details{" "}
            <Typography sx={{ color: "gray" }}>
              (Room No:{selectedRoom?.roomNo})
            </Typography>
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRoom?.serviceTypeStatus === "Room_Cleaning" ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "200px",
              }}
            >
              <Typography
                sx={{ color: "gray", fontSize: "1.4rem", fontWeight: "bold" }}
              >
                Room cleaning is completed , please press on proceed button for
                checkout
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>Sl. No.</StyledTableCell>
                    <StyledTableCell>Item</StyledTableCell>
                    <StyledTableCell>Available</StyledTableCell>
                    <StyledTableCell>Unavailable</StyledTableCell>
                    <StyledTableCell>Required no. of items</StyledTableCell>
                    <StyledTableCell>Available no. of items</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {selectedRoom?.extraItemsList?.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.itemName}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={!checkboxStates[row.id]}
                          onChange={() => handleCheckboxChange(row.id, false)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={checkboxStates[row.id] || false}
                          onChange={() => handleCheckboxChange(row.id, true)}
                        />
                      </TableCell>
                      <TableCell>{row.noOfItems}</TableCell>
                      <TableCell>
                        <TextField
                          id="available-items"
                          variant="standard"
                          size="small"
                          disabled={!checkboxStates[row.id]}
                          value={itemCounts[row.id] || ""}
                          onChange={(e) =>
                            handleItemCountChange(row.id, e.target.value)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box
            sx={{
              width: "100%",
              mt: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              id="standard-basic"
              label="Remarks"
              variant="outlined"
              size="small"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>
              {selectedRoom?.serviceTypeStatus === "Room_Cleaning"
                ? "Proceed"
                : "Submit"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <LoadingComponent open={approveServiceRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default HouseKeeperDashboard;
