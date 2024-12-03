import {
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

const RestaurantAdmin = () => {
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
            Food Order List
          </Typography>
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    fontWeight: "bold",
                    letterSpacing: 1,
                    backgroundColor: "#3F3C87",
                    color: "#fff",
                    fontSize: 18,
                  },
                }}
              >
                <TableCell>SL No.</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Order Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                sx={{
                  ".MuiTableCell-root": {
                    letterSpacing: 1,
                    fontSize: 18,
                  },
                }}
              >
                <TableCell>1</TableCell>
                <TableCell>item 2</TableCell>
                <TableCell>item 3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </React.Fragment>
  );
};

export default RestaurantAdmin;
