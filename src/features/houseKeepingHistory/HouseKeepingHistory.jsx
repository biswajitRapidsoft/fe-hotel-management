import React, { memo } from "react";
import SnackAlert from "../../components/Alert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import { saveAs } from "file-saver";

import {
  Box,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  TableBody,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Autocomplete,
  DialogActions,
} from "@mui/material";
// import {
//   StyledTableRow,
//   StyledTableCell,
// } from "../dashboard/HouseKeeperDashboard";
import Grid from "@mui/material/Grid2";
import LoadingComponent from "../../components/LoadingComponent";
import {
  useGetAllRoomServiceHistoryQuery,
  useGetAllHouseKeepingStaffQuery,
  useAssignHouseKeepingRequestMutation,
} from "../../services/houseKeepingHistory";
import moment from "moment";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";

const HouseKeepingHistory = () => {
  const HouseKeepingHistoryTableHeaders = React.useMemo(() => {
    return [
      { label: "Sl. No.", key: "sno" },
      { label: "Created At", key: "createdAt" },
      { label: "Updated At", key: "updatedAt" },
      { label: "Room No.", key: "roomNo" },
      { label: "Assigned Person", key: "assignedPerson" },
      { label: "Status", key: "serviceRequestStatus" },
      { label: "Service Type", key: "serviceTypeStatus" },
      { label: "Action", key: "HouseKeepingAction" },
    ];
  }, []);

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const [HouseKeepingHistoryTableData, setHouseKeepingHistoryTableData] =
    React.useState({
      numberOfElements: 0,
      totalElements: 0,
      totalPages: 0,
      data: [],
    });
  console.log("HouseKeepingHistoryTableData", HouseKeepingHistoryTableData);
  const [HouseKeepingHistoryTablePageNo, setHouseKeepingHistoryTablePageNo] =
    React.useState(0);
  const [
    HouseKeepingHistoryTableRowsPerPage,
    setHouseKeepingHistoryTableRowsPerPage,
  ] = React.useState(10);

  const initialHouseKeepingHistoryTableFilters = React.useMemo(
    () => ({
      HouseKeepingStatus: null,
      HouseKeepingStatusInputVal: "",
      pageNo: 0,
      pageSize: 10,
    }),
    []
  );

  const [
    HouseKeepingHistoryTableFilters,
    //  setHouseKeepingHistoryTableFilters
  ] = React.useState(initialHouseKeepingHistoryTableFilters);

  const {
    data: houseKeepingHistoryData = {
      paginationData: {},
    },
    isLoading: isHouseKeepingHistoryLoading,
    isSuccess: isHouseKeepingHistorySuccess,
  } = useGetAllRoomServiceHistoryQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
    pageNo: HouseKeepingHistoryTableFilters?.pageNo,
    pageSize: HouseKeepingHistoryTableFilters?.pageSize,
  });
  React.useEffect(() => {
    if (isHouseKeepingHistorySuccess) {
      setHouseKeepingHistoryTableData(
        houseKeepingHistoryData?.paginationData?.data
      );
    }
  }, [isHouseKeepingHistorySuccess, houseKeepingHistoryData]);

  const handleChangeHouseKeepingHistoryTablePageNo = React.useCallback(
    (event, newpage) => {
      setHouseKeepingHistoryTablePageNo(newpage);
    },
    []
  );

  const handleChangeHouseKeepingHistoryTableRowsPerPage = React.useCallback(
    (event) => {
      setHouseKeepingHistoryTableRowsPerPage(parseInt(event.target.value, 10));
      setHouseKeepingHistoryTablePageNo(0);
    },
    []
  );
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: "100%",
            // backgroundColor: "yellow",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: "bold", fontSize: "1.4rem" }}>
              House Keeping Records
            </Typography>
          </Box>

          <Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FileDownloadIcon />}
              sx={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                textTransform: "none",
                letterSpacing: 1,
              }}
              // onClick={handleSubmitFilter}
            >
              Export Excel
            </Button>
          </Box>
        </Box>
        <Grid container size={12}>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "calc(100vh - 250px)",
                  xl: "calc(100vh - 200px)",
                },
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <CustomHouseKeepingHistoryTableContainer
                tableHeaders={HouseKeepingHistoryTableHeaders}
                tableData={houseKeepingHistoryData?.paginationData}
                pageNo={HouseKeepingHistoryTablePageNo}
                pageSize={HouseKeepingHistoryTableRowsPerPage}
                handlePageChange={handleChangeHouseKeepingHistoryTablePageNo}
                handleChangeRowsPerPage={
                  handleChangeHouseKeepingHistoryTableRowsPerPage
                }
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <LoadingComponent open={isHouseKeepingHistoryLoading || false} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

