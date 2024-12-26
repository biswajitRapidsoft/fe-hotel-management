import React from "react";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { useParkingSlotStatusChangeMutation } from "../../services/parking";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const Row = ({ slNo, data, setParkingToUpdate, handleChangeSlotStatus }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          ".MuiTableCell-root": {
            fontSize: "1rem",
            letterSpacing: 1,
          },
        }}
      >
        <TableCell>{slNo}</TableCell>
        <TableCell>{data.areaName}</TableCell>
        <TableCell>{data.location}</TableCell>
        <TableCell>
          <IconButton onClick={() => setParkingToUpdate(data)}>
            <EditIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      ".MuiTableCell-root": {
                        fontWeight: "bold",
                        letterSpacing: 1,
                        backgroundColor: "#e3f2fd",
                      },
                    }}
                  >
                    <TableCell>Sl No.</TableCell>
                    <TableCell>Slot Number</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.parkingSlotData.map((slotData, index) => {
                    return (
                      <TableRow key={slotData.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{slotData.slotNumber}</TableCell>
                        <TableCell>{slotData.vehicleType}</TableCell>
                        <TableCell>
                          <Switch
                            checked={slotData.isActive}
                            color="success"
                            onChange={(e) =>
                              handleChangeSlotStatus(slotData.id)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const ParkingListTable = ({ parkingData, setParkingToUpdate }) => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [changeSlotStatus, changeSlotStatusRes] =
    useParkingSlotStatusChangeMutation();
  const handleChangeSlotStatus = React.useCallback(
    (id) => {
      changeSlotStatus({ id: id })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "success",
          });
        });
    },
    [changeSlotStatus]
  );
  return (
    <React.Fragment>
      <Paper>
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
            Parking List
          </Typography>
        </Toolbar>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table>
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
                <TableCell>Parking Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Action</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {parkingData.map((data, index) => {
                return (
                  <Row
                    key={data.id}
                    slNo={index + 1}
                    data={data}
                    setParkingToUpdate={setParkingToUpdate}
                    handleChangeSlotStatus={handleChangeSlotStatus}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <SnackAlert snack={snack} setSnack={setSnack} />
      <LoadingComponent open={changeSlotStatusRes.isLoading} />
    </React.Fragment>
  );
};

export default ParkingListTable;
