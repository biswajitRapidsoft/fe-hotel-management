import React from "react";
import ReactDOM from "react-dom";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SnackAlert = ({ snack, setSnack }) => {
  const handleClose = React.useCallback(
    (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setSnack({
        ...snack,
        open: false,
      });
    },
    [snack, setSnack]
  );

  return ReactDOM.createPortal(
    <Snackbar
      open={snack.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={handleClose}
        severity={snack.severity}
        sx={{ width: "100%" }}
      >
        {snack.message}
      </Alert>
    </Snackbar>,
    document.getElementById("portal")
  );
};

export default React.memo(SnackAlert);