function calculateSerialNumber(index, pageNumber, rowsPerPage) {
  index = index ?? 0;
  pageNumber = pageNumber ?? 0;
  rowsPerPage = rowsPerPage ?? 10;

  index = Number(index);
  pageNumber = Number(pageNumber);
  rowsPerPage = Number(rowsPerPage);

  return pageNumber * rowsPerPage + index + 1;
}

// const getCellValue = (obj, key, fallback = "") => {
//   if (!key) {
//     // Return length of itemsDto array for Items column
//     return obj.itemsDto ? obj.itemsDto.length : 0;
//   }
//   return key
//     .split(".")
//     .reduce(
//       (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
//       obj
//     );
// };

const CustomRow = memo(function ({ tableHeaders, rowSerialNumber, row }) {
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);

  const handleActionButtonClick = () => {
    setStatusDialogOpen(true);
  };
  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };

  return (
    <>
      <TableRow
        hover
        key={row?.id}
        sx={{
          cursor: "pointer",
          height: 60,
          backgroundColor: "inherit",
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        {tableHeaders?.map((subitem, subIndex) => {
          return (
            <TableCell
              key={`table-body-cell=${subIndex}`}
              align="center"
              // onClick={subitem?.key === "" ? handleItemsClick : undefined}
            >
              <Box>
                {subitem?.key === "sno" ? (
                  <Typography
                    sx={{
                      fontSize: "13px",
                      cursor: subitem?.key === "" ? "pointer" : "default",
                    }}
                    // onClick={subitem?.key === "" ? handleItemsClick : undefined}
                  >
                    {rowSerialNumber}
                  </Typography>
                ) : subitem?.key === "createdAt" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.createdAt &&
                      moment(row?.createdAt).format("DD-MM-YYYY hh:mm A")}
                  </Typography>
                ) : subitem.key === "updatedAt" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.updatedAt &&
                      moment(row?.updatedAt).format("DD-MM-YYYY hh:mm A")}
                  </Typography>
                ) : subitem.key === "roomNo" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.roomData?.roomNo}
                  </Typography>
                ) : subitem.key === "assignedPerson" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.assignedPerson?.name}
                  </Typography>
                ) : subitem.key === "serviceRequestStatus" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.serviceRequestStatus}
                  </Typography>
                ) : subitem.key === "serviceTypeStatus" ? (
                  <Typography sx={{ fontSize: "13px" }}>
                    {row?.serviceTypeStatus}
                  </Typography>
                ) : subitem.key === "HouseKeepingAction" ? (
                  <>
                    {row?.serviceRequestStatus === "Request_Submitted" && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="outlined"
                          sx={{ minWidth: "unset", width: "11px" }}
                          onClick={handleActionButtonClick}
                        >
                          <EventAvailableIcon
                            sx={{ fontSize: "14px", fontWeight: 600 }}
                          />
                        </Button>
                      </Box>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </Box>
            </TableCell>
          );
        })}
      </TableRow>
      <HouseKeepingRequestDialog
        open={statusDialogOpen}
        onClose={handleStatusDialogClose}
        items={row}
      />
    </>
  );
});

