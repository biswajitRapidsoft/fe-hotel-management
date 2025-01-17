import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  // Paper,
  // Table,
  // TableBody,
  // TableCell,
  // TableContainer,
  // TableHead,
  // TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
// import { useParams } from "react-router-dom";
import dayjs from "dayjs";
// import moment from "moment";

// const getCellValue = (obj, key, fallback = "") => {
//   if (!key) return undefined;
//   return key
//     .split(".")
//     .reduce(
//       (acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback),
//       obj
//     );
// };

const SpaInvoice = () => {
  // const foodListTableHeaders = useMemo(
  //   () => [
  //     { label: "Sl. No.", key: "sno" },
  //     { label: "Start Time", key: "startTime" },
  //     { label: "End Time", key: "endTime" },
  //   ],
  //   []
  // );
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 0);
  }, []);

  const invoiceData = useMemo(() => {
    const sessionedEventData = sessionStorage.getItem("orderForSpaInvoice");
    return sessionedEventData ? JSON.parse(sessionedEventData) : null;
  }, []);

  const hotelLogo = JSON.parse(sessionStorage.getItem("orderForSpaInvoice"))
    .hotelDto?.logoUrl;

  const subTotalSpaCharges = useMemo(() => {
    return (
      invoiceData?.totalPrice -
      invoiceData?.paidAmount +
      invoiceData?.totalPrice * 0.18
    );
  }, [invoiceData]);

  // const totalSpaCharges = useMemo(() => {
  //   return invoiceData?.totalPrice - invoiceData?.totalPrice * 0.18;
  // }, [invoiceData]);

  // const gstCharges = useMemo(() => {
  //   return invoiceData?.totalPrice * 0.18;
  // }, [invoiceData]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
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
          }}
        >
          <Grid container size={12}>
            <Grid size={{ xs: 12 }}>
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
                />
                <Typography></Typography>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.hotelDto?.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.hotelDto?.address}
                    {", "}
                    {invoiceData?.hotelDto?.state?.name}{" "}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    {invoiceData?.hotelDto?.gstIn}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {" "}
                    {invoiceData?.hotelDto?.email}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textAlign: "right",
                    }}
                  >
                    {invoiceData?.hotelDto?.contactNos?.length &&
                      invoiceData?.hotelDto?.contactNos?.join(", ")}
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
                Spa Invoice
              </Typography>

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
                      {Boolean(invoiceData?.customerFirstName) &&
                        `${invoiceData?.customerFirstName}`}
                      {Boolean(invoiceData?.customerMiddleName) &&
                        ` ${invoiceData?.customerMiddleName}`}
                      {Boolean(invoiceData?.customerLastName) &&
                        ` ${invoiceData?.customerLastName}`}{" "}
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
                      {invoiceData?.customerAddress}
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
                      {invoiceData?.bookingSpaRefNumber}
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
                      wordBreak: "break-all",
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
                      {invoiceData?.customerEmail || "NA"}
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
                      {invoiceData?.bookingDate || "NA"}
                      {/* {moment(invoiceData?.bookingDate).format(
                        "DD-MM-YYYY hh:mm A"
                      )} */}
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
                      {invoiceData?.customerPhoneNo}
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
                      {invoiceData?.startTime || "NA"}
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
                      {invoiceData?.roomDto?.roomNo || "NA"}
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
                      {invoiceData?.endTime || "NA"}
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
                            borderTop: "1.7px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {/* {totalSpaCharges} */}
                            {invoiceData?.totalPrice || "NA"}
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
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            GST Charges{" "}
                            <span
                              style={{
                                color: "gray",
                                fontStyle: "italic",
                                fontSize: "0.9rem",
                              }}
                            >
                              (18%)
                            </span>
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
                            {/* {gstCharges} */}
                            {invoiceData?.gstPrice || "NA"}
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
                            borderTop: "1.7px solid black",
                            borderRight: "1.7px solid black",
                            bgcolor: "white",
                          }}
                        >
                          <Typography
                            sx={{ textAlign: "right", fontWeight: 550 }}
                          >
                            {/* {subTotalRoomCharges} */}
                            {invoiceData?.paidAmount || "NA"}
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
                            borderLeft: "1.7px solid black",
                            bgcolor: "white",
                            paddingLeft: "5px",
                          }}
                        >
                          <Typography sx={{ fontWeight: 550 }}>
                            Sub Total
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
                            {subTotalSpaCharges}
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
    </>
  );
};

export default SpaInvoice;
