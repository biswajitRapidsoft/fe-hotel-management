import React from "react";
import {
  Box,
  Button,
  IconButton,
  DialogTitle,
  DialogContent,
  Typography,
  Grid2 as Grid,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { BootstrapDialog } from "../header/Header";
import CloseIcon from "@mui/icons-material/Close";
import ChairIcon from "@mui/icons-material/Chair";
import { useGetAllTablesForWaiterQuery } from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import { useNavigate } from "react-router-dom";

const WaiterDashboard = () => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    data: tableListForWaiter = {
      data: [],
    },
  } = useGetAllTablesForWaiterQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data")).hotelId,
    userId: JSON.parse(sessionStorage.getItem("data")).id,
  });

  console.log("tableListForWaiter", tableListForWaiter);

  return (
    <>
      <Box>
        <TableCardsForWaiter tableListForWaiter={tableListForWaiter} />
      </Box>
    </>
  );
};

const TableCardsForWaiter = ({ tableListForWaiter }) => {
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
      2: 1.2,
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
                    // backgroundColor: "black",
                    backgroundColor: Boolean(item?.bookingRequestDto)
                      ? "#FFAC1C"
                      : "#17B169",
                    opacity: 0.7,
                    cursor: "pointer",
                  }}
                  // onClick={() => handleNavigateToFoodOrder(item)}
                  onClick={() => {
                    sessionStorage.setItem("tableId", item?.id);
                    sessionStorage.setItem("isStayingGuest", false);
                    sessionStorage.setItem(
                      "orderTakenBy",
                      JSON.parse(sessionStorage.getItem("data")).id
                    );
                    navigate("/resturant");
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
                    <Typography sx={{ color: "#fff" }}>
                      {item?.tableNo}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "#fff", fontSize: "12px" }}>
                    Capacity: {item?.noOfSeats}
                  </Typography>
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

export default WaiterDashboard;