const CustomHouseKeepingHistoryTableContainer = memo(
  ({
    tableHeaders,
    tableData,
    pageNo,
    pageSize,
    handlePageChange,
    handleChangeRowsPerPage,
  }) => {
    console.log("tableHeaders", tableHeaders);
    return (
      <>
        <TableContainer
          component={Paper}
          sx={{
            overflow: "auto",
            maxHeight: {
              xs: "calc(100vh - 310px)",
              xl: "calc(100vh - 280px)",
              "&::-webkit-scrollbar": {},
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#ffffff00",
                width: "none",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#280071",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#3b0b92",
              },
            },
          }}
        >
          <Table aria-label="simple table" stickyHeader size="small">
            <TableHead>
              <TableRow>
                {tableHeaders?.map((item, index) => {
                  return (
                    <TableCell
                      key={`table-head-${index}`}
                      align="center"
                      sx={{
                        color: "white",
                        backgroundColor: "primary.main",
                        fontWeight: "bold",
                        paddingY: item?.key === "sno" ? "15px" : "auto",
                        fontSize: "14px",
                      }}
                    >
                      {item?.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {Boolean(tableData?.data?.length > 0) ? (
                tableData?.data?.map((row, index) => (
                  <CustomRow
                    tableHeaders={tableHeaders}
                    rowSerialNumber={calculateSerialNumber(
                      index,
                      pageNo,
                      pageSize
                    )}
                    key={row.id}
                    row={row}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={
                      Boolean(tableHeaders?.length) ? tableHeaders?.length : 1
                    }
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={tableData?.totalElements || 0}
          rowsPerPage={pageSize}
          page={pageNo}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          // rowsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      </>
    );
  }
);

const HouseKeepingRequestDialog = ({ open, onClose, items }) => {
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  console.log("selectedStaff", selectedStaff);

  const {
    data: houseKeepingStaffList = {
      data: [],
    },
  } = useGetAllHouseKeepingStaffQuery({
    hotelId: JSON.parse(sessionStorage.getItem("data"))?.hotelId,
  });

  const [assignHouseKeepingRequest, assignHouseKeepingRequestRes] =
    useAssignHouseKeepingRequestMutation();

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const handleAssignRequest = () => {
    if (!selectedStaff) {
      setSnack({
        open: true,
        message: "Please select staff",
        severity: "error",
      });
      return;
    }

    const payload = {
      id: items?.id,
      createdBy: selectedStaff?.id,
    };
    assignHouseKeepingRequest(payload)
      .unwrap()
      .then((res) => {
        setSnack({
          open: true,
          message: res.message,
          severity: "success",
        });
        onClose();
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data || "Something Went Wrong",
          severity: "error",
        });
      });
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        // maxWidth="md"
        // fullWidth
        sx={{ "& .MuiDialog-paper": { minHeight: "450px", minWidth: "700px" } }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.4rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Assign HouseKeeping Request
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid size={{ xs: 4, lg: 2, xl: 1.5 }}>
            <Box
              sx={{
                ".MuiTextField-root": {
                  width: "100%",
                  backgroundColor: "transparent",
                  ".MuiInputBase-root": {
                    color: "#B4B4B4",
                    background: "rgba(255, 255, 255, 0.25)",
                  },
                },
                ".MuiFormLabel-root": {
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: 18,
                },
                ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                  borderBottom: (theme) =>
                    `1px solid ${theme.palette.primary.main}`,
                },
                ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                  borderBottom: (theme) =>
                    `1px solid ${theme.palette.primary.main}`,
                },
              }}
            >
              <Autocomplete
                options={houseKeepingStaffList?.data || []}
                value={selectedStaff}
                onChange={(event, newValue) => setSelectedStaff(newValue)}
                fullWidth
                getOptionLabel={(option) => option?.name}
                clearOnEscape
                disablePortal
                // isOptionDisabled={(option) => isOptionDisabled(option.key)}
                popupIcon={<KeyboardArrowDownIcon color="primary" />}
                sx={{
                  // width: 200,
                  ".MuiInputBase-root": {
                    color: "#fff",
                  },

                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
                    backgroundColor: "#E9E5F1",
                    color: "#280071",
                    fontWeight: 600,
                  },
                  "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected='true']:hover":
                    {
                      backgroundColor: "#E9E5F1",
                      color: "#280071",
                      fontWeight: 600,
                    },
                }}
                size="small"
                clearIcon={<ClearIcon color="primary" />}
                PaperComponent={(props) => (
                  <Paper
                    sx={{
                      background: "#fff",
                      color: "#B4B4B4",
                      borderRadius: "10px",
                    }}
                    {...props}
                  />
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="HouseKeeping Staff"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const serviceCount = option?.servicesList?.length || 0;
                  let color = "#FFBF00";
                  if (serviceCount >= 3) {
                    color = "#AA0000";
                  } else if (serviceCount <= 1) {
                    color = "#018749";
                  } else if (serviceCount === 2) {
                    color = "#FFBF00	";
                  }

                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        // backgroundColor,
                        color: color,
                        fontWeight: 600,
                        // "&:hover": {
                        //   backgroundColor: backgroundColor,
                        //   opacity: 0.8,
                        // },
                      }}
                    >
                      {option.name}
                    </Box>
                  );
                }}
              />
            </Box>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="error" onClick={onClose}>
            cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAssignRequest}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
      <SnackAlert snack={snack} setSnack={setSnack} />
      <LoadingComponent
        open={assignHouseKeepingRequestRes.isLoading || false}
      />
    </>
  );
};
export default HouseKeepingHistory;
