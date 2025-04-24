import React, { memo, useCallback, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import {
  Box,
  Button,
  Divider,
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
import dayjs from "dayjs";
import moment from "moment";
import { useGetAllFinalInvoiceDetailsQuery } from "../../services/dashboard";

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

const hotelLogo = JSON.parse(sessionStorage.getItem("data"))?.hotelLogoUrl;
const customerGstNumberfromSession =
  sessionStorage.getItem("customerGstNumber");

const FinalSpaBillInvoice = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 0);
  }, []);
  const spaListTableHeaders = useMemo(
    () => [
      { label: "Sl. No.", key: "sno" },
      { label: "Ref. Number", key: "spaBookingRefNumber" },
      { label: "Spa Type", key: "spaType" },
      { label: "Therapist", key: "therapist" },
      { label: "Price", key: "price" },
    ],
    []
  );

  const {
    data: finalInvoiceDetails = {
      data: [],
    },
    isLoading,
  } = useGetAllFinalInvoiceDetailsQuery(
    sessionStorage.getItem("FinalHotelBillSpabookingRefNumber")
  );

  console.log("finalInvoiceDetails", finalInvoiceDetails);
  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          // px: "400px",
          px: {
            xs: "50px",
            xl: "400px",
            md: "100px",
          },
          py: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            border: "2px solid black",
            px: 3,
            py: 2,
          }}
        >
          <Grid container size={12}>
            <Grid size={{ xs: 12 }}>
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
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  py: 2,
                  px: 2,
                }}
              >
                <Box
                  component="img"
                  src={hotelLogo}
                  sx={{ width: 120, height: 120 }}
                />{" "}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      textAlign: "right",
                    }}
                  >
                    {
                      finalInvoiceDetails?.data?.customerBookingDetalis?.hotel
                        ?.name
                    }
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {
                      finalInvoiceDetails?.data?.customerBookingDetalis?.hotel
                        ?.address
                    }
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    22AAAAA0000A1Z5
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    support@goldentulip.com
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    8270367679
                  </Typography>
                </Box>
              </Box>

              {/* Booking details */}
              <Box sx={{ display: "flex" }}>
                <Grid container size={12}>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.firstName
                        }
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.middleName
                        }
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.lastName
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* date */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {dayjs().format("DD-MM-YYYY")}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* address */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.address
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* booking ref no */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.bookingRefNumber
                        }{" "}
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.email
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* booking date and time */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {moment(
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.bookedOn
                        ).format("DD-MM-YYYY hh:mm A")}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* phone nos */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.phoneNumber
                        }{" "}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* Room category */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        fontWeight: 600,
                      }}
                    >
                      Room category
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.roomType?.type
                        }{" "}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/*Company Name*/}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        // color: "#707070",
                        fontWeight: 600,
                      }}
                    >
                      Company Name
                    </Typography>
                  </Grid>
                  <Grid size={4}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {JSON.parse(sessionStorage.getItem("data")).companyName}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* PAX */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.noOfPeoples
                        }
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {sessionStorage.getItem("customerGstNumber")}
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* GSTN Bill */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.hotel?.gstIn
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  {/* arrival date and time */}
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.checkInDate
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
                        {
                          finalInvoiceDetails?.data?.customerBookingDetalis
                            ?.roomDto?.roomNo
                        }
                      </Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      ></Typography>
                    </Typography>
                  </Grid>
                  <Grid size={2}>
                    <Typography
                      sx={{
                        fontSize: "15.5px",
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
                        fontWeight: 600,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "15.5px",
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
                        }}
                      >
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
                    xs: "2fr",
                  },
                  gridAutoFlow: "dense",
                  width: "100%",
                }}
              >
                {Boolean(finalInvoiceDetails?.data?.mergeFoodItem?.length) && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 600,
                          width: "100%",
                          borderBottom: "2px solid #ccc",
                          marginBottom: "5px",
                        }}
                      >
                        Spa Details :
                      </Typography>

                      <SpaInvoiceTable
                        spaListTableHeaders={spaListTableHeaders}
                        spaListTableData={
                          finalInvoiceDetails?.data?.spaBookingDetailsTrailDtos
                        }
                      />
                    </Box>
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
                            {
                              finalInvoiceDetails?.data?.spaCharge
                                ?.amountWithoutGst
                            }
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
                            GST Charges
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
                            {finalInvoiceDetails?.data?.spaCharge?.gstAmount}
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
                            Sub-Total
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
                            {finalInvoiceDetails?.data?.spaCharge?.amount}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
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
      <LoadingComponent open={isLoading} />
    </>
  );
};

const SpaInvoiceTable = memo(function ({
  spaListTableHeaders,
  spaListTableData,
}) {
  return (
    <React.Fragment>
      <TableContainer
        sx={{
          overflow: "auto",
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
        }}
      >
        <Table aria-label="simple table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              {spaListTableHeaders?.map((item, index) => {
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
            {spaListTableData?.map((item, index) => {
              return (
                <TableRow key={`food-item-${item}-${index}`}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">
                    {item?.spaBookingRefNumber}
                  </TableCell>
                  <TableCell align="center">{item?.spaType?.name}</TableCell>
                  <TableCell align="center">{item?.therapist?.name}</TableCell>
                  <TableCell align="center">{item?.spaType?.price}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
});

export default FinalSpaBillInvoice;
