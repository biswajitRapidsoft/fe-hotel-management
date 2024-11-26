import React from "react";
import ReactDOM from "react-dom";
import {
  Box,
  Button,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  IconButton,
  DialogContent,
  DialogActions,
  Grid2 as Grid,
} from "@mui/material";
import { useGetAllRoomTypesByCompanyQuery } from "../../services/roomType";
import LoadingComponent from "../../components/LoadingComponent";
import { BootstrapDialog } from "../header/Header";
import CloseIcon from "@mui/icons-material/Close";

const RoomTypeTable = () => {
  const {
    data: roomTypeList = {
      data: [],
    },
    isLoading,
  } = useGetAllRoomTypesByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId
  );

  const [viewImageDialog, setViewImageDialog] = React.useState(null);

  const handleViewImageDialog = React.useCallback((title, imageList) => {
    setViewImageDialog({ title: title, imageList });
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setViewImageDialog(null);
  }, []);

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
            Room Type List
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
                <TableCell>Room Type</TableCell>
                <TableCell>Extra items</TableCell>
                <TableCell>Images</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roomTypeList.data.map((roomType, index) => {
                return (
                  <TableRow
                    sx={{
                      "& > *": { borderBottom: "unset" },
                      ".MuiTableCell-root": {
                        fontSize: "1rem",
                        letterSpacing: 1,
                      },
                    }}
                    key={roomType.id}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{roomType.type}</TableCell>
                    <TableCell>
                      {roomType.extraItem
                        ?.map((item) => item.itemName)
                        .join(", ")}
                    </TableCell>
                    <TableCell sx={{ display: "flex", alignItems: "center" }}>
                      {Boolean(roomType.images.length) && (
                        <Box
                          key={roomType.images[0]}
                          component="img"
                          src={roomType.images[0]}
                          alt={`image-1`}
                          sx={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          onClick={() =>
                            handleViewImageDialog(
                              roomType.type,
                              roomType.images
                            )
                          }
                        />
                      )}
                      {roomType.images.length > 1 && (
                        <Button
                          size="small"
                          sx={{ textTransform: "none" }}
                          onClick={() =>
                            handleViewImageDialog(
                              roomType.type,
                              roomType.images
                            )
                          }
                        >{`+${roomType.images.length - 1} More`}</Button>
                      )}
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
      <LoadingComponent open={isLoading} />
    </React.Fragment>
  );
};

const ViewImageDialog = React.memo(function ({
  open,
  handleClose,
  viewImageDialog,
}) {
  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="sm"
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
          {open && viewImageDialog.title}
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
        <DialogContent>
          <Box sx={{ px: 3.5 }}>
            <Grid container spacing={2}>
              {open &&
                viewImageDialog.imageList.map((image) => {
                  return (
                    <Grid size={4} key={image}>
                      <Box component="img" src={image} sx={{ width: "100%" }} />
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions />
      </BootstrapDialog>
    </React.Fragment>,
    document.getElementById("portal")
  );
});

export default RoomTypeTable;
