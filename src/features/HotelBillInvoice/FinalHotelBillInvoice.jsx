import React, { memo, useCallback, useMemo, useState } from "react";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import {
  Box,
  Button,
  Divider,
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
import { useGetAllFinalInvoiceDetailsQuery } from "../../services/dashboard";

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

const hotelLogo = JSON.parse(sessionStorage.getItem("data"))?.hotelLogoUrl;
const customerGstNumberfromSession =
  sessionStorage.getItem("customerGstNumber");

const FinalHotelBillInvoice = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 0);
  }, []);

  const {
    data: finalInvoiceDetails = {
      data: [],
    },
    isLoading,
  } = useGetAllFinalInvoiceDetailsQuery(
    sessionStorage.getItem("FinalHotelBillbookingRefNumber")
  );

  console.log(
    "finalInvoiceDetails",

    finalInvoiceDetails
  );
  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          backgroundColor: "white",
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
            overflowX: "hidden",
            overflowY: "auto",
            border: "2px solid black",
            px: 3,
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
                          // color: "#707070",
                          // fontWeight: 600,
                        }}
                      >
                        Nikhil Kumar Khuntia
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
                        rsbb
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
                        20250327092220-375D7243
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
                        NA
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
                        27-03-2025 02:52 PM
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
                        9668537293
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
                        Standard
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
                        4
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
                        {/* {invoiceData?.bookingDto?.hotel?.gstIn} */}
                        ABCD1289
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
                        22/11/2000
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
                        121
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
                      >
                        HGF
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
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default FinalHotelBillInvoice;
