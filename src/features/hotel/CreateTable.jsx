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
import {
  useGetAllTablesQuery,
  useCreateTableMutation,
} from "../../services/dashboard";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const CreateTable = () => {
  const [createTableDialog, setCreateTableDialog] = React.useState(null);
  const handleCloseCreateTableDialog = React.useCallback(() => {
    setCreateTableDialog(null);
  }, []);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const {
    data: tableList = {
      data: [],
    },
    isLoading: isTableListLoading,
    isFetching: isTableListFetching,
  } = useGetAllTablesQuery({
    hotelId: sessionStorage.getItem("hotelIdForFoodItem"),
    // hotelId: 4,
  });

  const [createTable, createTableRes] = useCreateTableMutation();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          color="secondary"
          variant="contained"
          // size="small"
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
          onClick={() => setCreateTableDialog(true)}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Table
        </Button>
      </Box>
      <Box>
        <TableCards tableList={tableList} />
      </Box>
      <CreateTableDialog
        open={Boolean(createTableDialog)}
        handleCloseCreateTableDialog={handleCloseCreateTableDialog}
        createTable={createTable}
        setSnack={setSnack}
        tableList={tableList}
      />

      <LoadingComponent
        open={
          isTableListLoading || isTableListFetching || createTableRes.isLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default CreateTable;

const TableCards = ({ tableNumber = "T-101", tableList }) => {
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

  return (
    <>
      <Grid container spacing={2}>
        {tableList?.data?.map((item, index) => {
          // Use noOfSeats from each item
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
                    backgroundColor: "black",
                    opacity: 0.7,
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

const CreateTableDialog = ({
  open,
  handleCloseCreateTableDialog,
  createTable,
  setSnack,
  tableList,
}) => {
  const [formData, setFormData] = React.useState({
    capacity: "",
    tableList: [],
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetFormData = () => {
    setFormData({
      capacity: "",
      tableList: [],
    });
  };

  const handleClose = () => {
    resetFormData();
    handleCloseCreateTableDialog();
  };

  const handleAddTable = () => {
    if (formData.capacity > 20) {
      setSnack({
        open: true,
        message: "A table of maximum capacity : 20 is allowed",
        severity: "warning",
      });
      return;
    }
    if (formData.capacity <= 0) {
      setSnack({
        open: true,
        message: "A table of capacity less then or equal to 0 is not allowed",
        severity: "warning",
      });
      return;
    }
    if (formData.capacity) {
      const existingTables = tableList?.data || [];
      let highestTableNumber = 0;

      existingTables.forEach((table) => {
        const match = table.tableNo.match(/\d+/);
        if (match) {
          const tableNum = parseInt(match[0], 10);
          if (tableNum > highestTableNumber) {
            highestTableNumber = tableNum;
          }
        }
      });

      formData.tableList.forEach((table) => {
        const match = table.tableNo.match(/\d+/);
        if (match) {
          const tableNum = parseInt(match[0], 10);
          if (tableNum > highestTableNumber) {
            highestTableNumber = tableNum;
          }
        }
      });

      const nextTableNumber = highestTableNumber + 1;
      const tableName = `T${nextTableNumber}`;

      setFormData((prev) => ({
        capacity: "",
        tableList: [
          ...prev.tableList,
          {
            tableNo: tableName,
            noOfSeats: Number(prev.capacity),
          },
        ],
      }));
    }
  };

  const handleSubmitTableData = React.useCallback(async () => {
    createTable({
      tablesDataList: formData.tableList,
      hotelId: sessionStorage.getItem("hotelIdForFoodItem"),
    })
      .unwrap()
      .then((res) => {
        handleClose();
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
      })
      .catch((err) => {
        setSnack({
          open: true,
          message:
            err.data?.message ||
            err.data ||
            err.message ||
            "Something Went Wrong",
          severity: "error",
        });
      });
  }, [createTable, formData.tableList, setSnack, handleClose]);
  return (
    <>
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
            Add Table
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
              <Box
                component="form"
                sx={{
                  ".MuiTextField-root": {
                    width: "100%",
                    backgroundColor: "transparent",
                    ".MuiInputBase-root": {
                      color: "#7A7A7A",
                    },
                  },
                }}
                // onSubmit={handleSubmit}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <TextField
                      label={
                        <>
                          Capacity
                          <Box
                            component="span"
                            sx={{
                              color: (theme) => theme.palette.error.main,
                            }}
                          >
                            *
                          </Box>
                        </>
                      }
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      variant="standard"
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <IconButton
                      onClick={handleAddTable}
                      disabled={!formData.capacity}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ py: 2 }}>
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
                        <TableCell>Sl. No.</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Capacity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.tableList.map((table, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{table.tableNo}</TableCell>
                          <TableCell>{table.noOfSeats}</TableCell>
                        </TableRow>
                      ))}
                      {formData.tableList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No tables added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 5,
                  marginBottom: 5,
                }}
              >
                <Button
                  color="secondary"
                  variant="contained"
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
                  disabled={formData.tableList.length === 0}
                  // type="submit"
                  onClick={handleSubmitTableData}
                >
                  Add Table
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};
