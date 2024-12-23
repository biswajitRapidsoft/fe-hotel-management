import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";

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

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link
        sx={{ color: "#FFFFFF", textDecoration: "none" }}
        href="/"
        onClick={(e) => e.preventDefault()}
      >
        HOMS
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

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

export default function SignIn() {
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
        p: 1,
        background: `linear-gradient(45deg, blue, red)`,
        height: "100vh",
        minHeight: "600px",
      }}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
            px: 3,
            boxShadow: (theme) => theme.shadows[5],
          }}
          component={Paper}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
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
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
            {location.pathname === "/staff-login" && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={visible ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                variant="standard"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSetVisibility}>
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
              }}
            >
              {location.pathname === "/staff-login" && (
                <Link component={RouterLink} href="#" variant="body1">
                  Forgot password?
                </Link>
              )}
              {location.pathname === "/staff-login" ? (
                <Link component={RouterLink} to="/guest-login" variant="body1">
                  {"Sign In as Guest"}
                </Link>
              ) : (
                <Link component={RouterLink} to="/staff-login" variant="body1">
                  {"Sign In as Staff"}
                </Link>
              )}
            </Box>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4, color: "#FFFFFF" }} />
      </Container>
      <LoadingComponent open={loginResponse.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Box>
  );
}
