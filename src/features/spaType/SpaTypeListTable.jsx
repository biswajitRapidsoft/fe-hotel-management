import React from "react";
import { useGetAllSpaTypeQuery } from "../../services/spa";
import {
  Box,
  Button,
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
  IconButton,
  Collapse,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { ViewImageDialog } from "../roomType/RoomTypeTable";
import SnackAlert from "../../components/Alert";
import { useNavigate } from "react-router-dom";

const SpaTypeListTable = ({ saveSpaType, setSpaToUpdate }) => {
  const navigate = useNavigate();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const [viewImageDialog, setViewImageDialog] = React.useState(null);
  const {
    data: spaTypeList = {
      data: [],
    },
  } = useGetAllSpaTypeQuery({
    hotelId: JSON.parse(sessionStorage.getItem("hotelIdForSpaType")),
    isActive: null,
  });

  const handleViewImageDialog = React.useCallback((title, imageList) => {
    setViewImageDialog({ title: title, imageList });
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setViewImageDialog(null);
  }, []);

  const handleChangeStatus = React.useCallback(
    (e, spaType) => {
      saveSpaType({
        ...spaType,
        hotelId: JSON.parse(sessionStorage.getItem("hotelIdForSpaType")),
        isActive: e.target.checked,
      })
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
    [saveSpaType]
  );

  return (
    <React.Fragment>
      <Paper>
        <Toolbar
          sx={[
            {
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              justifyContent: { xs: "space-between" },
            },
          ]}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between  ",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Spa Type List
            </Typography>
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
              onClick={() => navigate("/spa-room-allocation")}
            >
              Room Allocation
            </Button>
          </Box>
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
                <TableCell>Sl No.</TableCell>
                <TableCell>Spa Name</TableCell>
                <TableCell>Base Amount</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Is Advance Required</TableCell>
                <TableCell>Advance Percentage</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {spaTypeList.data.map((spaType, index) => {
                return (
                  <Row
                    key={spaType.id}
                    spaType={spaType}
                    index={index}
                    handleViewImageDialog={handleViewImageDialog}
                    handleChangeStatus={handleChangeStatus}
                    setSpaToUpdate={setSpaToUpdate}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <ViewImageDialog
        open={Boolean(viewImageDialog)}
        handleClose={handleCloseDialog}
        viewImageDialog={viewImageDialog}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const Row = React.memo(function ({
  spaType,
  index,
  handleViewImageDialog,
  handleChangeStatus,
  setSpaToUpdate,
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <TableRow key={spaType.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{spaType.name}</TableCell>
        <TableCell>{spaType.price}</TableCell>
        <TableCell>{spaType.hotelDto.name}</TableCell>
        <TableCell>{spaType.isAdvanceNeeded ? "Yes" : "No"}</TableCell>
        <TableCell>{spaType?.advancePaymentPercentage}</TableCell>
        <TableCell
        //  sx={{ display: "flex", alignItems: "center" }}
        >
          {Boolean(spaType?.images?.length) && (
            <Box
              key={spaType.images[0]}
              component="img"
              src={spaType.images[0]}
              alt={`image-1`}
              sx={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
              }}
              onClick={() =>
                handleViewImageDialog(spaType.name, spaType.images)
              }
            />
          )}
          {spaType?.images?.length > 1 && (
            <Button
              size="small"
              sx={{ textTransform: "none" }}
              onClick={() =>
                handleViewImageDialog(spaType.name, spaType.images)
              }
            >{`+${spaType.images.length - 1} More`}</Button>
          )}
        </TableCell>
        <TableCell>
          <Switch
            color="success"
            checked={spaType.isActive}
            onChange={(e) => handleChangeStatus(e, spaType)}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => setSpaToUpdate(spaType)}>
            <EditIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow
        sx={{
          "& > *": {
            borderBottom: "unset",
          },
        }}
      >
        <TableCell sx={{ p: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, backgroundColor: "#f4f4f4" }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", px: 2, py: 1 }}
                >
                  Therapist
                </Typography>
                <Table size="small">
                  <TableHead
                    sx={{
                      ".MuiTableCell-root": {
                        letterSpacing: 1,
                        fontWeight: 600,
                        fontSize: 16,
                      },
                    }}
                  >
                    <TableCell>SL no.</TableCell>
                    <TableCell>Therapist</TableCell>
                  </TableHead>
                  <TableBody>
                    {spaType?.therapistUserList?.map((therapist, index) => {
                      return (
                        <TableRow
                          sx={{
                            ".MuiTableCell-root": {
                              letterSpacing: 1,
                              fontSize: 16,
                            },
                            "& > *": { borderBottom: "unset" },
                          }}
                          key={therapist.id}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{therapist.name}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", px: 2, py: 1 }}
                >
                  Spa Breakdown
                </Typography>
                <Table size="small">
                  <TableHead
                    sx={{
                      ".MuiTableCell-root": {
                        letterSpacing: 1,
                        fontWeight: 600,
                        fontSize: 16,
                      },
                    }}
                  >
                    <TableCell>SL no.</TableCell>
                    <TableCell>Service Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableHead>
                  <TableBody>
                    {spaType?.spaTypeDetailsList?.map((spaDetail, index) => {
                      return (
                        <TableRow
                          sx={{
                            ".MuiTableCell-root": {
                              letterSpacing: 1,
                              fontSize: 16,
                            },
                            "& > *": { borderBottom: "unset" },
                          }}
                          key={spaDetail.id}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{spaDetail.serviceName}</TableCell>
                          <TableCell>{spaDetail.serviceDescription}</TableCell>
                          <TableCell>{spaDetail.durationMinutes}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

export default SpaTypeListTable;
