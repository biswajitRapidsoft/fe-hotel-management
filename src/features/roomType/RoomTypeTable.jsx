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
  Chip,
} from "@mui/material";
import { useGetAllRoomTypesByCompanyQuery } from "../../services/roomType";
import LoadingComponent from "../../components/LoadingComponent";
import { BootstrapDialog } from "../header/Header";
import CloseIcon from "@mui/icons-material/Close";
import { ADMIN } from "../../helper/constants";

const CustomChips = ({ itemList }) => {
  const [showMore, setShowMore] = React.useState(false);
  return (
    <React.Fragment>
      {itemList.map((item, index) => {
        if (index < 3) {
          return (
            <Chip
              key={item.itemName}
              color={item.isReusable ? "success" : "error"}
              label={item.itemName}
              sx={{ mx: 0.1, my: 0.1 }}
            />
          );
        } else {
          return null;
        }
      })}
      {showMore ? (
        <React.Fragment>
          {itemList.slice(3).map((item) => {
            return (
              <Chip
                key={item.itemName}
                color={item.isReusable ? "success" : "error"}
                label={item.itemName}
                sx={{ mx: 0.1, my: 0.1 }}
              />
            );
          })}
        </React.Fragment>
      ) : (
        Boolean(itemList.length - 2 > 0) && (
          <Chip
            color="primary"
            label={`+${itemList.length - 3} More`}
            sx={{ mx: 0.2, my: 0.1, cursor: "pointer" }}
            variant="outlined"
            onClick={() => setShowMore(true)}
          />
        )
      )}
    </React.Fragment>
  );
};

const RoomTypeTable = () => {
  const {
    data: roomTypeList = {
      data: [],
    },
    isLoading,
  } = useGetAllRoomTypesByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId,
    { skip: JSON.parse(sessionStorage.getItem("data"))?.roleType !== ADMIN }
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
              justifyContent: { xs: "space-between" },
            },
          ]}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Room Type List
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  height: 15,
                  width: 15,
                  borderRadius: "50%",
                  backgroundColor: (theme) => theme.palette.success.main,
                }}
              />
              <Typography>Non-Consumables</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  height: 15,
                  width: 15,
                  borderRadius: "50%",
                  backgroundColor: (theme) => theme.palette.error.main,
                }}
              />
              <Typography>Consumables</Typography>
            </Box>
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
                <TableCell>Room Type</TableCell>
                <TableCell sx={{ width: "40%" }}>Extra items</TableCell>
                <TableCell>Reward Points</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Capacity</TableCell>
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
                      {roomType.extraItem && (
                        <CustomChips itemList={roomType.extraItem} />
                      )}
                    </TableCell>
                    <TableCell>{roomType.rewardsPoints}</TableCell>
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

                    <TableCell>₹{roomType.basePrice}</TableCell>
                    <TableCell>{roomType.capacity}</TableCell>
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

export const ViewImageDialog = React.memo(function ({
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
                      <Box
                        component="img"
                        src={image}
                        sx={{ width: "100%", height: "100%" }}
                      />
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
