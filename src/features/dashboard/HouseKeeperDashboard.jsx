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
import { HOUSEKEEPER } from "../../helper/constants";
import SnackAlert from "../../components/Alert";
import LoadingComponent from "../../components/LoadingComponent";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import {
  useGetServiceableRoomDataQuery,
  useApproveHouseKeepingServiceMutation,
} from "../../services/dashboard";
// import { useNavigate } from "react-router-dom";

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
  const [currentFilter, setCurrentFilter] = React.useState("All Rooms");
  const [roomServiceDialogOpen, setRoomServiceDialogOpen] =
    React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState("");

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  // const navigate = useNavigate();
  const {
    data: serviceableRoomData = {
      data: [],
    },
    isLoading,
    isFetching: isServiceFetching,
  } = useGetServiceableRoomDataQuery(
    currentFilter === "Service"
      ? {
          hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
          userId: JSON.parse(sessionStorage.getItem("data")).id,
          serviceType: "Room_Cleaning",
        }
      : currentFilter === "Checkout"
      ? {
          hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
          userId: JSON.parse(sessionStorage.getItem("data")).id,
          serviceType: "Checkout_Request",
        }
      : currentFilter === "Laundry"
      ? {
          hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
          userId: JSON.parse(sessionStorage.getItem("data")).id,
          serviceType: "Laundry_Service",
        }
      : {
          hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
          userId: JSON.parse(sessionStorage.getItem("data")).id,
          serviceType: "",
        },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !JSON.parse(sessionStorage.getItem("data")).roleType === HOUSEKEEPER,
    }
    // JSON.parse(sessionStorage.getItem("data")).hotelId
  );

  // JSON.parse(sessionStorage.getItem("data")).hotelId
  const handleFilterClick = (filterName) => {
    setCurrentFilter(filterName);
  };
  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setRoomServiceDialogOpen(true);
  };

  const handleDialogClose = () => {
    setRoomServiceDialogOpen(false);
    setSelectedRoom(null);
  };
  const houseKeepingFilterButtons = [
    { id: 1, icon: <HouseIcon />, name: "All Rooms", color: "gray" },
    {
      id: 2,
      icon: <CleaningServicesIcon sx={{ color: "#5cba5c" }} />,
      name: "Service",
      color: "#280071",
    },
    {
      id: 3,
      icon: <WavingHandIcon sx={{ color: "#de5c69" }} />,
      name: "Checkout",
      color: "00A9E0",
    },
    {
      id: 3,
      icon: <DryCleaningIcon sx={{ color: "#548abe" }} />,
      name: "Laundry",
      // color: "gray",
    },
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
          display: "flex",
        }}
      >
        <Box
          sx={{
            // backgroundColor: "yellow",
            width: "20%",
            display: "flex",
            // justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Button
            variant="contained"
            onClick={() => navigate("/LaundryHistory")}
          >
            Laundry History
          </Button> */}
        </Box>
        <HouseKeepingFilters
          houseKeepingFilterButtons={houseKeepingFilterButtons}
          onFilterClick={handleFilterClick}
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
                    boxShadow:
                      "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19)",
                    minHeight: "9rem",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                    borderRadius: "8px",
                    // "&:hover": {
                    //   backgroundColor: "#f5f5f5",
                    // },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    // backgroundColor: "green",
                    backgroundColor:
                      item?.serviceTypeStatus === "Checkout_Request"
                        ? "#de5c69"
                        : item?.serviceTypeStatus === "Room_Cleaning"
                        ? "#5cba5c"
                        : item?.serviceTypeStatus ===
                          "Room_Cleaning_After_Checkout"
                        ? "#C445FF"
                        : "#548abe",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => handleRoomClick(item)}
                >
                  {/* <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  > */}
                  {/* <Box
                      sx={{
                        width: "100%",
                        backgroundColor:
                          item?.serviceTypeStatus === "Checkout_Request"
                            ? "#00A9E0"
                            : item?.serviceTypeStatus === "Room_Cleaning"
                            ? "#280071"
                            : item?.serviceTypeStatus ===
                              "Room_Cleaning_After_Checkout"
                            ? "#C445FF"
                            : "gray",
                        height: "1.5rem",
                      }}
                    ></Box> */}
                  {/* <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "red",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  > */}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                    }}
                  >
                    {item?.roomNo}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontFamily: "'Times New Roman', Times, serif",
                      fontWeight: "bold",
                      letterSpacing: 1.2,
                      fontSize: "1.1rem",
                    }}
                  >
                    {item?.roomType?.type}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontFamily: "'Times New Roman', Times, serif",
                    }}
                  >
                    {item?.serviceTypeStatus?.replace(/_/g, " ")}
                  </Typography>
                  {/* </Box> */}
                  {/* </Box> */}
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
      <LoadingComponent open={isLoading || isServiceFetching} />
    </Box>
  );
};
const HouseKeepingFilters = ({ houseKeepingFilterButtons, onFilterClick }) => {
  return (
    <Box
      sx={{
        width: "80%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {houseKeepingFilterButtons?.map((filter, index) => (
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
                backgroundColor: "#BEBEBE ",
                borderRadius: "8px",
                transition: "background-color 0.3s ease",
              },
            }}
            onClick={() => onFilterClick(filter.name)}
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
  console.log("selectedRoom", selectedRoom);
  const [checkboxStates, setCheckboxStates] = React.useState({});
  const [itemCounts, setItemCounts] = React.useState({});

  //  states for laundry service
  const [laundryCheckboxStates, setLaundryCheckboxStates] = React.useState({});
  const [laundryItemCounts, setLaundryItemCounts] = React.useState({});

  const [remarks, setRemarks] = React.useState("");
  const [approveService, approveServiceRes] =
    useApproveHouseKeepingServiceMutation();

  // const handleCheckboxChange = (rowId, isUnavailableChecked) => {
  //   setCheckboxStates((prev) => ({
  //     ...prev,
  //     [rowId]: isUnavailableChecked,
  //   }));
  // };

  const handleCheckboxChange = (rowId, isUnavailableChecked) => {
    setItemCounts((prevCounts) => ({
      ...prevCounts,
      [rowId]: "",
    }));

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

  // laundry service handlers
  const handleLaundryCheckboxChange = (itemId) => {
    setLaundryCheckboxStates((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLaundryItemCountChange = (itemId, value) => {
    setLaundryItemCounts((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleDialogClose = () => {
    setCheckboxStates({});
    setItemCounts({});
    setLaundryCheckboxStates({});
    setLaundryItemCounts({});
    setRemarks("");
    onClose();
  };
  const handleSubmit = () => {
    // const extraItemsList =
    //   selectedRoom?.serviceTypeStatus === "Room_Cleaning"
    //     ? []
    //     : selectedRoom.extraItemsList?.map((item) => ({
    //         id: item.id,
    //         noOfItemsRequired: item.noOfItemsRequired || 1,
    //         noOfItems: Number(itemCounts[item.id]) || 0,
    //         isAvailable: !checkboxStates[item.id],
    //       }));

    // const payload = {
    //   isForCheckoutRequest: selectedRoom?.serviceTypeStatus !== "Room_Cleaning",
    //   roomDto: {
    //     id: selectedRoom.id,
    //   },
    //   extraItemsList,
    //   remarks,
    // };

    // const payloadForLaundryService = {
    //   isForLaundryService: true,
    //   roomDto: {
    //     id: selectedRoom.id,
    //   },
    //   laundryDto: {
    //     totalPrice: 100,
    //     itemsList: [
    //       {
    //         laundryItems: {
    //           id: 1,
    //         },
    //         noOfQty: 1,
    //         price: 100,
    //       },
    //     ],
    //   },
    //   remarks,
    // };

    let payload;

    if (selectedRoom?.serviceTypeStatus === "Room_Cleaning") {
      payload = {
        isForCheckoutRequest: false,
        roomDto: {
          id: selectedRoom.id,
        },
        remarks,
        serviceTypeStatus: selectedRoom?.serviceTypeStatus,
      };
    } else if (selectedRoom?.serviceTypeStatus === "Laundry_Service") {
      // Calculate total price and prepare laundry items list
      const laundryItems = selectedRoom.laundryItemsList
        .filter((item) => laundryCheckboxStates[item.id])
        .map((item) => ({
          laundryItems: {
            id: item.id,
          },
          noOfQty: Number(laundryItemCounts[item.id] || 0),
          price: item.price * Number(laundryItemCounts[item.id] || 0),
        }));

      if (laundryItems.length === 0) {
        setSnack({
          open: true,
          message:
            "No laundry items selected. Please select at least one item.",
          severity: "error",
        });
        return;
      }
      const invalidItems = laundryItems.filter((item) => item.noOfQty <= 0);
      if (invalidItems.length > 0) {
        setSnack({
          open: true,
          message: "Please provide a valid quantity for all selected items.",
          severity: "error",
        });
        return;
      }
      const totalPrice = laundryItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      payload = {
        isForLaundryService: true,
        roomDto: {
          id: selectedRoom.id,
        },
        laundryDto: {
          totalPrice,
          itemsList: laundryItems,
        },
        remarks,
        serviceTypeStatus: selectedRoom?.serviceTypeStatus,
      };
    } else if (
      selectedRoom?.serviceTypeStatus === "Room_Cleaning_After_Checkout"
    ) {
      payload = {
        isForCheckoutRequest: false,
        roomDto: {
          id: selectedRoom.id,
        },
        remarks,
        serviceTypeStatus: selectedRoom?.serviceTypeStatus,
      };
    } else {
      // Checkout request logic
      const extraItemsList = selectedRoom.extraItemsList?.map((item) => ({
        id: item.id,
        noOfItemsRequired: item.noOfItems || 1,
        noOfItems: Number(itemCounts[item.id]) || 0,
        isAvailable: !checkboxStates[item.id],
      }));

      payload = {
        isForCheckoutRequest: true,
        roomDto: {
          id: selectedRoom.id,
        },
        extraItemsList,
        remarks,
        serviceTypeStatus: selectedRoom?.serviceTypeStatus,
      };
    }
    approveService(payload)
      .unwrap()
      .then((res) => {
        // onClose();
        handleDialogClose();
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
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography
            sx={{ fontWeight: "bold", fontSize: "1.4rem", color: "" }}
          >
            {selectedRoom?.serviceTypeStatus?.split("_").join(" ")}
          </Typography>
          <Typography sx={{ color: "gray" }}>
            (Room No:{selectedRoom?.roomNo})
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
                Room cleaning is completed, please press on proceed button
              </Typography>
            </Box>
          ) : selectedRoom?.serviceTypeStatus ===
            "Room_Cleaning_After_Checkout" ? (
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
                Room cleaning is completed, please press on proceed button for
                checkout
              </Typography>
            </Box>
          ) : selectedRoom?.serviceTypeStatus === "Laundry_Service" ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell>Select</StyledTableCell>
                    <StyledTableCell>Sl. No.</StyledTableCell>
                    <StyledTableCell>Cloth type</StyledTableCell>
                    <StyledTableCell>Per Unit Price</StyledTableCell>
                    <StyledTableCell>Quantity</StyledTableCell>
                    <StyledTableCell>Total Price</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {selectedRoom?.laundryItemsList ? (
                    selectedRoom?.laundryItemsList.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={laundryCheckboxStates[item.id] || false}
                            onChange={() =>
                              handleLaundryCheckboxChange(item.id)
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {item.name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          ₹ {item.price}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <TextField
                            id={`laundry-item-${item.id}`}
                            variant="standard"
                            size="small"
                            type="number"
                            disabled={!laundryCheckboxStates[item.id]}
                            value={laundryItemCounts[item.id] || ""}
                            onChange={(e) =>
                              handleLaundryItemCountChange(
                                item.id,
                                e.target.value
                              )
                            }
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {laundryCheckboxStates[item.id] &&
                          laundryItemCounts[item.id]
                            ? `₹ ${
                                item.price * Number(laundryItemCounts[item.id])
                              }`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No laundry items available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
                  {selectedRoom?.extraItemsList ? (
                    selectedRoom?.extraItemsList.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell align="center">{index + 1}</TableCell>
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
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
