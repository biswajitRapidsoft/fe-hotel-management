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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { ViewImageDialog } from "../roomType/RoomTypeTable";
import SnackAlert from "../../components/Alert";

const SpaTypeListTable = ({ saveSpaType, setSpaToUpdate }) => {
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
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Spa Type List
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
                <TableCell>Sl No.</TableCell>
                <TableCell>Spa Name</TableCell>
                <TableCell>Base Amount</TableCell>
                <TableCell>Hotel</TableCell>
                <TableCell>Is Advance Required</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spaTypeList.data.map((spaType, index) => {
                return (
                  <TableRow key={spaType.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{spaType.name}</TableCell>
                    <TableCell>{spaType.price}</TableCell>
                    <TableCell>{spaType.hotelDto.name}</TableCell>
                    <TableCell>
                      {spaType.isAdvanceNeeded ? "Yes" : "No"}
                    </TableCell>
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
                  </TableRow>
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

export default SpaTypeListTable;
