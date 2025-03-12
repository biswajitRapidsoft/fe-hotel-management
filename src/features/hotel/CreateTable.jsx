import React from "react";
import {
  Box,
  Button,
  IconButton,
  DialogTitle,
  DialogContent,
  Typography,
  Grid2 as Grid,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { BootstrapDialog } from "../header/Header";
import CloseIcon from "@mui/icons-material/Close";
const CreateTable = () => {
  const [createTableDialog, setCreateTableDialog] = React.useState(null);
  const handleCloseCreateTableDialog = React.useCallback(() => {
    setCreateTableDialog(null);
  }, []);
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          color="secondary"
          variant="contained"
          // size="small"
          sx={{
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            fontSize: 18,
            "&.Mui-disabled": {
              background: "#B2E5F6",
              color: "#FFFFFF",
            },
          }}
          onClick={() => setCreateTableDialog(true)}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Table
        </Button>
      </Box>
      <CreateTableDialog
        open={Boolean(createTableDialog)}
        handleCloseCreateTableDialog={handleCloseCreateTableDialog}
      />
    </>
  );
};

export default CreateTable;

const CreateTableDialog = ({ open, handleCloseCreateTableDialog }) => {
  const [formData, setFormData] = React.useState({
    tableList: [],
  });
  return (
    <>
      <BootstrapDialog
        open={open}
        onClose={handleCloseCreateTableDialog}
        aria-labelledby="password-change-dialog-title"
        maxWidth="lg"
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
        <DialogTitle id="view-image-dialog-title" sx={{ fontSize: 24 }}>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "1.9rem",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Add Table
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleCloseCreateTableDialog}
          sx={{
            position: "absolute",
            right: 30,
            top: 16,
            color: "#280071",
          }}
        >
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>

        <DialogContent dividers>
          <Box sx={{ px: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Box
                component="form"
                sx={{
                  ".MuiTextField-root": {
                    width: "100%",
                    backgroundColor: "transparent",
                    ".MuiInputBase-root": {
                      color: "#7A7A7A",
                    },
                  },
                  ".MuiFormLabel-root": {
                    color: (theme) =>
                      `${theme.palette.primary.main} !important`,
                    fontWeight: 600,
                    fontSize: 18,
                  },
                  ".css-3zi3c9-MuiInputBase-root-MuiInput-root:before": {
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.primary.main} !important`,
                  },
                  ".css-iwxl7s::before": {
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.primary.main} !important`,
                  },
                  ".css-3zi3c9-MuiInputBase-root-MuiInput-root:after": {
                    borderBottom: "1px solid #fff !important",
                  },
                  ".css-iwxl7s::after": {
                    borderBottom: "1px solid #fff !important",
                  },
                  ".css-iwadjf-MuiInputBase-root-MuiInput-root:before": {
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.primary.main} !important`,
                  },
                  ".css-1kbklr8::before": {
                    borderBottom: (theme) =>
                      `1px solid ${theme.palette.primary.main} !important`,
                  },
                  ".css-iwadjf-MuiInputBase-root-MuiInput-root:after": {
                    borderBottom: "1px solid #fff !important",
                  },
                  ".css-1kbklr8::after": {
                    borderBottom: "1px solid #fff !important",
                  },
                }}
                // onSubmit={handleSubmit}
              >
                <Grid container spacing={2}>
                  <Grid size={3}>
                    <TextField
                      label={
                        <React.Fragment>
                          Capacity
                          <Box
                            component="span"
                            sx={{
                              color: (theme) => theme.palette.error.main,
                            }}
                          >
                            *
                          </Box>
                        </React.Fragment>
                      }
                      name="itemName"
                      // value={formData.itemName}
                      // onChange={handleChange}
                      variant="standard"
                    />
                  </Grid>
                  <Grid size={3}>
                    <IconButton>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                >
                  <Button
                    color="secondary"
                    variant="contained"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: 18,
                      "&.Mui-disabled": {
                        background: "#B2E5F6",
                        color: "#FFFFFF",
                      },
                    }}
                    // disabled={!isFormValid()}
                    type="submit"
                  >
                    Add Table
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};
