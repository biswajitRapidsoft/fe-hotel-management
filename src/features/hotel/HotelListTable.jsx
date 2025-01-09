import React from "react";
import ReactDOM from "react-dom";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  // Collapse,
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
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid2 as Grid,
  Chip,
} from "@mui/material";
import { BootstrapDialog } from "../header/Header";

// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
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
  // { label: "State" },
  // { label: "City" },
  // { label: "Address" },
  // { label: "GST IN" },
  // {
  //   label: "Email",
  // },
  // { label: "Phone No." },
  { label: "Halls" },
  { label: "Banquets" },
  { label: "Spa Types" },
  { label: "Parkings" },
  { label: "PromoCode" },
  { label: "Restaurant Items" },
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
  // const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [viewHotelDetailsDialog, setHotelDetailsDialog] = React.useState(null);
  const handleCloseViewHotelDetailsDialog = React.useCallback(() => {
    setHotelDetailsDialog(null);
  }, []);
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
        {/* <TableCell>{hotel.state.name}</TableCell> */}
        {/* <TableCell>{hotel.city.name}</TableCell> */}
        {/* <TableCell sx={{ minWidth: 200 }}>{hotel.address}</TableCell> */}
        {/* <TableCell>{hotel.gstIn}</TableCell> */}
        {/* <TableCell>{hotel.email}</TableCell> */}
        {/* <TableCell>{hotel.contactNos?.join(", ")}</TableCell> */}
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForHall", hotel?.id);
            navigate("/HallList");
          }}
        >
          <Chip
            label={hotel?.noOfHalls}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForBanquet", hotel?.id);
            navigate("/BanquetList");
          }}
        >
          <Chip
            label={hotel?.noOfBanquets}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForSpaType", hotel?.id);
            navigate("/spa-type");
          }}
        >
          <Chip
            label={hotel?.noOfSpaType || 0}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForParkingList", hotel?.id);
            navigate("/parking-list");
          }}
        >
          {/* <Typography sx={{ cursor: "pointer" }}> */}
          <Chip
            label={hotel?.noOfParkingAreaCounts || 0}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
          {/* </Typography> */}
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForPromoCode", hotel?.id);
            navigate("/PromocodeList");
          }}
        >
          <Chip
            label={hotel?.noOfCoupons}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell
          onClick={() => {
            sessionStorage.setItem("hotelIdForFoodItem", hotel?.id);

            navigate("/FoodItemList");
          }}
        >
          <Chip
            label={hotel?.noOfMasterDinningTypes}
            clickable
            color="secondary"
            sx={{
              color: "#fff",
            }}
          />
        </TableCell>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton onClick={() => setHotelToUpdate(hotel)}>
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{ display: "block" }}
              size="small"
              // onClick={() => setOpen(!open)}
              onClick={() => setHotelDetailsDialog(hotel)}
            >
              <InfoIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          {/* <Collapse in={open} timeout="auto" unmountOnExit>
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
          </Collapse> */}
        </TableCell>
      </TableRow>
      <HotelDetailsDialog
        open={Boolean(viewHotelDetailsDialog)}
        viewHotelDetailsDialog={viewHotelDetailsDialog}
        handleClose={handleCloseViewHotelDetailsDialog}
        handleChangeStatus={handleChangeStatus}
        hotel={hotel}
      />
    </React.Fragment>
  );
}

const HotelDetailsDialog = ({
  open,
  viewHotelDetailsDialog,
  handleClose,
  handleChangeStatus,
  hotel,
}) => {
  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="lg"
        fullWidth
        sx={{
          ".MuiDialogTitle-root": {
            px: 5,
            py: 3,
          },
        }}
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.9rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {viewHotelDetailsDialog?.name}
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 30,
            top: 16,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>
        <DialogContent dividers>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Grid container>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      State:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.state?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      City:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.city?.name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      GST IN:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.gstIn}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      Address:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.address}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, lg: 4 }}>
                  <Box sx={{ display: "flex" }}>
                    <Typography
                      sx={{ fontWeight: "bold", width: 80 }}
                      gutterBottom
                    >
                      Email:
                    </Typography>
                    <Typography gutterBottom>
                      {viewHotelDetailsDialog?.email}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ height: "400px", overflowY: "auto" }}>
              <Table stickyHeader>
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
                  {hotel?.floorRoomMapData?.map((floor) => {
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
          </Box>
        </DialogContent>
        <DialogActions />
      </BootstrapDialog>
    </React.Fragment>,
    document.getElementById("portal")
  );
};

export default React.memo(HotelListTable);
