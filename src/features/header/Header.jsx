import React from "react";
import ReactDOM from "react-dom";
import {
  Box,
  Avatar,
  Typography,
  // Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  DialogContent,
  TextField,
} from "@mui/material";

import {
  ADMIN,
  CUSTOMER,
  FRONTDESK,
  HOUSEKEEPER,
} from "../../helper/constants";

import Grid from "@mui/material/Grid2";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

// import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Logout from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import LockResetIcon from "@mui/icons-material/LockReset";

import SnackAlert from "../../components/Alert";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

import logo from "../../img/logo.svg";
import { useChangePasswordMutation } from "../../services/login";
import LoadingComponent from "../../components/LoadingComponent";

const StyledHeaderBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: `linear-gradient(to right, white, ${theme.palette.primary.main})`,
  boxShadow: theme.shadows[2],
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
  px: 1,
}));

const Header = () => {
  const navigate = useNavigate();

  const [snack, setSnack] = React.useState({
    open: false,
    severity: "",
    message: "",
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = React.useMemo(() => {
    return Boolean(anchorEl);
  }, [anchorEl]);
  const [notificationEl, setNotificationEl] = React.useState(null);
  const openNotification = React.useMemo(() => {
    return Boolean(notificationEl);
  }, [notificationEl]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openPasswordChangeDialog, setOpenPasswordChangeDialog] =
    React.useState(false);

  const handleClickOpenDialog = React.useCallback(() => {
    setOpenDialog(true);
  }, []);

  const handleClickOpenPasswordChangeDialog = React.useCallback(() => {
    setOpenPasswordChangeDialog(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setOpenDialog(false);
  }, []);

  const handleClosePasswordChangeDialog = React.useCallback(() => {
    setOpenPasswordChangeDialog(false);
  }, []);

  const handleClick = React.useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = React.useCallback(() => {
    setAnchorEl(null);
  }, []);

  // const handleClickNotification = React.useCallback((e) => {
  //   setNotificationEl(e.currentTarget);
  // }, []);

  const handleCloseNotification = React.useCallback((e) => {
    setNotificationEl(null);
  }, []);

  const handleLogout = React.useCallback(() => {
    sessionStorage.clear();
    setOpenDialog(false);
    navigate("/");
  }, [navigate]);

  return (
    <StyledHeaderBox
    // sx={{
    //   display: "flex",
    //   alignItems: "center",
    //   justifyContent: "space-between",
    //   background: (theme) =>
    //     `linear-gradient(to right, white, ${theme.palette.primary.main})`,
    //   boxShadow: (theme) => theme.shadows[2],
    //   position: "sticky",
    //   top: 0,
    //   zIndex: 10000,
    //   px: 1,
    // }}
    >
      <img
        src={logo}
        alt="Logo"
        width="300"
        // style={{
        //   cursor:
        //     JSON.parse(sessionStorage.getItem("data")).userType === SUPER_ADMIN
        //       ? "pointer"
        //       : "none",
        // }}
      />
      {/* <Typography>hotel</Typography> */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Box sx={{ marginRight: 10 }}>
          {/* <IconButton
            size="large"
            sx={{
              color: "#fff",
              ".MuiBadge-badge": {
                color: "#222",
                background: "#FFD100",
                fontWeight: 600,
              },
            }}
            onClick={handleClickNotification}
          >
            <Badge
              badgeContent={7}
              // badgeContent={notificationList.data.length}
            >
              <NotificationsNoneIcon sx={{ fontSize: 29 }} />
            </Badge>
          </IconButton> */}

          <MenuComp
            anchorEl={notificationEl}
            id="notification-menu"
            open={openNotification}
            onClose={handleCloseNotification}
          >
            <Box
              sx={{
                width: 396,
                maxHeight: 300,
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  px: 2,
                  py: 1,
                  backgroundColor: "#fff",
                  zIndex: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(63, 63, 63, 1)",
                  }}
                >
                  Notification
                </Typography>
                <IconButton onClick={handleCloseNotification} color="primary">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" align="center">
                    No Notification
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MenuComp>
        </Box>
        {/*  */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
            "&:before": {
              content: "''",
              position: "absolute",
              backgroundColor: "#D4CCE3",
              top: 10,
              bottom: 10,
              width: "1px",
              marginLeft: -5,
            },
          }}
        >
          <Avatar
            alt="avatar"
            // src={JSON.parse(sessionStorage.getItem("data")).imageUrl}
            sx={{ width: 48, height: 48 }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              ".MuiTypography-root": {
                color: "#fff",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: 1,
              }}
            >
              {JSON.parse(sessionStorage.getItem("data"))?.userName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography sx={{ fontSize: 14, letterSpacing: 1 }}>
                {getUserType(
                  JSON.parse(sessionStorage.getItem("data"))?.roleType
                )}
              </Typography>
              <Typography sx={{ fontSize: 14, letterSpacing: 1 }}>
                {!Boolean(
                  JSON.parse(sessionStorage.getItem("data"))?.roleType === ADMIN
                ) &&
                  !Boolean(
                    JSON.parse(sessionStorage.getItem("data"))?.roleType ===
                      CUSTOMER
                  ) &&
                  `(${JSON.parse(sessionStorage.getItem("data"))?.hotelName})`}
              </Typography>
            </Box>
          </Box>

          <React.Fragment>
            <IconButton
              sx={{ color: "#fff" }}
              onClick={handleClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <KeyboardArrowDownIcon />
            </IconButton>
            <MenuComp
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
            >
              {!Boolean(
                JSON.parse(sessionStorage.getItem("data"))?.roleType ===
                  CUSTOMER
              ) && (
                <div>
                  <MenuItem onClick={handleClickOpenPasswordChangeDialog}>
                    <ListItemIcon>
                      <LockResetIcon fontSize="small" />
                    </ListItemIcon>
                    Change Password
                  </MenuItem>
                  <Divider />
                </div>
              )}

              <MenuItem onClick={handleClickOpenDialog}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </MenuComp>
            <AlertDialog
              open={openDialog}
              handleClose={handleCloseDialog}
              handleLogout={handleLogout}
            />
          </React.Fragment>
        </Box>
      </Box>

      <PasswordChangeDialog
        open={openPasswordChangeDialog}
        handleClose={handleClosePasswordChangeDialog}
        setSnack={setSnack}
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </StyledHeaderBox>
  );
};

const AlertDialog = React.memo(function ({ open, handleClose, handleLogout }) {
  return ReactDOM.createPortal(
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{
        ".MuiDialog-container": {
          alignItems: "flex-start",
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">
        Do you want to logout this session?
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          No
        </Button>
        <Button onClick={handleLogout} variant="contained" color="error">
          Yes
        </Button>
      </DialogActions>
    </Dialog>,
    document.getElementById("portal")
  );
});

const PasswordChangeDialog = React.memo(function ({
  open,
  handleClose,
  setSnack,
}) {
  const [changePassword, changePasswordRes] = useChangePasswordMutation();
  const [formData, setFormData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleChange = React.useCallback(
    (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    },
    [formData]
  );

  const resetForm = React.useCallback(() => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
  }, []);

  const handleSubmit = React.useCallback(
    (event) => {
      event.preventDefault();
      if (formData.newPassword !== formData.confirmNewPassword) {
        return setSnack({
          open: true,
          message: "Confirm new password does not match with new password.",
          severity: "error",
        });
      }
      changePassword({
        username: JSON.parse(sessionStorage.getItem("data"))?.email,
        password: formData.currentPassword,
        newPassword: formData.newPassword,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          handleClose();
          resetForm();
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
    [formData, setSnack, handleClose, resetForm, changePassword]
    // []
  );

  const isFormValid = React.useCallback(() => {
    return Boolean(
      formData.currentPassword.trim() &&
        formData.newPassword.trim() &&
        formData.confirmNewPassword.trim()
    );
  }, [formData]);

  React.useEffect(() => {
    resetForm();
  }, [open, resetForm]);

  return ReactDOM.createPortal(
    <React.Fragment>
      <BootstrapDialog
        open={open}
        onClose={handleClose}
        aria-labelledby="password-change-dialog-title"
        maxWidth="sm"
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
        <DialogTitle id="password-change-dialog-title" sx={{ fontSize: 24 }}>
          Change Password
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
        <Box
          component="form"
          sx={{
            px: 3.5,
            ".MuiTextField-root": {
              width: "100%",
              input: {
                color: "#747474",
              },
            },
            ".MuiFormLabel-root": {
              color: "#9380B8",
              fontWeight: 600,
              fontSize: 18,
            },
            ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: `1px solid #9380B8`,
            },
            ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
              borderBottom: `1px solid #9380B8`,
            },
          }}
          onSubmit={handleSubmit}
        >
          <DialogContent>
            <Grid container rowSpacing={5}>
              <Grid size={12}>
                <TextField
                  label="Current Password"
                  variant="standard"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="New Password"
                  variant="standard"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Confirm New Password"
                  variant="standard"
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                display: "block",
                margin: "1rem auto",
                color: "#fff",
                textTransform: "none",
                fontSize: 18,
                px: 6,
                py: 1,
                borderRadius: 2,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              variant="contained"
              color="secondary"
              type="submit"
              disabled={!isFormValid()}
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </BootstrapDialog>
      <LoadingComponent open={changePasswordRes.isLoading} />
    </React.Fragment>,
    document.getElementById("portal")
  );
});

export const MenuComp = React.memo(function (props) {
  return (
    <Menu
      {...props}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 1.5,
          "& .MuiAvatar-root": {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          "&:before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {props.children}
    </Menu>
  );
});

export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogTitle-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0,0,30,0.4)",
}));

export const getUserType = (type) => {
  if (type === ADMIN) {
    return "ADMIN";
  } else if (type === CUSTOMER) {
    return "Guest";
  } else if (type === FRONTDESK) {
    return "FrontDesk";
  } else if (type === HOUSEKEEPER) {
    return "HouseKeeper";
  } else {
    return "USER";
  }
};

export default Header;
