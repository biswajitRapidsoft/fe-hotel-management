import React, { memo, useCallback, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  Box,
  Button,
  // Collapse,
  Divider,
  // IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import QRCode from "react-qr-code";
import Grid from "@mui/material/Grid2";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import moment from "moment";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import moment from "moment";

const getCellValue = (obj, key, fallback = "") => {
  if (!key) return undefined;
  return key
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
      obj
    );
};

const gstData = `
    {
      "GSTIN": "27AABCU9603R1ZN",
      "InvoiceNo": "INV-001",
      "InvoiceDate": "2025-01-21",
      "TotalAmount": "1000.00",
      "TaxAmount": "180.00",
      "CGST": "90.00",
      "SGST": "90.00",
      "CustomerName": "John Doe"
    }
  `;

const CustomStayersTableForInvoice = memo(function ({ stayersData }) {
  return (
    <TableContainer
      component={Paper}
      sx={
        {
          // overflow: "auto",
          // maxHeight: {
          //   xs: "135px",
          //   // xl: "calc(100vh - 280px)",
          //   "&::-webkit-scrollbar": {
          //     // height: "14px",
          //   },
          //   "&::-webkit-scrollbar-track": {
          //     backgroundColor: "#ffffff00",
          //     width: "none",
          //   },
          //   "&::-webkit-scrollbar-thumb": {
          //     backgroundColor: "#280071",
          //     borderRadius: "4px",
          //   },
          //   "&::-webkit-scrollbar-thumb:hover": {
          //     backgroundColor: "#3b0b92",
          //   },
          // },
        }
      }
    >
      <Table aria-label="simple table" stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              // align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Sl No.
              </Typography>
            </TableCell>
            <TableCell
              // align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Name
              </Typography>
            </TableCell>
            <TableCell
              // align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Id Proof No.
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stayersData?.map((item, index) => {
            return (
              <TableRow key={`tr-${index}`}>
                <TableCell
                // align="center"
                >
                  <Typography
                    sx={{
                      width: "100%",
                      // textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell
                // align="center"
                >
                  <Typography
                    sx={{
                      width: "100%",
                      // textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.customerName || ""}
                  </Typography>
                </TableCell>
                <TableCell
                // align="center"
                >
                  <Box
                    sx={{
                      display: "flex",
                      // backgroundColor: "yellow",
                      gap: 1,
                      // justifyContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        // width: "100%",
                        // textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      {item?.govtIdNo}
                    </Typography>
                    <Typography
                      sx={{
                        // width: "100%",
                        // textAlign: "center",
                        fontSize: "10px",
                      }}
                    >
                      {`(${item?.govtIdType?.replace(/_/g, " ")})`}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});
const CustomInventoryTableForInvoice = memo(function ({ inventoryData }) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        overflow: "auto",
        maxHeight: {
          xs: "135px",
          // xl: "calc(100vh - 280px)",
          "&::-webkit-scrollbar": {
            // height: "14px",
          },
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
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Sl No.
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Product
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Quantity
              </Typography>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                backgroundColor: "#dbd8ff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                Price
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventoryData?.map((item, index) => {
            return (
              <TableRow key={`tr-${index}`}>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.itemName || ""}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.noOfItems || 0}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item?.totalPrice || 0}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell
              colSpan={2}
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                minHeight: "100%",
                borderTop: "1px solid #ccc",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                  // borderTop: "1px solid #ccc",
                  minHeight: "24.9px",
                }}
              >
                {" "}
              </Typography>
            </TableCell>
            <TableCell
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                borderTop: "1px solid #ccc",
              }}
              colSpan={1}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  // borderTop: "1px solid #ccc",
                }}
              >
                Total
              </Typography>
            </TableCell>
            <TableCell
              style={{
                position: "sticky",
                bottom: 0,
                zIndex: 1,
                background: "white",
                borderTop: "1px solid #ccc",
              }}
              colSpan={1}
            >
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "13px",
                  // borderTop: "1px solid #ccc",
                }}
              >
                {inventoryData?.reduce(
                  (sum, item) => sum + (item?.totalPrice || 0),
                  0
                )}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
});

const CustomParentCollapseTableRowForInvoice = memo(function ({
  foodListTableHeaders,
  rowSerialNumber,
  key,
  row,
}) {
  return (
    <TableRow
      hover
      key={row?.id}
      sx={{
        cursor: "pointer",
        height: 35,
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: "inherit",
        },
      }}
    >
      {foodListTableHeaders?.map((subitem, subIndex) => {
        return (
          <TableCell key={`table-body-cell=${subIndex}`} align="center">
            <Typography sx={{ fontSize: "12px" }}>
              {subitem?.key === "sno" ? (
                <Typography sx={{ fontSize: "12px" }}>
                  {rowSerialNumber}
                </Typography>
              ) : (
                // </Box>
                <Typography sx={{ fontSize: "12px", wordWrap: "break-word" }}>
                  {getCellValue(row, subitem?.key)}
                </Typography>
              )}
            </Typography>
          </TableCell>
        );
      })}
    </TableRow>
  );
});

const CustomFoodListTableContainerForInvoice = memo(function ({
  foodListTableHeaders,
  foodListTableData,
  uniqueFoodItems,
}) {
  console.log(
    "CustomFoodListTableContainerForInvoice foodListTableData : ",
    foodListTableData
  );
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          // maxHeight: { xs: isForCheckOut ? "220px" : "310px" },
          // xl: "calc(100vh - 280px)",
          "&::-webkit-scrollbar": {
            // height: "14px",
          },
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
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {foodListTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      backgroundColor: "#dbd8ff",
                      fontWeight: "bold",
                      // paddingY: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(uniqueFoodItems?.length > 0) ? (
              uniqueFoodItems?.map((row, index) => (
                <CustomParentCollapseTableRowForInvoice
                  foodListTableHeaders={foodListTableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(foodListTableHeaders?.length)
                      ? foodListTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell
                colSpan={1}
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  minHeight: "100%",
                  borderTop: "1px solid #ccc",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                    minHeight: "24.9px",
                  }}
                >
                  {" "}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  Total
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  {foodListTableData?.reduce(
                    (sum, item) =>
                      sum + (item?.bookingDetails?.totalPrice || 0),
                    0
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

const CustomLaundryTableRowForInvoice = memo(function ({
  laundryListTableHeaders,
  rowSerialNumber,
  key,
  row,
}) {
  return (
    <TableRow
      hover
      key={row?.id}
      sx={{
        cursor: "pointer",
        height: 35,
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: "inherit",
        },
      }}
    >
      {laundryListTableHeaders?.map((subitem, subIndex) => {
        return (
          <TableCell key={`table-body-cell=${subIndex}`} align="center">
            <Typography sx={{ fontSize: "12px" }}>
              {subitem?.key === "sno" ? (
                <Typography sx={{ fontSize: "12px" }}>
                  {rowSerialNumber}
                </Typography>
              ) : (
                // </Box>
                <Typography sx={{ fontSize: "12px", wordWrap: "break-word" }}>
                  {getCellValue(row, subitem?.key)}
                </Typography>
              )}
            </Typography>
          </TableCell>
        );
      })}
    </TableRow>
  );
});

const CustomLaundryListTableContainerForInvoice = memo(function ({
  laundryListTableHeaders,
  laundryListTableData,
  uniqueLaudryItems,
}) {
  console.log(
    "CustomFoodListTableContainerForInvoice laundryListTableData : ",
    laundryListTableData
  );
  console.log(
    "CustomLaundryListTableContainerForInvoice  uniqueLaudryItems : ",
    uniqueLaudryItems
  );
  return (
    <React.Fragment>
      <TableContainer
        component={Paper}
        sx={{
          overflow: "auto",
          // maxHeight: { xs: isForCheckOut ? "220px" : "310px" },
          // xl: "calc(100vh - 280px)",
          "&::-webkit-scrollbar": {
            // height: "14px",
          },
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
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {laundryListTableHeaders?.map((item, index) => {
                return (
                  <TableCell
                    key={`room-table-head-${index}`}
                    align="center"
                    sx={{
                      backgroundColor: "#dbd8ff",
                      fontWeight: "bold",
                      // paddingY: "10px",
                      fontSize: "13px",
                    }}
                  >
                    {item?.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Boolean(uniqueLaudryItems?.length > 0) ? (
              uniqueLaudryItems?.map((row, index) => (
                <CustomLaundryTableRowForInvoice
                  laundryListTableHeaders={laundryListTableHeaders}
                  rowSerialNumber={index + 1}
                  key={row.id}
                  row={row}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    Boolean(laundryListTableHeaders?.length)
                      ? laundryListTableHeaders?.length
                      : 1
                  }
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell
                colSpan={
                  Boolean(laundryListTableHeaders?.length)
                    ? laundryListTableHeaders?.length - 2
                    : 1
                }
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  minHeight: "100%",
                  borderTop: "1px solid #ccc",
                }}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                    minHeight: "24.9px",
                  }}
                >
                  {" "}
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  Total
                </Typography>
              </TableCell>
              <TableCell
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  background: "white",
                  borderTop: "1px solid #ccc",
                }}
                colSpan={1}
              >
                <Typography
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "13px",
                    // borderTop: "1px solid #ccc",
                  }}
                >
                  {parseFloat(
                    laundryListTableData?.reduce(
                      (sum, item) => sum + (item?.totalPrice || 0),
                      0
                    )
                  ).toFixed(2)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

const HotelBillInvoice = () => {
  const { bookingRefNo } = useParams("bookingRefNo");
  // const printRef = useRef(null)

  const customerGstNumberfromSession =
    sessionStorage.getItem("customerGstNumber");
  const invoiceData = useMemo(() => {
    const sessionedEventData = sessionStorage.getItem(
      `hotelBillInvoice-${bookingRefNo}`
    );
    return sessionedEventData ? JSON.parse(sessionedEventData) : null;
  }, [bookingRefNo]);

  // here all the items where iscredit is false is added
  const subTotalExpense = useMemo(
    () =>
      parseFloat(
        invoiceData?.bookingDto?.transactionDetails
          ?.filter((item) => !Boolean(item?.isCredit))
          ?.reduce((sum, item) => sum + (item.amount || 0), 0)
      ).toFixed(2),
    [invoiceData]
  );
  // here all the items where iscredit is true is added
  const subTotalPaidExpense = useMemo(
    () =>
      parseFloat(
        invoiceData?.bookingDto?.transactionDetails
          ?.filter((item) => Boolean(item?.isCredit))
          ?.reduce((sum, item) => sum + (item.amount || 0), 0)
      ).toFixed(2),
    [invoiceData]
  );

  const amountToBePaid = useMemo(
    () => parseFloat(subTotalExpense - subTotalPaidExpense).toFixed(2),
    [subTotalExpense, subTotalPaidExpense]
  );
  // const subTotalAmountPaid = useMemo(
  //   () =>
  //     parseFloat(
  //       invoiceData?.bookingDto?.transactionDetails
  //         ?.filter((item) => Boolean(item?.isCredit))
  //         ?.reduce((sum, item) => sum + (item.amount || 0), 0)
  //     ).toFixed(3),
  //   [invoiceData]
  // );

  const subTotalExtraItemsExpense = useMemo(() => {
    const sum =
      invoiceData?.bookingDto?.extraItemsList?.reduce(
        (sum, item) => sum + (item?.totalPrice || 0),
        0
      ) || 0; // Ensure sum is a number

    return sum.toFixed(2);
  }, [invoiceData]);

  const subTotalLaundryExpense = useMemo(() => {
    const sum =
      invoiceData?.bookingDto?.laundryDataList?.reduce(
        (sum, item) => sum + (item?.totalPrice || 0),
        0
      ) || 0; // Ensure sum is a number

    return sum.toFixed(2);
  }, [invoiceData]);

  // const subTotalFoodExpense = useMemo(
  //   () =>
  //     parseFloat(
  //       invoiceData?.bookingDto?.foodDataList?.reduce(
  //         (sum, item) => sum + (item?.bookingDetails?.totalPrice || 0),
  //         0
  //       )
  //     ).toFixed(2),
  //   [invoiceData]
  // );

  const subTotalFoodExpense = useMemo(() => {
    const sum =
      invoiceData?.bookingDto?.foodDataList?.reduce(
        (sum, item) => sum + (item?.bookingDetails?.totalPrice || 0),
        0
      ) || 0;
    return sum.toFixed(2);
  }, [invoiceData]);

  const subTotalBarExpense = useMemo(() => {
    const sum =
      invoiceData?.bookingDto?.barOrderDtos?.reduce(
        (sum, item) => sum + (item?.totalAmount + item?.gstPrice),
        0
      ) || 0;
    return sum.toFixed(2);
  }, [invoiceData]);

  const subTotalSpaExpense = useMemo(() => {
    const sum =
      invoiceData?.bookingDto?.spaBookingDetails?.reduce(
        (sum, item) => sum + (item?.totalPrice || 0),
        0
      ) || 0;
    return sum.toFixed(2);
  }, [invoiceData]);

  console.log("subTotalBarExpense", subTotalBarExpense);
  // const subTotalRoomCharges = useMemo(() => {
  //   // const expense = parseFloat(subTotalExpense) || 0;
  //   // const extraItemsExpense = parseFloat(subTotalExtraItemsExpense) || 0;
  //   // const laundrysExpense = parseFloat(subTotalLaundryExpense) || 0;
  //   // const foodExpense = parseFloat(subTotalFoodExpense) || 0;

  //   // return (
  //   //   expense -
  //   //   extraItemsExpense -
  //   //   foodExpense -
  //   //   laundrysExpense
  //   // ).toFixed(2);
  //   return (
  //     subTotalExpense -
  //     subTotalExtraItemsExpense -
  //     subTotalLaundryExpense -
  //     subTotalFoodExpense -
  //     subTotalBarExpense -
  //     subTotalSpaExpense
  //   ).toFixed(2);
  // }, [
  //   subTotalExpense,
  //   subTotalExtraItemsExpense,
  //   subTotalFoodExpense,
  //   subTotalLaundryExpense,
  //   subTotalSpaExpense,
  //   subTotalBarExpense,
  // ]);

  const subTotalRoomCharges = useMemo(() => {
    const sum =
      // invoiceData?.bookingDto?.foodDataList?.reduce(
      //   (sum, item) => sum + (item?.bookingDetails?.totalPrice || 0),
      //   0
      // ) || 0;
      parseFloat(
        invoiceData?.bookingDto?.gstPrice +
          invoiceData?.bookingDto?.totalRoomCharge
      );

    return sum.toFixed(2);
  }, [invoiceData]);

  const foodListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Item", key: "itemName" },
      { label: "Quantity", key: "totalQuantity" },
    ],
    []
  );

  console.log("invoiceData : ", invoiceData);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const laundryListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Name", key: "name" },
      { label: "Charges (per peice)", key: "pricePerPiece" },
      { label: "Quantity", key: "quantity" },
      { label: "Price", key: "totalPrice" },
    ],
    []
  );

  const uniqueFoodItems = useMemo(() => {
    const foodList = Boolean(invoiceData?.bookingDto?.foodDataList?.length)
      ? invoiceData?.bookingDto?.foodDataList
      : [];
    const foodItemsMap = {};

    foodList?.forEach((order) => {
      order.itemsList.forEach((item) => {
        if (item.itemName) {
          // Ensure the item has a valid name
          if (foodItemsMap[item.itemName]) {
            foodItemsMap[item.itemName] += item.noOfItems || 0;
          } else {
            foodItemsMap[item.itemName] = item.noOfItems || 0;
          }
        }
      });
    });

    return Object.keys(foodItemsMap).map((itemName) => ({
      itemName,
      totalQuantity: foodItemsMap[itemName],
    }));
  }, [invoiceData?.bookingDto?.foodDataList]);

  const uniqueLaundryItems = useMemo(() => {
    const laundryList = Array.isArray(invoiceData?.bookingDto?.laundryDataList)
      ? invoiceData.bookingDto.laundryDataList
      : [];
    const laundryItemsMap = {};

    laundryList?.forEach((order) => {
      order?.itemsDto?.forEach((item) => {
        if (item?.name && item?.id) {
          // Ensure the item has a valid name and id
          const price = parseFloat(item?.price || 0);
          const quantity = item?.qty || 0;

          if (laundryItemsMap[item.id]) {
            // Aggregate quantity and price for the same item ID
            laundryItemsMap[item.id].quantity += quantity;
            laundryItemsMap[item.id].totalPrice += price;
          } else {
            // Initialize with the first item's values
            laundryItemsMap[item.id] = {
              id: item.id,
              name: item.name,
              quantity,
              totalPrice: price,
            };
          }
        }
      });
    });

    // Calculate price per piece and format values
    return Object.values(laundryItemsMap).map((item) => ({
      ...item,
      pricePerPiece:
        item?.quantity > 0
          ? (item?.totalPrice / item?.quantity).toFixed(2)
          : item?.totalPrice.toFixed(2),
      totalPrice: item?.totalPrice.toFixed(2),
    }));
  }, [invoiceData?.bookingDto?.laundryDataList]);

  console.log("uniqueFoodItems : ", uniqueFoodItems);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(() => {
    setIsPrinting(true); // Hide button
    setTimeout(() => {
      window.print();
      setIsPrinting(false); // Show button after print
    }, 0); // Delay for print dialog
  }, []);

  const hotelLogo = JSON.parse(sessionStorage.getItem("data")).hotelLogoUrl;

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          // backgroundColor: "yellow",
          // px: "400px",
          px: {
            xs: "50px",
            xl: "400px",
            md: "100px",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            // height: {
            //   xs: "calc(100vh - 50px)",
            //   xl: "calc(100vh - 50px)",
            // },
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          <Grid container size={12}>
            <Grid size={{ xs: 12 }}>
              {/* header */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  // justifyContent: "center",
                  // alignItems: "center",
                  // backgroundColor: "yellow",
                  py: 2,
                  px: 2,
                }}
              >
                <Box
                  component="img"
                  src={hotelLogo}
                  sx={{ width: 120, height: 120 }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.bookingDto?.hotel?.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.bookingDto?.hotel?.address}
                    {", "}
                    {invoiceData?.bookingDto?.hotel?.state?.name}{" "}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    {invoiceData?.bookingDto?.hotel?.gstIn}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    {invoiceData?.bookingDto?.hotel?.email}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.bookingDto?.hotel?.contactNos?.length &&
                      invoiceData?.bookingDto?.hotel?.contactNos?.join(", ")}
                  </Typography>
                </Box>
              </Box>
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "17px",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Tax Invoice
              </Typography>

              {/* Hotel Details */}
              {/* <Grid container size={12}>
                <Grid size={1.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    Hotel Name
                  </Typography>
                </Grid>
                <Grid size={10.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        marginRight: "5px",
                      }}
                    >
                      :
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        // fontWeight: 600,
                      }}
                    >
                      {invoiceData?.bookingDto?.hotel?.name}
                    </Typography>
                  </Typography>
                </Grid>

                <Grid size={1.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    Address
                  </Typography>
                </Grid>
                <Grid size={10.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        marginRight: "5px",
                      }}
                    >
                      :
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        // fontWeight: 600,
                      }}
                    >
                      {invoiceData?.bookingDto?.hotel?.address}
                      {", "}
                      {invoiceData?.bookingDto?.hotel?.state?.name}
                    </Typography>
                  </Typography>
                </Grid>


                <Grid size={1.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    Email ID
                  </Typography>
                </Grid>
                <Grid size={10.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        marginRight: "5px",
                      }}
                    >
                      :
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        // fontWeight: 600,
                      }}
                    >
                      {invoiceData?.bookingDto?.hotel?.email}
                    </Typography>
                  </Typography>
                </Grid>

                <Grid size={1.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    Phone No
                  </Typography>
                </Grid>
                <Grid size={10.5}>
                  <Typography
                    sx={{
                      fontSize: "15.5px",
                      // color: "#707070",
                      fontWeight: 600,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                        marginRight: "5px",
                      }}
                    >
                      :
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        // fontWeight: 600,
                      }}
                    >
                      {invoiceData?.bookingDto?.hotel?.contactNos?.length &&
                        invoiceData?.bookingDto?.hotel?.contactNos?.join(", ")}
                    </Typography>
                  </Typography>
                </Grid>
              </Grid> */}
              {/* <Divider
                sx={{
                  borderBottomWidth: 4,
                  backgroundColor: "black",
                  my: 0.5,
                }}
              /> */}

              {/* Booking To Details */}
              <Box sx={{ display: "flex" }}>
                <Grid container size={12}>
                  {/* name */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Name
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {Boolean(invoiceData?.bookingDto?.firstName) &&
                          `${invoiceData?.bookingDto?.firstName}`}
                        {Boolean(invoiceData?.bookingDto?.middleName) &&
                          ` ${invoiceData?.bookingDto?.middleName}`}
                        {Boolean(invoiceData?.bookingDto?.lastName) &&
                          ` ${invoiceData?.bookingDto?.lastName}`}{" "}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* date */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Invoice Date
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.bookingDto?.checkOutDate} */}
                        {dayjs().format("DD-MM-YYYY")}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* address */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Address
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.address}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* booking ref no */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Booking No.
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.bookingRefNumber}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* email id */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Email ID
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.email || "NA"}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* booking date and time */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Booking Date
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.bookingDto?.bookedOn || "NA"} */}
                        {moment(invoiceData?.bookingDto?.bookedOn).format(
                          "DD-MM-YYYY hh:mm A"
                        )}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* phone nos */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Phone No
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.phoneNumber}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* Room category */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Room category{" "}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.roomType?.type}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/*Company Name{" "}
                   */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Company Name{" "}
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.roomType?.type} */}
                        {JSON.parse(sessionStorage.getItem("data")).companyName}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* PAX */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Pax
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.bookingMapData?.length}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* gst no. */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      GST Number
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.roomType?.type} */}
                        {/* -- */}
                        {sessionStorage.getItem("customerGstNumber")}
                      </Typography>
                    </Typography>
                  </Grid>

                  {/* GSTN Bill */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      GSTN Bill
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.roomType?.type} */}
                        --
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* arrival date and time */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Arrival
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.bookingDto?.checkInDate || "NA"}
                      </Typography>
                    </Typography>
                  </Grid>

                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Room No.
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {invoiceData?.roomNo || "NA"}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Departure
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.bookingDto?.checkOutDate || "NA"} */}
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Billing Type
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          fontWeight: 600,
                          marginRight: "5px",
                        }}
                      >
                        :
                      </Typography>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        {/* {invoiceData?.bookingDto?.checkOutDate || "NA"} */}
                        Direct Payment
                      </Typography>
                    </Typography>
                  </Grid>
                </Grid>
                {Boolean(customerGstNumberfromSession) && (
                  <Box sx={{ width: "20%" }}>
                    <QRCode
                      size={256}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      value={gstData}
                      viewBox={`0 0 256 256`}
                    />
                  </Box>
                )}
              </Box>

              <Divider
                sx={{
                  borderBottomWidth: 2,
                  backgroundColor: "black",
                  my: 0.5,
                }}
              />

              <Grid
                container
                size={12}
                spacing={1}
                sx={{
                  gridTemplateColumns: {
                    xs: "2fr", // Single column on small screens
                  },
                  gridAutoFlow: "dense", // Allow items to fill empty spaces
                  width: "100%",
                }}
              >
                {Boolean(invoiceData?.bookingDto?.foodDataList?.length) && (
                  <Grid size={6}>
                    {Boolean(invoiceData?.bookingDto?.foodDataList?.length) && (
                      <Box
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          Food Details :
                        </Typography>
                        <CustomFoodListTableContainerForInvoice
                          foodListTableHeaders={foodListTableHeaders}
                          foodListTableData={
                            invoiceData?.bookingDto?.foodDataList
                          }
                          isForCheckOut={true}
                          uniqueFoodItems={uniqueFoodItems}
                        />
                      </Box>
                    )}
                  </Grid>
                )}

                {Boolean(
                  Boolean(invoiceData?.bookingDto?.bookingMapData?.length) ||
                    Boolean(invoiceData?.bookingDto?.laundryDataList?.length) ||
                    Boolean(invoiceData?.bookingDto?.extraItemsList?.length)
                ) && (
                  <Grid size={12}>
                    {Boolean(
                      invoiceData?.bookingDto?.bookingMapData?.length
                    ) && (
                      <Box
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "18px",
                            // color: "#707070",
                            fontWeight: 600,
                            width: "100%",
                            borderBottom: "2px solid #ccc",
                            marginBottom: "5px",
                          }}
                        >
                          Stayers Details :
                        </Typography>
                        <CustomStayersTableForInvoice
                          stayersData={invoiceData?.bookingDto?.bookingMapData}
                        />
                      </Box>
                    )}
                    {Boolean(
                      invoiceData?.bookingDto?.laundryDataList?.length
                    ) &&
                      false && (
                        <Box
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Laundry Details :
                          </Typography>
                          <CustomLaundryListTableContainerForInvoice
                            laundryListTableHeaders={laundryListTableHeaders}
                            laundryListTableData={
                              invoiceData?.bookingDto?.laundryDataList
                            }
                            uniqueLaudryItems={uniqueLaundryItems}
                          />
                        </Box>
                      )}

                    {Boolean(invoiceData?.bookingDto?.extraItemsList?.length) &&
                      false && (
                        <Box
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "18px",
                              // color: "#707070",
                              fontWeight: 600,
                              width: "100%",
                              borderBottom: "2px solid #ccc",
                              marginBottom: "5px",
                            }}
                          >
                            Inventory Details :
                          </Typography>
                          <CustomInventoryTableForInvoice
                            inventoryData={
                              invoiceData?.bookingDto?.extraItemsList
                            }
                          />
                        </Box>
                      )}
                  </Grid>
                )}
              </Grid>
              <Divider
                sx={{
                  borderBottomWidth: 2,
                  backgroundColor: "black",
                  my: 0.5,
                }}
              />

              <Grid container size={12} columnSpacing={2}>
                <Grid size={12}>
                  <Box
                    sx={{
                      width: "99.7%",
                      margin: "auto",
                    }}
                  >
                    <Grid container size={12}>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderTop: "1.7px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Room Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderTop: "1.7px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalRoomCharges}
                            {/* {invoiceData?.bookingDto?.gstPrice +
                              invoiceData?.bookingDto?.totalRoomCharge} */}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Inventory Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalExtraItemsExpense}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Food Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalFoodExpense}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Laundry Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalLaundryExpense}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Spa Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalSpaExpense}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Bar Charges
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalBarExpense}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            borderBottom: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Total
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            borderBottom: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalExpense}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Paid Amount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {subTotalPaidExpense}
                            {/* {invoiceData?.bookingDto?.bookingAmount} */}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography
                            sx={{ fontSize: "20px", fontWeight: 600 }}
                          >
                            Amount to pay
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={6}>
                        <Box
                          sx={{
                            width: "100%",
                            height: "30px",
                            border: "1.3px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{
                              textAlign: "right",
                              fontSize: "19px",
                              fontWeight: 600,
                            }}
                          >
                            {amountToBePaid}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      // paddingX: 3,
                      gap: 3,
                      // marginTop: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: "300px",
                        height: "70px",
                        marginTop: "7px",
                      }}
                    >
                      <Typography>Remarks:</Typography>
                      <Box
                        sx={{
                          minHeight: "calc(100% - 25px)",
                          border: "2px solid black",
                          borderRadius: "5px",
                          bgcolor: "white",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        justifyContent: "flex-end",
                        columnGap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          height: "125px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            minHeight: "45px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            bgcolor: "white",
                            width: "170px",
                          }}
                        />
                        <Typography sx={{ fontSize: "14px" }}>
                          Staff Signature
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: "125px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            minHeight: "45px",
                            border: "2px solid black",
                            borderRadius: "5px",
                            bgcolor: "white",
                            width: "170px",
                          }}
                        />
                        <Typography sx={{ fontSize: "14px" }}>
                          Guest Signature
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {!isPrinting && (
          <Box
            sx={{
              width: "100%",
              // position: "fixed",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bottom: 15,
              zIndex: 100,
              // backgroundColor: "yellow",
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={() => handlePrint()}
              sx={{
                backgroundImage:
                  "linear-gradient(to right, #0acffe 0%, #495aff 100%)",
                color: "white",
                "&:hover": {
                  backgroundImage:
                    "linear-gradient(to right, #0acffe 10%, #495aff 90%)",
                },
                // ml: 60,
              }}
            >
              PRINT NOW
            </Button>
          </Box>
        )}
      </Box>

      <LoadingComponent open={false} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </>
  );
};

export default HotelBillInvoice;
