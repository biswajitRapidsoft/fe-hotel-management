// import React, { memo, useCallback, useMemo, useState } from "react";
// import LoadingComponent from "../../components/LoadingComponent";
// import SnackAlert from "../../components/Alert";
// import {
//   Box,
//   Button,
//   Divider,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import Grid from "@mui/material/Grid2";
// import { useParams } from "react-router-dom";
// import dayjs from "dayjs";
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
// const BarInvoice = () => {
//   const { bookingRefNo } = useParams("bookingRefNo");
//   const [isPrinting, setIsPrinting] = useState(false);
//   const [snack, setSnack] = useState({
//     open: false,
//     message: "",
//     severity: "",
//   });

//   const invoiceData = useMemo(() => {
//     const sessionedEventData = sessionStorage.getItem(
//       `foodBillInvoice-${bookingRefNo}`
//     );
//     return sessionedEventData ? JSON.parse(sessionedEventData) : null;
//   }, [bookingRefNo]);

//   const barListTableHeaders = useMemo(
//     () => [
//       { label: "Sl. No.", key: "sno" },
//       { label: "Item", key: "itemName" },
//       { label: "Quantity", key: "totalQuantity" },
//     ],
//     []
//   );

//   const handlePrint = useCallback(() => {
//     setIsPrinting(true);
//     setTimeout(() => {
//       window.print();
//       setIsPrinting(false);
//     }, 0);
//   }, []);
//   const hotelLogo = JSON.parse(sessionStorage.getItem("data")).hotelLogoUrl;

//   return (
//     <>
//       <Box
//         sx={{
//           width: "100%",
//           display: "flex",
//           flexDirection: "column",
//           gap: 1,
//           px: {
//             xs: "50px",
//             xl: "400px",
//             md: "100px",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             width: "100%",
//             overflowX: "hidden",
//             overflowY: "auto",
//           }}
//         >
//           <Grid container size={12}>
//             <Grid size={{ xs: 12 }}>
//               <Box
//                 sx={{
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   py: 2,
//                   px: 2,
//                 }}
//               >
//                 <Box
//                   component="img"
//                   src={hotelLogo}
//                   sx={{ width: 120, height: 120 }}
//                 />{" "}
//                 <Box>
//                   <Typography
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1.3rem",
//                       textAlign: "right",
//                     }}
//                   >
//                     {invoiceData?.bookingDto?.hotel?.name}
//                   </Typography>
//                   <Typography
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       textAlign: "right",
//                     }}
//                   >
//                     {invoiceData?.bookingDto?.hotel?.address}
//                     {", "}
//                     {invoiceData?.bookingDto?.hotel?.state?.name}{" "}
//                   </Typography>
//                   <Typography
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       textAlign: "right",
//                     }}
//                   >
//                     {" "}
//                     {invoiceData?.bookingDto?.hotel?.gstIn}
//                   </Typography>
//                   <Typography
//                     sx={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       textAlign: "right",
//                     }}
//                   >
//                     {" "}
//                     {invoiceData?.bookingDto?.hotel?.email}
//                   </Typography>
//                   <Typography
//                     sx ={{
//                       fontWeight: "bold",
//                       fontSize: "1rem",
//                       textAlign: "right",
//                     }}
//                   >
//                     {invoiceData?.bookingDto?.hotel?.contactNos?.length &&
//                       invoiceData?.bookingDto?.hotel?.contactNos?.join(", ")}
//                   </Typography>
//                 </Box>
//               </Box>
//             </Grid>
//           </Grid>
//         </Box>
//       </Box>
//     </>
//   );
// };

// export default BarInvoice;
import React from "react";

const BarInvoice = () => {
  return <div>BarInvoice</div>;
};

export default BarInvoice;
