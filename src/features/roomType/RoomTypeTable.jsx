import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useGetAllRoomTypesByCompanyQuery } from "../../services/roomType";
import LoadingComponent from "../../components/LoadingComponent";

const RoomTypeTable = () => {
  const {
    data: roomTypeList = {
      data: [],
    },
    isLoading,
  } = useGetAllRoomTypesByCompanyQuery(
    JSON.parse(sessionStorage.getItem("data")).companyId
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
                      />
                      {roomType.images.length > 1 && (
                        <Button
                          size="small"
                          sx={{ textTransform: "none" }}
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
      <LoadingComponent open={isLoading} />
    </React.Fragment>
  );
};

export default RoomTypeTable;
