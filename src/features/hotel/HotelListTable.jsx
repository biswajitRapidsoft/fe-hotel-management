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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditIcon from "@mui/icons-material/Edit";
import LoadingComponent from "../../components/LoadingComponent";

import {
  useChangeRoomStatusMutation,
  useGetHotelListByCompanyQuery,
} from "../../services/hotel";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../helper/constants";
import SnackAlert from "../../components/Alert";

const tableHeader = [
  { label: "Sl No." },
  { label: "Hotel Name" },
  { label: "State" },
  { label: "City" },
  { label: "Address" },
  { label: "GST IN" },
  {
    label: "Email",
  },
  { label: "Phone No." },
  { label: "Halls" },
  { label: "Banquets" },
  { label: "Spa Types" },
  { label: "PromoCode" },
  { label: "Action" },
];

const HotelListTable = ({ setHotelToUpdate }) => {
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const {
    data: hotelList = {
      data: [],
    },
    isLoading,
  } = useGetHotelListByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
  );
  const [changeRoomStatus, changeRoomStatusRes] = useChangeRoomStatusMutation();
  const handleChangeStatus = React.useCallback(
    (room) => {
      changeRoomStatus({ id: room.id })
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
            severity: "error",
          });
        });
    },
    [changeRoomStatus]
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
            Hotel List
          </Typography>
        </Toolbar>
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
                {tableHeader.map((header) => {
                  return (
                    <TableCell key={header.label}>{header.label}</TableCell>
                  );
                })}
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {hotelList.data.map((hotel, index) => {
                return (
                  <Row
                    hotel={hotel}
                    key={hotel.id}
                    sequence={index + 1}
                    setHotelToUpdate={setHotelToUpdate}
                    handleChangeStatus={handleChangeStatus}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <LoadingComponent open={isLoading || changeRoomStatusRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

function Row({ hotel, sequence, setHotelToUpdate, handleChangeStatus }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  //   let roomSlNo = 0;
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
        <TableCell>{sequence}</TableCell>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: 230,
            }}
          >
            <Box
              component="img"
              src={hotel.logoUrl}
              sx={{ width: 50, height: 50 }}
            />
            {hotel.name}
          </Box>
        </TableCell>
        <TableCell>{hotel.state.name}</TableCell>
        <TableCell>{hotel.city.name}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{hotel.address}</TableCell>
        <TableCell>{hotel.gstIn}</TableCell>
        <TableCell>{hotel.email}</TableCell>
        <TableCell>{hotel.contactNos?.join(", ")}</TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForHall", hotel?.id);
            navigate("/HallList");
          }}
        >
          <Typography sx={{ cursor: "pointer" }}>{hotel?.noOfHalls}</Typography>
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForBanquet", hotel?.id);
            navigate("/BanquetList");
          }}
        >
          <Typography sx={{ cursor: "pointer" }}>
            {hotel?.noOfBanquets}
          </Typography>
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForSpaType", hotel?.id);
            navigate("/spa-type");
          }}
        >
          <Typography sx={{ cursor: "pointer" }}>
            {hotel?.noOfSpaType || 0}
          </Typography>
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForPromoCode", hotel?.id);
            navigate("/PromocodeList");
          }}
        >
          <Typography sx={{ cursor: "pointer" }}>
            {hotel?.noOfCoupons}
          </Typography>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => setHotelToUpdate(hotel)}>
            <EditIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            sx={{ ml: "auto", display: "block" }}
            size="small"
            onClick={() => setOpen(!open)}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
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
                    <TableCell>Floor</TableCell>
                    <TableCell>Room number</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotel.floorRoomMapData?.map((floor) => {
                    return floor.roomDto?.map((room, roomIndex) => {
                      //   roomSlNo += 1;
                      return (
                        <TableRow key={room.id}>
                          {roomIndex === 0 && (
                            <TableCell rowSpan={floor.roomDto.length}>
                              {floor.floorNo}
                            </TableCell>
                          )}
                          {roomIndex === 0 && (
                            <TableCell
                              rowSpan={floor.roomDto.length}
                            >{`Floor ${floor.floorNo}`}</TableCell>
                          )}
                          <TableCell>{room.roomNo}</TableCell>
                          <TableCell>{room.roomType.type}</TableCell>
                          <TableCell>
                            <Switch
                              checked={room.isActive}
                              color="success"
                              onChange={() => handleChangeStatus(room)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default React.memo(HotelListTable);
