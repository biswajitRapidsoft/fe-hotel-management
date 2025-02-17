import {
  Box,
  TextField,
  Typography,
  Button,
  Avatar,
  Link,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";

import React from "react";
import hotelImage from "../../img/hotel1.jpg";
import logo from "../../img/logo.svg";
// import { useTheme } from "@mui/material/styles";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import * as Yup from "yup";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import { useLoginMutation } from "../../services/login";

import { Cookies } from "../../helper/cookies";
import {
  // SUPER_ADMIN,
  ADMIN,
  CUSTOMER,
  FRONTDESK,
  HOUSEKEEPER,
  KITCHENSTAFF,
  GUARD,
  BARSTAFF,
  MANAGER,
} from "../../helper/constants";

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// function Copyright(props) {
//   return (
//     <Typography
//       variant="body2"
//       color="text.secondary"
//       align="center"
//       {...props}
//     >
//       {"Copyright © "}
//       <Link
//         sx={{ color: "#FFFFFF", textDecoration: "none" }}
//         href="/"
//         onClick={(e) => e.preventDefault()}
//       >
//         HOMS
//       </Link>{" "}
//       {new Date().getFullYear()}
//       {"."}
//     </Typography>
//   );
// }

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("This field is required")
    .test(
      "phone-or-email",
      "Please enter a valid email or phone number",
      (value) => {
        if (!value) return false;

        if (phoneRegex.test(value)) {
          return true;
        }

        if (emailRegex.test(value)) {
          return true;
        }

        return false;
      }
    ),
  // password: Yup.string().required("Password is required"),
  password: Yup.string().test(
    "optional-password",
    "Password is required.",
    (value) => {
      if (window.location.pathname === "/staff-login" && !value) {
        return false;
      }
      return true;
    }
  ),
});

const Loginv2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [login, loginResponse] = useLoginMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      login({
        username: values.username,
        password: location.pathname === "/staff-login" ? values.password : null,
        isPhone: phoneRegex.test(values.username) ? true : false,
      })
        .unwrap()
        .then((res) => {
          setSnack({
            open: true,
            message: res.message,
            severity: "success",
          });
          sessionStorage.setItem("data", JSON.stringify(res.data));
          Cookies.setCookie("loginSuccess", res.message, 2000);
          if (res.data.roleType === CUSTOMER) {
            navigate("/guest-dashboard");
          } else if (res.data.roleType === ADMIN) {
            navigate("/admin-dashboard");
          } else if (res.data.roleType === FRONTDESK) {
            navigate("/dashboard");
          } else if (res.data.roleType === HOUSEKEEPER) {
            navigate("/housekeeper-dashboard");
          } else if (res.data.roleType === KITCHENSTAFF) {
            navigate("/restaurant-admin");
          } else if (res.data.roleType === GUARD) {
            navigate("/Parking");
          } else if (res.data.roleType === BARSTAFF) {
            navigate("/bar-admin");
          } else if (res.data.roleType === MANAGER) {
            navigate("/managerDashboard");
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          setSnack({
            open: true,
            message: err.data?.message || err.data,
            severity: "error",
          });
        });
    },
  });

  const handleEmailChange = React.useCallback(
    (e) => {
      formik.setFieldValue("username", e.target.value.toLowerCase());
    },
    [formik]
  );

  const [visible, setVisible] = React.useState(false);
  const handleSetVisibility = React.useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${hotelImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          // filter: "blur(1px)",
          zIndex: -1,
        },
      }}
    >
      <Box
        sx={{
          width: "900px",
          height: "450px",
          backgroundColor: "#fff",
          boxShadow:
            "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
          borderRadius: "14px",
          display: "flex",
          opacity: 0.93,
        }}
      >
        <Box
          sx={{
            // background: "rgb(0,51,102)",
            background:
              "linear-gradient(159deg, rgba(0,51,102,1) 0%, rgba(15,82,186,1) 100%)",

            width: "50%",
            borderTopLeftRadius: "14px",
            borderBottomLeftRadius: "14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            // border: "10px solid black",
          }}
        >
          <Box sx={{ mb: 1 }}>
            <img src={logo} alt="Logo" width="300" />
          </Box>
          <Typography sx={{ color: "#fff" }}>WELCOME TO</Typography>
          <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
            HOTEL MANAGEMENT SYSTEM
          </Typography>
          <Box
            sx={{
              width: "100% ",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column  ",
            }}
          >
            <Box
              sx={{
                width: "80%",
                height: "2px",
                backgroundColor: "white",
                margin: "10px auto",
              }}
            />
            <Typography
              sx={{
                textTransform: "uppercase",
                fontSize: "0.8rem",
                color: "#fff",
                margin: "0 auto",
              }}
            >
              Login to access Hotel Management System
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: "50%",
            borderBottomRightRadius: "14px",
            borderTopRightRadius: "14px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            // border: "2px solid black",
            // opacity: 0.5,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              px: 10,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
            </Box>
            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Enter Email / Phone"
                name="username"
                autoComplete="username"
                autoFocus
                variant="standard"
                value={formik.values.username}
                onChange={handleEmailChange}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
              />

              {location.pathname === "/staff-login" && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  variant="standard"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleSetVisibility}
                          >
                            {visible ? <VisibilityOffIcon /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 5, mb: 2 }}
              >
                Sign In
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    location.pathname === "/guest-login"
                      ? "center"
                      : "space-between",
                  // justifyContent: "center",
                }}
              >
                {location.pathname === "/staff-login" && (
                  <Link component={RouterLink} href="#" variant="body1">
                    Forgot password?
                  </Link>
                )}
                {location.pathname === "/staff-login" ? (
                  <Link
                    component={RouterLink}
                    to="/guest-login"
                    variant="body1"
                  >
                    {"Sign In as Guest"}
                  </Link>
                ) : (
                  <Link
                    component={RouterLink}
                    to="/staff-login"
                    variant="body1"
                  >
                    {"Sign In as Staff"}
                  </Link>
                )}
              </Box>
            </Box>
          </Box>
          {/* <Copyright sx={{ mt: 8, mb: 4, color: "#FFFFFF" }} /> */}
        </Box>

        <LoadingComponent open={loginResponse.isLoading} />
        <SnackAlert snack={snack} setSnack={setSnack} />
      </Box>
    </Box>
  );
};

export default Loginv2;
