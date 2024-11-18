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

import { useNavigate } from "react-router-dom";

import { useFormik } from "formik";
import * as Yup from "yup";

import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

import { useLoginMutation } from "../../services/login";

import { Cookies } from "../../helper/cookies";
import { SUPER_ADMIN } from "../../helper/constants";

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
  email: Yup.string()
    .email("Please provide a valid email")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function SignIn() {
  const navigate = useNavigate();
  const [login, loginResponse] = useLoginMutation();
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      login({
        username: values.email,
        password: values.password,
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
          if (res.data.userType === SUPER_ADMIN) {
            navigate("/home");
          } else {
            navigate("/dashboard");
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              variant="standard"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSetVisibility}>
                      {visible ? <VisibilityOffIcon /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 5, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4, color: "#FFFFFF" }} />
      </Container>
      <LoadingComponent open={loginResponse.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </Box>
  );
}
